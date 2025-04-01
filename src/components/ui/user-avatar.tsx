'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  image?: string;
  name?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  username?: string;
  linkToProfile?: boolean;
  colorClass?: string;
  className?: string;
}

export default function UserAvatar({ 
  image, 
  name, 
  text, 
  size = 'md',
  username,
  linkToProfile,
  colorClass = "from-purple-500 to-indigo-600",
  className = ""
}: UserAvatarProps) {
  // Usar nombre o texto para iniciales
  const displayText = text || name;
  
  const initials = displayText
    ? displayText
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : "U";

  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-14 h-14 text-base",
    full: "w-full h-full text-xl"
  };
  
  // Combinar clases según el tamaño
  const combinedClassName = `${sizeClasses[size] || ""} ${className}`;

  return (
    <Avatar className={combinedClassName}>
      {image && <AvatarImage src={image} alt={name || initials} />}
      <AvatarFallback className={`bg-gradient-to-br ${colorClass} text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
} 