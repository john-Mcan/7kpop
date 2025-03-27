import React from "react";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";

interface SocialButtonProps {
  icon: LucideIcon;
  label?: string | number;
  onClick?: () => void;
  variant?: "default" | "active" | "primary";
  size?: "sm" | "md";
  className?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const variantClasses = {
    default: "text-gray-600 hover:bg-gray-100",
    active: "text-purple-700 hover:bg-purple-50",
    primary: "text-purple-700 hover:bg-purple-50"
  };

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm"
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1.5 ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg ${className}`}
      onClick={onClick}
    >
      <Icon size={size === 'sm' ? 16 : 18} />
      {label !== undefined && <span className={variant === "active" ? "font-medium" : ""}>{label}</span>}
    </Button>
  );
};

export default SocialButton; 