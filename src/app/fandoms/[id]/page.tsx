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
import { Image, Video, MapPin } from "lucide-react";

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
      slug: slug
    };
  }

  // Datos de ejemplo para un fandom específico
  const fandomData = {
    id: fandomInfo.id,
    nombre: fandomInfo.name,
    slug: fandomInfo.slug,
    descripcion: "Comunidad oficial en 7Kpop dedicada a los fans de este increíble grupo. Comparte tus pensamientos, fotos, videos y conecta con otros fans.",
    miembros: 15600,
    posts: 4325,
    creacion: "Enero 2023",
    inicial: fandomInfo.name.charAt(0),
    administradores: [
      { id: 1, nombre: "María González", username: "mariakpop" },
      { id: 2, nombre: "Carlos Sánchez", username: "carlosk" }
    ],
    moderadores: [
      { id: 3, nombre: "Ana López", username: "analopez" },
      { id: 4, nombre: "Roberto Díaz", username: "robertokpop" }
    ],
    reglas: [
      "Respeta a todos los miembros del fandom",
      "No compartas contenido inapropiado",
      "Evita discusiones tóxicas entre fandoms",
      "Usa etiquetas adecuadas para tus publicaciones",
      "Las publicaciones deben estar relacionadas al grupo"
    ]
  };
  
  // Pestañas del fandom
  const tabs = [
    { id: 1, nombre: "Publicaciones", activo: true },
    { id: 2, nombre: "Multimedia", activo: false },
    { id: 3, nombre: "Eventos", activo: false },
    { id: 4, nombre: "Miembros", activo: false },
    { id: 5, nombre: "Acerca de", activo: false }
  ];

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
                    <FandomAvatar
                      alt={fandomData.nombre}
                      initial={fandomData.inicial}
                      colorClass="from-purple-600 to-indigo-600"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`¿Qué está pasando en ${fandomData.nombre}?`}
                        className="w-full py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5">
                      <Image size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Imagen</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5">
                      <Video size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Video</span>
                    </button>
                    <button className="p-2.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center gap-1.5">
                      <MapPin size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Ubicación</span>
                    </button>
                  </div>
                  <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all">
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