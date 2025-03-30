# Configuración de Supabase para fanverse

Este documento detalla el proceso para configurar Supabase como backend para la autenticación y base de datos de la aplicación fanverse.

## 1. Crear un proyecto en Supabase

1. Ve a [database.new](https://database.new) o [app.supabase.com](https://app.supabase.com) y crea una cuenta o inicia sesión
2. Haz clic en "New Project"
3. Asigna un nombre al proyecto (por ejemplo, "fanverse")
4. Establece una contraseña segura para la base de datos
5. Selecciona una región cercana a tus usuarios objetivo
6. Haz clic en "Create new project"

## 2. Configurar las variables de entorno

Una vez creado el proyecto, necesitarás las credenciales para conectar tu aplicación:

1. En el dashboard de Supabase, ve a "Settings" > "API"
2. Copia la URL de tu proyecto y la clave anónima (anon key)
3. Actualiza el archivo `.env.local` en la raíz de tu proyecto con estos valores:

```
NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANONIMA
```

## 3. Configurar la autenticación

Para configurar la autenticación con email y contraseña:

1. En el dashboard de Supabase, ve a "Authentication" > "Providers"
2. Asegúrate de que "Email" esté habilitado
3. Puedes configurar opciones adicionales como:
   - Permitir registros sin confirmación de email
   - Personalizar templates de email
   - Establecer una duración para las sesiones

## 4. Configurar la base de datos

### 4.1 Tabla de perfiles de usuario y roles

Supabase ya incluye una tabla `auth.users` para los datos de autenticación. Crearemos una tabla de perfiles para la información adicional de los usuarios y roles:

1. Ve a "SQL Editor" y ejecuta el siguiente SQL:

```sql
-- Crear tabla de perfiles de usuario
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

-- Políticas RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para ver cualquier perfil
CREATE POLICY "Perfiles visibles para todos" ON public.profiles
  FOR SELECT USING (true);

-- Política para actualizar solo tu propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
  
-- Política para que los administradores puedan actualizar cualquier perfil
CREATE POLICY "Los administradores pueden actualizar cualquier perfil" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 4.2 Tablas principales

Para la estructura principal de la aplicación, ejecuta:

```sql
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

-- Tabla de solicitudes de fandoms
CREATE TABLE IF NOT EXISTS public.fandom_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE SET NULL
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla para los miembros de fandoms 
CREATE TABLE IF NOT EXISTS public.fandom_members (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, fandom_id)
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

-- Sistema de votos para publicaciones
CREATE TABLE IF NOT EXISTS public.post_votes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  vote_type INTEGER CHECK (vote_type IN (-1, 1)), -- -1 para downvote, 1 para upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- Sistema de votos para comentarios
CREATE TABLE IF NOT EXISTS public.comment_votes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type INTEGER CHECK (vote_type IN (-1, 1)), -- -1 para downvote, 1 para upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, comment_id)
);

-- Guardados o favoritos
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT one_reference_only CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (comment_id IS NOT NULL AND post_id IS NULL)
  )
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'reply', 'upvote', 'mod_action', 'system')),
  content TEXT NOT NULL,
  link TEXT, -- URL a la que dirigir cuando se hace clic en la notificación
  is_read BOOLEAN DEFAULT FALSE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Usuario que causó la notificación
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reportes de contenido inapropiado
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  reason TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT one_item_only CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (comment_id IS NOT NULL AND post_id IS NULL)
  )
);

-- Etiquetas (tags) para publicaciones
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Relación entre posts y tags
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Mensajes privados entre usuarios
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Votaciones
CREATE TABLE IF NOT EXISTS public.votaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Opciones de votación
CREATE TABLE IF NOT EXISTS public.votacion_opciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  votacion_id UUID REFERENCES public.votaciones(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT
);

-- Votos de usuarios
CREATE TABLE IF NOT EXISTS public.votos (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opcion_id UUID REFERENCES public.votacion_opciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, opcion_id)
);

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

-- Agregar triggers para actualizar automáticamente los conteos de votos

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

-- Función para actualizar los upvotes/downvotes de comentarios
CREATE OR REPLACE FUNCTION update_comment_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 1 THEN
      UPDATE public.comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE public.comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
      UPDATE public.comments 
      SET upvotes = upvotes - 1, downvotes = downvotes + 1 
      WHERE id = NEW.comment_id;
    ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
      UPDATE public.comments 
      SET downvotes = downvotes - 1, upvotes = upvotes + 1 
      WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 1 THEN
      UPDATE public.comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE public.comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para mantener actualizados los conteos de votos
CREATE TRIGGER update_post_votes
AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
FOR EACH ROW EXECUTE PROCEDURE update_post_votes_count();

CREATE TRIGGER update_comment_votes
AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
FOR EACH ROW EXECUTE PROCEDURE update_comment_votes_count();

