# Pasos para implementar la funcionalidad completa de perfil

## 1. Ejecutar script SQL de seguidores

Ejecutar el archivo `sql/user_follows.sql` en la consola SQL de Supabase:

```sql
-- Este script está ya en el archivo sql/user_follows.sql
```

## 2. Verificar dependencias

Asegurarse de que todas las dependencias necesarias estén instaladas:

```bash
npm install date-fns
```

## 3. Crear un bucket para almacenamiento de imágenes

Si no existe ya, crear un bucket llamado `posts.media` en Supabase Storage:

1. Ir al panel de Storage en Supabase
2. Crear un nuevo bucket llamado "posts.media"
3. Definir las políticas de acceso:
   - Permitir SELECT (lectura) a todos los usuarios
   - Permitir INSERT (subida) solo a usuarios autenticados
   - Permitir UPDATE/DELETE solo al propietario del archivo

## 4. Probar el componente de perfil

Verificar que el perfil puede:
- Cargar datos del usuario actual
- Mostrar fandoms a los que pertenece
- Mostrar contadores de seguidores/seguidos
- Publicar posts con imágenes y URLs
- Navegar entre las pestañas de contenido

## 5. Solución de problemas comunes

- **Problema**: No se cargan los datos del perfil
  **Solución**: Verificar la sesión de usuario y los permisos RLS

- **Problema**: Error al subir imágenes
  **Solución**: Verificar permisos del bucket y tamaño máximo de archivos

- **Problema**: No aparecen los contadores de seguidores/seguidos
  **Solución**: Verificar que las funciones SQL `get_follower_count` y `get_following_count` existen y están correctamente definidas

## 6. Implementación de funcionalidad de seguimiento

Para permitir que los usuarios sigan/dejen de seguir a otros, añadir botones en los perfiles de otros usuarios con estas funciones:

```typescript
// Seguir a un usuario
const followUser = async (followedId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .insert([
      { follower_id: currentUserId, followed_id: followedId }
    ]);
  
  if (error) {
    console.error('Error al seguir usuario:', error);
    return;
  }
  
  // Actualizar UI
};

// Dejar de seguir a un usuario
const unfollowUser = async (followedId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .delete()
    .match({ follower_id: currentUserId, followed_id: followedId });
  
  if (error) {
    console.error('Error al dejar de seguir usuario:', error);
    return;
  }
  
  // Actualizar UI
};

// Verificar si el usuario actual sigue a otro
const checkIfFollowing = async (followedId: string) => {
  const { data, error } = await supabase
    .rpc('is_following', { 
      follower: currentUserId, 
      followed: followedId 
    });
  
  if (error) {
    console.error('Error al verificar si sigue:', error);
    return false;
  }
  
  return data || false;
};
``` 