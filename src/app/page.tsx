import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebarServer from "@/components/trending-sidebar-server";
import PostFeed from "@/components/post-feed";
import MobileNav from "@/components/mobile-nav";
import { Suspense } from "react";
import HomePostHandler from "../components/home-post-handler";
import IndexSearchBar from "@/components/index-search-bar";

export default function Home({
  searchParams,
}: {
  searchParams: { post?: string };
}) {
  const postSlug = searchParams.post || null;

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Feed de contenido o post individual */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <Suspense fallback={<div>Cargando...</div>}>
              {postSlug ? (
                <HomePostHandler postSlug={postSlug} />
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                        Tu Feed
                      </h1>
                      
                      <div className="dropdown relative">
                        <button className="flex items-center justify-center gap-1 text-sm rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2">
                          <span>Más recientes</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <IndexSearchBar />
                  </div>
                  
                  <div className="mt-6">
                    <PostFeed />
                  </div>
                </>
              )}
            </Suspense>
          </div>
        </main>

        {/* Columna derecha - Tendencias */}
        <TrendingSidebarServer />
      </div>
      
      {/* Navegación móvil */}
      <MobileNav />
    </>
  );
} 