-- Función para crear notificaciones automáticamente
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_comment_author_id UUID;
BEGIN
  -- Si es un comentario directo a un post, notificar al autor del post
  IF NEW.parent_comment_id IS NULL THEN
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    
    -- No enviar notificación si el usuario comenta su propio post
    IF post_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (
        user_id, type, content, actor_id, post_id, comment_id
      )
      VALUES (
        post_author_id,
        'reply',
        'Alguien ha comentado en tu publicación',
        NEW.user_id,
        NEW.post_id,
        NEW.id
      );
    END IF;
  ELSE
    -- Si es una respuesta a otro comentario, notificar al autor del comentario padre
    SELECT user_id INTO parent_comment_author_id 
    FROM public.comments 
    WHERE id = NEW.parent_comment_id;
    
    -- No enviar notificación si el usuario responde a su propio comentario
    IF parent_comment_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (
        user_id, type, content, actor_id, post_id, comment_id
      )
      VALUES (
        parent_comment_author_id,
        'reply',
        'Alguien ha respondido a tu comentario',
        NEW.user_id,
        NEW.post_id,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear notificaciones automáticamente cuando alguien comenta
CREATE TRIGGER comment_notification_trigger
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE PROCEDURE create_reply_notification();

## 5. Políticas de seguridad (RLS)

Las políticas de Row Level Security (RLS) son esenciales para proteger tus datos y aplicar los diferentes roles. Ejecuta el siguiente código SQL:

```sql
-- Funciones auxiliares para verificar roles

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

-- Políticas para Fandoms

-- Todos pueden ver los fandoms aprobados
CREATE POLICY "Fandoms aprobados visibles para todos" ON public.fandoms
  FOR SELECT USING (status = 'approved');

-- Solo administradores pueden ver todos los fandoms (incluyendo pendientes)
CREATE POLICY "Administradores pueden ver todos los fandoms" ON public.fandoms
  FOR SELECT USING (public.is_admin());

-- Solo administradores pueden crear fandoms
CREATE POLICY "Solo administradores pueden crear fandoms" ON public.fandoms
  FOR INSERT WITH CHECK (public.is_admin());

-- Solo administradores y creadores pueden actualizar fandoms
CREATE POLICY "Administradores pueden actualizar fandoms" ON public.fandoms
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Moderadores pueden actualizar datos de su fandom" ON public.fandoms
  FOR UPDATE USING (public.is_fandom_moderator(id));

-- Políticas para Solicitudes de Fandoms

-- Usuarios autenticados pueden solicitar fandoms
CREATE POLICY "Usuarios pueden solicitar fandoms" ON public.fandom_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuarios pueden ver sus propias solicitudes
CREATE POLICY "Usuarios pueden ver sus propias solicitudes" ON public.fandom_requests
  FOR SELECT USING (user_id = auth.uid());

-- Administradores pueden ver todas las solicitudes
CREATE POLICY "Administradores pueden ver todas las solicitudes" ON public.fandom_requests
  FOR SELECT USING (public.is_admin());

-- Administradores pueden actualizar solicitudes
CREATE POLICY "Administradores pueden procesar solicitudes" ON public.fandom_requests
  FOR UPDATE USING (public.is_admin());

-- Políticas para Moderadores de Fandoms

-- Solo administradores pueden asignar moderadores
CREATE POLICY "Solo administradores pueden asignar moderadores" ON public.fandom_moderators
  FOR INSERT WITH CHECK (public.is_admin());

-- Moderadores pueden ver su propio estatus
CREATE POLICY "Moderadores pueden ver su estatus" ON public.fandom_moderators
  FOR SELECT USING (user_id = auth.uid());

-- Los administradores pueden ver todos los moderadores
CREATE POLICY "Administradores pueden ver todos los moderadores" ON public.fandom_moderators
  FOR SELECT USING (public.is_admin());

-- Los administradores pueden remover moderadores
CREATE POLICY "Administradores pueden remover moderadores" ON public.fandom_moderators
  FOR DELETE USING (public.is_admin());

-- Políticas para Publicaciones

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

-- Políticas para Membresía de Fandoms

-- Usuarios pueden unirse a fandoms
CREATE POLICY "Usuarios pueden unirse a fandoms" ON public.fandom_members
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.fandoms
      WHERE id = fandom_id AND status = 'approved'
    )
  );

-- Usuarios pueden ver a qué fandoms pertenecen
CREATE POLICY "Usuarios pueden ver sus membresías" ON public.fandom_members
  FOR SELECT USING (user_id = auth.uid());

-- Administradores pueden ver todas las membresías
CREATE POLICY "Administradores pueden ver todas las membresías" ON public.fandom_members
  FOR SELECT USING (public.is_admin());

-- Moderadores pueden ver membresías de su fandom
CREATE POLICY "Moderadores pueden ver membresías de su fandom" ON public.fandom_members
  FOR SELECT USING (public.is_fandom_moderator(fandom_id));

-- Usuarios pueden abandonar fandoms
CREATE POLICY "Usuarios pueden abandonar fandoms" ON public.fandom_members
  FOR DELETE USING (user_id = auth.uid());

-- Administradores y moderadores pueden eliminar usuarios de un fandom
CREATE POLICY "Moderadores pueden eliminar usuarios de su fandom" ON public.fandom_members
  FOR DELETE USING (public.is_fandom_moderator(fandom_id));

CREATE POLICY "Administradores pueden eliminar cualquier membresía" ON public.fandom_members
  FOR DELETE USING (public.is_admin());

-- Políticas para Comentarios

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

-- Políticas para votos de publicaciones

-- Usuarios autenticados pueden votar
CREATE POLICY "Usuarios pueden votar en publicaciones" ON public.post_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuarios pueden cambiar su voto
CREATE POLICY "Usuarios pueden cambiar sus votos en publicaciones" ON public.post_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuarios pueden quitar su voto
CREATE POLICY "Usuarios pueden quitar sus votos en publicaciones" ON public.post_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Usuarios solo pueden ver sus propios votos
CREATE POLICY "Usuarios pueden ver sus votos en publicaciones" ON public.post_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Administradores pueden ver todos los votos
CREATE POLICY "Administradores pueden ver todos los votos de publicaciones" ON public.post_votes
  FOR SELECT USING (public.is_admin());

-- Políticas similares para votos de comentarios
CREATE POLICY "Usuarios pueden votar en comentarios" ON public.comment_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden cambiar sus votos en comentarios" ON public.comment_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar sus votos en comentarios" ON public.comment_votes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver sus votos en comentarios" ON public.comment_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Administradores pueden ver todos los votos de comentarios" ON public.comment_votes
  FOR SELECT USING (public.is_admin());

-- Políticas para elementos guardados

-- Usuarios pueden guardar elementos
CREATE POLICY "Usuarios pueden guardar elementos" ON public.saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden ver sus elementos guardados
CREATE POLICY "Usuarios pueden ver sus elementos guardados" ON public.saved_items
  FOR SELECT USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus elementos guardados
CREATE POLICY "Usuarios pueden eliminar sus elementos guardados" ON public.saved_items
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notificaciones

-- Usuarios pueden ver sus notificaciones
CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Usuarios pueden marcar notificaciones como leídas
CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para reportes

-- Usuarios pueden crear reportes
CREATE POLICY "Usuarios pueden reportar contenido" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Usuarios pueden ver sus propios reportes
CREATE POLICY "Usuarios pueden ver sus reportes" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Moderadores pueden ver reportes de su fandom
CREATE POLICY "Moderadores pueden ver reportes de su fandom" ON public.reports
  FOR SELECT USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden ver todos los reportes
CREATE POLICY "Administradores pueden ver todos los reportes" ON public.reports
  FOR SELECT USING (public.is_admin());

-- Moderadores pueden procesar reportes de su fandom
CREATE POLICY "Moderadores pueden procesar reportes de su fandom" ON public.reports
  FOR UPDATE USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden procesar cualquier reporte
CREATE POLICY "Administradores pueden procesar cualquier reporte" ON public.reports
  FOR UPDATE USING (public.is_admin());

-- Políticas para etiquetas (tags)

-- Todos pueden ver etiquetas
CREATE POLICY "Etiquetas visibles para todos" ON public.tags
  FOR SELECT USING (true);

-- Moderadores pueden crear etiquetas para su fandom
CREATE POLICY "Moderadores pueden crear etiquetas" ON public.tags
  FOR INSERT WITH CHECK (public.is_fandom_moderator(fandom_id));

-- Administradores pueden crear cualquier etiqueta
CREATE POLICY "Administradores pueden crear cualquier etiqueta" ON public.tags
  FOR INSERT WITH CHECK (public.is_admin());

-- Moderadores pueden actualizar etiquetas de su fandom
CREATE POLICY "Moderadores pueden actualizar etiquetas" ON public.tags
  FOR UPDATE USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden actualizar cualquier etiqueta
CREATE POLICY "Administradores pueden actualizar cualquier etiqueta" ON public.tags
  FOR UPDATE USING (public.is_admin());

-- Moderadores pueden eliminar etiquetas de su fandom
CREATE POLICY "Moderadores pueden eliminar etiquetas" ON public.tags
  FOR DELETE USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden eliminar cualquier etiqueta
CREATE POLICY "Administradores pueden eliminar cualquier etiqueta" ON public.tags
  FOR DELETE USING (public.is_admin());

-- Políticas para asignación de etiquetas a posts

-- Todos pueden ver la relación de etiquetas
CREATE POLICY "Relación de etiquetas visible para todos" ON public.post_tags
  FOR SELECT USING (true);

-- El autor del post puede asignar etiquetas
CREATE POLICY "Autores pueden asignar etiquetas a sus posts" ON public.post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Moderadores pueden asignar etiquetas en su fandom
CREATE POLICY "Moderadores pueden asignar etiquetas" ON public.post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.fandoms f ON p.fandom_id = f.id
      WHERE p.id = post_id AND public.is_fandom_moderator(f.id)
    )
  );

-- Autor puede quitar etiquetas de su post
CREATE POLICY "Autores pueden quitar etiquetas de sus posts" ON public.post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Moderadores pueden quitar etiquetas en su fandom
CREATE POLICY "Moderadores pueden quitar etiquetas" ON public.post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.fandoms f ON p.fandom_id = f.id
      WHERE p.id = post_id AND public.is_fandom_moderator(f.id)
    )
  );

-- Políticas para mensajes privados

-- Usuarios pueden enviar mensajes
CREATE POLICY "Usuarios pueden enviar mensajes" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Usuarios pueden ver sus mensajes enviados o recibidos
CREATE POLICY "Usuarios pueden ver sus mensajes" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Solo el receptor puede marcar como leído
CREATE POLICY "Receptores pueden marcar mensajes como leídos" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Usuarios pueden eliminar mensajes que han enviado
CREATE POLICY "Usuarios pueden eliminar mensajes enviados" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Políticas para votaciones

-- Todos pueden ver las votaciones activas
CREATE POLICY "Votaciones visibles para todos" ON public.votaciones
  FOR SELECT USING (true);

-- Solo administradores pueden crear votaciones
CREATE POLICY "Solo administradores pueden crear votaciones" ON public.votaciones
  FOR INSERT WITH CHECK (public.is_admin());

-- Solo administradores pueden actualizar votaciones
CREATE POLICY "Solo administradores pueden actualizar votaciones" ON public.votaciones
  FOR UPDATE USING (public.is_admin());

-- Solo administradores pueden eliminar votaciones
CREATE POLICY "Solo administradores pueden eliminar votaciones" ON public.votaciones
  FOR DELETE USING (public.is_admin());

-- Políticas para opciones de votación

-- Todos pueden ver opciones de votación
CREATE POLICY "Opciones de votación visibles para todos" ON public.votacion_opciones
  FOR SELECT USING (true);

-- Solo administradores pueden crear opciones
CREATE POLICY "Solo administradores pueden crear opciones de votación" ON public.votacion_opciones
  FOR INSERT WITH CHECK (public.is_admin());

-- Solo administradores pueden actualizar opciones
CREATE POLICY "Solo administradores pueden actualizar opciones de votación" ON public.votacion_opciones
  FOR UPDATE USING (public.is_admin());

-- Solo administradores pueden eliminar opciones
CREATE POLICY "Solo administradores pueden eliminar opciones de votación" ON public.votacion_opciones
  FOR DELETE USING (public.is_admin());

-- Políticas para votos de usuarios

-- Usuarios pueden ver el resultado total de votos
CREATE POLICY "Resultados de votación visibles para todos" ON public.votos
  FOR SELECT USING (true);

-- Usuarios autenticados pueden votar
CREATE POLICY "Usuarios pueden votar" ON public.votos
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.votacion_opciones vo
      JOIN public.votaciones v ON vo.votacion_id = v.id
      WHERE vo.id = opcion_id
      AND v.start_date <= NOW()
      AND v.end_date >= NOW()
    )
  );

-- Usuarios pueden eliminar/cambiar su voto mientras la votación esté activa
CREATE POLICY "Usuarios pueden eliminar su voto" ON public.votos
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.votacion_opciones vo
      JOIN public.votaciones v ON vo.votacion_id = v.id
      WHERE vo.id = opcion_id
      AND v.start_date <= NOW()
      AND v.end_date >= NOW()
    )
  );
```

## 6. Pruebas

Una vez configurado, puedes probar la autenticación navegando a:

- `/auth/signup` para registrarse
- `/auth/login` para iniciar sesión

Para configurar el primer administrador, puedes ejecutar manualmente:

```sql
-- Asignar rol de administrador al primer usuario (reemplaza USER_ID)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_ID_AQUÍ';
```

## Recursos adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de autenticación de Next.js con Supabase](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Ejemplos de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 

## Nota sobre implementación de comentarios anidados

La única consideración adicional es que para la integración real con Supabase, cuando se implemente:

1. Al enviar un comentario de respuesta, se debe establecer el campo `parent_comment_id` con el ID del comentario al que se responde
2. Al cargar comentarios, la estructura de árbol debe construirse adecuadamente a partir de los datos planos de Supabase

Esto requerirá un procesamiento adicional en el cliente para transformar la estructura plana devuelta por Supabase en una estructura jerárquica de comentarios y respuestas para mostrar correctamente en la interfaz de usuario. 

## Actualización: Soporte para categorías de fandoms

Para agregar soporte para categorías de fandoms en Supabase, es necesario ejecutar las siguientes sentencias SQL:

### 1. Agregar campo categoría a la tabla fandoms

```sql
-- Agregar campo category a la tabla de fandoms
ALTER TABLE public.fandoms 
ADD COLUMN category TEXT;
```

### 2. Crear tabla para las categorías de fandoms

```sql
-- Crear tabla para categorías de fandoms
CREATE TABLE IF NOT EXISTS public.fandom_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en la tabla
ALTER TABLE public.fandom_categories ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
-- Todos pueden ver las categorías
CREATE POLICY "Categorías visibles para todos" ON public.fandom_categories
  FOR SELECT USING (true);

-- Solo administradores pueden crear/editar/eliminar categorías
CREATE POLICY "Solo administradores pueden administrar categorías" ON public.fandom_categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Solo administradores pueden actualizar categorías" ON public.fandom_categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Solo administradores pueden eliminar categorías" ON public.fandom_categories
  FOR DELETE USING (public.is_admin());
```

### 3. Agregar campo categoría a las solicitudes de fandoms

```sql
-- Agregar campo category a la tabla de solicitudes de fandoms
ALTER TABLE public.fandom_requests 
ADD COLUMN category TEXT;
```

### 4. Insertar categorías iniciales

```sql
-- Insertar categorías iniciales
INSERT INTO public.fandom_categories (name, slug) VALUES
  ('Música', 'música'),
  ('Series', 'series'),
  ('Películas', 'películas'),
  ('Videojuegos', 'videojuegos'),
  ('Libros', 'libros');
```

### 5. Crear índice para mejora de rendimiento en búsquedas por categoría

```sql
-- Crear índice para optimizar búsquedas por categoría
CREATE INDEX idx_fandoms_category ON public.fandoms(category);
```

Las categorías son una parte fundamental del sistema de fandoms, permitiendo a los usuarios filtrar y encontrar comunidades específicas según sus intereses. Al implementar estas categorías en la base de datos, se mejora tanto la experiencia de usuario como la organización del contenido. 

## Actualizaciones para el sistema de mensajes y notificaciones

Para mejorar el sistema de mensajes directos y notificaciones, se han añadido los siguientes elementos a la configuración de Supabase:

### 1. Campo slug para la tabla fandoms

Este campo es necesario para crear URLs amigables hacia las páginas de fandoms y para construir los enlaces en las notificaciones.

```sql
-- Añadir columna slug a la tabla fandoms
ALTER TABLE public.fandoms
ADD COLUMN slug TEXT UNIQUE;

-- Crear un índice en el slug para optimizar búsquedas
CREATE INDEX idx_fandoms_slug ON public.fandoms(slug);

-- NOTA: Es necesario actualizar los fandoms existentes para asignarles un slug
-- Ejemplo: UPDATE public.fandoms SET slug = 'bts' WHERE name = 'BTS';
```

### 2. Trigger para notificaciones de mensajes directos

Crea automáticamente una notificación cuando un usuario recibe un mensaje directo:

```sql
-- Función para crear notificación de nuevo mensaje
CREATE OR REPLACE FUNCTION public.create_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_username TEXT;
BEGIN
  -- Obtener username del remitente para el contenido de la notificación
  SELECT username INTO sender_username FROM public.profiles WHERE id = NEW.sender_id;

  -- Insertar notificación para el destinatario
  INSERT INTO public.notifications (
    user_id, type, content, actor_id, link
  )
  VALUES (
    NEW.recipient_id,
    'system',
    'Has recibido un nuevo mensaje de @' || sender_username,
    NEW.sender_id,
    '/mensajes'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para ejecutar la función después de insertar un mensaje
CREATE TRIGGER new_message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE PROCEDURE public.create_new_message_notification();
```

### 3. Triggers para notificaciones de votos positivos (upvotes)

Crean automáticamente notificaciones cuando un usuario recibe un voto positivo en una publicación o comentario:

```sql
-- Función para crear notificación de upvote en post
CREATE OR REPLACE FUNCTION public.create_post_upvote_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  sender_username TEXT;
BEGIN
  -- Notificar solo en inserción de upvote (1) o cambio de downvote (-1) a upvote (1)
  IF (TG_OP = 'INSERT' AND NEW.vote_type = 1) OR (TG_OP = 'UPDATE' AND OLD.vote_type = -1 AND NEW.vote_type = 1) THEN
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    SELECT username INTO sender_username FROM public.profiles WHERE id = NEW.user_id;

    -- No notificar al autor si se vota a sí mismo
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (
        user_id, type, content, actor_id, post_id, link
      )
      VALUES (
        post_author_id,
        'upvote',
        '@' || sender_username || ' ha votado positivamente tu publicación.',
        NEW.user_id,
        NEW.post_id,
        '/fandoms/' || (SELECT f.slug FROM public.fandoms f JOIN public.posts p ON f.id = p.fandom_id WHERE p.id = NEW.post_id) || '/posts/' || NEW.post_id
      );
    END IF;
  END IF;
  RETURN NULL; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para notificación de upvote en post
CREATE TRIGGER post_upvote_notification_trigger
AFTER INSERT OR UPDATE ON public.post_votes
FOR EACH ROW EXECUTE PROCEDURE public.create_post_upvote_notification();

-- Función para crear notificación de upvote en comentario
CREATE OR REPLACE FUNCTION public.create_comment_upvote_notification()
RETURNS TRIGGER AS $$
DECLARE
  comment_author_id UUID;
  sender_username TEXT;
  related_post_id UUID;
  fandom_slug TEXT;
BEGIN
  -- Notificar solo en inserción de upvote (1) o cambio de downvote (-1) a upvote (1)
  IF (TG_OP = 'INSERT' AND NEW.vote_type = 1) OR (TG_OP = 'UPDATE' AND OLD.vote_type = -1 AND NEW.vote_type = 1) THEN
    SELECT user_id, post_id INTO comment_author_id, related_post_id FROM public.comments WHERE id = NEW.comment_id;
    SELECT username INTO sender_username FROM public.profiles WHERE id = NEW.user_id;

    -- No notificar al autor si se vota a sí mismo
    IF comment_author_id IS NOT NULL AND comment_author_id != NEW.user_id THEN
      -- Obtener slug del fandom para el link
      SELECT f.slug INTO fandom_slug
      FROM public.fandoms f
      JOIN public.posts p ON f.id = p.fandom_id
      WHERE p.id = related_post_id;

      INSERT INTO public.notifications (
        user_id, type, content, actor_id, comment_id, post_id, link
      )
      VALUES (
        comment_author_id,
        'upvote',
        '@' || sender_username || ' ha votado positivamente tu comentario.',
        NEW.user_id,
        NEW.comment_id,
        related_post_id,
        '/fandoms/' || fandom_slug || '/posts/' || related_post_id || '#comment-' || NEW.comment_id
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para notificación de upvote en comentario
CREATE TRIGGER comment_upvote_notification_trigger
AFTER INSERT OR UPDATE ON public.comment_votes
FOR EACH ROW EXECUTE PROCEDURE public.create_comment_upvote_notification();
```

### 4. Vista para lista de conversaciones

Esta vista facilita obtener la lista de conversaciones del usuario actual con los últimos mensajes y el conteo de mensajes no leídos:

```sql
-- Crear vista para obtener la lista de conversaciones del usuario actual
CREATE OR REPLACE VIEW public.conversation_list AS
WITH ranked_messages AS (
  -- Selecciona y numera los mensajes por cada par de usuarios único
  SELECT
    m.id AS message_id,
    m.created_at,
    m.content,
    m.sender_id,
    m.recipient_id,
    m.is_read,
    -- Identifica al otro participante
    CASE
      WHEN m.sender_id = auth.uid() THEN m.recipient_id
      ELSE m.sender_id
    END AS other_participant_id,
    -- Identificador único de la conversación (participantes ordenados)
    CASE
      WHEN m.sender_id < m.recipient_id THEN m.sender_id || '_' || m.recipient_id
      ELSE m.recipient_id || '_' || m.sender_id
    END AS conversation_pair_id,
    -- Rango de mensajes dentro de cada conversación, el más reciente es 1
    ROW_NUMBER() OVER (PARTITION BY CASE WHEN m.sender_id < m.recipient_id THEN m.sender_id || '_' || m.recipient_id ELSE m.recipient_id || '_' || m.sender_id END ORDER BY m.created_at DESC) as rn
  FROM
    public.messages m
  WHERE
    m.sender_id = auth.uid() OR m.recipient_id = auth.uid()
),
latest_messages AS (
  -- Obtiene solo el último mensaje de cada conversación
  SELECT * FROM ranked_messages WHERE rn = 1
),
unread_counts AS (
  -- Cuenta los mensajes no leídos por el usuario actual de cada remitente
  SELECT
    sender_id AS other_participant_id,
    COUNT(*) AS unread_count
  FROM
    public.messages
  WHERE
    recipient_id = auth.uid() AND NOT is_read
  GROUP BY
    sender_id
)
-- Combina la información
SELECT
  lm.conversation_pair_id AS id, -- ID único de la conversación
  lm.other_participant_id AS userId, -- ID del otro usuario
  p.username AS username, -- Username del otro usuario
  p.username AS displayName, -- Usar username o un campo de nombre real si existe en 'profiles'
  p.avatar_url AS avatar, -- Avatar del otro usuario
  lm.content AS lastMessage, -- Contenido del último mensaje
  lm.created_at AS timestamp, -- Fecha del último mensaje
  COALESCE(uc.unread_count, 0) AS unreadCount -- Conteo de no leídos
FROM
  latest_messages lm
JOIN
  public.profiles p ON lm.other_participant_id = p.id -- Une con perfiles para obtener datos del otro usuario
LEFT JOIN
  unread_counts uc ON lm.other_participant_id = uc.other_participant_id; -- Une con conteos de no leídos

-- Permisos para la vista
GRANT SELECT ON public.conversation_list TO authenticated;
```

### 5. Configuración de políticas Realtime para mensajería en tiempo real

Estas políticas permiten a los usuarios recibir actualizaciones en tiempo real sobre nuevos mensajes y notificaciones a través de WebSockets:

```sql
-- Asegurar que las tablas están habilitadas para Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Política Realtime para la tabla 'messages'
CREATE POLICY "Allow realtime listening on messages for participants"
ON public.messages FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (auth.uid() = sender_id OR auth.uid() = recipient_id)
);

-- Política Realtime para la tabla 'notifications'
CREATE POLICY "Allow realtime listening on notifications for target user"
ON public.notifications FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  auth.uid() = user_id
);
```

### Integración con frontend

Para integrar estas funcionalidades con el frontend, será necesario:

1. Reemplazar los datos estáticos con llamadas a Supabase usando la librería cliente.
2. Implementar las funciones para enviar mensajes y marcar notificaciones como leídas.
3. Configurar suscripciones de Supabase Realtime para recibir actualizaciones en tiempo real.
4. Implementar la funcionalidad "escribiendo..." utilizando canales personalizados de Realtime.

Ejemplo de código para escuchar nuevos mensajes y notificaciones con Supabase Realtime:

```typescript
// En un useEffect del componente principal
useEffect(() => {
  // Suscripción a nuevos mensajes
  const messagesSubscription = supabase
    .channel('messages-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`,
      },
      (payload) => {
        // Actualizar UI con nuevo mensaje
        console.log('Nuevo mensaje recibido', payload);
        // Actualizar conversaciones y/o mensajes de la conversación actual
      }
    )
    .subscribe();

  // Suscripción a nuevas notificaciones
  const notificationsSubscription = supabase
    .channel('notifications-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        // Actualizar UI con nueva notificación
        console.log('Nueva notificación recibida', payload);
        // Actualizar contador y lista de notificaciones
      }
    )
    .subscribe();

  // Limpiar suscripciones al desmontar
  return () => {
    supabase.removeChannel(messagesSubscription);
    supabase.removeChannel(notificationsSubscription);
  };
}, [user.id, supabase]);
``` 

## Actualizaciones de seguridad y optimización

Las siguientes correcciones y mejoras fueron aplicadas para resolver advertencias de seguridad y optimizar el rendimiento de la base de datos.

### 1. Corrección de vista conversation_list (SECURITY INVOKER)

La vista `conversation_list` fue redefinida para usar explícitamente `SECURITY INVOKER` en lugar de `SECURITY DEFINER`:

```sql
-- Eliminar la vista existente para una recreación limpia
DROP VIEW IF EXISTS public.conversation_list;

