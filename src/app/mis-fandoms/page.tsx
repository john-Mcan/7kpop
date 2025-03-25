import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FandomAvatar } from "@/components/ui/fandom-avatar";
import Link from "next/link";

export default function MisFandomsPage() {
  // Datos de ejemplo para los fandoms del usuario
  const misFandoms = [
    {
      id: 1,
      nombre: "BTS",
      descripcion: "El fandom oficial de BTS (Bangtan Sonyeondan) en 7Kpop",
      miembros: 15600,
      posts: 4325,
      postsNuevos: 12,
      inicial: "B"
    },
    {
      id: 3,
      nombre: "TWICE",
      descripcion: "Para todos los ONCE que aman a TWICE",
      miembros: 10230,
      posts: 2876,
      postsNuevos: 8,
      inicial: "T"
    },
    {
      id: 5,
      nombre: "NewJeans",
      descripcion: "Comunidad para fans de NewJeans",
      miembros: 8700,
      posts: 2198,
      postsNuevos: 5,
      inicial: "N"
    }
  ];

  // Fandoms recomendados
  const fandomsRecomendados = [
    {
      id: 2,
      nombre: "BLACKPINK",
      descripcion: "Comunidad de BLINKS en América Latina",
      miembros: 12450,
      posts: 3189,
      inicial: "B"
    },
    {
      id: 4,
      nombre: "SEVENTEEN",
      descripcion: "El hogar de CARATS en 7Kpop",
      miembros: 9800,
      posts: 2567,
      inicial: "S"
    }
  ];

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Feed de contenido */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Mis Fandoms
                </h1>
                
                <Link href="/fandoms">
                  <Button variant="outline" className="flex items-center justify-center gap-1 text-sm rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50">
                    <span>Explorar Fandoms</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Sección: Mis Fandoms */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fandoms que sigo</h2>
              
              {misFandoms.length === 0 ? (
                <Card className="bg-white border border-gray-100 shadow-sm p-6 text-center">
                  <p className="text-gray-500 mb-4">Aún no te has unido a ningún fandom</p>
                  <Link href="/fandoms">
                    <Button className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-sm hover:shadow hover:opacity-90 transition-all">
                      Explorar fandoms
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {misFandoms.map((fandom) => (
                    <Link key={fandom.id} href={`/fandoms/${fandom.id}`}>
                      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
                        <div className="flex">
                          {/* Imagen o avatar del fandom */}
                          <div className="w-16 h-16 shrink-0">
                            <FandomAvatar 
                              alt={fandom.nombre}
                              initial={fandom.inicial}
                            />
                          </div>
                          
                          {/* Información del fandom */}
                          <div className="p-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-gray-900">
                                {fandom.nombre}
                              </h3>
                              {fandom.postsNuevos > 0 && (
                                <div className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                  {fandom.postsNuevos} nuevos
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {fandom.descripcion}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="text-xs text-gray-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                {fandom.miembros.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                {fandom.posts.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sección: Fandoms recomendados */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fandoms recomendados para ti</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fandomsRecomendados.map((fandom) => (
                  <Link key={fandom.id} href={`/fandoms/${fandom.id}`}>
                    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
                      <div className="flex">
                        {/* Imagen o avatar del fandom */}
                        <div className="w-16 h-16 shrink-0">
                          <FandomAvatar 
                            alt={fandom.nombre}
                            initial={fandom.inicial}
                          />
                        </div>
                        
                        {/* Información del fandom */}
                        <div className="p-4 flex-1">
                          <h3 className="text-base font-bold text-gray-900">
                            {fandom.nombre}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {fandom.descripcion}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              {fandom.miembros.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                              {fandom.posts.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
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