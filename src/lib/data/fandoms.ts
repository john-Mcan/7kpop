/**
 * Datos de los fandoms disponibles en la aplicación.
 * Esta estructura simula la que tendríamos con datos reales.
 */
export const fandomsData = [
  { id: 1, name: "BTS", slug: "bts" },
  { id: 2, name: "BLACKPINK", slug: "blackpink" },
  { id: 3, name: "TWICE", slug: "twice" },
  { id: 4, name: "SEVENTEEN", slug: "seventeen" }, 
  { id: 5, name: "NewJeans", slug: "newjeans" },
  { id: 6, name: "aespa", slug: "aespa" },
  { id: 7, name: "Stray Kids", slug: "stray-kids" },
  { id: 8, name: "IVE", slug: "ive" },
  { id: 9, name: "EXO", slug: "exo" },
  { id: 10, name: "Red Velvet", slug: "red-velvet" }
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