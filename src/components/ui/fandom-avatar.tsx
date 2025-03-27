"use client";

import UserAvatar from "./user-avatar";

interface FandomAvatarProps {
  src?: string;
  alt: string;
  initial: string;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
}

export function FandomAvatar({ src, alt, initial, size = 'md', colorClass }: FandomAvatarProps) {
  // Como sabemos que las imágenes no existen,
  // usamos el componente UserAvatar con la inicial
  return (
    <UserAvatar 
      text={initial}
      size={size}
      colorClass={colorClass}
    />
  );
} 