'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/supabase/auth-context';
import Image from 'next/image';

type AuthView = 'login' | 'signup' | 'reset-password';

export default function AuthContainer() {
  const pathname = usePathname();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp, resetPassword } = useAuth();

  // Determinar la vista inicial basada en la URL
  useEffect(() => {
    if (pathname === '/auth/signup') {
      setCurrentView('signup');
    } else if (pathname === '/auth/reset-password') {
      setCurrentView('reset-password');
    } else {
      setCurrentView('login');
    }
  }, [pathname]);

  const handleViewChange = (view: AuthView) => {
    setError(null);
    setSuccess(null);
    
    // Actualizar la URL sin recargar la página
    const path = view === 'login' ? '/auth/login' : 
                view === 'signup' ? '/auth/signup' : '/auth/reset-password';
    
    window.history.pushState({}, '', path);
    setCurrentView(view);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/'); // Redirigir a la página principal después del inicio de sesión
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
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
      await signUp(email, password);
      setSuccess('¡Registro exitoso! Te hemos enviado un correo de confirmación.');
      setIsLoading(false);
      setTimeout(() => {
        handleViewChange('login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Error al registrarse');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Se ha enviado un enlace a tu correo para restablecer tu contraseña');
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || 'Error al enviar el correo de recuperación');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full md:flex">
      {/* Panel lateral decorativo - visible solo en pantallas md y mayores */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-6">fanverse</h1>
          <p className="text-xl mb-8">La comunidad para fans en América Latina</p>
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-lg border border-white/20">
            <p className="italic">
              "Conecta con otros fans, descubre nuevos artistas y expresa tu pasión en una comunidad que celebra la creatividad y la cultura de los fandoms."
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
              <span>Votaciones y discusiones en la comunidad</span>
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
      
      {/* Formulario de autenticación */}
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
                {currentView === 'login' && 'Inicia sesión en tu cuenta'}
                {currentView === 'signup' && 'Crea tu cuenta'}
                {currentView === 'reset-password' && 'Recupera tu contraseña'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {currentView === 'login' && 'Bienvenido de nuevo a la comunidad fanverse'}
                {currentView === 'signup' && 'Únete a la comunidad de fans más grande de Latinoamérica'}
                {currentView === 'reset-password' && 'Te enviaremos un correo para restablecer tu contraseña'}
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

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100"
              >
                {success}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Recordarme
                        </label>
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleViewChange('reset-password')}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all py-3 text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                          Iniciando sesión...
                        </div>
                      ) : (
                        'Iniciar sesión'
                      )}
                    </Button>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <button
                          type="button"
                          onClick={() => handleViewChange('signup')}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Regístrate
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {currentView === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
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
                        Confirmar contraseña
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

                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        Acepto los{' '}
                        <a href="/terminos" className="text-purple-600 hover:text-purple-700 font-medium">
                          términos y condiciones
                        </a>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all py-3 text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                          Registrando...
                        </div>
                      ) : (
                        'Registrarse'
                      )}
                    </Button>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <button
                          type="button"
                          onClick={() => handleViewChange('login')}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Inicia sesión
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {currentView === 'reset-password' && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all text-base"
                        placeholder="tu@email.com"
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
                          Enviando...
                        </div>
                      ) : (
                        'Enviar enlace de recuperación'
                      )}
                    </Button>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={() => handleViewChange('login')}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Volver a iniciar sesión
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
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