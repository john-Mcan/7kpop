type ColorFormat = 'bg-gradient' | 'from-to';

// Diccionario de colores para los fandoms
const fandomColorsMap: Record<string, string> = {
  "BTS": "from-purple-600 to-indigo-600",
  "BLACKPINK": "from-pink-500 to-purple-600",
  "TWICE": "from-purple-500 to-pink-500",
  "Stray Kids": "from-indigo-600 to-blue-500",
  "aespa": "from-purple-600 to-purple-900",
  "Red Velvet": "from-red-500 to-purple-600",
  "IVE": "from-blue-500 to-indigo-600",
  "ITZY": "from-pink-400 to-red-500",
  // Valor por defecto
  "default": "from-purple-600 to-indigo-600"
};

/**
 * Obtiene el color de un fandom en el formato especificado
 * @param name Nombre del fandom
 * @param format Formato del color ('bg-gradient' o 'from-to')
 * @returns Clase CSS con el color del fandom
 */
export function getFandomColor(name: string, format: ColorFormat = 'bg-gradient'): string {
  const colorValue = fandomColorsMap[name] || fandomColorsMap.default;
  
  if (format === 'bg-gradient') {
    return `bg-gradient-to-br ${colorValue}`;
  }
  
  return colorValue;
}

/**
 * Convierte un formato de color a otro
 * @param colorClass Clase de color actual
 * @param toFormat Formato al que se desea convertir
 * @returns Clase CSS en el nuevo formato
 */
export function convertColorFormat(colorClass: string, toFormat: ColorFormat): string {
  if (toFormat === 'bg-gradient' && !colorClass.includes('bg-gradient')) {
    return `bg-gradient-to-br ${colorClass}`;
  }
  
  if (toFormat === 'from-to' && colorClass.includes('bg-gradient')) {
    return colorClass.replace('bg-gradient-to-br', '').trim();
  }
  
  return colorClass;
} 