# fanverse - Comunidad para fans en América Latina

fanverse es una plataforma moderna y dinámica diseñada para conectar a fans de diferentes comunidades en América Latina. Este proyecto está inspirado en la interfaz de OnlyFans con un diseño limpio al estilo Apple, adaptado para celebrar la diversidad de la cultura de fandoms.

## Características principales

- **Sistema de usuarios**: Registro, inicio de sesión y perfiles personalizados
- **Estructura por fandoms**: Comunidades dedicadas a diferentes grupos, series, películas y más
- **Sistema de publicaciones**: Creación de posts con texto, imágenes y videos
- **Comentarios y votos**: Interacciones con el contenido y otros usuarios
- **Sistema de mensajes y notificaciones**: Comunicación entre usuarios y alertas sobre actividad relevante
- **Diseño responsivo**: Experiencia optimizada para dispositivos móviles y de escritorio

## Tecnologías utilizadas

- **Next.js**: Framework de React para renderizado del lado del servidor
- **Tailwind CSS**: Framework de CSS para diseño rápido y consistente
- **ShadCN UI**: Biblioteca de componentes accesibles y modernos
- **Supabase**: Base de datos y autenticación
- **Zustand/Context API**: Manejo de estado

## Estado actual del proyecto

El proyecto tiene implementado:

- **Estructura base de Next.js**: Configuración de rutas y layouts
- **Componentes principales**:
  - Sistema de navegación (sidebar y móvil)
  - Feed de publicaciones con datos de ejemplo
  - Trending sidebar con tendencias y recomendaciones
  - Componentes UI personalizados (FandomAvatar, FandomBanner)
- **Rutas implementadas**:
  - Página principal (Home)
  - Explorar (estructura inicial)
  - Perfil (estructura inicial)
  - Mensajes y notificaciones
  - Fandoms (listado de comunidades disponibles)
  - Mis Fandoms (fandoms seguidos y recomendados)
  - Detalle de Fandom (perfil completo con publicaciones)
  - Vista individual de post (con comentarios, sistema para compartir y reportar)
- **Sistema de Fandoms**:
  - Exploración de comunidades
  - Estructura de datos para fandoms
  - Categorización de fandoms
  - Perfil detallado de cada fandom
  - Vista de publicaciones específicas de un fandom
  - Componente mejorado para crear publicaciones
- **Sistema de Posts**:
  - Feed de posts con vista de tarjeta
  - Vista individual de post completo
  - Sistema de votación (upvote/downvote)
  - Funcionalidad para compartir en redes sociales
  - Sistema para reportar contenido inapropiado
- **Sistema de Comentarios**:
  - Visualización de comentarios en posts
  - Respuestas anidadas a comentarios
  - Votación en comentarios
- **Sistema de Mensajes y Notificaciones**:
  - Interfaz para visualizar conversaciones
  - Sistema de notificaciones
  - Indicadores de mensajes no leídos
- **Diseño responsivo**: Adaptación para móviles y escritorio

## Cómo ejecutar localmente

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/fanverse.git
   cd fanverse
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del proyecto

```
fanverse/
├── src/
│   ├── app/                 # Rutas y páginas (App Router de Next.js)
│   │   ├── page.tsx         # Página principal
│   │   ├── layout.tsx       # Layout principal
│   │   ├── explorar/        # Ruta de exploración
│   │   ├── perfil/          # Ruta de perfil de usuario
│   │   ├── mensajes/        # Sistema de mensajes y notificaciones
│   │   ├── fandoms/         # Listado de fandoms disponibles
│   │   │   └── [id]/        # Detalle de fandom específico
│   │   └── mis-fandoms/     # Fandoms seguidos por el usuario
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes de UI básicos
│   │   │   ├── share-post.tsx    # Componente para compartir posts
│   │   │   ├── report-post.tsx   # Componente para reportar posts
│   │   │   └── comments.tsx      # Componente de comentarios
│   │   ├── navigation-sidebar.tsx  # Navegación lateral
│   │   ├── mobile-nav.tsx   # Navegación móvil
│   │   ├── post-feed.tsx    # Feed de publicaciones
│   │   ├── single-post-view.tsx  # Vista individual de posts
│   │   └── trending-sidebar.tsx    # Sidebar de tendencias
│   ├── lib/                 # Utilidades y funciones auxiliares
│   └── styles/              # Estilos globales
└── ...                      # Archivos de configuración
```

## Próximos pasos

