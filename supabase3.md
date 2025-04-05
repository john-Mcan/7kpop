# Implementación de sistema de moderación para fanverse

Este documento contiene los scripts SQL necesarios para implementar las características de moderación en la plataforma fanverse.

## 1. Modificaciones a tablas existentes

```sql
-- Añadir estado de moderación a la tabla 'posts'
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending_review', 'approved', 'rejected'));

-- Añadir estado a la tabla 'fandom_members' para permitir restricciones
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fandom_members') THEN
        CREATE TABLE public.fandom_members (
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE NOT NULL,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'muted', 'banned')),
            PRIMARY KEY (user_id, fandom_id)
        );
        ALTER TABLE public.fandom_members ENABLE ROW LEVEL SECURITY;
    ELSE
        ALTER TABLE public.fandom_members
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'muted', 'banned'));
        ALTER TABLE public.fandom_members ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
```

## 2. Nuevas tablas

```sql
-- Tabla para solicitudes de creación de fandoms
CREATE TABLE IF NOT EXISTS public.fandom_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fandom_name TEXT NOT NULL,
    fandom_description TEXT,
    category TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.fandom_requests ENABLE ROW LEVEL SECURITY;

-- Tabla para reportes de usuario a usuario
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
```

## 3. Políticas RLS para moderación

### Políticas para Fandom Requests

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear solicitudes de fandom" ON public.fandom_requests;
DROP POLICY IF EXISTS "Administradores pueden ver y gestionar solicitudes" ON public.fandom_requests;
DROP POLICY IF EXISTS "El creador puede ver su propia solicitud" ON public.fandom_requests;

-- Usuarios autenticados pueden crear solicitudes
CREATE POLICY "Usuarios autenticados pueden crear solicitudes de fandom" ON public.fandom_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- El creador puede ver su propia solicitud pendiente
CREATE POLICY "El creador puede ver su propia solicitud" ON public.fandom_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Administradores pueden ver y gestionar todas las solicitudes
CREATE POLICY "Administradores pueden ver y gestionar solicitudes" ON public.fandom_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### Políticas para Fandom Members

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Miembros pueden ver su propia membresía" ON public.fandom_members;
DROP POLICY IF EXISTS "Todos pueden ver miembros activos de un fandom" ON public.fandom_members;
DROP POLICY IF EXISTS "Moderadores pueden gestionar miembros de su fandom" ON public.fandom_members;
DROP POLICY IF EXISTS "Administradores pueden gestionar todos los miembros" ON public.fandom_members;
DROP POLICY IF EXISTS "Usuarios pueden unirse a fandoms" ON public.fandom_members;
DROP POLICY IF EXISTS "Usuarios pueden abandonar fandoms" ON public.fandom_members;

-- Usuarios pueden unirse a fandoms
CREATE POLICY "Usuarios pueden unirse a fandoms" ON public.fandom_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Miembros pueden ver su propia membresía
CREATE POLICY "Miembros pueden ver su propia membresía" ON public.fandom_members
  FOR SELECT USING (auth.uid() = user_id);

-- Todos pueden ver la lista de miembros ACTIVOS
CREATE POLICY "Todos pueden ver miembros activos de un fandom" ON public.fandom_members
  FOR SELECT USING (status = 'active');

-- Moderadores pueden gestionar miembros de su fandom
CREATE POLICY "Moderadores pueden gestionar miembros de su fandom" ON public.fandom_members
  FOR ALL USING (public.is_fandom_moderator(fandom_id)) WITH CHECK (public.is_fandom_moderator(fandom_id));

-- Administradores pueden gestionar todos los miembros
CREATE POLICY "Administradores pueden gestionar todos los miembros" ON public.fandom_members
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Usuarios pueden abandonar fandoms
CREATE POLICY "Usuarios pueden abandonar fandoms" ON public.fandom_members
  FOR DELETE USING (auth.uid() = user_id);
```

### Políticas para Fandom Moderators

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Administradores pueden gestionar moderadores" ON public.fandom_moderators;
DROP POLICY IF EXISTS "Moderadores y admins pueden ver la lista de moderadores" ON public.fandom_moderators;
DROP POLICY IF EXISTS "select_fandom_moderators" ON public.fandom_moderators;
DROP POLICY IF EXISTS "insert_fandom_moderators" ON public.fandom_moderators;
DROP POLICY IF EXISTS "update_fandom_moderators" ON public.fandom_moderators;
DROP POLICY IF EXISTS "delete_fandom_moderators" ON public.fandom_moderators;

-- Administradores pueden gestionar todos los moderadores
CREATE POLICY "Administradores pueden gestionar moderadores" ON public.fandom_moderators
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Permitir ver quién modera un fandom
CREATE POLICY "Moderadores y admins pueden ver la lista de moderadores" ON public.fandom_moderators
  FOR SELECT USING (public.is_admin() OR public.is_fandom_moderator(fandom_id));
```

