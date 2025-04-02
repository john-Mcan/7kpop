"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, Users, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import UserAvatar from "./ui/user-avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Componente para un ítem de navegación
interface NavItemProps {
  href: string;
  icon: React.ElementType;
  name: string;
  isActive: boolean;
}

const NavItem = ({ href, icon: Icon, name, isActive }: NavItemProps) => (
  <Link href={href} className="block">
    <div className={`w-full py-3 px-4 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 hover:text-purple-700 transition-all duration-200 flex items-center gap-3 relative ${
      isActive ? 'bg-white text-purple-700 shadow-sm' : 'bg-transparent'
    }`}>
      <Icon className="w-5 h-5" />
      <span>{name}</span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
      )}
    </div>
  </Link>
);

const NavigationSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  
  // Verificar si el usuario es admin o moderador
  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user) return;

      try {
        // Verificar si es administrador
        const { data: adminData, error: adminError } = await supabase
          .rpc('is_admin');

        if (adminError) throw adminError;
        setIsAdmin(!!adminData);

        if (!adminData) {
          // Verificar si es moderador de algún fandom
          const { data: modData, error: modError } = await supabase
            .from('fandom_moderators')
            .select('fandom_id')
            .eq('user_id', user.id);

          if (modError) throw modError;
          setIsModerator(modData && modData.length > 0);
        }
      } catch (error) {
        console.error('Error al verificar roles:', error);
      }
    };

    checkUserRoles();
  }, [user]);
  
  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Explorar", href: "/explorar", icon: Search },
    { name: "Fandoms", href: "/fandoms", icon: Users },
    { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  // Añadir el enlace de moderación si el usuario es admin o moderador
  if ((isAdmin || isModerator) && user) {
    navItems.push({ name: "Moderación", href: "/moderacion", icon: Shield });
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="h-full w-64 bg-gray-50 p-6 hidden md:flex flex-col">
      <div className="mb-8 px-4">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">fanverse</h1>
        </Link>
      </div>
      
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            name={item.name}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
      
      <div className="pt-6 mt-4">
        {isLoading ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-t-purple-600 border-r-purple-600 border-b-purple-600 border-l-transparent animate-spin"></div>
          </div>
        ) : user ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 mr-3 flex-shrink-0">
                <UserAvatar 
                  text={user.email?.charAt(0) || "U"}
                  size="full"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Miembro
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full rounded-full border border-gray-300 text-gray-700 hover:text-purple-700 hover:border-purple-400 font-medium flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Button 
              onClick={() => router.push("/auth/login")}
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all"
            >
              Iniciar sesión
            </Button>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Únete a la conversación
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <Link href="/auth/signup" className="text-purple-600 hover:text-purple-700">
                  Regístrate
                </Link> para compartir tus ideas en los fandoms
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationSidebar; 