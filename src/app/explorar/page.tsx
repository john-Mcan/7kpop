'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import MobileNav from "@/components/mobile-nav";
import SearchResults from "@/components/search-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchStore } from "@/store/search-store";
import { supabase } from "@/lib/supabase";
import { PostCard } from "@/components/post-feed";
import FandomCard from "@/components/fandom-card";
import Link from "next/link";
import GlobalSearchBar from "@/components/global-search-bar";

export default function ExplorePage() {
  const { 
    query: globalQuery,
    setQuery: setGlobalQuery, 
    search, 
    resetSearch, 
    activeTab, 
    setActiveTab 
  } = useSearchStore();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(true);
  const [postsPopulares, setPostsPopulares] = useState<any[]>([]);
  const [fandomsDestacados, setFandomsDestacados] = useState<any[]>([]);

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
  
  const handleSearch = useCallback((newQuery: string) => {
    const trimmedQuery = newQuery.trim();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    } else {
      params.delete('q');
    }
    router.replace(`/explorar?${params.toString()}`, { scroll: false });

    setGlobalQuery(trimmedQuery);

    if (!trimmedQuery) {
      resetSearch();
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        await search();

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error: upsertError } = await supabase
              .from('user_searches')
              .upsert(
                { user_id: user.id, query: trimmedQuery, created_at: new Date().toISOString() },
                { onConflict: 'user_id, query', ignoreDuplicates: false }
              );

            if (upsertError) {
              console.error('Error al guardar búsqueda:', upsertError);
            } else {
              fetchRecentSearches();
            }
          }
        } catch (dbError) {
          console.error('Error al interactuar con la base de datos:', dbError);
        }

      } catch (searchError) {
        console.error('Error durante la búsqueda:', searchError);
      }
    }, 300);

  }, [searchParams, router, setGlobalQuery, resetSearch, search, fetchRecentSearches]);
  
  const fetchPopularPosts = useCallback(async () => {
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
  }, []);
  
  const fetchFeaturedFandoms = useCallback(async () => {
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
  }, []);
  
  const handleClearHistory = useCallback(async () => {
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
  }, []);
  
  useEffect(() => {
    fetchRecentSearches();
    fetchPopularPosts();
    fetchFeaturedFandoms();
  }, [fetchRecentSearches, fetchPopularPosts, fetchFeaturedFandoms]);
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Ejecutar búsqueda automáticamente si hay un parámetro q en la URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim() && q !== globalQuery) {
      setGlobalQuery(q);
      // Ejecutar la búsqueda después de un breve retraso para asegurar que el estado se ha actualizado
      setTimeout(() => {
        search();
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  
                  {!globalQuery && (
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