### Políticas para User Reports

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Usuarios pueden crear reportes de usuario" ON public.user_reports;
DROP POLICY IF EXISTS "Administradores pueden gestionar reportes de usuario" ON public.user_reports;

-- Usuarios autenticados pueden reportar otros usuarios
CREATE POLICY "Usuarios pueden crear reportes de usuario" ON public.user_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id AND reporter_id <> reported_user_id);

-- Solo administradores pueden gestionar reportes de usuario
CREATE POLICY "Administradores pueden gestionar reportes de usuario" ON public.user_reports
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### Políticas ajustadas para Posts

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Publicaciones visibles para todos" ON public.posts;
DROP POLICY IF EXISTS "Publicaciones aprobadas visibles para todos" ON public.posts;
DROP POLICY IF EXISTS "Autores/Mods/Admins pueden ver posts no aprobados" ON public.posts;
DROP POLICY IF EXISTS "Miembros pueden crear publicaciones en su fandom" ON public.posts;
DROP POLICY IF EXISTS "Miembros activos pueden crear publicaciones" ON public.posts;
DROP POLICY IF EXISTS "Autores pueden actualizar sus publicaciones" ON public.posts;
DROP POLICY IF EXISTS "Moderadores pueden editar publicaciones de su fandom" ON public.posts;
DROP POLICY IF EXISTS "Moderadores/Admins pueden actualizar posts" ON public.posts;
DROP POLICY IF EXISTS "Autores pueden eliminar sus publicaciones" ON public.posts;
DROP POLICY IF EXISTS "Moderadores pueden eliminar publicaciones de su fandom" ON public.posts;
DROP POLICY IF EXISTS "Administradores pueden eliminar cualquier publicación" ON public.posts;
DROP POLICY IF EXISTS "Moderadores/Admins pueden eliminar posts" ON public.posts;

-- Solo publicaciones aprobadas son visibles para todos
CREATE POLICY "Publicaciones aprobadas visibles para todos" ON public.posts
  FOR SELECT USING (moderation_status = 'approved');

-- Autores, moderadores y admins pueden ver posts no aprobados
CREATE POLICY "Autores/Mods/Admins pueden ver posts no aprobados" ON public.posts
  FOR SELECT USING (
    auth.uid() = user_id OR
    public.is_fandom_moderator(fandom_id) OR
    public.is_admin()
  );

-- Solo miembros activos pueden crear publicaciones
CREATE POLICY "Miembros activos pueden crear publicaciones" ON public.posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.fandom_members fm
      WHERE fm.user_id = auth.uid()
        AND fm.fandom_id = posts.fandom_id
        AND fm.status = 'active'
    )
  );

-- Autores pueden actualizar sus posts (si no están rechazados)
CREATE POLICY "Autores pueden actualizar sus posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id AND moderation_status <> 'rejected')
  WITH CHECK (auth.uid() = user_id AND moderation_status <> 'rejected');

-- Moderadores y admins pueden actualizar cualquier post
CREATE POLICY "Moderadores/Admins pueden actualizar posts" ON public.posts
  FOR UPDATE USING (public.is_fandom_moderator(fandom_id) OR public.is_admin())
  WITH CHECK (public.is_fandom_moderator(fandom_id) OR public.is_admin());

-- Autores pueden eliminar sus posts
CREATE POLICY "Autores pueden eliminar sus posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Moderadores y admins pueden eliminar cualquier post
CREATE POLICY "Moderadores/Admins pueden eliminar posts" ON public.posts
  FOR DELETE USING (public.is_fandom_moderator(fandom_id) OR public.is_admin());