-- Recrear la vista especificando SECURITY INVOKER explícitamente
CREATE OR REPLACE VIEW public.conversation_list
WITH (security_invoker = true) -- Asegura explícitamente que use los permisos del invocador
AS
WITH ranked_messages AS (
  SELECT
    m.id AS message_id,
    m.created_at,
    m.content,
    m.sender_id,
    m.recipient_id,
    m.is_read,
    CASE
      WHEN m.sender_id = auth.uid() THEN m.recipient_id
      ELSE m.sender_id
    END AS other_participant_id,
    CASE
      WHEN m.sender_id < m.recipient_id THEN m.sender_id || '_' || m.recipient_id
      ELSE m.recipient_id || '_' || m.sender_id
    END AS conversation_pair_id,
    ROW_NUMBER() OVER (PARTITION BY CASE WHEN m.sender_id < m.recipient_id THEN m.sender_id || '_' || m.recipient_id ELSE m.recipient_id || '_' || m.sender_id END ORDER BY m.created_at DESC) as rn
  FROM
    public.messages m
  WHERE
    -- Filtro principal para asegurar que el usuario actual participa
    (m.sender_id = auth.uid() OR m.recipient_id = auth.uid()) AND
    -- Segunda capa de seguridad: Asegurar que la política RLS de la tabla 'messages' se evalúe
    (SELECT TRUE FROM public.messages WHERE id = m.id)
),
latest_messages AS (
  SELECT * FROM ranked_messages WHERE rn = 1
),
unread_counts AS (
  SELECT
    sender_id AS other_participant_id,
    COUNT(*) AS unread_count
  FROM
    public.messages m
  WHERE
    recipient_id = auth.uid() AND NOT is_read AND
    -- Segunda capa de seguridad: Asegurar que la política RLS de la tabla 'messages' se evalúe
    (SELECT TRUE FROM public.messages WHERE id = m.id)
  GROUP BY
    sender_id
)
-- Combina la información
SELECT
  lm.conversation_pair_id AS id,
  lm.other_participant_id AS userId,
  p.username AS username,
  p.username AS displayName,
  p.avatar_url AS avatar,
  lm.content AS lastMessage,
  lm.created_at AS timestamp,
  COALESCE(uc.unread_count, 0) AS unreadCount
