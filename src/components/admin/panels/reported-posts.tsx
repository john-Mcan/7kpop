'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Flag, Check, X, ExternalLink, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interfaces para tipar los datos de Supabase
// Definir interfaces específicas para la respuesta de Supabase
interface SupabaseProfile {
  id: string;
  username: string;
}

interface SupabasePostProfile {
  username: string;
}

interface SupabasePost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  profiles: SupabasePostProfile;
}

interface SupabaseComment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  profiles: SupabasePostProfile;
}

interface SupabaseFandom {
  id: string;
  name: string;
  slug: string;
}

interface SupabaseReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_id: string;
  profiles: SupabaseProfile;
  post_id: string | null;
  posts: SupabasePost | null;
  comment_id: string | null;
  comments: SupabaseComment | null;
  fandom_id: string;
  fandoms: SupabaseFandom;
}

// Interfaces para el manejo interno de datos
interface ReportedItem {
  id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  reporter: {
    id: string;
    username: string;
  };
  post?: {
    id: string;
    title: string;
    content: string;
    user_id: string;
    author: {
      username: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    user_id: string;
    post_id: string;
    author: {
      username: string;
    };
  };
  fandom: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ReportedPostsPanelProps {
  isAdmin: boolean;
  fandomId?: string;
}

export default function ReportedPostsPanel({ isAdmin, fandomId }: ReportedPostsPanelProps) {
  const [reports, setReports] = useState<ReportedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reportId: string | null;
    action: 'accept' | 'reject' | null;
    title: string;
    description: string;
  }>({
    open: false,
    reportId: null,
    action: null,
    title: '',
    description: ''
  });
  
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadReports();
  }, [fandomId, activeTab, page]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Primero obtenemos el total de reportes para la paginación
      let countQuery = supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', activeTab);
      
      // Si es moderador o se especifica un fandom, filtrar por fandom
      if (fandomId) {
        countQuery = countQuery.eq('fandom_id', fandomId);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalReports(count || 0);
      
      // Ahora obtenemos los datos para la página actual
      let query = supabase
        .from('reports')
        .select(`
          id, reason, status, created_at,
          reporter_id,
          profiles!reports_reporter_id_fkey(id, username),
          post_id,
          posts(id, title, content, user_id, profiles(username)),
          comment_id,
          comments(id, content, user_id, post_id, profiles(username)),
          fandom_id,
          fandoms(id, name, slug)
        `)
        .eq('status', activeTab);
      
      // Si es moderador o se especifica un fandom, filtrar por fandom
      if (fandomId) {
        query = query.eq('fandom_id', fandomId);
      }
      
      // Añadir paginación
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      if (!data) {
        setReports([]);
        return;
      }

      // Formatear datos para facilitar su uso
      const formattedReports: ReportedItem[] = data.map((report: any) => {
        // Crear objeto con la estructura deseada para evitar errores de tipo
        const formattedReport: ReportedItem = {
          id: report.id,
          reason: report.reason,
          status: report.status as 'pending' | 'reviewed' | 'accepted' | 'rejected',
          created_at: report.created_at,
          reporter: {
            id: report.profiles.id,
            username: report.profiles.username
          },
          fandom: {
            id: report.fandoms.id,
            name: report.fandoms.name,
            slug: report.fandoms.slug
          }
        };

        // Agregar datos de post si existe
        if (report.post_id && report.posts) {
          formattedReport.post = {
            id: report.posts.id,
            title: report.posts.title,
            content: report.posts.content,
            user_id: report.posts.user_id,
            author: {
              username: report.posts.profiles.username
            }
          };
        }

        // Agregar datos de comentario si existe
        if (report.comment_id && report.comments) {
          formattedReport.comment = {
            id: report.comments.id,
            content: report.comments.content,
            user_id: report.comments.user_id,
            post_id: report.comments.post_id,
            author: {
              username: report.comments.profiles.username
            }
          };
        }

        return formattedReport;
      });

      setReports(formattedReports);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para preparar el diálogo de confirmación
  const openConfirmDialog = (reportId: string, action: 'accept' | 'reject') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const isPost = !!report.post;
    const contentType = isPost ? 'publicación' : 'comentario';
    const authorName = isPost ? report.post?.author.username : report.comment?.author.username;
    
    setConfirmDialog({
      open: true,
      reportId,
      action,
      title: action === 'accept' 
        ? `Aceptar reporte de ${contentType}`
        : `Rechazar reporte de ${contentType}`,
      description: action === 'accept'
        ? `¿Estás seguro que deseas aceptar este reporte? El ${contentType} de @${authorName} será eliminado y se notificará al autor.`
        : `¿Estás seguro que deseas rechazar este reporte? No se tomará ninguna acción sobre el ${contentType} de @${authorName}.`
    });
  };
  
