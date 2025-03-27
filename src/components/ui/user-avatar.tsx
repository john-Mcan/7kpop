import React from "react";
import Link from "next/link";

interface UserAvatarProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  username?: string;
  linkToProfile?: boolean;
  colorClass?: string;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  text,
  size = 'md',
  username,
  linkToProfile = false,
  colorClass = "from-purple-600 to-indigo-500",
  className = ""
}) => {
  // Mapeo de tamaños a clases
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-14 h-14 text-base",
    full: "w-full h-full text-xl"
  };
  
  // Combinamos las clases de manera manual
  const avatarClasses = `
    ${sizeClasses[size] || sizeClasses.md} 
    rounded-full bg-gradient-to-r 
    ${colorClass} 
    text-white flex items-center justify-center font-medium flex-shrink-0 
    ${className}
  `;

  const avatarContent = (
    <div className={avatarClasses.replace(/\s+/g, ' ').trim()}>
      {text.charAt(0).toUpperCase()}
    </div>
  );

  if (linkToProfile && username) {
    return (
      <Link href={`/perfil/${username}`}>
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
};

export default UserAvatar; 