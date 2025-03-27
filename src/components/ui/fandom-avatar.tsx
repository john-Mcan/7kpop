"use client";

interface FandomAvatarProps {
  src?: string;
  alt: string;
  initial: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  colorClass?: string;
  className?: string;
}

export function FandomAvatar({ 
  src, 
  alt, 
  initial, 
  size = 'full', 
  colorClass = "from-purple-600 to-indigo-600", 
  className = "" 
}: FandomAvatarProps) {
  // Determinar el tamaño del texto basado en el tamaño del avatar
  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-xl",
    full: "text-2xl"
  };

  return (
    <div 
      className={`w-full h-full flex items-center justify-center bg-gradient-to-r ${colorClass} text-white font-bold ${textSizeClass[size]} ${className}`}
    >
      {initial.charAt(0).toUpperCase()}
    </div>
  );
} 