/**
 * Datos de los fandoms disponibles en la aplicación.
 * Esta estructura simula la que tendríamos con datos reales.
 */
export const fandomsData = [
  { id: 1, name: "Marvel", slug: "marvel", category: "películas" },
  { id: 2, name: "Taylor Swift", slug: "taylor-swift", category: "música" },
  { id: 3, name: "Anime", slug: "anime", category: "series" },
  { id: 4, name: "Star Wars", slug: "star-wars", category: "películas" }, 
  { id: 5, name: "The Witcher", slug: "the-witcher", category: "videojuegos" },
  { id: 6, name: "Harry Potter", slug: "harry-potter", category: "libros" },
  { id: 7, name: "Game of Thrones", slug: "game-of-thrones", category: "series" },
  { id: 8, name: "FIFA", slug: "fifa", category: "videojuegos" },
  { id: 9, name: "Shakira", slug: "shakira", category: "música" },
  { id: 10, name: "Breaking Bad", slug: "breaking-bad", category: "series" }
];

/**
 * Categorías disponibles para clasificar los fandoms
 */
export const fandomCategories = [
  { id: 1, name: "Todos", slug: "todos" },
  { id: 2, name: "Música", slug: "música" },
  { id: 3, name: "Series", slug: "series" },
  { id: 4, name: "Películas", slug: "películas" },
  { id: 5, name: "Videojuegos", slug: "videojuegos" },
  { id: 6, name: "Libros", slug: "libros" }
];

/**
 * Busca un fandom por su slug
 * @param slug Slug del fandom
 * @returns Información del fandom o null si no se encuentra
 */
export function getFandomBySlug(slug: string) {
  const normalizedSlug = slug.toLowerCase();
  return fandomsData.find(f => f.slug === normalizedSlug) || null;
}

/**
 * Busca un fandom por su ID
 * @param id ID del fandom
 * @returns Información del fandom o null si no se encuentra
 */
export function getFandomById(id: number) {
  return fandomsData.find(f => f.id === id) || null;
}

/**
 * Busca un fandom por su nombre
 * @param name Nombre del fandom
 * @returns Información del fandom o null si no se encuentra
 */
export function getFandomByName(name: string) {
  const normalizedName = name.toLowerCase();
  return fandomsData.find(f => f.name.toLowerCase() === normalizedName) || null;
}

/**
 * Filtra fandoms por categoría
 * @param category Categoría a filtrar
 * @returns Array de fandoms que pertenecen a la categoría
 */
export function getFandomsByCategory(category: string) {
  if (category === "todos") {
    return fandomsData;
  }
  return fandomsData.filter(f => f.category === category);
}

/**
 * Genera un slug a partir de un texto
 * Esto es útil para crear URLs amigables
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Reemplaza espacios con guiones
    .replace(/[^\w\-]+/g, '') // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, '-');  // Elimina múltiples guiones consecutivos
} 