FROM
  latest_messages lm
JOIN
  -- Aseguramos que solo se puedan ver perfiles visibles según RLS de profiles
  public.profiles p ON lm.other_participant_id = p.id AND (SELECT TRUE FROM public.profiles WHERE id = p.id)
LEFT JOIN
  unread_counts uc ON lm.other_participant_id = uc.other_participant_id;

-- Otorgar permisos necesarios
GRANT SELECT ON public.conversation_list TO authenticated;
```

Nota: El uso de `SECURITY INVOKER` en vistas es generalmente inseguro cuando se utiliza Row Level Security (RLS), ya que ejecuta todas las consultas con los permisos del usuario que llama.

### 2. Corrección del search_path en funciones

Todas las funciones definidas deben tener un `search_path` explícito para evitar problemas de seguridad relacionados con la búsqueda de objetos. Se corrigieron las siguientes funciones:

#### 2.1. Función get_paginated_posts

```sql
CREATE OR REPLACE FUNCTION public.get_paginated_posts(
  p_fandom_id UUID DEFAULT NULL,
  p_last_cursor BIGINT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  user_id UUID,
  fandom_id UUID,
  upvotes INTEGER,
  downvotes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  slug TEXT,
  url TEXT,
  cursor_id BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.content, p.user_id, p.fandom_id,
    p.upvotes, p.downvotes, p.created_at, p.updated_at,
    p.slug, p.url, p.cursor_id
  FROM
    public.posts p
  WHERE
    (p_fandom_id IS NULL OR p.fandom_id = p_fandom_id) AND
    (p_last_cursor IS NULL OR p.cursor_id < p_last_cursor)
  ORDER BY
    p.cursor_id DESC
  LIMIT
    p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;
```

#### 2.2. Función get_paginated_comments

```sql
CREATE OR REPLACE FUNCTION public.get_paginated_comments(
  p_post_id UUID,
  p_last_created_at TIMESTAMPTZ DEFAULT NULL,
  p_last_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  user_id UUID,
  post_id UUID,
  parent_comment_id UUID,
  upvotes INTEGER,
  downvotes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.content, c.user_id, c.post_id, c.parent_comment_id,
    c.upvotes, c.downvotes, c.created_at, c.updated_at
  FROM
    public.comments c
  WHERE
    c.post_id = p_post_id AND
    (
      p_last_created_at IS NULL OR
      (c.created_at < p_last_created_at) OR
      (c.created_at = p_last_created_at AND c.id < p_last_id)
    )
  ORDER BY
    c.created_at DESC, c.id DESC
  LIMIT
    p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;
```

#### 2.3. Función generate_post_slug

```sql
CREATE OR REPLACE FUNCTION public.generate_post_slug()
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

  -- Si el slug base queda vacío después de la limpieza, usar un valor predeterminado
  IF base_slug = '' THEN
     base_slug := coalesce(NEW.id::text, 'post'); 
  END IF;

  -- Asignar el slug inicial
  final_slug := base_slug;

  -- Verificar si el slug ya existe
  WHILE EXISTS(SELECT 1 FROM public.posts WHERE slug = final_slug AND id != NEW.id) LOOP
    -- Si existe, añadir contador
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  -- Asignar el slug generado
  NEW.slug := final_slug;

  -- Construir la URL completa
  SELECT f.slug INTO fandom_record_slug FROM public.fandoms f WHERE f.id = NEW.fandom_id;
  
  -- Verificar si se encontró el slug del fandom
  IF fandom_record_slug IS NULL THEN
    NEW.url := NULL; -- O asignar una URL alternativa sin fandom
  ELSE
    NEW.url := '/fandoms/' || fandom_record_slug || '/posts/' || final_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = public;

-- Asegurar que el trigger use la versión correcta de la función
DROP TRIGGER IF EXISTS set_post_slug ON public.posts;
CREATE TRIGGER set_post_slug
BEFORE INSERT OR UPDATE OF title ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.generate_post_slug();
```

### 3. Índices optimizados para búsquedas frecuentes

```sql
-- Índices para tabla de posts
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_fandom_id ON public.posts(fandom_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_fandom_date ON public.posts(fandom_id, created_at DESC);
CREATE INDEX idx_posts_popularity ON public.posts((upvotes - downvotes) DESC);

-- Índices para tabla de comentarios
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_post_date ON public.comments(post_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- Índice de texto completo para búsquedas de contenido
CREATE INDEX idx_posts_content_search ON public.posts USING gin(to_tsvector('spanish', title || ' ' || content));
CREATE INDEX idx_comments_content_search ON public.comments USING gin(to_tsvector('spanish', content));

-- Índices para mensajes
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id, created_at DESC);

-- Índices para notificaciones
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
```

### 4. Notas importantes para desarrolladores

1. **Uso de SECURITY INVOKER vs SECURITY DEFINER**:
   - SECURITY INVOKER (predeterminado): Las consultas se ejecutan con los permisos del usuario que llama. Esto es más seguro para respetar las políticas RLS.
   - SECURITY DEFINER: Las consultas se ejecutan con los permisos del usuario que definió la función/vista. Usar solo cuando sea absolutamente necesario.

2. **Siempre especificar search_path en funciones**:
   - `SET search_path = public` evita posibles ataques de confusión cuando los usuarios modifican su search_path.

3. **Consideraciones de rendimiento**:
   - Usar `STABLE` para funciones que no modifican la base de datos.
   - Usar `VOLATILE` para funciones que tienen efectos secundarios.
   - Añadir índices adecuados para queries frecuentes.

4. **Paginación eficiente**:
   - La paginación basada en cursores (`cursor_id`) es más eficiente que offset/limit para conjuntos de datos grandes.
   - Asegurarse de que los campos usados para paginación tengan índices.

5. **Slugs y URLs amigables**:
   - Siempre validar y limpiar los inputs para crear slugs.
   - Manejar casos donde los slugs podrían quedar vacíos o duplicados.
   - Verificar la existencia de referencias a otras tablas (como fandom_id) antes de construir URLs. 