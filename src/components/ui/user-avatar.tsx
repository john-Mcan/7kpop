import React from "react";
import Link from "next/link";

interface UserAvatarProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
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
    lg: "w-10 h-10 text-sm"
  };

  const avatarContent = (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClass} text-white flex items-center justify-center font-medium flex-shrink-0 ${className}`}
    >
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