'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Flag, MessageSquare, AlertTriangle, Users, Loader2 } from 'lucide-react';
import ReportedPostsPanel from './panels/reported-posts';
import FandomMembersPanel from './panels/fandom-members';

interface Fandom {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  banner_url: string | null;
  slug: string;
}

interface ModeratorDashboardProps {
  userId: string | undefined;
  isAdmin: boolean;
}

interface ModeratorStats {
  pendingReports: number;
  totalMembers: number;
  activeMembers: number;
  newMembersLastWeek: number;
  totalPosts: number;
  loadingStats: boolean;
}

interface SupabaseFandom {
  id: string; 
  name: string;
  description: string;
  avatar_url: string | null;
  banner_url: string | null;
  slug: string;
}

interface ModeratorResult {
  fandom_id: string;
  fandoms: SupabaseFandom;
}

export default function ModeratorDashboard({ userId, isAdmin }: ModeratorDashboardProps) {
  const [fandoms, setFandoms] = useState<Fandom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFandom, setSelectedFandom] = useState<string | null>(null);
  const [stats, setStats] = useState<ModeratorStats>({
    pendingReports: 0,
    totalMembers: 0,
    activeMembers: 0,
    newMembersLastWeek: 0,
    totalPosts: 0,
    loadingStats: true
  });

  useEffect(() => {
    if (userId) {
      loadModeratedFandoms();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedFandom) {
      loadFandomStats(selectedFandom);
    }
  }, [selectedFandom]);

  const loadModeratedFandoms = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('fandom_moderators')
        .select(`
          fandom_id,
          fandoms:fandom_id(
            id, 
            name, 
            description,
            avatar_url,
            banner_url,
            slug
          )
        `);
      
      // Si es moderador (no admin), filtrar por su ID
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setFandoms([]);
        setLoading(false);
        return;
      }
      
      // Usamos any para solucionar el problema de tipado con la respuesta de Supabase
      const fandomsList: Fandom[] = data.map((item: any) => ({
        id: item.fandoms?.id || '',
        name: item.fandoms?.name || '',
        description: item.fandoms?.description || '',
        avatar_url: item.fandoms?.avatar_url,
        banner_url: item.fandoms?.banner_url,
        slug: item.fandoms?.slug || ''
      }));
      
      setFandoms(fandomsList);
      
      // Si hay fandoms, seleccionar el primero por defecto
      if (fandomsList.length > 0) {
        setSelectedFandom(fandomsList[0].id);
      }
      
    } catch (error) {
      console.error('Error al cargar fandoms moderados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadFandomStats = async (fandomId: string) => {
    try {
      setStats(prev => ({ ...prev, loadingStats: true }));
      
      // Cargar reportes pendientes
      const { count: pendingReports, error: reportsError } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('fandom_id', fandomId)
        .eq('status', 'pending');
      
      if (reportsError) throw reportsError;
      
      // Cargar total de miembros y miembros activos
      const { data: membersData, error: membersError } = await supabase
        .from('fandom_members')
        .select('user_id, status')
        .eq('fandom_id', fandomId);
      
      if (membersError) throw membersError;
      
      const totalMembers = membersData?.length || 0;
      const activeMembers = membersData?.filter(m => m.status === 'active').length || 0;
      
      // Cargar nuevos miembros de la última semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newMembersLastWeek, error: newMembersError } = await supabase
        .from('fandom_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('fandom_id', fandomId)
        .gte('joined_at', oneWeekAgo.toISOString());
      
      if (newMembersError) throw newMembersError;
      
      // Cargar total de posts
      const { count: totalPosts, error: postsError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('fandom_id', fandomId);
      
      if (postsError) throw postsError;
      
      setStats({
        pendingReports: pendingReports || 0,
        totalMembers,
        activeMembers,
        newMembersLastWeek: newMembersLastWeek || 0,
        totalPosts: totalPosts || 0,
        loadingStats: false
      });
      
    } catch (error) {
      console.error('Error al cargar estadísticas del fandom:', error);
      setStats(prev => ({ ...prev, loadingStats: false }));
    }
  };
  
  const selectedFandomData = fandoms.find(f => f.id === selectedFandom);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (fandoms.length === 0) {
    return (
      <Alert className="bg-amber-50 text-amber-800 border-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sin fandoms asignados</AlertTitle>
        <AlertDescription>
          {isAdmin 
            ? "No hay fandoms con moderadores asignados." 
            : "No tienes fandoms asignados para moderar."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {fandoms.map((fandom) => (
          <Badge
            key={fandom.id}
            variant={selectedFandom === fandom.id ? "default" : "outline"}
            className="cursor-pointer text-sm py-1.5"
            onClick={() => setSelectedFandom(fandom.id)}
          >
            {fandom.name}
          </Badge>
        ))}
      </div>

      {selectedFandomData ? (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="md:w-2/3">
              <h2 className="text-xl font-bold mb-2">{selectedFandomData.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{selectedFandomData.description}</p>
            </div>
            
            <div className="md:w-1/3 flex items-center justify-end">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                {selectedFandomData.avatar_url ? (
                  <img 
                    src={selectedFandomData.avatar_url} 
                    alt={selectedFandomData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-800">
                    {selectedFandomData.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
              <TabsTrigger value="members">Miembros</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Reportes Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center">
                        <Flag className="h-5 w-5 mr-2 text-red-500" />
                        <div className="text-2xl font-bold">{stats.pendingReports}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Miembros Activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-500" />
                        <div className="text-2xl font-bold">{stats.activeMembers}</div>
                      </div>
                    )}
                    {!stats.loadingStats && (
                      <CardDescription className="text-xs mt-1">
                        De {stats.totalMembers} miembros totales
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Publicaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.loadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                        <div className="text-2xl font-bold">{stats.totalPosts}</div>
                      </div>
                    )}
                    {!stats.loadingStats && stats.newMembersLastWeek > 0 && (
                      <CardDescription className="text-xs mt-1">
                        +{stats.newMembersLastWeek} nuevos miembros esta semana
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">¿Qué puedes hacer como moderador?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full">
                      <Flag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Revisar Reportes</h3>
                      <p className="text-sm text-gray-600">Gestiona los reportes de publicaciones y comentarios.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Moderar Miembros</h3>
                      <p className="text-sm text-gray-600">Silencia o expulsa a usuarios que incumplan las normas.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              {selectedFandom && (
                <ReportedPostsPanel isAdmin={isAdmin} fandomId={selectedFandom} />
              )}
            </TabsContent>

            <TabsContent value="members">
              {selectedFandom && (
                <FandomMembersPanel isAdmin={isAdmin} fandomId={selectedFandom} />
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Selecciona un fandom para ver sus detalles
        </div>
      )}
    </div>
  );
} 