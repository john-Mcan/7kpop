"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, Users, User, LogIn } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Explorar", href: "/explorar", icon: Search },
    { name: "Fandoms", href: "/fandoms", icon: Users },
    { name: "Mensajes", href: "/mensajes", icon: MessageSquare },
    { name: "Perfil", href: "/perfil", icon: User },
  ];

  // Añadir la opción de iniciar sesión si no hay usuario autenticado
  const authItem = user 
    ? null 
    : { name: "Entrar", href: "/auth/login", icon: LogIn };

  const allItems = authItem 
    ? [...navItems.slice(0, 4), authItem]  // Reemplazar el último elemento con "Entrar" si no hay usuario
    : navItems;  // Mantener todos los elementos si hay usuario

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-10">
      <div className="flex justify-around items-center h-16">
        {allItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link href={item.href} key={item.href}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`flex flex-col h-full py-1 rounded-none relative group ${
                  isActive ? 'text-purple-700' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 rounded-full" />
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav; 