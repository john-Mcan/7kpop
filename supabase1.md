# Configuración de Supabase para fanverse

Este documento detalla la configuración de Supabase como backend para la aplicación fanverse.

## Recursos incluidos en la configuración

### Tablas
1. **profiles** - Perfiles de usuario
2. **fandoms** - Comunidades temáticas
3. **fandom_moderators** - Moderadores de fandoms
4. **fandom_requests** - Solicitudes de creación de fandoms
5. **posts** - Publicaciones de usuarios
6. **fandom_members** - Miembros de fandoms
7. **comments** - Comentarios en publicaciones
8. **post_votes** - Votos en publicaciones
9. **comment_votes** - Votos en comentarios
10. **saved_items** - Items guardados por usuarios
11. **notifications** - Notificaciones para usuarios
12. **reports** - Reportes de contenido inapropiado
13. **tags** - Etiquetas para publicaciones
14. **post_tags** - Relación entre posts y etiquetas
15. **messages** - Mensajes privados entre usuarios
16. **votaciones** - Sistema de votaciones
17. **votacion_opciones** - Opciones en votaciones
18. **votos** - Registro de votos de usuarios

### Funciones y Triggers
- **handle_new_user()** - Crea perfil automáticamente al registrarse
- **update_post_votes_count()** - Actualiza conteo de votos en posts
- **update_comment_votes_count()** - Actualiza conteo de votos en comentarios
- **create_reply_notification()** - Genera notificaciones automáticas en respuestas
- **generate_post_slug_and_path()** - Genera slugs y rutas internas para posts

### Seguridad
- Row Level Security (RLS) activado en todas las tablas
- Políticas de seguridad para diferentes roles (usuarios, moderadores, administradores)

## Scripts SQL esenciales

### Tablas principales

```sql
-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- 'user' o 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Función para crear un perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Tabla de fandoms
CREATE TABLE IF NOT EXISTS public.fandoms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabla de moderadores de fandoms
CREATE TABLE IF NOT EXISTS public.fandom_moderators (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, fandom_id)
);

-- Tabla de publicaciones
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  image_urls TEXT[],                 -- Array para URLs de imágenes subidas
  video_url TEXT,                    -- URL del video subido
  link_url TEXT,                     -- URL externa proporcionada por el usuario
  slug TEXT,                         -- Slug generado para la URL amigable
  internal_path TEXT,                -- Ruta interna generada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Para comentarios anidados
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Habilitar RLS en las tablas

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.fandoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fandom_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fandom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fandom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votacion_opciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;
```

### Funciones para actualización automática

```sql
-- Función para actualizar los upvotes/downvotes de posts
CREATE OR REPLACE FUNCTION update_post_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 1 THEN
      UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
      UPDATE public.posts 
      SET upvotes = upvotes - 1, downvotes = downvotes + 1 
      WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
      UPDATE public.posts 
      SET downvotes = downvotes - 1, upvotes = upvotes + 1 
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 1 THEN
      UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Función para generar slug y ruta interna del post
CREATE OR REPLACE FUNCTION public.generate_post_slug_and_path()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  fandom_record_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Crear slug básico desde el título
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := trim(regexp_replace(base_slug, '\s+', '-', 'g'));

  -- Si el slug base queda vacío, usar UUID del post
  IF base_slug = '' THEN
     base_slug := NEW.id::text;
  END IF;

  -- Asignar el slug inicial
  final_slug := base_slug;

  -- Verificar si el slug ya existe para este fandom y añadir contador si es necesario
  WHILE EXISTS(
    SELECT 1 FROM public.posts
    WHERE slug = final_slug AND fandom_id = NEW.fandom_id AND id != NEW.id
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  -- Asignar el slug final generado
  NEW.slug := final_slug;

  -- Construir la ruta interna ('internal_path')
  SELECT f.slug INTO fandom_record_slug FROM public.fandoms f WHERE f.id = NEW.fandom_id;

  -- Asignar NULL si no se encuentra el slug del fandom
  IF fandom_record_slug IS NULL THEN
    NEW.internal_path := NULL;
  ELSE
    NEW.internal_path := '/fandoms/' || fandom_record_slug || '/posts/' || final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = public;

-- Trigger para generar slug y ruta interna
DROP TRIGGER IF EXISTS set_post_slug ON public.posts;
CREATE TRIGGER set_post_slug_and_path
BEFORE INSERT OR UPDATE OF title ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.generate_post_slug_and_path();
```

## Configuración de proyecto

