"use client";

import { useState, useRef, ChangeEvent } from "react";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PostFeed from "@/components/post-feed";
import { Image, Video, MapPin } from "lucide-react";

export default function PerfilPage() {
  // Datos de ejemplo para el perfil del usuario
  const usuario = {
    nombre: "María González",
    username: "maria_fans",
    biografia: "Fan de música, cine y series desde 2016. Me encanta seguir a mis artistas favoritos, asistir a eventos y conocer nuevas personas con gustos similares.",
    ubicacion: "Ciudad de México, México",
    miembroDesde: "Enero 2023",
    seguidores: 245,
    siguiendo: 187,
    fandoms: ["Marvel", "Taylor Swift", "Star Wars", "Anime"],
  };
  
  // Pestañas del perfil
  const tabs = [
    { id: 1, nombre: "Publicaciones", activo: true },
    { id: 2, nombre: "Comentarios", activo: false },
    { id: 3, nombre: "Favoritos", activo: false },
  ];
  
  // Estados para el componente de creación de posts
  const [postText, setPostText] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Referencias para los inputs de archivos
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Manejadores de eventos para los inputs
  const handlePostTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };
  
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };
  
  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };
  
  const handleLocationClick = () => {
    setShowLocationInput(!showLocationInput);
    if (!showLocationInput) {
      // Si tenemos acceso a la API de geolocalización, podríamos usarla aquí
      // navigator.geolocation.getCurrentPosition(...)
    }
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
  
  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
      // Si hay un video, no permitimos imágenes y viceversa
      setImageFiles([]);
    }
  };
  
  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  
  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveVideo = () => {
    setVideoFile(null);
  };
  
  const handlePublish = () => {
    // Aquí iría la lógica para publicar el post
    console.log({
      text: postText,
      images: imageFiles,
      video: videoFile,
      location: location
    });
    
    // Reiniciar el formulario
    setPostText("");
    setImageFiles([]);
    setVideoFile(null);
    setLocation("");
    setShowLocationInput(false);
  };
  
  // Verificar si hay algún contenido para habilitar el botón de publicar
  const canPublish = postText.trim().length > 0 || imageFiles.length > 0 || videoFile !== null;

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
                <span className="text-white text-xl font-bold">
                  {usuario.nombre.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            
            {/* Información del usuario y botones en la misma fila */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-4 sm:mt-6">
              {/* Nombre del usuario */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent text-center sm:text-left">
                {usuario.nombre}
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
                      <span><strong>{usuario.seguidores}</strong> seguidores</span>
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" y1="8" x2="23" y2="13"></line>
                        <line x1="23" y1="8" x2="18" y2="13"></line>
                      </svg>
                      <span><strong>{usuario.siguiendo}</strong> siguiendo</span>
                    </div>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Miembro desde {usuario.miembroDesde}
                    </div>
                    {usuario.ubicacion && (
                      <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {usuario.ubicacion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Solo para dispositivos pequeños (móvil) */}
              <div className="flex flex-col sm:hidden">
                <div className="text-center">
                  <p className="text-sm text-gray-500">@{usuario.username}</p>
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-2 text-xs text-gray-500">
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span><strong>{usuario.seguidores}</strong> seguidores</span>
                    </div>
                    <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" y1="8" x2="23" y2="13"></line>
                        <line x1="23" y1="8" x2="18" y2="13"></line>
                      </svg>
                      <span><strong>{usuario.siguiendo}</strong> siguiendo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Biografía */}
            <div className="mt-6 mb-5 bg-white rounded-lg border border-gray-100 shadow-sm p-3.5 sm:p-4">
              <p className="text-sm text-gray-600">
                {usuario.biografia}
              </p>
            </div>
            
            {/* Fandoms */}
            <div className="mb-6 bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3 text-gray-700">Mis Fandoms</h2>
              <div className="flex flex-wrap gap-2">
                {usuario.fandoms.map((fandom) => (
                  <Button key={fandom} variant="outline" size="sm" className="rounded-full text-xs hover:bg-purple-50 hover:text-purple-600">
                    {fandom}
                  </Button>
                ))}
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
                      <span className="text-white text-sm font-bold">
                        {usuario.nombre.split(' ').map(n => n[0]).join('')}
                      </span>
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
                
                {/* Input de ubicación */}
                {showLocationInput && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Agregar ubicación..."
                      className="w-full py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-200 focus:border-purple-400 transition-all"
                      value={location}
                      onChange={handleLocationChange}
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
                    >
                      <Image size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Imagen</span>
                    </button>
                    <button 
                      className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${imageFiles.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleVideoClick}
                      disabled={imageFiles.length > 0}
                    >
                      <Video size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Video</span>
                    </button>
                    <button 
                      className={`p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5 ${showLocationInput ? 'text-purple-600 bg-purple-50' : ''}`}
                      onClick={handleLocationClick}
                    >
                      <MapPin size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Ubicación</span>
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
            
            {/* Feed de publicaciones */}
            <div className="mb-6">
              <PostFeed />
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