"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostFeed from "@/components/post-feed";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Tipo para el perfil de usuario
type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Tipo para un fandom
type Fandom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const { username } = params;
  
  // Estados para los datos del perfil
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userFandoms, setUserFandoms] = useState<Fandom[]>([]);
  const [seguidores, setSeguidores] = useState<number>(0);
  const [siguiendo, setSiguiendo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // Pestañas del perfil
  const [tabs, setTabs] = useState([
    { id: 1, nombre: "Publicaciones", activo: true },
    { id: 2, nombre: "Comentarios", activo: false },
    { id: 3, nombre: "Favoritos", activo: false },
  ]);
  
  // Cargar datos del perfil desde Supabase
  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        // Obtener la sesión actual del usuario
        const { data: { session } } = await supabase.auth.getSession();
        
        // Guardamos el ID del usuario actual si está autenticado
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }
        
        // Obtener el perfil solicitado por username
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();
        
        if (profileError) {
          // Si no se encuentra el perfil
          if (profileError.code === 'PGRST116') {
            console.warn("El perfil solicitado no existe en la BD.", profileError);
            setProfile(null);
          } else {
            throw profileError;
          }
        } else {
          setProfile(profileData);
          
          // Verificar si es el perfil propio
          if (session?.user && profileData.id === session.user.id) {
            setIsOwnProfile(true);
          }
          
          // Obtener los fandoms del usuario
          const { data: fandomData, error: fandomError } = await supabase
            .from("fandom_members")
            .select(`
              fandom_id,
              fandoms:fandom_id (
                id,
                name,
                slug,
                description,
                avatar_url
              )
            `)
            .eq("user_id", profileData.id);
          
          if (fandomError) throw fandomError;
          
          // Filtrar posibles resultados nulos
          const formattedFandoms = fandomData?.map(item => item.fandoms).filter(f => f !== null) as unknown as Fandom[] || [];
          setUserFandoms(formattedFandoms);
          
          // Obtener conteo de seguidores y seguidos
          const [followerResult, followingResult] = await Promise.all([
            supabase.rpc('get_follower_count', { user_id: profileData.id }),
            supabase.rpc('get_following_count', { user_id: profileData.id })
          ]);
          
          if (!followerResult.error) {
            setSeguidores(followerResult.data || 0);
          }
          
          if (!followingResult.error) {
            setSiguiendo(followingResult.data || 0);
          }
        }
      } catch (error) {
        console.error("Error cargando datos del perfil:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfileData();
  }, [username]);
  
  const handleTabClick = (tabId: number) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        activo: tab.id === tabId
      }))
    );
  };
  
  // Formatear fecha de registro
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "Fecha desconocida";
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };
  
  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <>
        <div className="h-full w-full flex bg-gray-50">
          <NavigationSidebar />
          <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
            <p className="text-gray-500">Cargando perfil...</p>
          </main>
          <TrendingSidebar />
        </div>
        <MobileNav />
      </>
    );
  }
  
  // Si el perfil no existe, mostrar error
  if (!profile) {
    return (
      <>
        <div className="h-full w-full flex bg-gray-50">
          <NavigationSidebar />
          <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Perfil no encontrado</h2>
              <p className="text-gray-600">No existe ningún usuario con ese nombre.</p>
              <Button
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/')}
              >
                Volver al inicio
              </Button>
            </div>
          </main>
          <TrendingSidebar />
        </div>
        <MobileNav />
      </>
    );
  }
  
  // Si es el perfil propio, redirigir a la página de perfil estándar
  if (isOwnProfile) {
    router.push('/perfil');
    return (
      <div className="h-full w-full flex bg-gray-50">
        <NavigationSidebar />
        <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
          <p className="text-gray-500">Redirigiendo a tu perfil personal...</p>
        </main>
        <TrendingSidebar />
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Contenido */}
        <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Banner del perfil */}
          <div className="w-full h-32 sm:h-40 md:h-52 relative bg-gradient-to-r from-purple-500 to-indigo-600">
            {/* Banner personalizable */}
          </div>
          
          <div className="max-w-3xl mx-auto px-3 sm:px-4">
            {/* Avatar del usuario */}
            <div className="flex justify-center sm:justify-start -mt-14 sm:-mt-16 md:-mt-20 mb-4 sm:mb-0 relative z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-md bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username || 'Avatar de usuario'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {profile.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Información del usuario y botones en la misma fila */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-4 sm:mt-6">
              {/* Nombre del usuario */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent text-center sm:text-left">
                {profile.username || 'Usuario sin nombre'}
              </h1>
              
              {/* Botones de acción */}
              <div className="flex justify-center sm:justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-full text-sm bg-white border-gray-200 shadow-sm hover:bg-gray-50 flex-1 sm:flex-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  Compartir
                </Button>
                <Button size="sm" className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-sm hover:shadow hover:opacity-90 transition-all flex-1 sm:flex-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="18" y1="8" x2="23" y2="13"></line>
                    <line x1="23" y1="8" x2="18" y2="13"></line>
                  </svg>
                  Seguir
                </Button>
              </div>
            </div>
            
            {/* Información del usuario - Estadísticas */}
            <div className="sm:mt-4">
              {/* Solo para dispositivos medianos y grandes (desktop) */}
              <div className="hidden sm:block">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span><strong>{seguidores}</strong> seguidores</span>
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" y1="8" x2="23" y2="13"></line>
                        <line x1="23" y1="8" x2="18" y2="13"></line>
                      </svg>
                      <span><strong>{siguiendo}</strong> siguiendo</span>
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Miembro desde {profile.created_at ? formatMemberSince(profile.created_at) : '...'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Solo para dispositivos pequeños (móvil) */}
              <div className="flex flex-col sm:hidden">
                <div className="text-center">
                  <p className="text-sm text-gray-500">@{profile.username || 'usuario'}</p>
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span><strong>{seguidores}</strong> seguidores</span>
                    </div>
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" y1="8" x2="23" y2="13"></line>
                        <line x1="23" y1="8" x2="18" y2="13"></line>
                      </svg>
                      <span><strong>{siguiendo}</strong> siguiendo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Biografía */}
            <div className="mt-6 mb-5 bg-white rounded-lg border border-gray-100 shadow-sm p-3.5 sm:p-4">
              <p className="text-sm text-gray-600">
                {profile.bio || 'Sin biografía todavía...'}
              </p>
            </div>
            
            {/* Fandoms */}
            <div className="mb-6 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">Fandoms</h2>
              <div className="flex flex-wrap gap-2">
                {userFandoms.length > 0 ? (
                  userFandoms.map((fandom) => (
                    <Button 
                      key={fandom.id} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs hover:bg-purple-50 hover:text-purple-600"
                      onClick={() => router.push(`/fandoms/${fandom.slug || fandom.id}`)}
                    >
                      {fandom.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Este usuario no pertenece a ningún fandom</p>
                )}
              </div>
            </div>
            
            {/* Pestañas de navegación */}
            <div className="border-b border-gray-200 mb-5 overflow-x-auto">
              <div className="flex space-x-4 sm:space-x-6 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`py-2.5 sm:py-3 text-sm font-medium transition-colors border-b-2 px-2 ${
                      tab.activo
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.nombre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Feed de publicaciones */}
            <div className="mb-6">
              {tabs[0].activo && <PostFeed userId={profile.id} />}
              {tabs[1].activo && <div className="bg-white p-5 rounded-xl text-center text-gray-500">Comentarios próximamente</div>}
              {tabs[2].activo && <div className="bg-white p-5 rounded-xl text-center text-gray-500">Favoritos próximamente</div>}
            </div>
          </div>
        </main>

        {/* Columna derecha - Tendencias */}
        <TrendingSidebar />
      </div>
      
      {/* Navegación móvil */}
      <MobileNav />
    </>
  );
}
