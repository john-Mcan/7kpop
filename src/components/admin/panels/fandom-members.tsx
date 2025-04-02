'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, UserMinus, Shield, UserX } from 'lucide-react';
import UserAvatar from '@/components/ui/user-avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProfileData {
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface Member {
  id: string;
  role: 'member' | 'moderator' | 'banned';
  created_at: string;
  user_id: string;
  fandom_id: string;
  profiles: ProfileData;
  is_founder?: boolean;
}

interface FandomMembersPanelProps {
  isAdmin: boolean;
  fandomId?: string;
}

export default function FandomMembersPanel({ isAdmin, fandomId }: FandomMembersPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (fandomId) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [fandomId, activeTab]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Determinar el rol a filtrar según la pestaña activa
      const roleFilter = 
        activeTab === 'members' ? 'member' : 
        activeTab === 'moderators' ? 'moderator' : 'banned';
      
      const { data, error } = await supabase
        .from('fandom_members')
        .select(`
          id, role, created_at, user_id, fandom_id,
          profiles(username, display_name, avatar_url)
        `)
        .eq('fandom_id', fandomId as string)
        .eq('role', roleFilter)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Si también es admin, verificar quién es el fundador
      if (isAdmin) {
        const { data: fandomData } = await supabase
          .from('fandoms')
          .select('created_by')
          .eq('id', fandomId as string)
          .single();
        
        if (fandomData) {
          // Marcar el fundador
          const founderId = fandomData.created_by;
          // Formatear correctamente los datos
          const formattedMembers: Member[] = data.map((member: any) => ({
            id: member.id,
            role: member.role,
            created_at: member.created_at,
            user_id: member.user_id,
            fandom_id: member.fandom_id,
            profiles: member.profiles,
            is_founder: member.user_id === founderId
          }));
          
          setMembers(formattedMembers);
        } else {
          // Formatear correctamente los datos
          const formattedMembers: Member[] = data.map((member: any) => ({
            id: member.id,
            role: member.role,
            created_at: member.created_at,
            user_id: member.user_id,
            fandom_id: member.fandom_id,
            profiles: member.profiles
          }));
          
          setMembers(formattedMembers);
        }
      } else {
        // Formatear correctamente los datos
        const formattedMembers: Member[] = data.map((member: any) => ({
          id: member.id,
          role: member.role,
          created_at: member.created_at,
          user_id: member.user_id,
          fandom_id: member.fandom_id,
          profiles: member.profiles
        }));
        
        setMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error al cargar miembros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'member' | 'moderator' | 'banned') => {
    try {
      setProcessingId(memberId);
      
      // Actualizar rol del miembro
      const { error } = await supabase
        .from('fandom_members')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', memberId);
      
      if (error) throw error;
      
      // Actualizar la lista sin recargar
      if (activeTab === 'members' && newRole !== 'member' ||
          activeTab === 'moderators' && newRole !== 'moderator' ||
          activeTab === 'banned' && newRole !== 'banned') {
        // Si el nuevo rol no pertenece a la pestaña actual, eliminar
        setMembers(prevMembers => 
          prevMembers.filter(member => member.id !== memberId)
        );
      } else {
        // Actualizar el rol en la lista actual
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!fandomId) {
    return (
      <Alert>
        <AlertTitle>No hay un fandom seleccionado</AlertTitle>
        <AlertDescription>
          Selecciona un fandom desde el panel lateral para administrar sus miembros.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="moderators">Moderadores</TabsTrigger>
          <TabsTrigger value="banned">Baneados</TabsTrigger>
        </TabsList>
      </Tabs>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sin miembros</CardTitle>
            <CardDescription>
              No hay {activeTab === 'members' ? 'miembros' : 
              activeTab === 'moderators' ? 'moderadores' : 'usuarios baneados'} en este fandom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Los {activeTab === 'members' ? 'miembros' : 
              activeTab === 'moderators' ? 'moderadores' : 'usuarios baneados'} aparecerán aquí cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <UserAvatar
                      src={member.profiles.avatar_url}
                      text={member.profiles.username}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium">
                        {member.profiles.display_name || member.profiles.username}
                        {member.is_founder && (
                          <Badge variant="secondary" className="ml-2">Fundador</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">@{member.profiles.username}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Miembro desde {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {activeTab !== 'moderators' && !member.is_founder && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleRoleChange(member.id, 'moderator')}
                        disabled={processingId === member.id}
                      >
                        {processingId === member.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="mr-2 h-4 w-4" />
                        )}
                        Hacer Moderador
                      </Button>
                    )}
                    
                    {activeTab === 'moderators' && !member.is_founder && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(member.id, 'member')}
                        disabled={processingId === member.id}
                      >
                        {processingId === member.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="mr-2 h-4 w-4" />
                        )}
                        Quitar Moderador
                      </Button>
                    )}
                    
                    {activeTab !== 'banned' && !member.is_founder && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRoleChange(member.id, 'banned')}
                        disabled={processingId === member.id}
                      >
                        {processingId === member.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="mr-2 h-4 w-4" />
                        )}
                        Banear
                      </Button>
                    )}
                    
                    {activeTab === 'banned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleRoleChange(member.id, 'member')}
                        disabled={processingId === member.id}
                      >
                        {processingId === member.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="mr-2 h-4 w-4" />
                        )}
                        Restaurar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 