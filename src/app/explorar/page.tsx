'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import SearchResults from "@/components/search-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchStore } from "@/store/search-store";
import { supabase } from "@/lib/supabase";
import PostCard from "@/components/post-card";
import FandomCard from "@/components/fandom-card";
import Link from "next/link";
import GlobalSearchBar from "@/components/global-search-bar";

export default function ExplorePage() {
  const { activeTab, setActiveTab, search, query, setQuery } = useSearchStore();
  const searchParams = useSearchParams();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(true);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [postsPopulares, setPostsPopulares] = useState<any[]>([]);
  const [fandomsDestacados, setFandomsDestacados] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchRecentSearches = useCallback(async () => {
    try {
      setIsLoadingSearches(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRecentSearches([]);
        setIsLoadingSearches(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_searches')
        .select('query, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      console.log('[fetchRecentSearches] Raw data from Supabase:', data);

      if (error) {
        console.error('Error al obtener búsquedas recientes:', error);
        setRecentSearches([]);
      } else if (data) {
        const uniqueQueries = Array.from(new Set(data.map(item => item.query)));
        console.log('[fetchRecentSearches] Unique queries set to state:', uniqueQueries);
        setRecentSearches(uniqueQueries);
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.error('Error al procesar búsquedas recientes:', error);
      setRecentSearches([]);
    } finally {
      setIsLoadingSearches(false);
    }
  }, []);
  
  const handleSearch = useCallback((q: string) => {
    const trimmedQuery = q.trim();
    if (!trimmedQuery) {
        return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log(`[handleSearch Debounced] Executing for query: "${trimmedQuery}"`);

        await search(trimmedQuery);

        setQuery('');

        setRecentSearches(prevSearches => {
          const updatedSearches = [trimmedQuery, ...prevSearches.filter(s => s !== trimmedQuery)].slice(0, 5);
          console.log('[handleSearch Debounced] Optimistic update state:', updatedSearches);
          return updatedSearches;
        });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log(`[handleSearch Debounced] Inserting query: "${trimmedQuery}" for user: ${user.id}`);
            
            // Volver a insert, pero manejar silenciosamente los errores de duplicados
            const { error: insertError } = await supabase
              .from('user_searches')
              .insert({ user_id: user.id, query: trimmedQuery });

            if (insertError) {
              // Ignorar errores de duplicados (código 409 Conflict)
              // Solo mostrar en consola otros tipos de errores
              if (!insertError.message.includes('duplicate key value') && 
                  insertError.code !== '23505' && // Código para duplicados en Postgres
                  insertError.code !== '409') {   // Código HTTP para conflicto
                console.warn('[handleSearch Debounced] Error al guardar búsqueda en historial:', insertError);
              }
            }
          }
        } catch (dbError) {
          console.error('[handleSearch Debounced] Error al intentar guardar búsqueda:', dbError);
        }

      } catch (searchError) {
        console.error("[handleSearch Debounced] Error durante la búsqueda (search store):", searchError);
      }
    }, 300);

  }, [search, setQuery]);
  
  useEffect(() => {
    fetchRecentSearches();
    
    fetchPopularPosts();
    fetchFeaturedFandoms();
    
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      
      // Si hay un parámetro de búsqueda en la URL y es una carga inicial,
      // guardamos en el historial y realizamos la búsqueda
      // Esto cubre el caso de navegación desde la página principal
      const isInitialLoad = !document.referrer.includes('/explorar');
      if (isInitialLoad) {
        // Solo guardar en historial, sin usar handleSearch para evitar loops
        const saveToHistory = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log(`[Initial Navigation] Inserting query: "${q}" for user: ${user.id}`);
              const { error: insertError } = await supabase
                .from('user_searches')
                .insert({ user_id: user.id, query: q });
                
              // Ignorar silenciosamente errores de duplicados
              if (insertError && 
                  !insertError.message.includes('duplicate key value') && 
                  insertError.code !== '23505' && 
                  insertError.code !== '409') {
                console.warn('[Initial Navigation] Error al guardar búsqueda:', insertError);
              }
              
              // Actualizar optimistamente el historial local
              setRecentSearches(prevSearches => {
                const updatedSearches = [q, ...prevSearches.filter(s => s !== q)].slice(0, 5);
                return updatedSearches;
              });
            }
          } catch (error) {
            console.error('Error guardando historial inicial:', error);
          }
        };
        
        saveToHistory();
      }
    }
  }, [searchParams, fetchRecentSearches, setQuery]);
  
  const fetchPopularPosts = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, content, created_at, updated_at, 
        upvotes, downvotes, slug, 
        user_id, profiles:user_id(username), 
        fandom_id, fandoms:fandom_id(name, slug)
      `)
      .eq('moderation_status', 'approved')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('upvotes', { ascending: false })
      .limit(3);
      
    if (data) {
      setPostsPopulares(data);
    }
  };
  
  const fetchFeaturedFandoms = async () => {
    const { data } = await supabase
      .from('fandoms')
      .select(`
        id, name, description, slug, category, 
        members:fandom_members(count), 
        posts(count)
      `)
      .eq('status', 'approved')
      .order('members -> count', { ascending: false, nullsFirst: false })
      .limit(3);
      
    if (data) {
      setFandomsDestacados(data);
    }
  };
  
  const handleClearHistory = async () => {
    try {
      setIsLoadingSearches(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuario no autenticado, no se puede borrar historial');
        setIsLoadingSearches(false);
        return;
      }
      
      const { error } = await supabase
        .from('user_searches')
        .delete()
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error al borrar historial de búsquedas:', error);
      } else {
        console.log('Historial de búsquedas borrado correctamente');
        setRecentSearches([]);
      }
    } catch (error) {
      console.error('Error al procesar borrado de historial:', error);
    } finally {
      setIsLoadingSearches(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        <NavigationSidebar />

        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Explorar fanverse
                </h1>
              </div>
              
              <GlobalSearchBar onSearch={handleSearch} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-0 pt-3.5 px-4">
                    <CardTitle className="text-sm font-semibold text-gray-800">Búsquedas recientes</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3.5 pt-3">
                    {isLoadingSearches ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                      </div>
                    ) : recentSearches.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-1.5">
                        {recentSearches.map((recentQuery, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs h-7 px-3 py-0 bg-white border-gray-200 hover:bg-gray-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                            onClick={() => {
                              handleSearch(recentQuery);
                            }}
                          >
                            {recentQuery}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-2">
                        No hay búsquedas recientes. Tus búsquedas aparecerán aquí.
                      </div>
                    )}
                    <div className="mt-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-normal text-gray-500 hover:text-purple-700 hover:bg-transparent p-0 h-auto"
                        onClick={handleClearHistory}
                        disabled={recentSearches.length === 0 || isLoadingSearches}
                      >
                        Borrar historial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Tabs defaultValue="todo" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start mb-4 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="todo" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Todo</TabsTrigger>
                    <TabsTrigger value="posts" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Posts</TabsTrigger>
                    <TabsTrigger value="usuarios" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Usuarios</TabsTrigger>
                    <TabsTrigger value="fandoms" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Fandoms</TabsTrigger>
                  </TabsList>
                  
                  <SearchResults />
                  
                  {!query && (
                    <div className="space-y-4 mt-4">
                      <h2 className="text-lg font-medium">Posts populares</h2>
                      <div className="space-y-3">
                        {postsPopulares.map(post => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                      
                      <h2 className="text-lg font-medium mt-8">Fandoms destacados</h2>
                      <div className="space-y-3">
                        {fandomsDestacados.map(fandom => (
                          <FandomCard key={fandom.id} fandom={fandom} />
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <Button asChild variant="outline" className="w-fit">
                          <Link href="/fandoms">
                            Ver todos los fandoms
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </main>

        <TrendingSidebar />
      </div>
      
      <MobileNav />
    </>
  );
} 