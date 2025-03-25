# 7Kpop - Comunidad para fans de Kpop en América Latina

7Kpop es una plataforma moderna y dinámica diseñada para conectar a fans de Kpop en América Latina. Este proyecto está inspirado en la interfaz de OnlyFans con un diseño limpio al estilo Apple, adaptado con los colores y la energía de la cultura Kpop.

## Características principales

- **Sistema de usuarios**: Registro, inicio de sesión y perfiles personalizados
- **Estructura por fandoms**: Comunidades dedicadas a diferentes grupos de Kpop
- **Sistema de publicaciones**: Creación de posts con texto, imágenes y videos
- **Comentarios y votos**: Interacciones con el contenido y otros usuarios
- **Encuestas semanales/mensuales**: Votaciones para elegir grupos y canciones favoritas
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
  - Votaciones (estructura inicial)
  - Fandoms (listado de comunidades disponibles)
  - Mis Fandoms (fandoms seguidos y recomendados)
  - Detalle de Fandom (perfil completo con publicaciones)
- **Sistema de Fandoms**:
  - Exploración de comunidades
  - Estructura de datos para fandoms
  - Perfil detallado de cada fandom
  - Vista de publicaciones específicas de un fandom
- **Diseño responsivo**: Adaptación para móviles y escritorio

## Cómo ejecutar localmente

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/7kpop.git
   cd 7kpop
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
7kpop/
├── src/
│   ├── app/                 # Rutas y páginas (App Router de Next.js)
│   │   ├── page.tsx         # Página principal
│   │   ├── layout.tsx       # Layout principal
│   │   ├── explorar/        # Ruta de exploración
│   │   ├── perfil/          # Ruta de perfil de usuario
│   │   ├── votaciones/      # Ruta de votaciones
│   │   ├── fandoms/         # Listado de fandoms disponibles
│   │   │   └── [id]/        # Detalle de fandom específico
│   │   └── mis-fandoms/     # Fandoms seguidos por el usuario
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes de UI básicos
│   │   ├── navigation-sidebar.tsx  # Navegación lateral
│   │   ├── mobile-nav.tsx   # Navegación móvil
│   │   ├── post-feed.tsx    # Feed de publicaciones
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
6. ⏳ Desarrollo de funcionalidades de interacción (likes, comentarios, compartir)
7. ⏳ Completar integración de datos reales en páginas existentes
8. ⏳ Implementar validación de datos y manejo de errores robustos para formularios y operaciones críticas
9. ✅ Implementar sistema de moderación de contenido
10. ⏳ Implementar funcionalidad de búsqueda para encontrar contenido, fandoms, usuarios y publicaciones
11. ⏳ Desarrollar sistema de hashtags para categorización de contenido y mejora de descubrimiento
12. ⏳ Optimización de rendimiento y SEO
13. ✅ Configuración de seguridad y privacidad
    - Autenticación segura
    - Protección contra ataques comunes
    - Encriptación de datos sensibles
14. ⏳ Implementar accesibilidad (WCAG)
15. ⏳ Crear documentación legal
    - Términos y condiciones
    - Política de privacidad
    - Política de cookies
16. ⏳ Despliegue en plataforma de hosting (Vercel)
17. ⏳ Configuración de dominio personalizado
18. ⏳ Implementar pruebas automatizadas (unitarias, integración y end-to-end)
19. ⏳ Crear documentación para desarrolladores
20. ⏳ Implementación de analíticas para seguimiento de métricas
21. ⏳ Pruebas de usabilidad con usuarios reales
22. ⏳ Configuración de sistemas de respaldo y recuperación
23. ⏳ Implementar canal para feedback de usuarios durante fase beta
24. ⏳ Plan de escalabilidad para crecimiento futuro
25. ⏳ Estrategia de monetización (si aplica)
26. ⏳ Preparación para lanzamiento oficial (beta)

### Estado de la implementación de Supabase

Ya se ha configurado Supabase como backend para la aplicación, incluyendo:

- **Autenticación**: Sistema completo con registro, inicio de sesión y protección de rutas
- **Base de datos**: Esquema completo con tablas para:
  - Perfiles de usuario con sistema de roles (usuario/admin)
  - Fandoms y sistema de moderación
  - Publicaciones, comentarios, votos y reacciones
  - Sistema de notificaciones y mensajería
  - Votaciones y encuestas
- **Seguridad**: Políticas de Row Level Security (RLS) configuradas para todas las tablas
- **Middlewares**: Configuración para gestión de sesiones y autenticación

Ver archivo `SUPABASE.md` para la documentación completa sobre la configuración de Supabase.

## Pendiente para próximas fases

El próximo paso principal es la integración de los componentes existentes con Supabase para reemplazar los datos estáticos por datos reales de la base de datos, implementando las operaciones CRUD necesarias.

## Licencia

[MIT](LICENSE) 