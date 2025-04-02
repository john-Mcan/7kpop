'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PendingFandomsPanel from './panels/pending-fandoms';
import ModeratorsPanel from './panels/moderators-panel';
import ReportedPostsPanel from './panels/reported-posts';
import UserReportsPanel from './panels/user-reports';
import { supabase } from '@/lib/supabase/client';
import { 
  Users, Flag, UserCog, Settings, 
  LayoutDashboard, TrendingUp, CheckCircle, XCircle,
  Loader2
} from 'lucide-react';

// Interfaces para los datos que manejaremos
interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  date: string;
}

interface FandomItem {
  id: string;
  name: string;
  slug: string;
  members: number;
  posts: number;
}

// Interfaces para Supabase
interface SupabaseFandomName {
  name: string;
}

interface SupabaseReport {
  id: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  post_id: string | null;
  comment_id: string | null;
  fandoms: SupabaseFandomName;
}

// Componente de tarjeta de estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

// Componente de Estadísticas
function StatCard({ title, value, description, icon, trend, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-purple-100 p-1 text-purple-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-500">Cargando...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-gray-500">{description}
              {trend !== undefined && (
                <span className={`ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Interfaz para el estado
interface DashboardStats {
  totalFandoms: number;
  newPosts: number;
  pendingReports: number;
  pendingFandomRequests: number;
  activities: ActivityItem[];
  topFandoms: FandomItem[];
  loadingStats: boolean;
  loadingActivities: boolean;
  loadingTopFandoms: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalFandoms: 0,
    newPosts: 0,
    pendingReports: 0,
    pendingFandomRequests: 0,
    activities: [],
    topFandoms: [],
    loadingStats: true,
    loadingActivities: true,
    loadingTopFandoms: true
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
      loadRecentActivity();
      loadTopFandoms();
    }
  }, [activeTab]);

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    try {
      setStats(s => ({ ...s, loadingStats: true }));
      
      // Total de fandoms aprobados
      const { count: totalFandoms, error: fandomsError } = await supabase
        .from('fandoms')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      if (fandomsError) throw fandomsError;

      // Posts nuevos en los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: newPosts, error: postsError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());
      
      if (postsError) throw postsError;

      // Reportes pendientes
      const { count: pendingReports, error: reportsError } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (reportsError) throw reportsError;

      // Solicitudes de fandom pendientes
      const { count: pendingFandomRequests, error: requestsError } = await supabase
        .from('fandom_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (requestsError) throw requestsError;

      setStats(s => ({
        ...s,
        totalFandoms: totalFandoms || 0,
        newPosts: newPosts || 0,
        pendingReports: pendingReports || 0,
        pendingFandomRequests: pendingFandomRequests || 0,
        loadingStats: false
      }));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setStats(s => ({ ...s, loadingStats: false }));
    }
  };

  // Cargar actividad reciente
  const loadRecentActivity = async () => {
    try {
      setStats(s => ({ ...s, loadingActivities: true }));
      
      // Obtener mezcla de actividades recientes (aprobaciones de fandom, reportes, etc.)
      const { data: recentReports, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id, status, created_at, reviewed_at,
          post_id, comment_id,
          fandoms:fandom_id(name)
        `)
        .order('reviewed_at', { ascending: false })
        .in('status', ['accepted', 'rejected'])
        .limit(3);
      
      if (reportsError) throw reportsError;

      const { data: recentFandomApprovals, error: fandomsError } = await supabase
        .from('fandoms')
        .select('id, name, status, created_at')
        .in('status', ['approved', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (fandomsError) throw fandomsError;

      // Combinar actividades y ordenar por fecha
      const activities: ActivityItem[] = [
        ...(recentReports || []).map((report: any) => ({
          id: report.id,
          type: report.status === 'accepted' ? 'report_accepted' : 'report_rejected',
          title: report.status === 'accepted' ? 'Reporte aceptado' : 'Reporte rechazado',
          subtitle: `Fandom: ${report.fandoms?.name || 'Desconocido'}`,
          date: report.reviewed_at || report.created_at
        })),
        ...(recentFandomApprovals || []).map(fandom => ({
          id: fandom.id,
          type: fandom.status === 'approved' ? 'fandom_approved' : 'fandom_rejected',
          title: fandom.status === 'approved' ? 'Fandom aprobado' : 'Fandom rechazado',
          subtitle: fandom.name || 'Desconocido',
          date: fandom.created_at
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

      setStats(s => ({
        ...s,
        activities,
        loadingActivities: false
      }));
    } catch (error) {
      console.error('Error al cargar actividad reciente:', error);
      setStats(s => ({ ...s, loadingActivities: false }));
    }
  };

  // Cargar fandoms más activos
  const loadTopFandoms = async () => {
    try {
      setStats(s => ({ ...s, loadingTopFandoms: true }));
      
      // Obtener fandoms con más posts y miembros
      const { data, error } = await supabase
        .rpc('get_top_active_fandoms', { limit_count: 5 });
      
      if (error) throw error;

      // Si no existe la función RPC, usar enfoque alternativo
      if (!data) {
        const { data: fandoms, error: fandomsError } = await supabase
          .from('fandoms')
          .select(`
            id, name, slug,
            posts(count),
            fandom_members(count)
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (fandomsError) throw fandomsError;

        const formattedFandoms: FandomItem[] = (fandoms || []).map(fandom => ({
          id: fandom.id || '',
          name: fandom.name || '',
          slug: fandom.slug || '',
          members: fandom.fandom_members?.length || 0,
          posts: fandom.posts?.length || 0
        }));

        setStats(s => ({
          ...s,
          topFandoms: formattedFandoms,
          loadingTopFandoms: false
        }));
        return;
      }

      // Convertir los datos RPC a nuestro formato
      const formattedData: FandomItem[] = data.map((item: any) => ({
        id: item.id || '',
        name: item.name || '',
        slug: item.slug || '',
        members: item.members_count || 0,
        posts: item.posts_count || 0
      }));

      setStats(s => ({
        ...s,
        topFandoms: formattedData,
        loadingTopFandoms: false
      }));
    } catch (error) {
      console.error('Error al cargar fandoms más activos:', error);
      setStats(s => ({ ...s, loadingTopFandoms: false }));
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-center gap-1 bg-gray-100 p-1 mb-6">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="fandoms" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Fandoms Pendientes
          </TabsTrigger>
          <TabsTrigger 
            value="moderators" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Moderadores
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
          >
            <Flag className="w-4 h-4 mr-2" />
            Reportes
          </TabsTrigger>
          <TabsTrigger 
            value="user-reports" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
          >
            <Flag className="w-4 h-4 mr-2" />
            Reportes de Usuario
          </TabsTrigger>
        </TabsList>

        {/* Panel de Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total de Fandoms"
              value={stats.totalFandoms}
              description="Fandoms aprobados"
              icon={<Users />}
              loading={stats.loadingStats}
            />
            <StatCard
              title="Posts Nuevos"
              value={stats.newPosts}
              description="Últimos 7 días"
              icon={<TrendingUp />}
              loading={stats.loadingStats}
            />
            <StatCard
              title="Reportes Pendientes"
              value={stats.pendingReports}
              description="Requieren acción"
              icon={<Flag />}
              loading={stats.loadingStats}
            />
            <StatCard
              title="Solicitudes de Fandom"
              value={stats.pendingFandomRequests}
              description="Pendientes de revisión"
              icon={<Users />}
              loading={stats.loadingStats}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.loadingActivities ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : stats.activities.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No hay actividad reciente</p>
                ) : (
                  <div className="space-y-4">
                    {stats.activities.map((activity, i) => (
                      <div key={activity.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.type.includes('approved') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {activity.type.includes('approved') ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.subtitle}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleString('es', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Fandoms Más Activos</CardTitle>
                <CardDescription>Basado en actividad reciente</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.loadingTopFandoms ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : stats.topFandoms.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No hay fandoms activos</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topFandoms.map((fandom, i) => (
                      <div key={fandom.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{fandom.name}</p>
                            <p className="text-xs text-gray-500">{fandom.members} miembros</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">{fandom.posts} posts</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fandoms">
          <PendingFandomsPanel />
        </TabsContent>

        <TabsContent value="moderators">
          <ModeratorsPanel />
        </TabsContent>

        <TabsContent value="reports">
          <ReportedPostsPanel isAdmin={true} />
        </TabsContent>

        <TabsContent value="user-reports">
          <UserReportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}