'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Error al actualizar la contraseña');
      setIsLoading(false);
    }
  };

  // Verificar que el usuario tenga una sesión válida para cambiar la contraseña
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        router.push('/auth/login');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen w-full md:flex">
      {/* Panel lateral decorativo - visible solo en pantallas md y mayores */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-6">fanverse</h1>
          <p className="text-xl mb-8">La comunidad para fans en América Latina</p>
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
            <p className="italic">
              "Conecta con fans, participa en votaciones, comparte tus opiniones y mantente al día con todo lo relacionado con tus artistas favoritos."
            </p>
          </div>
          <div className="mt-12 space-y-2">
            <div className="flex items-center space-x-2 opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Comunidades para todos tus intereses</span>
            </div>
            <div className="flex items-center space-x-2 opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Participa en discusiones y eventos</span>
            </div>
            <div className="flex items-center space-x-2 opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Comparte fotos y videos exclusivos</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulario de actualización de contraseña */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-between p-6 md:p-12 bg-gray-50 min-h-screen">
        <div className="w-full"></div> {/* Espaciador superior */}
        <div className="w-full max-w-md">
          {/* Logo para móviles - visible solo en pantallas pequeñas */}
          <div className="md:hidden text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              fanverse
            </h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Actualiza tu contraseña
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Crea una nueva contraseña segura para tu cuenta
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100"
              >
                {error}
              </motion.div>
            )}

            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                  ¡Contraseña actualizada con éxito! Serás redirigido a la página de inicio de sesión en unos segundos.
                </div>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all py-3 text-base"
                >
                  Ir a inicio de sesión
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                    placeholder="Repite tu contraseña"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all py-3 text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
        
        <div className="w-full mt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 fanverse. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
} 