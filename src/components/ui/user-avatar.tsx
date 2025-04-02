'use client';

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string | null;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-md"
};

export default function UserAvatar({ src, text, size = 'md' }: UserAvatarProps) {
  const getInitials = (text: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase();
  };

  return (
    <Avatar className={cn(sizeClasses[size])}>
      {src ? (
        <AvatarImage src={src} alt={text || "Avatar"} />
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary">
          {text ? getInitials(text) : '?'}
        </AvatarFallback>
      )}
    </Avatar>
  );
} 