1. Crear proyecto en [app.supabase.com](https://app.supabase.com)
2. Configurar variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
   ```
3. Habilitar autenticación por email en Authentication > Providers
4. Ejecutar los scripts SQL para crear las tablas y funciones
5. Configurar políticas RLS para cada tabla

Para configurar el primer administrador después de crear todas las tablas:
```sql
-- Asignar rol de administrador al primer usuario (reemplaza USER_ID)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_ID_AQUÍ';
``` 

## Funciones auxiliares de seguridad

```sql
-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- Función para verificar si el usuario es moderador de un fandom
CREATE OR REPLACE FUNCTION public.is_fandom_moderator(fandom_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fandom_moderators
    WHERE user_id = auth.uid() AND fandom_id = $1
  );
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;

-- Función para verificar si el usuario es miembro de un fandom
CREATE OR REPLACE FUNCTION public.is_fandom_member(fandom_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fandom_members
    WHERE user_id = auth.uid() AND fandom_id = $1
  );
$$ LANGUAGE SQL SECURITY DEFINER SET search_path = public;
```

## Políticas de seguridad (RLS)

### Políticas para Fandoms

```sql
-- Todos pueden ver los fandoms aprobados
CREATE POLICY "Fandoms aprobados visibles para todos" ON public.fandoms
  FOR SELECT USING (status = 'approved');

-- Solo administradores pueden ver todos los fandoms (incluyendo pendientes)
CREATE POLICY "Administradores pueden ver todos los fandoms" ON public.fandoms
  FOR SELECT USING (public.is_admin());

-- Solo administradores pueden crear fandoms
CREATE POLICY "Solo administradores pueden crear fandoms" ON public.fandoms
  FOR INSERT WITH CHECK (public.is_admin());

-- Solo administradores pueden actualizar fandoms
CREATE POLICY "Administradores pueden actualizar fandoms" ON public.fandoms
  FOR UPDATE USING (public.is_admin());

-- Moderadores pueden actualizar sus fandoms
CREATE POLICY "Moderadores pueden actualizar datos de su fandom" ON public.fandoms
  FOR UPDATE USING (public.is_fandom_moderator(id));
```

### Políticas para Publicaciones

```sql
-- Todos pueden ver las publicaciones
CREATE POLICY "Publicaciones visibles para todos" ON public.posts
  FOR SELECT USING (true);

-- Solo miembros del fandom pueden crear publicaciones
CREATE POLICY "Miembros pueden crear publicaciones en su fandom" ON public.posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.is_fandom_member(fandom_id)
  );

-- El autor puede editar sus publicaciones
CREATE POLICY "Autores pueden actualizar sus publicaciones" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Moderadores pueden editar publicaciones en su fandom
CREATE POLICY "Moderadores pueden editar publicaciones de su fandom" ON public.posts
  FOR UPDATE USING (public.is_fandom_moderator(fandom_id));

-- El autor puede eliminar sus publicaciones
CREATE POLICY "Autores pueden eliminar sus publicaciones" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Moderadores pueden eliminar publicaciones en su fandom
CREATE POLICY "Moderadores pueden eliminar publicaciones de su fandom" ON public.posts
  FOR DELETE USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden eliminar cualquier publicación
CREATE POLICY "Administradores pueden eliminar cualquier publicación" ON public.posts
  FOR DELETE USING (public.is_admin());
```

### Políticas para Comentarios

```sql
-- Todos pueden ver los comentarios
CREATE POLICY "Comentarios visibles para todos" ON public.comments
  FOR SELECT USING (true);

-- Usuarios autenticados pueden comentar
CREATE POLICY "Usuarios pueden comentar" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Solo el autor puede editar su comentario
CREATE POLICY "Autores pueden editar sus comentarios" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Moderadores pueden editar comentarios en su fandom
CREATE POLICY "Moderadores pueden editar comentarios" ON public.comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.fandom_moderators fm ON p.fandom_id = fm.fandom_id
      WHERE p.id = public.comments.post_id AND fm.user_id = auth.uid()
    )
  );

-- El autor puede eliminar su comentario
CREATE POLICY "Autores pueden eliminar sus comentarios" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Moderadores pueden eliminar comentarios
CREATE POLICY "Moderadores pueden eliminar comentarios" ON public.comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.fandom_moderators fm ON p.fandom_id = fm.fandom_id
      WHERE p.id = public.comments.post_id AND fm.user_id = auth.uid()
    )
  );

-- Administradores pueden eliminar cualquier comentario
CREATE POLICY "Administradores pueden eliminar cualquier comentario" ON public.comments
  FOR DELETE USING (public.is_admin());
```

## Configuración de Storage

```sql
-- Políticas para Supabase Storage (Bucket: posts.media)
CREATE POLICY "Permitir lectura pública de medios de posts" 
ON storage.objects FOR SELECT
TO anon, authenticated
USING ( bucket_id = 'posts.media' );

-- Permitir subida a usuarios autenticados
CREATE POLICY "Permitir subida de medios a usuarios autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'posts.media' AND auth.role() = 'authenticated' );

-- Permitir actualizar solo al propietario
CREATE POLICY "Permitir al propietario actualizar sus archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'posts.media' AND auth.uid() = owner );

-- Permitir eliminar solo al propietario
CREATE POLICY "Permitir al propietario eliminar sus archivos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'posts.media' AND auth.uid() = owner );
```

Para configurar Supabase Storage:

1. Crear bucket `posts.media` en Storage con acceso público
2. Verificar que las políticas para SELECT, INSERT, UPDATE y DELETE estén activas 