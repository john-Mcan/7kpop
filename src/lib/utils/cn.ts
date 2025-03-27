import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina múltiples clases de CSS de manera segura, utilizando clsx y tailwind-merge.
 * Útil para combinar clases condicionales y evitar conflictos con Tailwind CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 