1. ✅ Implementación de Supabase para autenticación y base de datos
2. ✅ Crear modelos de datos y esquemas para la base de datos
3. ⏳ Refactorizar componentes para trabajar con interfaces de datos reales
4. ✅ Completar formularios de registro e inicio de sesión
5. ⏳ Implementar carga y almacenamiento de imágenes
6. ✅ Desarrollo de funcionalidades de interacción (likes, comentarios, compartir)
7. ⏳ Completar integración de datos reales en páginas existentes
8. ⏳ Implementar validación de datos y manejo de errores robustos para formularios y operaciones críticas
9. ✅ Implementar sistema de moderación de contenido
10. ⏳ Implementar funcionalidad de búsqueda para encontrar contenido, fandoms, usuarios y publicaciones
11. ⏳ Desarrollar sistema de hashtags para categorización de contenido y mejora de descubrimiento
12. ⏳ Optimización de rendimiento y SEO
13. ✅ Configuración de seguridad y privacidad
14. ⏳ Implementar accesibilidad (WCAG)
15. ⏳ Crear documentación legal
16. ⏳ Despliegue en plataforma de hosting (Vercel)
17. ⏳ Configuración de dominio personalizado
18. ⏳ Implementar pruebas automatizadas
19. ⏳ Crear documentación para desarrolladores
20. ⏳ Implementación de analíticas para seguimiento de métricas
21. ⏳ Pruebas de usabilidad con usuarios reales
22. ⏳ Configuración de sistemas de respaldo y recuperación
23. ⏳ Implementar canal para feedback de usuarios durante fase beta
24. ⏳ Plan de escalabilidad para crecimiento futuro
25. ⏳ Estrategia de monetización (si aplica)
26. ⏳ Preparación para lanzamiento oficial (beta)

### Tareas pendientes inmediatas
1. ✅ Refinar la página de mensajes/notificaciones
2. ⏳ Implementar vista de links de cualquier tipo en crear post de fandoms
3. ✅ Implementar componentes para compartir y reportar posts
4. ✅ Mejorar la jerarquía visual de las tarjetas de posts en el feed
5. ⏳ Conectar los componentes de UI con Supabase
6. ⏳ Implementar sistema de notificaciones en tiempo real
7. ⏳ Implementar obtención de metadatos OG (vista previa) para URLs adjuntas en posts (realizar en backend/servidor al conectar con Supabase)

### Estado de la implementación de Supabase

Ya se ha configurado Supabase como backend para la aplicación, incluyendo:

- **Autenticación**: Sistema completo con registro, inicio de sesión y protección de rutas
- **Base de datos**: Esquema completo con tablas para:
  - Perfiles de usuario con sistema de roles (usuario/admin)
  - Fandoms con categorización y sistema de moderación
  - Publicaciones, comentarios, votos y reacciones
  - Sistema de notificaciones y mensajería
- **Seguridad**: Políticas de Row Level Security (RLS) configuradas para todas las tablas
- **Middlewares**: Configuración para gestión de sesiones y autenticación
- **Sistema de Mensajes**: Vista para lista de conversaciones y triggers para notificaciones de mensajes nuevos
- **Notificaciones**: Triggers para crear notificaciones automáticas de respuestas y votos
- **Optimización**: Índices mejorados para búsquedas y funciones para paginación eficiente
- **Tiempo Real**: Configuración de canales para actualizaciones en tiempo real de mensajes y notificaciones
- **Seguridad Avanzada**: Correcciones en funciones y vistas para asegurar un funcionamiento seguro

Ver archivo `SUPABASE.md` para la documentación completa sobre la configuración de Supabase.

## Cambios recientes

### Última actualización (Mayo 2023)
- Implementación de vista individual de posts con sistema completo de comentarios
- Creación de componentes reutilizables para compartir y reportar posts
- Mejora en la jerarquía visual de las tarjetas de posts en el feed
- Refinamiento de la página de mensajes y notificaciones
- Implementación de interacción completa en posts (compartir, reportar, votar, comentar)
- Corrección del diseño para que todo el post sea clickeable, excepto los enlaces específicos
- Eliminación de botones redundantes en la interfaz de comentarios
- Actualización de la configuración de Supabase con:
  - Sistema de notificaciones en tiempo real
  - Optimización de consultas con índices
  - Mejoras de seguridad en funciones
  - Vista para conversaciones y mensajes
  - Triggers para notificaciones automáticas

### Actualización anterior (Marzo 28, 2023)
- Cambio del branding de 7Kpop a fanverse
- Implementación de base de datos para categorización de fandoms
- Eliminación de la página de votaciones y creación de la página de mensajes/notificaciones
- Actualización del componente de creación de posts en las páginas de detalle de fandoms y de perfil

## Licencia

[MIT](LICENSE) 