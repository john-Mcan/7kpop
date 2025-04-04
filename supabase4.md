-- Función para crear un perfil al registrarse (Modificada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  base_email_part TEXT;
  attempts INT := 0;
BEGIN
  -- Intentar usar la parte local del email como base (si está disponible)
  base_email_part := split_part(NEW.email, '@', 1);
  -- Limpiar caracteres no alfanuméricos y limitar longitud
  base_email_part := lower(regexp_replace(base_email_part, '[^a-zA-Z0-9]', '', 'g'));
  IF char_length(base_email_part) > 15 THEN
    base_email_part := substring(base_email_part, 1, 15);
  END IF;
  IF base_email_part = '' THEN
     base_email_part := 'usuario'; -- Fallback si el email no da una base útil
  END IF;

  generated_username := base_email_part;

  -- Intentar encontrar un username único añadiendo números si es necesario
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) AND attempts < 10 LOOP
    generated_username := base_email_part || '_' || (random() * 1000)::int;
    attempts := attempts + 1;
  END LOOP;

  -- Si aún hay colisión (muy improbable), usar UUID
  IF attempts = 10 THEN
     generated_username := 'user_' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;

  -- Insertar el perfil con el username generado
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, generated_username); 
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Asegurarse de que el trigger usa la nueva función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Opcional: Actualizar perfiles existentes que no tengan username
-- Ejecuta esto con cuidado si tienes usuarios antiguos sin username
-- UPDATE public.profiles
-- SET username = 'user_' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)
-- WHERE username IS NULL; 

-- Script para corregir la relación FK entre posts y profiles (requerido para join implícito)
-- 1. Eliminar la restricción de clave foránea existente en posts.user_id
-- Nota: El nombre 'posts_user_id_fkey' es una suposición común. 
-- Si obtienes un error indicando que no existe, necesitas encontrar el nombre real 
-- de la restricción en tu esquema Supabase (puedes buscarlo en la interfaz de Supabase 
-- o con una consulta como: SELECT conname FROM pg_constraint WHERE conrelid = 'public.posts'::regclass AND contype = 'f') 
-- y reemplazar 'posts_user_id_fkey' con el nombre correcto.
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- 2. Añadir la nueva restricción de clave foránea referenciando public.profiles(id)
-- Esto crea la relación directa que Supabase necesita.
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id)
REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Opcional pero recomendado: Refrescar el esquema cache de PostgREST
-- A veces Supabase tarda en reconocer los cambios, esto puede ayudar.
NOTIFY pgrst, 'reload schema';


-- Script para ajustar políticas RLS de la tabla posts para permitir posts de perfil (fandom_id IS NULL)
-- 1. Eliminar la política INSERT restrictiva actual
DROP POLICY IF EXISTS "Miembros activos pueden crear publicaciones" ON public.posts;

-- 2. Crear NUEVA política INSERT que permite posts de perfil (fandom_id IS NULL) O posts de fandom (si es miembro activo)
CREATE POLICY "Usuarios pueden crear posts (perfil o fandom)" ON public.posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Condición 1: Es un post de perfil (fandom_id es nulo)
      posts.fandom_id IS NULL
      OR 
      -- Condición 2: Es un post de fandom y el usuario es miembro activo de ese fandom
      (
        posts.fandom_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.fandom_members fm
          WHERE fm.user_id = auth.uid()
            AND fm.fandom_id = posts.fandom_id
            AND fm.status = 'active'
        )
      )
    )
  );

-- 3. Eliminar las políticas SELECT existentes para reemplazarlas por una más completa
DROP POLICY IF EXISTS "Publicaciones aprobadas visibles para todos" ON public.posts;
DROP POLICY IF EXISTS "Autores/Mods/Admins pueden ver posts no aprobados" ON public.posts;
-- Si creaste las políticas revisadas en mi pensamiento anterior, elimínalas también:
DROP POLICY IF EXISTS "Ver posts públicos (perfil o fandom aprobado)" ON public.posts;
DROP POLICY IF EXISTS "Ver todos los posts propios/moderados/administrados" ON public.posts;


-- 4. Crear NUEVA política SELECT combinada para visibilidad
-- Permite ver si:
--   a) Es un post de perfil (fandom_id IS NULL)
--   b) Es un post de fandom y está aprobado
--   c) Es un post de fandom (cualquier estado) y eres el autor, moderador de ese fandom, o admin.
CREATE POLICY "Visibilidad de posts combinada (perfil y fandom)" ON public.posts
  FOR SELECT USING (
    -- Condición 1: Es un post de perfil (asumimos visible para usuarios logueados/público)
    fandom_id IS NULL
    OR
    -- Condición 2: Es un post de fandom APROBADO (visible para usuarios logueados/público)
    (fandom_id IS NOT NULL AND moderation_status = 'approved')
    OR
    -- Condición 3: Acceso elevado (autor/mod/admin) a posts de fandom (incluye no aprobados)
    (
        fandom_id IS NOT NULL AND (
          auth.uid() = user_id OR                           -- Eres el autor
          public.is_fandom_moderator(fandom_id) OR         -- Eres moderador del fandom
          public.is_admin()                                -- Eres admin
        )
    )
  );

-- NOTA: Las políticas UPDATE y DELETE existentes deberían funcionar correctamente.
-- Las que verifican auth.uid() = user_id se aplican a ambos tipos.
-- Las que verifican is_fandom_moderator(fandom_id) solo se aplicarán si fandom_id NO es NULL.

-- 5. Opcional pero recomendado: Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema'; 

-- 1. Eliminar la restricción de clave foránea existente en comments.user_id
-- Nota: El nombre 'comments_user_id_fkey' es una suposición. 
-- Verifica el nombre real en tu esquema si este falla. 
-- Consulta: SELECT conname FROM pg_constraint WHERE conrelid = 'public.comments'::regclass AND contype = 'f';
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- 2. Añadir la nueva restricción de clave foránea referenciando public.profiles(id)
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id)
REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Opcional pero recomendado: Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';

-- 1. Eliminar la política INSERT restrictiva actual para comentarios
DROP POLICY IF EXISTS "Miembros activos pueden comentar" ON public.comments;

-- 2. Crear NUEVA política INSERT que permita comentarios en posts de perfil (solo requiere autenticación)
--    O en posts de fandom (si el usuario es miembro activo)
CREATE POLICY "Usuarios pueden comentar (perfil o fandom)" ON public.comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Condición 1: El post asociado es un post de perfil (fandom_id es nulo)
      EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND p.fandom_id IS NULL)
      OR
      -- Condición 2: El post asociado es de fandom Y el usuario es miembro activo de ese fandom
      EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.fandom_members fm ON p.fandom_id = fm.fandom_id
        WHERE p.id = comments.post_id
          AND p.fandom_id IS NOT NULL -- Asegura que es post de fandom
          AND fm.user_id = auth.uid()
          AND fm.status = 'active'
      )
    )
  );

-- 3. Opcional: Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';

