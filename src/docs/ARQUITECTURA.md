# Arquitectura de Server y Client Components en fanverse

Este documento detalla la estrategia de arquitectura para el uso óptimo de Server Components y Client Components en la aplicación fanverse.

## Principios generales

1. **Server Components** se utilizan para:
   - Renderizado de contenido estático
   - Fetching de datos desde el servidor
   - Componentes que no requieren interactividad
   - Reducir el JavaScript enviado al cliente

2. **Client Components** se utilizan para:
   - Gestión de estado local
   - Manejo de eventos de usuario
   - Uso de hooks de React
   - Efectos del lado del cliente
   - Componentes que necesitan acceso al DOM

## Organización de componentes

### Server Components
- Páginas principales (`app/*/page.tsx`)
- Componentes de presentación (`FandomBanner`, `TrendingSidebarServer`)
- Componentes de fetching de datos

### Client Components
- Componentes interactivos (`Button`, `Tabs`, etc.)
- Manejadores de eventos (`HomePostHandler`)
- Componentes con estado local (`PostFeed`, `Comments`)
- Componentes que usan navegación cliente (`NavigationSidebar`)

## Patrones implementados

### 1. Patrón de Cascada

Mantener las páginas como Server Components y dejar que solo los componentes interactivos específicos sean Client Components.

```tsx
// Server Component (page.tsx)
export default function Page() {
  // Fetching de datos en el servidor
  
  return (
    <Layout>
      <StaticContent />
      <ClientComponent /> {/* Solo este nodo necesita interactividad */}
    </Layout>
  );
}
```

### 2. Patrón de Componente Contenedor/Presentación

Separar la lógica interactiva de la presentación:

```tsx
// Server Component (presentación)
export default function ProductPage({ id }) {
  const product = fetchProduct(id);
  
  return (
    <div>
      <ProductInfo product={product} />
      <AddToCartButton productId={id} /> {/* Client Component */}
    </div>
  );
}
```

### 3. Componentes Híbridos con Server Fetching

```tsx
// Server Component
export default async function ProfilePage({ userId }) {
  // Fetching en servidor
  const userData = await fetchUserData(userId);
  
  return <ProfileClient initialData={userData} />;
}

// Client Component
'use client'
export function ProfileClient({ initialData }) {
  // Estado cliente para edición interactiva
  const [data, setData] = useState(initialData);
  // ...
}
```

## Lista de Componentes por Tipo

### Server Components
- `app/page.tsx`
- `app/explorar/page.tsx`
- `app/fandoms/page.tsx`
- `components/trending-sidebar-server.tsx`
- `components/ui/fandom-banner.tsx`

### Client Components
- `components/home-post-handler.tsx`
- `components/post-feed.tsx`
- `components/single-post-view.tsx`
- `components/navigation-sidebar.tsx`
- `components/mobile-nav.tsx`
- `components/ui/button.tsx`
- `components/ui/tabs.tsx`
- `components/ui/share-post.tsx`
- `components/ui/report-post.tsx`
- `components/ui/comments.tsx`

## Beneficios del enfoque

1. **Rendimiento mejorado**: 
   - Menos JavaScript enviado al cliente
   - Mayor velocidad de carga inicial
   - Streaming de contenido

2. **SEO optimizado**:
   - Contenido renderizado en servidor
   - Metadatos disponibles en la primera carga
   - Mejor indexación por motores de búsqueda

3. **Mantenibilidad**:
   - Separación clara de responsabilidades
   - Código más predecible
   - Mejor escalabilidad

## Consideraciones adicionales

- Los componentes interactivos deben marcarse con `'use client'` al principio del archivo
- Limitar la cantidad de datos pasados entre Server y Client Components
- Usar React Suspense para manejar estados de carga
- Priorizar el fetching en el servidor excepto para datos que cambien frecuentemente
- Implementar Streaming para mejorar la experiencia de usuario 