"use client";

import { useState, useEffect, SyntheticEvent, useRef, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import PostFeed from "@/components/post-feed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FandomAvatar } from "@/components/ui/fandom-avatar";
import { FandomBanner } from "@/components/ui/fandom-banner";
import { getFandomBySlug, getFandomById } from "@/lib/data/fandoms";
import Link from "next/link";
import { Image, Video, Link as LinkIcon, X } from "lucide-react";
// Necesitarás importar el cliente de Supabase
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// Asume que tienes acceso al ID del usuario actual (ej. desde un hook o contexto)
// import { useUser } from '@/hooks/useUser'; // Ejemplo

interface FandomPageProps {
  params: {
    id: string; // Ahora este parámetro es el slug del fandom
  };
}

export default function FandomPage({ params }: FandomPageProps) {
  // Obtener el slug del fandom (normalizado a minúsculas)
  const slug = params.id.toLowerCase();
  
  // Obtener la información del fandom basada en el slug
  let fandomInfo = getFandomBySlug(slug);
  
  // Si no se encuentra por slug, intentar por ID en caso de URLs antiguas
  if (!fandomInfo) {
    const numId = parseInt(slug);
    if (!isNaN(numId)) {
      fandomInfo = getFandomById(numId);
    }
  }
  
  // Si aún no se encuentra, usar datos por defecto
  if (!fandomInfo) {
    fandomInfo = {
      id: 0,
      name: `Fandom ${slug}`,
      slug: slug,
      category: "general"
    };
  }

  // Estado para gestionar la pestaña activa
  const [activeTab, setActiveTab] = useState("publicaciones");

  // Datos de ejemplo para un fandom específico
  const fandomData = {
    id: fandomInfo.id,
    nombre: fandomInfo.name,
    slug: fandomInfo.slug,
    categoria: fandomInfo.category || "general",
    descripcion: "Comunidad oficial en fanverse dedicada a los fans de esta comunidad. Comparte tus pensamientos, fotos, videos y conecta con otros fans.",
    miembros: 15600,
    posts: 4325,
    creacion: "Enero 2023",
    inicial: fandomInfo.name.charAt(0),
    moderadores: [
      { id: 1, nombre: "María González", username: "maria_fans" },
      { id: 2, nombre: "Carlos Sánchez", username: "carlosmusic" },
      { id: 3, nombre: "Ana López", username: "ana_anime" },
      { id: 4, nombre: "Roberto Díaz", username: "roberto_fan" }
    ],
    reglas: [
      "Respeta a todos los miembros del fandom",
      "No compartas contenido inapropiado",
      "Evita discusiones tóxicas entre fandoms",
      "Usa etiquetas adecuadas para tus publicaciones",
      "Las publicaciones deben estar relacionadas a este fandom"
    ]
  };
  
  // Pestañas del fandom
  const tabs = [
    { id: 1, nombre: "Publicaciones", valor: "publicaciones", activo: activeTab === "publicaciones" },
    { id: 2, nombre: "Multimedia", valor: "multimedia", activo: activeTab === "multimedia" },
    { id: 3, nombre: "Eventos", valor: "eventos", activo: activeTab === "eventos" },
    { id: 4, nombre: "Miembros", valor: "miembros", activo: activeTab === "miembros" },
    { id: 5, nombre: "Acerca de", valor: "acerca", activo: activeTab === "acerca" }
  ];

  // Manejador para cambiar pestañas
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  // Estado para el texto del post
  const [postText, setPostText] = useState("");

  // Estado para el título del post
  const [postTitle, setPostTitle] = useState("");
  
  // Estado para las imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Estado para el video
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Cambiar estado de ubicación a URL
  const [urlLink, setUrlLink] = useState("");

  // Cambiar estado para mostrar input de ubicación a URL
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Estado para mostrar el formulario de creación de post
  const [showPostForm, setShowPostForm] = useState(false);

  // Referencias para los inputs de archivo
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Función para manejar el cambio en el texto del post
  const handlePostTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

  // Función para manejar el cambio en el título del post
  const handlePostTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostTitle(e.target.value);
  };

  // Función para manejar el cambio en las imágenes
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
    }
  };

  // Función para manejar el cambio en el video
  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
    }
  };

  // Función para manejar la eliminación de una imagen
  const handleRemoveImage = (index: number) => {
    const newImages = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImages);
  };

  // Función para manejar la eliminación del video
  const handleRemoveVideo = () => {
    setVideoFile(null);
  };

  // Función para manejar el clic en el botón de imagen
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  // Función para manejar el clic en el botón de video
  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  // Cambiar nombre y lógica para manejar clic en botón de URL
  const handleUrlClick = () => {
    setShowUrlInput(!showUrlInput);
    // No necesitamos geolocalización aquí
  };

  // Cambiar nombre y lógica para manejar cambio en input de URL
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlLink(e.target.value);
  };

  // Estado para indicar carga mientras se publica
  const [isPublishing, setIsPublishing] = useState(false);

  // Cliente Supabase (inicializar fuera o dentro según tu setup)
  // const supabase = createClientComponentClient(); 
  // const { user } = useUser(); // Ejemplo para obtener el usuario

  // Función para manejar la publicación del post (actualizada)
  const handlePublish = async () => { // Marcar como async
    // Obtener el ID del usuario actual (¡necesitarás implementarlo!)
    const currentUserId = null; // Reemplazar con la lógica real para obtener el ID del usuario
    // const currentUserId = user?.id; 

    // Obtener el ID del fandom actual
    const currentFandomId = fandomInfo?.id; // Asumiendo que fandomInfo contiene el ID correcto

    if (!currentUserId || !currentFandomId) {
      console.error("Error: No se pudo obtener el ID del usuario o del fandom.");
      // Mostrar error al usuario
      return;
    }

    // Validar que canPublish sea verdadero antes de continuar
    if (!canPublish) {
        console.warn("Intento de publicar con datos incompletos.")
        return; 
    }

    setIsPublishing(true); // Indicar inicio de publicación

    let uploadedImageUrls: string[] = [];
    let uploadedVideoUrl: string | null = null;

    try {
      // 1. Subir imágenes (si existen)
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const fileName = `${currentUserId}/${Date.now()}_${file.name}`;
          const filePath = `public/post_media/${fileName}`;
          
          // Placeholder: Lógica de subida real con Supabase Storage
          /*
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post_media') // Nombre de tu bucket
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Error subiendo imagen ${file.name}: ${uploadError.message}`);
          }
          
          // Obtener URL pública
          const { data: urlData } = supabase.storage
            .from('post_media')
            .getPublicUrl(filePath);
            
          return urlData.publicUrl;
          */
         console.log(`Placeholder: Subiendo imagen ${filePath}`);
         return `https://placeholder.com/storage/post_media/${fileName}`; // URL Placeholder
        });
        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      // 2. Subir video (si existe)
      if (videoFile) {
        const fileName = `${currentUserId}/${Date.now()}_${videoFile.name}`;
        const filePath = `public/post_media/${fileName}`;

        // Placeholder: Lógica de subida real con Supabase Storage
        /*
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post_media')
          .upload(filePath, videoFile);

        if (uploadError) {
          throw new Error(`Error subiendo video: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('post_media')
          .getPublicUrl(filePath);
          
uploadedVideoUrl = urlData.publicUrl;
        */
        console.log(`Placeholder: Subiendo video ${filePath}`);
        uploadedVideoUrl = `https://placeholder.com/storage/post_media/${fileName}`; // URL Placeholder
      }

      // 3. Preparar datos para insertar en la tabla 'posts'
      const postDataToInsert = {
        title: postTitle,
        content: postText,
        user_id: currentUserId,
        fandom_id: currentFandomId,
        image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : null, // Usar array o null
        video_url: uploadedVideoUrl,
        link_url: urlLink.trim() !== "" ? urlLink.trim() : null, // Usar link_url o null
        // 'slug' y 'internal_path' se generan por el trigger
        // 'upvotes' y 'downvotes' tienen default 0
      };

      console.log("Datos a insertar en tabla 'posts':", postDataToInsert);

      // 4. Insertar en la base de datos
      // Placeholder: Lógica de inserción real con Supabase
      /*
      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert([postDataToInsert])
        .select(); // Opcional: devolver el post insertado

      if (insertError) {
        throw new Error(`Error insertando post: ${insertError.message}`);
      }

      console.log("Post insertado con éxito:", insertedPost);
      */
      console.log("Placeholder: Insertando post en DB...")
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de red

      // 5. Reiniciar formulario (solo si todo fue exitoso)
      setPostTitle("");
      setPostText("");
      setImageFiles([]);
      setVideoFile(null);
      setUrlLink(""); 
      setShowUrlInput(false); 
      setShowPostForm(false); 
      // Aquí podrías añadir lógica para refrescar el feed de posts

    } catch (error) {
      console.error("Error al publicar el post:", error);
      // Mostrar un mensaje de error al usuario (ej. usando un toast)
    } finally {
      setIsPublishing(false); // Indicar fin de publicación (éxito o fallo)
    }
  };

  // Función para determinar si se puede publicar el post
  // Actualizar la condición para usar urlLink
  const canPublish = postTitle.trim() !== "" && (postText.trim() !== "" || imageFiles.length > 0 || videoFile || urlLink.trim() !== "");

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Contenido del fandom */}
        <main className="h-full flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Banner del fandom */}
          <div className="w-full h-32 sm:h-40 md:h-52 relative">
            <FandomBanner 
              alt={fandomData.nombre} 
              src={`/images/fandoms/${fandomData.id}-banner.jpg`}
            />
          </div>
          
          <div className="max-w-3xl mx-auto px-3 sm:px-4">
            {/* Avatar del fandom */}
            <div className="flex justify-center sm:justify-start -mt-14 sm:-mt-16 md:-mt-20 mb-4 sm:mb-0 relative z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
                <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                  {fandomData.inicial}
                </div>
              </div>
            </div>
            
            {/* Información del fandom y botones en la misma fila */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-4 sm:mt-6">
              {/* Nombre del fandom */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent text-center sm:text-left">
                {fandomData.nombre}
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
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Unirse
                </Button>
              </div>
            </div>
            
            {/* Información del fandom - Estadísticas */}
            <div className="sm:mt-4">
              {/* Solo para dispositivos medianos y grandes (desktop) */}
              <div className="hidden sm:block">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {fandomData.miembros.toLocaleString()} miembros
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      {fandomData.posts.toLocaleString()} posts
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Creado en {fandomData.creacion}
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Categoría: <span className="capitalize">{fandomData.categoria}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Solo para dispositivos pequeños (móvil) - Mantiene el diseño original */}
              <div className="flex flex-col sm:hidden">
                <div className="text-center">
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {fandomData.miembros.toLocaleString()} miembros
                    </div>
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      {fandomData.posts.toLocaleString()} posts
                    </div>
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Creado en {fandomData.creacion}
                    </div>
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span className="capitalize">{fandomData.categoria}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Descripción breve */}
            <div className="mt-6 mb-5 bg-white rounded-lg border border-gray-100 shadow-sm p-3.5 sm:p-4">
              <p className="text-sm text-gray-600">
                {fandomData.descripcion}
              </p>
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
                    onClick={() => handleTabChange(tab.valor)}
                  >
                    {tab.nombre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Contenido según la pestaña seleccionada */}
            {activeTab === "publicaciones" && (
              <>
                {/* Sección para crear nueva publicación */}
                <Card className="bg-white border border-gray-100 shadow-sm mb-6 overflow-hidden">
                  <div className="p-4 sm:p-5">
                    {!showPostForm ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <FandomAvatar
                            alt={fandomData.nombre}
                            initial={fandomData.inicial}
                            colorClass="from-purple-600 to-indigo-600"
                          />
                        </div>
                        <div 
                          onClick={() => setShowPostForm(true)}
                          className="flex-1 bg-gray-50 py-3 px-4 rounded-xl border border-gray-200 text-gray-500 text-sm cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                        >
                          ¿Qué quieres compartir con este fandom?
                        </div>
                        <Button 
                          onClick={() => setShowPostForm(true)}
                          className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all"
                        >
                          Crear post
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-800">Crear nueva publicación</h3>
                          <button 
                            onClick={() => setShowPostForm(false)} 
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-1">
                            <FandomAvatar
                              alt={fandomData.nombre}
                              initial={fandomData.inicial}
                              colorClass="from-purple-600 to-indigo-600"
                            />
                          </div>
                          <div className="flex-1">
                            {/* Campo para el título del post */}
                            <div className="relative mb-2">
                              <input
                                type="text"
                                placeholder="Título de la publicación"
                                className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all placeholder:text-gray-500"
                                value={postTitle}
                                onChange={handlePostTitleChange}
                              />
                            </div>
                            {/* Campo para el contenido del post */}
                            <div className="relative">
                              <textarea
                                placeholder={`¿Qué está pasando en ${fandomData.nombre}?`}
                                className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all placeholder:text-gray-500 min-h-[120px] resize-y"
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
                        
                        {/* Previsualización de video */}
                        {videoFile && (
                          <div className="mt-3 relative">
                            <video 
                              src={URL.createObjectURL(videoFile)} 
                              controls 
                              className="w-full rounded-lg"
                            />
                            <button 
                              className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                              onClick={handleRemoveVideo}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        
                        {/* Input de URL (reemplaza ubicación) */}
                        {showUrlInput && (
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder="Pegar enlace externo... (YouTube, web, etc.)" // Actualizar placeholder
                              className="w-full py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-200 focus:border-purple-400 transition-all"
                              value={urlLink} // Usar urlLink
                              onChange={handleUrlChange} // Usar handleUrlChange
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
                        <input 
                          type="file" 
                          ref={videoInputRef} 
                          className="hidden" 
                          accept="video/*" 
                          onChange={handleVideoChange}
                        />
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="flex gap-2">
                            <button 
                              className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${videoFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={handleImageClick}
                              disabled={!!videoFile}
                              title="Adjuntar imagen"
                            >
                              <Image size={18} />
                              <span className="text-xs font-medium hidden sm:inline">Imagen</span>
                            </button>
                            <button 
                              className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${imageFiles.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={handleVideoClick}
                              disabled={imageFiles.length > 0}
                              title="Adjuntar archivo de video"
                            >
                              <Video size={18} />
                              <span className="text-xs font-medium hidden sm:inline">Video</span>
                            </button>
                            <button 
                              className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${showUrlInput ? 'text-purple-600 bg-purple-50' : ''}`}
                              onClick={handleUrlClick}
                              title="Adjuntar enlace externo"
                            >
                              <LinkIcon size={18} />
                              <span className="text-xs font-medium hidden sm:inline">URL</span>
                            </button>
                          </div>
                          <Button 
                            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handlePublish}
                            disabled={!canPublish || isPublishing}
                          >
                            {isPublishing ? 'Publicando...' : 'Publicar'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
                
                {/* Feed de publicaciones */}
                <div className="mb-6">
                  <PostFeed fandomSlug={slug} />
                </div>
              </>
            )}
            
            {activeTab === "multimedia" && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Fotos y videos compartidos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                      <img 
                        src={`https://picsum.photos/seed/${fandomData.slug}${i}/300/300`} 
                        alt={`Imagen ${i + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" className="rounded-full text-sm">
                    Ver más
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "eventos" && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Próximos eventos</h2>
                  <Button variant="outline" size="sm" className="rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Proponer evento
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <h3 className="font-medium">Lanzamiento nuevo álbum/película/capítulo</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      15 de octubre, 2024
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Evento online
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="rounded-full bg-purple-600 text-white">
                        Interesado
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Compartir
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <h3 className="font-medium">Meet & Greet Virtual</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      23 de noviembre, 2024
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      Zoom (link por confirmar)
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="rounded-full bg-purple-600 text-white">
                        Interesado
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Compartir
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" className="rounded-full text-sm">
                    Ver todos los eventos
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "miembros" && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Miembros destacados</h2>
                
                <div className="divide-y divide-gray-100">
                  {/* Moderadores */}
                  <div className="pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Moderadores</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fandomData.moderadores.map(mod => (
                        <div key={mod.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-purple-600">
                            {mod.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{mod.nombre}</div>
                            <div className="text-xs text-gray-500">@{mod.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Otros miembros activos */}
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Miembros activos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-purple-600">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-medium text-sm truncate">Usuario {i + 1}</div>
                            <div className="text-xs text-gray-500">@user{i + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" className="rounded-full text-sm">
                    Ver todos los miembros
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "acerca" && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4">Acerca de este fandom</h2>
                
                <p className="text-sm text-gray-600 mb-6">
                  {fandomData.descripcion}
                </p>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Reglas de la comunidad</h3>
                  <ul className="space-y-2">
                    {fandomData.reglas.map((regla, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 mt-0.5 flex-shrink-0">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{regla}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-semibold text-purple-600">{fandomData.miembros.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Miembros</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-semibold text-purple-600">{fandomData.posts.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-semibold text-purple-600">24</div>
                      <div className="text-xs text-gray-500">Eventos</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-semibold text-purple-600">{fandomData.creacion}</div>
                      <div className="text-xs text-gray-500">Creación</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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