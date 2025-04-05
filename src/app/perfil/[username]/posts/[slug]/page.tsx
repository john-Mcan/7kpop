import { Suspense } from "react";
import UserPostHandler from "@/components/user-post-handler";
import NavigationSidebar from "@/components/navigation-sidebar";
import TrendingSidebarServer from "@/components/trending-sidebar-server";
import MobileNav from "@/components/mobile-nav";

export default function UserPostPage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const { username, slug } = params;

  return (
    <>
      <div className="h-full w-full flex bg-gray-50">
        {/* Columna izquierda - Navegación */}
        <NavigationSidebar />

        {/* Columna central - Post individual */}
        <main className="h-full flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-3xl mx-auto py-6 px-4">
            <Suspense fallback={<div>Cargando...</div>}>
              <UserPostHandler username={username} postSlug={slug} />
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
