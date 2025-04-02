'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Define la forma de los datos del perfil como se devuelven en consultas anidadas de Supabase
interface ProfileData {
  username: string;
}

interface FandomRequest {
  id: string;
  user_id: string;
  fandom_name: string;
  fandom_description: string;
  category: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  username?: string;
  profiles?: ProfileData;
}

export default function PendingFandomsPanel() {
  const [pendingRequests, setPendingRequests] = useState<FandomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      
      // Obtener las solicitudes pendientes junto con información del usuario
      const { data, error } = await supabase
        .from('fandom_requests')
        .select(`
          id, user_id, fandom_name, fandom_description, 
          category, reason, status, created_at,
          profiles(username)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formatear los datos para incluir el nombre de usuario
      const formattedData: FandomRequest[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        fandom_name: item.fandom_name,
        fandom_description: item.fandom_description,
        category: item.category,
        reason: item.reason,
        status: item.status,
        created_at: item.created_at,
        profiles: item.profiles,
        username: item.profiles?.username || 'Usuario desconocido'
      }));

      setPendingRequests(formattedData);
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes pendientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleApprove = async (requestId: string, requestData: FandomRequest) => {
    try {
      setProcessingId(requestId);

      // 1. Actualizar el estado de la solicitud a 'approved'
      const { error: updateError } = await supabase
        .from('fandom_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // 2. Crear el nuevo fandom
      const { data: newFandom, error: fandomError } = await supabase
        .from('fandoms')
        .insert({
          name: requestData.fandom_name,
          description: requestData.fandom_description,
          category: requestData.category,
          status: 'approved',
          requested_by: requestData.user_id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          // Generar un slug basado en el nombre
          slug: requestData.fandom_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .select('id')
        .single();

      if (fandomError) throw fandomError;

      // 3. Asignar al creador como moderador
      const { error: modError } = await supabase
        .from('fandom_moderators')
        .insert({
          user_id: requestData.user_id,
          fandom_id: newFandom.id,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (modError) throw modError;

      // 4. Agregar al creador como miembro
      const { error: memberError } = await supabase
        .from('fandom_members')
        .insert({
          user_id: requestData.user_id,
          fandom_id: newFandom.id,
          status: 'active'
        });

      if (memberError) throw memberError;

      // Actualizar la lista de solicitudes
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== requestId)
      );

      toast({
        title: "Fandom aprobado",
        description: `El fandom "${requestData.fandom_name}" ha sido creado exitosamente.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error al aprobar fandom:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el fandom",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, fandomName: string) => {
    try {
      setProcessingId(requestId);

      // Actualizar el estado de la solicitud a 'rejected'
      const { error } = await supabase
        .from('fandom_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // Actualizar la lista de solicitudes
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== requestId)
      );

      toast({
        title: "Solicitud rechazada",
        description: `La solicitud para "${fandomName}" ha sido rechazada.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Fandoms</CardTitle>
          <CardDescription>No hay solicitudes pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Todas las solicitudes han sido procesadas. Las nuevas solicitudes aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Solicitudes Pendientes</h2>
      
      {pendingRequests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">{request.fandom_name}</CardTitle>
                <CardDescription>
                  Solicitado por {request.username} • {new Date(request.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => handleReject(request.id, request.fandom_name)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={() => handleApprove(request.id, request)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Aprobar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
              <p className="text-sm mt-1">{request.fandom_description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                <p className="text-sm mt-1">{request.category || 'No especificada'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Motivo de solicitud</h3>
                <p className="text-sm mt-1">{request.reason || 'No proporcionado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 