```

### Políticas ajustadas para Comments

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Comentarios visibles para todos" ON public.comments;
DROP POLICY IF EXISTS "Usuarios pueden comentar" ON public.comments;
DROP POLICY IF EXISTS "Miembros activos pueden comentar" ON public.comments;
DROP POLICY IF EXISTS "Autores pueden editar sus comentarios" ON public.comments;
DROP POLICY IF EXISTS "Moderadores pueden editar comentarios" ON public.comments;
DROP POLICY IF EXISTS "Autores pueden eliminar sus comentarios" ON public.comments;
DROP POLICY IF EXISTS "Moderadores pueden eliminar comentarios" ON public.comments;
DROP POLICY IF EXISTS "Administradores pueden eliminar cualquier comentario" ON public.comments;
DROP POLICY IF EXISTS "Administradores pueden editar cualquier comentario" ON public.comments;

-- Todos pueden ver los comentarios
CREATE POLICY "Comentarios visibles para todos" ON public.comments
  FOR SELECT USING (true);

-- Solo miembros activos pueden comentar
CREATE POLICY "Miembros activos pueden comentar" ON public.comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.posts p
      JOIN public.fandom_members fm ON p.fandom_id = fm.fandom_id
      WHERE p.id = comments.post_id
        AND fm.user_id = auth.uid()
        AND fm.status = 'active'
    )
  );

-- Autores pueden editar sus comentarios
CREATE POLICY "Autores pueden editar sus comentarios" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Moderadores pueden editar comentarios en su fandom
CREATE POLICY "Moderadores pueden editar comentarios" ON public.comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND public.is_fandom_moderator(p.fandom_id))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND public.is_fandom_moderator(p.fandom_id))
  );

-- Autores pueden eliminar sus comentarios
CREATE POLICY "Autores pueden eliminar sus comentarios" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Moderadores pueden eliminar comentarios en su fandom
CREATE POLICY "Moderadores pueden eliminar comentarios" ON public.comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND public.is_fandom_moderator(p.fandom_id))
  );

-- Administradores pueden eliminar cualquier comentario
CREATE POLICY "Administradores pueden eliminar cualquier comentario" ON public.comments
  FOR DELETE USING (public.is_admin());

-- Administradores pueden editar cualquier comentario
CREATE POLICY "Administradores pueden editar cualquier comentario" ON public.comments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### Políticas para reportes de contenido

```sql
-- Limpieza y recreación
DROP POLICY IF EXISTS "Usuarios pueden reportar contenido" ON public.reports;
DROP POLICY IF EXISTS "Moderadores pueden ver reportes de su fandom" ON public.reports;
DROP POLICY IF EXISTS "Administradores pueden ver todos los reportes" ON public.reports;
DROP POLICY IF EXISTS "Moderadores pueden procesar reportes de su fandom" ON public.reports;
DROP POLICY IF EXISTS "Administradores pueden procesar cualquier reporte" ON public.reports;

-- Usuarios pueden crear reportes
CREATE POLICY "Usuarios pueden reportar contenido" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Moderadores pueden ver reportes de su fandom
CREATE POLICY "Moderadores pueden ver reportes de su fandom" ON public.reports
  FOR SELECT USING (public.is_fandom_moderator(fandom_id));

-- Administradores pueden ver todos los reportes
CREATE POLICY "Administradores pueden ver todos los reportes" ON public.reports
  FOR SELECT USING (public.is_admin());

-- Moderadores pueden procesar reportes de su fandom
CREATE POLICY "Moderadores pueden procesar reportes de su fandom" ON public.reports
  FOR UPDATE USING (public.is_fandom_moderator(fandom_id)) WITH CHECK (public.is_fandom_moderator(fandom_id));

-- Administradores pueden procesar cualquier reporte
CREATE POLICY "Administradores pueden procesar cualquier reporte" ON public.reports
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
```

## 4. Índices para optimización

```sql
-- Índices para posts
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON public.posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_fandom_mod_status ON public.posts(fandom_id, moderation_status);

-- Índices para fandom_members
CREATE INDEX IF NOT EXISTS idx_fandom_members_fandom_status ON public.fandom_members(fandom_id, status);
CREATE INDEX IF NOT EXISTS idx_fandom_members_status ON public.fandom_members(status);

-- Índices para fandom_requests
CREATE INDEX IF NOT EXISTS idx_fandom_requests_status ON public.fandom_requests(status);
CREATE INDEX IF NOT EXISTS idx_fandom_requests_user_id ON public.fandom_requests(user_id);

-- Índices para user_reports
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON public.user_reports(reporter_id);

