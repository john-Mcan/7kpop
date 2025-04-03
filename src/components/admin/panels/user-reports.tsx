'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Flag, Check, X, UserX, AlertTriangle } from 'lucide-react';
import UserAvatar from '@/components/ui/user-avatar';

interface UserReport {
  id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: string;
  reporter: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reported_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// Interfaz para la respuesta de Supabase
interface ReportData {
  id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: string;
  reporter_id: string;
  reported_user_id: string;
  reporter: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reported_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function UserReportsPanel() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Modificamos la consulta para un formato más directo
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          id, reason, status, created_at,
          reporter:profiles!user_reports_reporter_id_fkey(id, username, avatar_url),
          reported_user:profiles!user_reports_reported_user_id_fkey(id, username, avatar_url)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data) {
        setReports([]);
        return;
      }
      
      // Formatear datos para facilitar su uso
      const formattedReports: UserReport[] = data.map((report: any) => {
        const reporterData = Array.isArray(report.reporter) ? report.reporter[0] : report.reporter;
        const reportedUserData = Array.isArray(report.reported_user) ? report.reported_user[0] : report.reported_user;
        
        return {
          id: report.id,
          reason: report.reason,
          status: report.status,
          created_at: report.created_at,
          reporter: {
            id: reporterData?.id || '',
            username: reporterData?.username || '',
            avatar_url: reporterData?.avatar_url
          },
          reported_user: {
            id: reportedUserData?.id || '',
            username: reportedUserData?.username || '',
            avatar_url: reportedUserData?.avatar_url
          }
        };
      });

      setReports(formattedReports);
    } catch (error) {
      console.error('Error al cargar reportes de usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reportId: string, action: 'take_action' | 'dismiss') => {
    try {
      setProcessingId(reportId);
      const newStatus = action === 'take_action' ? 'action_taken' : 'dismissed';
      
      // Actualizar estado del reporte
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId);
      
      if (error) throw error;
      
      // Si se toma acción, podríamos implementar alguna acción adicional aquí
      // Por ejemplo, suspender temporalmente al usuario
      
      // Actualizar lista de reportes
      setReports(prevReports => 
        prevReports.filter(report => report.id !== reportId)
      );
      
    } catch (error) {
      console.error('Error al procesar reporte de usuario:', error);
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

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="action_taken">Acción tomada</TabsTrigger>
          <TabsTrigger value="dismissed">Desestimados</TabsTrigger>
        </TabsList>
      </Tabs>

      {reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sin reportes</CardTitle>
            <CardDescription>
              No hay reportes de usuario {activeTab === 'pending' ? 'pendientes' : 
              activeTab === 'action_taken' ? 'con acción tomada' : 'desestimados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Los reportes {activeTab} aparecerán aquí cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-red-500" />
                      Reporte de usuario
                    </CardTitle>
                    <CardDescription>
                      Reportado el {new Date(report.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={
                    report.status === 'pending' ? 'outline' : 
                    report.status === 'action_taken' ? 'destructive' : 'secondary'
                  }>
                    {report.status === 'pending' ? 'Pendiente' : 
                     report.status === 'action_taken' ? 'Acción tomada' : 'Desestimado'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500">Motivo del reporte</h3>
                  <p className="text-sm mt-1">{report.reason}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Usuario que reporta</h3>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <UserAvatar
                          text={report.reporter.username.charAt(0)}
                          size="md"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">@{report.reporter.username}</p>
                        <p className="text-xs text-gray-500">ID: {report.reporter.id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-red-100 rounded-md bg-red-50">
                    <h3 className="text-sm font-medium text-red-800 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                      Usuario reportado
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <UserAvatar
                          text={report.reported_user.username.charAt(0)}
                          size="md"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">@{report.reported_user.username}</p>
                        <p className="text-xs text-gray-500">ID: {report.reported_user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {report.status === 'pending' && (
                <CardFooter className="bg-gray-50 pt-3 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleAction(report.id, 'take_action')}
                    disabled={processingId === report.id}
                  >
                    {processingId === report.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="mr-2 h-4 w-4" />
                    )}
                    Tomar acción
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(report.id, 'dismiss')}
                    disabled={processingId === report.id}
                  >
                    {processingId === report.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Desestimar
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 