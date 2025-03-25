import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  await supabase.auth.getSession();
  
  return response;
}

// Este middleware se aplicará a todas las rutas
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes de Next.js)
     * - favicon.ico (icono del sitio)
     * - public (archivos públicos)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 