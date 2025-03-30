"use client";

import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebar from "@/components/trending-sidebar";
import PostFeed from "@/components/post-feed";
import MobileNav from "@/components/mobile-nav";
import SinglePostView from "@/components/single-post-view";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  // Obtener el parámetro 'post' de la URL si existe
  const searchParams = useSearchParams();
  const router = useRouter();
  const postSlug = searchParams?.get('post');
  
  const [isViewingPost, setIsViewingPost] = useState(false);

  // Efecto para detectar cambios en los parámetros de URL
  useEffect(() => {
    setIsViewingPost(!!postSlug);
  }, [postSlug]);
  
  // Función para volver al feed desde un post
  const handleBackToFeed = () => {
    router.push('/');
  };

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Feed de contenido o post individual */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            {isViewingPost && postSlug ? (
              <SinglePostView postSlug={postSlug} onBack={handleBackToFeed} />
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                      Tu Feed
                    </h1>
                    
                    <div className="dropdown relative">
                      <Button variant="outline" className="flex items-center justify-center gap-1 text-sm rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50">
                        <span>Más recientes</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative w-full">
                    <input 
                      type="search" 
                      placeholder="Buscar fanverse..." 
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
                
                <div className="mt-6">
                  <PostFeed />
                </div>
              </>
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