import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Interfaces para los tipos de datos
interface OpcionVotacion {
  id: number;
  nombre: string;
  votos: number;
  posts?: number;
  color: string;
}

interface Encuesta {
  id: number;
  title: string;
  description: string;
  fechaFin: string;
  opciones: OpcionVotacion[];
  votado: number | null;
}

interface EncuestaPasada {
  id: number;
  title: string;
  description: string;
  fechaFin: string;
  ganador: string;
  votos: number;
  participantes: number;
}

export default function VotacionesPage() {
  // Datos de ejemplo para las votaciones activas
  const encuestas: Encuesta[] = [
    {
      id: 1,
      title: "Grupo del Mes",
      description: "¡Vota por tu grupo favorito de mayo 2023!",
      fechaFin: "31 de mayo, 2023",
      opciones: [
        { id: 1, nombre: "BTS", votos: 3452, color: "from-purple-600 to-indigo-500" },
        { id: 2, nombre: "BLACKPINK", votos: 3011, color: "from-pink-500 to-purple-600" },
        { id: 3, nombre: "TWICE", votos: 2874, color: "from-purple-500 to-pink-500" },
        { id: 4, nombre: "Stray Kids", votos: 2567, color: "from-indigo-600 to-blue-500" },
        { id: 5, nombre: "NewJeans", votos: 2345, color: "from-blue-500 to-purple-500" },
      ],
      votado: null,
    },
    {
      id: 2,
      title: "Canción de la Semana",
      description: "¿Cuál es la mejor canción lanzada esta semana?",
      fechaFin: "14 de mayo, 2023",
      opciones: [
        { id: 1, nombre: "aespa - Spicy", votos: 1234, color: "from-purple-600 to-purple-400" },
        { id: 2, nombre: "Jimin - Set Me Free Pt.2", votos: 1145, color: "from-violet-600 to-violet-400" },
        { id: 3, nombre: "SEVENTEEN - Super", votos: 978, color: "from-indigo-600 to-indigo-400" },
        { id: 4, nombre: "IVE - I AM", votos: 856, color: "from-pink-600 to-pink-400" },
      ],
      votado: 2,
    },
    {
      id: 3,
      title: "Fandom Más Activo",
      description: "¿Qué fandom ha generado más actividad este mes en la plataforma?",
      fechaFin: "31 de mayo, 2023",
      opciones: [
        { id: 1, nombre: "ARMY (BTS)", votos: 4567, posts: 892, color: "from-purple-600 to-indigo-500" },
        { id: 2, nombre: "BLINK (BLACKPINK)", votos: 3982, posts: 754, color: "from-pink-500 to-purple-600" },
        { id: 3, nombre: "ONCE (TWICE)", votos: 3421, posts: 645, color: "from-purple-500 to-pink-500" },
        { id: 4, nombre: "STAY (Stray Kids)", votos: 2845, posts: 512, color: "from-indigo-600 to-blue-500" },
        { id: 5, nombre: "MY (aespa)", votos: 2233, posts: 423, color: "from-violet-600 to-violet-400" },
      ],
      votado: null,
    },
  ];

  // Datos de ejemplo para votaciones pasadas
  const encuestasPasadas: EncuestaPasada[] = [
    {
      id: 101,
      title: "Mejor MV de Abril",
      description: "¿Cuál fue el mejor video musical de abril 2023?",
      fechaFin: "30 de abril, 2023",
      ganador: "SEVENTEEN - Super",
      votos: 5243,
      participantes: 8762,
    },
    {
      id: 102,
      title: "Grupo del Mes - Abril",
      description: "El grupo más votado del mes de abril",
      fechaFin: "30 de abril, 2023",
      ganador: "BTS",
      votos: 6784,
      participantes: 12345,
    },
    {
      id: 103,
      title: "Comeback más esperado",
      description: "¿Qué regreso esperabas con más ansias?",
      fechaFin: "15 de abril, 2023",
      ganador: "BLACKPINK",
      votos: 4598,
      participantes: 9876,
    },
  ];

  // Función para calcular el porcentaje de votos
  const calcularPorcentaje = (votos: number, total: number) => {
    return Math.round((votos / total) * 100);
  };

  // Función para obtener el total de votos en una encuesta
  const obtenerTotalVotos = (opciones: OpcionVotacion[]) => {
    return opciones.reduce((acc, opcion) => acc + opcion.votos, 0);
  };

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Contenido */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Votaciones
                </h1>
                
                <div className="dropdown relative">
                  <Button variant="outline" className="flex items-center justify-center gap-1 text-sm rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50">
                    <span>Recientes</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="relative w-full">
                <input 
                  type="search" 
                  placeholder="Buscar votaciones..." 
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Votaciones Activas */}
            <div className="space-y-6 mt-6">
              {encuestas.map((encuesta) => {
                const totalVotos = obtenerTotalVotos(encuesta.opciones);
                
                return (
                  <Card key={encuesta.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="px-6 pt-5 pb-3">
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                        {encuesta.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1.5">
                        {encuesta.description}
                      </CardDescription>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Finaliza: {encuesta.fechaFin}
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {totalVotos.toLocaleString()} votos
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="px-6 py-4">
                      {/* Mostrar un banner informativo para Fandom Más Activo */}
                      {encuesta.title === "Fandom Más Activo" && (
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4 text-xs text-purple-700">
                          <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <div>
                              <p className="font-medium">Clasificación automática</p>
                              <p className="mt-1">Esta clasificación se actualiza automáticamente según la actividad de cada fandom (posts + interacciones)</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {encuesta.opciones.map((opcion) => {
                          const porcentaje = calcularPorcentaje(opcion.votos, totalVotos);
                          const esVotado = encuesta.votado === opcion.id;
                          
                          return (
                            <div key={opcion.id} className="relative">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-semibold text-gray-800">{opcion.nombre}</span>
                                <div className="text-xs text-gray-500">
                                  {opcion.posts ? (
                                    <span>{opcion.votos.toLocaleString()} interacciones ({porcentaje}%) • {opcion.posts} posts</span>
                                  ) : (
                                    <span>{opcion.votos.toLocaleString()} votos ({porcentaje}%)</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="w-full h-10 bg-gray-100 rounded-lg relative overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${opcion.color}`}
                                  style={{ width: `${porcentaje}%` }}
                                ></div>
                                
                                {/* Solo permitir votar en "Grupo del Mes" y "Canción de la Semana" */}
                                {encuesta.votado === null && !opcion.posts && (
                                  <button className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-black/5 transition-colors w-full h-full">
                                    Votar
                                  </button>
                                )}
                                
                                {/* Añadir efecto hover también a las opciones ya votadas para "Canción de la Semana" */}
                                {encuesta.title === "Canción de la Semana" && encuesta.votado !== null && !opcion.posts && !esVotado && (
                                  <button className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-black/5 transition-colors w-full h-full opacity-0 hover:opacity-100">
                                    Cambiar voto
                                  </button>
                                )}
                                
                                {/* Mostrar etiqueta "En vivo" para los fandoms más activos */}
                                {opcion.posts && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">En vivo</span>
                                  </div>
                                )}
                                
                                {esVotado && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="px-6 py-3 flex justify-between flex-wrap gap-2">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                        Me gusta
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Comentar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                          <polyline points="16 6 12 2 8 6"></polyline>
                          <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                        Compartir
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* Votaciones Pasadas */}
            <div className="mt-12">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent mb-6">
                Votaciones Anteriores
              </h2>
              
              <div className="space-y-4">
                {encuestasPasadas.map((encuesta) => (
                  <Card key={encuesta.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="px-6 pt-5 pb-3">
                      <CardTitle className="text-lg font-bold text-gray-800">
                        {encuesta.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1.5">
                        {encuesta.description}
                      </CardDescription>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Finalizada: {encuesta.fechaFin}
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {encuesta.participantes.toLocaleString()} participantes
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-100 to-purple-200 opacity-60"
                            style={{ width: `${calcularPorcentaje(encuesta.votos, encuesta.participantes)}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center px-4">
                            <div className="flex flex-col w-full overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800 truncate">Ganador: {encuesta.ganador}</span>
                                <div className="bg-purple-600 rounded-full p-0.5 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                  </svg>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                <span>{encuesta.votos.toLocaleString()} votos</span>
                                <span>• {calcularPorcentaje(encuesta.votos, encuesta.participantes)}% del total</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <div className="px-6 py-3 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-purple-600">
                        Ver resultados completos
                      </Button>
                    </div>
                  </Card>
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