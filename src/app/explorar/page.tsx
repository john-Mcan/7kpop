import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ExplorePage() {
  // Datos de ejemplo para resultados de búsqueda
  const recentSearches = ["BTS", "NewJeans", "Stray Kids", "Red Velvet", "TWICE"];
  
  const trendingSearches = [
    "Jimin", "Aespa comeback", "BLACKPINK tour", "Lisa solo", "HYBE 2024"
  ];
  
  const searchResults = {
    posts: [
      {
        id: "post1",
        title: "Análisis del último comeback de NewJeans",
        author: "kpoplover23",
        date: "Hace 2 horas",
        likes: 342,
        comments: 78,
        tags: ["NewJeans", "Comeback", "Análisis"]
      },
      {
        id: "post2",
        title: "Teorías sobre el próximo álbum de BTS",
        author: "army_forever",
        date: "Hace 5 horas",
        likes: 567,
        comments: 124,
        tags: ["BTS", "Comeback", "Teorías"]
      },
      {
        id: "post3",
        title: "Ranking: Las mejores coreografías de 2024",
        author: "dance_expert",
        date: "Hace 1 día",
        likes: 890,
        comments: 213,
        tags: ["Coreografía", "Ranking", "2024"]
      },
    ],
    usuarios: [
      {
        id: "user1",
        username: "jisoo_fan",
        name: "María López",
        followers: 1243,
        fandoms: ["BLACKPINK", "Red Velvet"]
      },
      {
        id: "user2",
        username: "kpop_news",
        name: "Noticias K-pop",
        followers: 5689,
        fandoms: ["Múltiples"]
      },
      {
        id: "user3",
        username: "bangchan_skz",
        name: "Carlos Mendoza",
        followers: 842,
        fandoms: ["Stray Kids", "ATEEZ"]
      },
    ],
    eventos: [
      {
        id: "event1",
        title: "TWICE World Tour 2024 - Ciudad de México",
        date: "15 de octubre, 2024",
        location: "Arena Ciudad de México",
        attendees: 1250
      },
      {
        id: "event2",
        title: "K-pop Convention LATAM",
        date: "3-5 de septiembre, 2024",
        location: "Centro de Convenciones, Buenos Aires",
        attendees: 3400
      },
    ]
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
                  Explorar 7Kpop
                </h1>
              </div>
              
              <div className="relative w-full mt-[0.55rem]">
                <input 
                  type="search" 
                  placeholder="Buscar 7kpop..." 
                  className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
              </div>
              
              {/* Búsquedas recientes y tendencias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-0 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold text-gray-800">Búsquedas recientes</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3.5 pt-3">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      {recentSearches.map((search, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full text-xs h-7 px-3 py-0 bg-white border-gray-200 hover:bg-gray-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs font-normal text-gray-500 hover:text-purple-700 hover:bg-transparent p-0 h-auto"
                      >
                        Borrar historial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-0 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold text-gray-800">Tendencias de búsqueda</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3.5 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-full text-xs h-7 px-3 py-0 bg-white border-gray-200 hover:bg-gray-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Resultados de búsqueda por categorías */}
              <div className="mt-6">
                <Tabs defaultValue="todo" className="w-full">
                  <TabsList className="w-full justify-start mb-4 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="todo" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Todo</TabsTrigger>
                    <TabsTrigger value="posts" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Posts</TabsTrigger>
                    <TabsTrigger value="usuarios" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Usuarios</TabsTrigger>
                    <TabsTrigger value="eventos" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Eventos</TabsTrigger>
                    <TabsTrigger value="fandoms" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Fandoms</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="todo">
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium">Posts populares</h2>
                      <div className="space-y-3">
                        {searchResults.posts.map(post => (
                          <Card key={post.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <Link href="#" className="text-md font-medium hover:text-purple-600 transition-colors">
                                {post.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <span>{post.author}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="text-center mt-6">
                        <Button variant="outline" className="rounded-full">
                          Ver más resultados
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="posts">
                    <div className="space-y-3">
                      {searchResults.posts.map(post => (
                        <Card key={post.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <Link href="#" className="text-md font-medium hover:text-purple-600 transition-colors">
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.date}</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>{post.comments}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="usuarios">
                    <div className="space-y-3">
                      {searchResults.usuarios.map(user => (
                        <Card key={user.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Link href="#" className="text-md font-medium hover:text-purple-600 transition-colors">
                                  @{user.username}
                                </Link>
                                <div className="text-sm text-gray-500">{user.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">{user.followers}</span> seguidores • Fandoms: {user.fandoms.join(", ")}
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="rounded-full text-sm">
                                Seguir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="eventos">
                    <div className="space-y-3">
                      {searchResults.eventos.map(event => (
                        <Card key={event.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <Link href="#" className="text-md font-medium hover:text-purple-600 transition-colors">
                              {event.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              <span>{event.attendees} asistentes</span>
                            </div>
                            <div className="mt-3">
                              <Button size="sm" className="rounded-full bg-purple-600 text-white hover:bg-purple-700">
                                Interesado
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="fandoms">
                    <div className="flex flex-col gap-4">
                      <p className="text-gray-500">
                        ¿Buscas fandoms? Visita la sección de <Link href="/fandoms" className="text-purple-600 hover:underline">fandoms</Link> para explorar las comunidades de K-pop.
                      </p>
                      <Button asChild variant="outline" className="w-fit">
                        <Link href="/fandoms">
                          Ir a Fandoms
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
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