'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/supabase/auth-context';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

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
      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
    } catch (error: any) {
      setError(error.message || 'Error al registrarse');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            7Kpop
          </h1>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-900">
            Crea tu cuenta
          </h2>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                ¡Registro exitoso! Te hemos enviado un correo de confirmación. Serás redirigido a la página de inicio de sesión en 5 segundos.
              </div>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all py-2.5"
              >
                Ir a inicio de sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
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
                  className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
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
                  className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
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
                  <Link href="/terminos" className="text-purple-600 hover:text-purple-700 font-medium">
                    términos y condiciones
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-medium shadow-sm hover:shadow hover:opacity-90 transition-all py-2.5"
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
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 