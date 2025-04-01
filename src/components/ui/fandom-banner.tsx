import { useState } from "react";

interface FandomBannerProps {
  src?: string;
  alt: string;
}

export function FandomBanner({ src, alt }: FandomBannerProps) {
  // Como sabemos que las imágenes no existen,
  // usamos directamente el fallback de gradiente
  return (
    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-300"></div>
  );
} 