-- Índices para reports (de contenido)
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_fandom_status ON public.reports(fandom_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_post_id ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment_id ON public.reports(comment_id);

-- Índices para comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id_user_id ON public.comments(post_id, user_id);
```

## 5. Sistema de búsqueda

```sql
-- Tabla para historial de búsquedas de usuarios
CREATE TABLE IF NOT EXISTS public.user_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para optimizar consultas
CREATE INDEX idx_user_searches_user_id ON public.user_searches(user_id);
CREATE INDEX idx_user_searches_created_at ON public.user_searches(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Usuarios pueden ver su historial de búsquedas" ON public.user_searches
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Usuarios pueden crear registros de búsqueda" ON public.user_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Usuarios pueden eliminar su historial" ON public.user_searches
  FOR DELETE USING (auth.uid() = user_id);

  -- Permitir a los usuarios actualizar sus propios registros de historial de búsqueda
CREATE POLICY "Usuarios pueden actualizar su historial" ON public.user_searches
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Función para búsqueda general
CREATE OR REPLACE FUNCTION public.search_content(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  type TEXT,
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  fandom_id UUID,
  fandom_name TEXT,
  slug TEXT,
  rank REAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  (
    -- Posts (Modificado para incluir posts de perfil y usar LEFT JOIN)
    SELECT
      'post' as type,
      p.id,
      p.title,
      p.content,
      p.user_id as author_id,
      pr.username as author_name,
      p.created_at,
      p.fandom_id,
      f.name as fandom_name, -- Será NULL para posts de perfil
      COALESCE(p.slug, p.id::text) as slug, -- Usar ID como fallback si el slug es NULL
      ts_rank(to_tsvector('spanish', p.title || ' ' || p.content), to_tsquery('spanish', search_term)) as rank
    FROM public.posts p
    JOIN public.profiles pr ON p.user_id = pr.id -- Necesitamos el perfil del autor
    LEFT JOIN public.fandoms f ON p.fandom_id = f.id -- <<<< CAMBIADO A LEFT JOIN
    WHERE
      (
        p.fandom_id IS NULL -- Incluir posts de perfil
        OR
        p.moderation_status = 'approved' -- O incluir posts de fandom aprobados
      )
      AND
      to_tsvector('spanish', p.title || ' ' || p.content) @@ to_tsquery('spanish', search_term) -- Condición de búsqueda de texto
    ORDER BY rank DESC
    LIMIT limit_count
  )
  UNION ALL
  (
    -- Usuarios (Sin cambios)
    SELECT
      'user' as type,
      p.id,
      p.username as title,
      p.bio as content,
      p.id as author_id,
      p.username as author_name,
      p.created_at,
      NULL as fandom_id,
      NULL as fandom_name,
      p.username as slug, -- Usar username como 'slug' para perfiles
      ts_rank(to_tsvector('spanish', p.username || ' ' || COALESCE(p.bio, '')), to_tsquery('spanish', search_term)) as rank
    FROM public.profiles p
    WHERE
      to_tsvector('spanish', p.username || ' ' || COALESCE(p.bio, '')) @@ to_tsquery('spanish', search_term)
    ORDER BY rank DESC
    LIMIT limit_count
  )
  UNION ALL
  (
    -- Fandoms (Sin cambios)
    SELECT
      'fandom' as type,
      f.id,
      f.name as title,
      f.description as content,
      f.created_by as author_id,
      pr.username as author_name,
      f.created_at,
      f.id as fandom_id,
      f.name as fandom_name,
      f.slug,
      ts_rank(to_tsvector('spanish', f.name || ' ' || COALESCE(f.description, '')), to_tsquery('spanish', search_term)) as rank
    FROM public.fandoms f
    LEFT JOIN public.profiles pr ON f.created_by = pr.id
    WHERE
      f.status = 'approved' AND
      to_tsvector('spanish', f.name || ' ' || COALESCE(f.description, '')) @@ to_tsquery('spanish', search_term)
    ORDER BY rank DESC
    LIMIT limit_count
  );
END;
$$;

```## Notas de implementación

1. **Flujo de moderación para posts:**
   - Los posts nuevos tienen `moderation_status = 'approved'` por defecto
   - Moderadores/admins pueden cambiar a `pending_review` o `rejected`
   - Solo posts con estado `approved` son visibles públicamente

2. **Gestión de miembros:**
   - Estado posible de miembros: `active`, `muted`, `banned`
   - Miembros `muted` no pueden crear posts ni comentarios
   - Miembros `banned` no aparecen en listas públicas

3. **Coordinación de moderación:**
   - Administradores ven y gestionan TODOS los reportes
   - Moderadores solo ven/gestionan reportes de sus fandoms asignados
   - Reportes usuario-a-usuario solo son manejados por administradores 

-- Tabla para gestionar seguidores/seguidos entre usuarios

CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (follower_id, followed_id)
);

-- Habilitar RLS en la tabla
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabla de seguidores
-- Permitir a cualquiera ver las relaciones de seguimiento
CREATE POLICY "Cualquiera puede ver las relaciones de seguimiento" ON public.user_follows
  FOR SELECT USING (true);

-- Solo permitir a usuarios autenticados seguir a otros
CREATE POLICY "Usuarios autenticados pueden seguir a otros" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Los usuarios solo pueden dejar de seguir si ellos mismos son el seguidor
CREATE POLICY "Usuarios pueden dejar de seguir" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_id ON public.user_follows(followed_id);

-- Función para obtener conteo de seguidores
CREATE OR REPLACE FUNCTION public.get_follower_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_follows
  WHERE followed_id = user_id;
$$;

-- Función para obtener conteo de seguidos
CREATE OR REPLACE FUNCTION public.get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_follows
  WHERE follower_id = user_id;
$$;

-- Función para verificar si un usuario sigue a otro
CREATE OR REPLACE FUNCTION public.is_following(follower UUID, followed UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_follows
    WHERE follower_id = follower AND followed_id = followed
  );
$$; 

