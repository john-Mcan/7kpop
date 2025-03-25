'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    // Mostrar un estado de carga mientras se verifica la autenticación
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-600 border-b-purple-600 border-l-purple-100 border-r-purple-100 animate-spin"></div>
      </div>
    );
  }

  // Si hay un usuario autenticado, mostrar el contenido protegido
  if (user) {
    return <>{children}</>;
  }

  // Este return es necesario por razones de tipo, pero nunca se renderizará
  // porque el useEffect redirigirá al usuario
  return null;
} 