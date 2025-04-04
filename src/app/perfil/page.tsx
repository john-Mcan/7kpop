"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Link as LinkIcon } from "lucide-react";
import PostFeed from "@/components/post-feed";
import { Image } from "lucide-react";
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

export default function PerfilPage() {
  // Estados para los datos del perfil
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userFandoms, setUserFandoms] = useState<Fandom[]>([]);
  const [seguidores, setSeguidores] = useState<number>(0);
  const [siguiendo, setSiguiendo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [postFeedKey, setPostFeedKey] = useState(0);
  
  // Pestañas del perfil
  const [tabs, setTabs] = useState([
    { id: 1, nombre: "Publicaciones", activo: true },
    { id: 2, nombre: "Comentarios", activo: false },
    { id: 3, nombre: "Favoritos", activo: false },
  ]);
  
  // Estados para el componente de creación de posts
  const [postText, setPostText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [postUrl, setPostUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Referencias para los inputs de archivos
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Cargar datos del perfil desde Supabase
  useEffect(() => {
    async function loadProfileData() {
      setLoading(true); // Asegurarse de poner loading en true al inicio
      try {
        // Obtener la sesión actual del usuario
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Manejar error de sesión
        if (sessionError) throw sessionError;

        if (!session?.user) {
          // Si no hay sesión/usuario, no hay perfil que cargar
          setProfile(null); 
          setLoading(false);
          // Podrías redirigir al login aquí si es necesario
          console.log("Usuario no autenticado.");
          return;
        }
        
        const userId = session.user.id;

        // Obtener el perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (profileError) {
          // Manejar caso donde el perfil no existe (podría pasar si el trigger falló)
          // PGRST116: Supabase code for "Requested range not satisfiable" (0 rows found)
          if (profileError.code === 'PGRST116') { 
             console.warn("El perfil para el usuario no existe en la BD.", profileError);
             // Podríamos intentar crear un perfil aquí o mostrar un error específico
             // Por ahora, lo dejamos como null para mostrar el mensaje de error
             setProfile(null);
          } else {
            throw profileError; // Lanzar otros errores inesperados
          }
        } else {
           setProfile(profileData);
        }
        
        // Obtener los fandoms del usuario (solo si hay perfil)
        // Asegurarse de que fandoms esté vacío si no hay perfil o si la consulta falla
        let formattedFandoms: Fandom[] = []; 
        if (profileData) { 
            try {
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
                .eq("user_id", userId);
                
                if (fandomError) throw fandomError;
                
                // Filtrar posibles resultados nulos si una relación falla
                formattedFandoms = fandomData?.map(item => item.fandoms).filter(f => f !== null) as unknown as Fandom[] || [];
            } catch (fandomError) {
                console.error("Error obteniendo fandoms:", fandomError);
                // Mantener formattedFandoms como [] en caso de error
            }
        }
        setUserFandoms(formattedFandoms);
        
        // Obtener conteo de seguidores y seguidos usando Promise.all para eficiencia
        const [followerResult, followingResult] = await Promise.all([
          supabase.rpc('get_follower_count', { user_id: userId }),
          supabase.rpc('get_following_count', { user_id: userId })
        ]);

        if (followerResult.error) {
          console.error("Error obteniendo seguidores:", followerResult.error);
          setSeguidores(0); // Default a 0 en caso de error
        } else {
          setSeguidores(followerResult.data || 0);
        }

        if (followingResult.error) {
          console.error("Error obteniendo seguidos:", followingResult.error);
          setSiguiendo(0); // Default a 0 en caso de error
        } else {
          setSiguiendo(followingResult.data || 0);
        }
        
      } catch (error) {
        console.error("Error cargando datos del perfil:", error);
        // Asegurar que el perfil sea null si hubo un error grave
        setProfile(null); 
      } finally {
         setLoading(false); // Poner loading en false independientemente del resultado
      }
    }
    
    loadProfileData();
  }, []);
  
  // Manejadores de eventos para los inputs
  const handlePostTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };
  
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  
  const handleUrlClick = () => {
    setShowUrlInput(!showUrlInput);
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertir FileList a array y limitar a 4 imágenes
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 4); // Limitar a 4 imágenes
      });
    }
  };
  
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostUrl(e.target.value);
  };
  
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleTabClick = (tabId: number) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        activo: tab.id === tabId
      }))
    );
  };
  
  const handlePublish = async () => {
    try {
      // Verificar si el usuario tiene una sesión activa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Debes iniciar sesión para publicar");
        return;
      }
      
      // Preparar URLs de imágenes si hay archivos
      const imageUrls: string[] = [];
      
      // Subir imágenes si existen
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('posts.media')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('posts.media')
            .getPublicUrl(filePath);
          
          imageUrls.push(publicUrl);
        }
      }
      
      // Crear el post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: postText.substring(0, 50), // Usar primeros 50 caracteres como título
          content: postText,
          user_id: session.user.id,
          image_urls: imageUrls,
          link_url: postUrl || null
        })
        .select();
      
      if (postError) throw postError;
      
      // Reiniciar el formulario
      setPostText("");
      setImageFiles([]);
      setPostUrl("");
      setShowUrlInput(false);
      
      // Incrementar la key para forzar la recarga de PostFeed
      setPostFeedKey(prevKey => prevKey + 1);
      
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Hubo un error al publicar. Por favor, inténtalo de nuevo.");
    }
  };
  
  // Verificar si hay algún contenido para habilitar el botón de publicar
  const canPublish = postText.trim().length > 0 || imageFiles.length > 0;
  
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

  // Mostrar estado de carga principal
  if (loading) {
     return (
        <>
            {/* Mantener barras laterales/nav para consistencia visual durante la carga si se desea */}
            <div className="h-full w-full flex bg-gray-50">
                <NavigationSidebar />
                <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
                    {/* Puedes usar un spinner o un esqueleto aquí */}
                    <p className="text-gray-500">Cargando perfil...</p> 
                </main>
                <TrendingSidebar />
            </div>
            <MobileNav />
        </>
     );
  }

  // Mostrar si no se pudo cargar el perfil o no está autenticado
  // Esto se muestra DESPUÉS de que loading es false
  if (!profile) {
     return (
       <>
         <div className="h-full w-full flex bg-gray-50">
           <NavigationSidebar />
           <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0 flex items-center justify-center">
             <div className="text-center p-6 bg-white rounded-lg shadow-md">
               <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
               <p className="text-gray-600">No se pudo cargar el perfil del usuario.</p>
               <p className="text-gray-500 text-sm mt-1">Por favor, asegúrate de haber iniciado sesión o inténtalo de nuevo más tarde.</p>
               {/* Podrías añadir un botón para reintentar o ir al login */}
             </div>
           </main>
           <TrendingSidebar />
         </div>
         <MobileNav />
       </>
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar Perfil
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
              <h2 className="text-sm font-semibold mb-3 text-gray-700">Mis Fandoms</h2>
              <div className="flex flex-wrap gap-2">
                {userFandoms.length > 0 ? (
                  userFandoms.map((fandom) => (
                    <Button 
                      key={fandom.id} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs hover:bg-purple-50 hover:text-purple-600"
                    >
                      {fandom.name}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Aún no perteneces a ningún fandom</p>
                )}
                <Button variant="ghost" size="sm" className="rounded-full text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Unirse a más fandoms
                </Button>
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
            
            {/* Sección para crear nueva publicación */}
            <Card className="bg-white border border-gray-100 shadow-sm mb-6 overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-500 flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {profile.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="¿En qué estás pensando?"
                        className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all placeholder:text-gray-500"
                        value={postText}
                        onChange={handlePostTextChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Previsualización de imágenes */}
                {imageFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Imagen ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button 
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Input de URL */}
                {showUrlInput && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Añadir URL..."
                      className="w-full py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-200 focus:border-purple-400 transition-all"
                      value={postUrl}
                      onChange={handleUrlChange}
                    />
                  </div>
                )}
                
                {/* Inputs ocultos para archivos */}
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                />
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      className="p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5"
                      onClick={handleImageClick}
                    >
                      <Image size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Imagen</span>
                    </button>
                    <button 
                      className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${showUrlInput ? 'text-purple-600 bg-purple-50' : ''}`}
                      onClick={handleUrlClick}
                    >
                      <LinkIcon size={18} />
                      <span className="text-xs font-medium hidden sm:inline">URL</span>
                    </button>
                  </div>
                  <Button 
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePublish}
                    disabled={!canPublish}
                  >
                    Publicar
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Feed de publicaciones - Añadir la prop key */}
            <div className="mb-6">
              {tabs[0].activo && <PostFeed key={postFeedKey} userId={profile.id} />}
              {tabs[1].activo && profile && <div className="bg-white p-5 rounded-xl text-center text-gray-500">Comentarios próximamente</div>}
              {tabs[2].activo && profile && <div className="bg-white p-5 rounded-xl text-center text-gray-500">Favoritos próximamente</div>}
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