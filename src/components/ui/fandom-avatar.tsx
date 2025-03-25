"use client";

interface FandomAvatarProps {
  src?: string;
  alt: string;
  initial: string;
}

export function FandomAvatar({ src, alt, initial }: FandomAvatarProps) {
  // Como sabemos que las imágenes no existen,
  // usamos directamente el fallback con la inicial
  return (
    <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
      {initial}
    </div>
  );
} 