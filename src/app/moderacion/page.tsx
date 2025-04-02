'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/admin/admin-dashboard';
import ModeratorDashboard from '@/components/admin/moderator-dashboard';
import { ProtectedRoute } from '@/lib/supabase/protected-route';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

export default function ModeracionPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;

      try {
        // Verificar si es administrador
        const { data: adminData, error: adminError } = await supabase
          .rpc('is_admin');

        if (adminError) throw adminError;
        setIsAdmin(adminData);

        if (!adminData) {
          // Si no es admin, verificar si es moderador de algún fandom
          const { data: modData, error: modError } = await supabase
            .from('fandom_moderators')
            .select('fandom_id')
            .eq('user_id', user.id);

          if (modError) throw modError;
          setIsModerator(modData && modData.length > 0);
        }
      } catch (error) {
        console.error('Error al verificar rol del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Redirigir al inicio si no es admin ni moderador
  useEffect(() => {
    if (!loading && !isAdmin && !isModerator) {
      router.push('/');
    }
  }, [isAdmin, isModerator, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-700">Verificando permisos...</span>
      </div>
    );
  }

  if (!isAdmin && !isModerator) {
    return null; // No renderizar nada mientras se redirige
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center">
          {isAdmin ? (
            <Shield className="mr-3 h-8 w-8 text-purple-600" />
          ) : (
            <ShieldAlert className="mr-3 h-8 w-8 text-indigo-600" />
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de {isAdmin ? 'Administración' : 'Moderación'}
          </h1>
        </div>

        <Tabs defaultValue={isAdmin ? "admin" : "mod"} className="w-full">
          {isAdmin && (
            <TabsList className="mb-6">
              <TabsTrigger value="admin">Administración</TabsTrigger>
              <TabsTrigger value="mod">Moderación</TabsTrigger>
            </TabsList>
          )}

          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}

          <TabsContent value="mod">
            <ModeratorDashboard userId={user?.id} isAdmin={!!isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 