  // Manejar la acción de los reportes después de la confirmación
  const handleReportAction = async (reportId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(reportId);
      setConfirmDialog(prev => ({ ...prev, open: false }));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // 1. Actualizar estado del reporte
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);
      
      if (updateError) throw updateError;

      // 2. Si se acepta el reporte, eliminar el contenido reportado
      if (action === 'accept') {
        if (report.post) {
          // Eliminar post reportado
          const { error: deletePostError } = await supabase
            .from('posts')
            .delete()
            .eq('id', report.post.id);
          
          if (deletePostError) throw deletePostError;
        } else if (report.comment) {
          // Eliminar comentario reportado
          const { error: deleteCommentError } = await supabase
            .from('comments')
            .delete()
            .eq('id', report.comment.id);
          
          if (deleteCommentError) throw deleteCommentError;
        }
      }

      // 3. Recargar datos
      await loadReports();
    } catch (error) {
      console.error(`Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} reporte:`, error);
    } finally {
      setProcessingId(null);
    }
  };
  
  // Funciones para paginación
  const goToNextPage = () => {
    if (page * ITEMS_PER_PAGE < totalReports) {
      setPage(p => p + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const getContentExcerpt = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          setPage(1); // Reiniciar a primera página al cambiar de tab
        }}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="reviewed">Revisados</TabsTrigger>
          <TabsTrigger value="accepted">Aceptados</TabsTrigger>
          <TabsTrigger value="rejected">Rechazados</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sin reportes</CardTitle>
            <CardDescription>
              No hay reportes {activeTab === 'pending' ? 'pendientes' : activeTab === 'reviewed' ? 'en revisión' : 
              activeTab === 'accepted' ? 'aceptados' : 'rechazados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              Los reportes {activeTab} aparecerán aquí cuando estén disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        <Flag className="h-4 w-4 mr-2 text-red-500" />
                        Reporte {report.post ? 'de publicación' : 'de comentario'}
                      </CardTitle>
                      <CardDescription>
                        Reportado por @{report.reporter.username} • {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      report.status === 'pending' ? 'outline' : 
                      report.status === 'accepted' ? 'destructive' : 
                      report.status === 'rejected' ? 'secondary' : 'default'
                    }>
                      {report.status === 'pending' ? 'Pendiente' : 
                       report.status === 'accepted' ? 'Aceptado' : 
                       report.status === 'rejected' ? 'Rechazado' : 'En revisión'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Motivo del reporte</h3>
                    <p className="text-sm mt-1">{report.reason}</p>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium flex items-center">
                        {report.post ? (
                          <span className="flex items-center">
                            <span className="mr-1">Publicación de</span> 
                            <Badge variant="outline" className="ml-1 font-normal">
                              @{report.post.author.username}
                            </Badge>
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            <span className="mr-1">Comentario de</span>
                            <Badge variant="outline" className="ml-1 font-normal">
                              @{report.comment?.author.username}
                            </Badge>
                          </span>
                        )}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {report.fandom.name}
                      </Badge>
                    </div>
                    
                    {report.post ? (
                      <>
                        <h4 className="text-sm font-medium">{report.post.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          {getContentExcerpt(report.post.content)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {getContentExcerpt(report.comment?.content || '')}
                      </p>
                    )}
                  </div>
                </CardContent>
                
                {report.status === 'pending' && (
                  <CardFooter className="bg-gray-50 pt-3 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => openConfirmDialog(report.id, 'accept')}
                      disabled={processingId === report.id}
                    >
                      {processingId === report.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Aceptar Reporte
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConfirmDialog(report.id, 'reject')}
                      disabled={processingId === report.id}
                    >
                      {processingId === report.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Rechazar Reporte
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      asChild
                    >
                      <a 
                        href={report.post 
                          ? `/fandoms/${report.fandom.slug}/posts/${report.post.id}`
                          : `/fandoms/${report.fandom.slug}/posts/${report.comment?.post_id}#comment-${report.comment?.id}`
                        } 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver
                      </a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
          
          {/* Paginación */}
          {totalReports > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalReports)}-
                {Math.min(page * ITEMS_PER_PAGE, totalReports)} de {totalReports} reportes
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevPage} 
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextPage} 
                  disabled={page * ITEMS_PER_PAGE >= totalReports}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button 
              variant={confirmDialog.action === 'accept' ? 'destructive' : 'default'}
              onClick={() => {
                if (confirmDialog.reportId && confirmDialog.action) {
                  handleReportAction(confirmDialog.reportId, confirmDialog.action);
                }
              }}
            >
              {confirmDialog.action === 'accept' ? 'Sí, aceptar reporte' : 'Sí, rechazar reporte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}