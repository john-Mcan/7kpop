# Actualizaciones y mejoras del sistema Supabase para fanverse

## 1. Categorías de fandoms

```sql
-- Agregar campo category a la tabla de fandoms
ALTER TABLE public.fandoms 
ADD COLUMN category TEXT;

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

-- Crear políticas RLS para categorías
CREATE POLICY "Categorías visibles para todos" ON public.fandom_categories
  FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden administrar categorías" ON public.fandom_categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Solo administradores pueden actualizar categorías" ON public.fandom_categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Solo administradores pueden eliminar categorías" ON public.fandom_categories
  FOR DELETE USING (public.is_admin());

-- Agregar campo category a las solicitudes de fandoms
ALTER TABLE public.fandom_requests 
ADD COLUMN category TEXT;

-- Insertar categorías iniciales
INSERT INTO public.fandom_categories (name, slug) VALUES
  ('Música', 'música'),
  ('Series', 'series'),
  ('Películas', 'películas'),
  ('Videojuegos', 'videojuegos'),
  ('Libros', 'libros');

-- Crear índice para optimizar búsquedas por categoría
CREATE INDEX idx_fandoms_category ON public.fandoms(category);
```

## 2. Mejoras para URLs amigables y notificaciones

```sql
-- Añadir columna slug a la tabla fandoms
ALTER TABLE public.fandoms
ADD COLUMN slug TEXT UNIQUE;

-- Crear un índice en el slug para optimizar búsquedas
CREATE INDEX idx_fandoms_slug ON public.fandoms(slug);
```

## 3. Triggers para notificaciones automáticas

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

## 4. Vista para conversaciones

```sql
-- Crear vista para obtener la lista de conversaciones del usuario actual
CREATE OR REPLACE VIEW public.conversation_list
WITH (security_invoker = true)
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
    (m.sender_id = auth.uid() OR m.recipient_id = auth.uid()) AND
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
    (SELECT TRUE FROM public.messages WHERE id = m.id)
  GROUP BY
    sender_id
)
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
  public.profiles p ON lm.other_participant_id = p.id AND (SELECT TRUE FROM public.profiles WHERE id = p.id)
LEFT JOIN
  unread_counts uc ON lm.other_participant_id = uc.other_participant_id;

-- Otorgar permisos necesarios
GRANT SELECT ON public.conversation_list TO authenticated;
```

## 5. Configuración para tiempo real (Realtime)

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

## 6. Funciones con seguridad mejorada

```sql
-- Función paginación de posts
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

-- Función paginación de comentarios
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

## 7. Índices optimizados

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

## 8. Script para verificar y actualizar tabla de reportes

```sql
-- Verificar y modificar la tabla reports si es necesario
DO $$
BEGIN
    -- Verificar si la tabla reports existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports') THEN
        -- La tabla existe, verificar/añadir columnas si es necesario
        
        -- Verificar si la columna reporter_id existe
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.reports'::regclass 
                      AND attname = 'reporter_id' 
                      AND NOT attisdropped) THEN
            ALTER TABLE public.reports 
            ADD COLUMN reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL;
        END IF;
        
        -- Verificar fandom_id
        IF NOT EXISTS (SELECT FROM pg_attribute 
                      WHERE attrelid = 'public.reports'::regclass 
                      AND attname = 'fandom_id' 
                      AND NOT attisdropped) THEN
            ALTER TABLE public.reports 
            ADD COLUMN fandom_id UUID REFERENCES public.fandoms(id) ON DELETE CASCADE;
        END IF;
        
    ELSE
        -- La tabla no existe, crearla completa
        CREATE TABLE public.reports (
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
        
        -- Habilitar RLS
        ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Verificar y crear políticas solo si no existen
DO $$
BEGIN
    -- Verificar política para insertar reportes
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'reports' 
        AND policyname = 'Usuarios pueden reportar contenido'
    ) THEN
        CREATE POLICY "Usuarios pueden reportar contenido" ON public.reports
          FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
    
    -- Verificar política para moderadores
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'reports' 
        AND policyname = 'Moderadores pueden ver reportes de su fandom'
    ) THEN
        CREATE POLICY "Moderadores pueden ver reportes de su fandom" ON public.reports
          FOR SELECT USING (public.is_fandom_moderator(fandom_id));
    END IF;
    
    -- Verificar política para administradores
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'reports' 
        AND policyname = 'Administradores pueden ver todos los reportes'
    ) THEN
        CREATE POLICY "Administradores pueden ver todos los reportes" ON public.reports
          FOR SELECT USING (public.is_admin());
    END IF;
    
    -- Verificar políticas para actualizar reportes
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'reports' 
        AND policyname = 'Moderadores pueden procesar reportes de su fandom'
    ) THEN
        CREATE POLICY "Moderadores pueden procesar reportes de su fandom" ON public.reports
          FOR UPDATE USING (public.is_fandom_moderator(fandom_id));
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'reports' 
        AND policyname = 'Administradores pueden procesar cualquier reporte'
    ) THEN
        CREATE POLICY "Administradores pueden procesar cualquier reporte" ON public.reports
          FOR UPDATE USING (public.is_admin());
    END IF;
END
$$;
```

## Notas de seguridad

1. **SECURITY INVOKER vs SECURITY DEFINER**:
   - SECURITY INVOKER: Ejecuta con permisos del usuario que llama. Respeta políticas RLS.
   - SECURITY DEFINER: Ejecuta con permisos del creador. Usar solo cuando sea necesario.

2. **Protección del search_path**:
   - Usar `SET search_path = public` para evitar ataques de confusión.

3. **Rendimiento y optimización**:
   - Funciones `STABLE`: No modifican la base de datos.
   - Funciones `VOLATILE`: Tienen efectos secundarios.
   - Índices optimizados para mejorar rendimiento.

4. **Paginación eficiente**:
   - Paginación basada en cursores vs. offset/limit.
   - Índices para campos de paginación.

5. **Gestión segura de slugs**:
   - Validar y limpiar inputs para crear slugs.
   - Manejar casos de slugs vacíos o duplicados.
   - Verificar existencia de referencias antes de construir URLs. 