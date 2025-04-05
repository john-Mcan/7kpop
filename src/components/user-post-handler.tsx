'use client';

import { useRouter } from "next/navigation";
import SinglePostView from "@/components/single-post-view";

interface UserPostHandlerProps {
  username: string;
  postSlug: string;
}

export default function UserPostHandler({ username, postSlug }: UserPostHandlerProps) {
  const router = useRouter();
  
  // Función para volver al perfil del usuario desde un post
  const handleBackToProfile = () => {
    router.push(`/perfil/${username}`);
  };

  return <SinglePostView postSlug={postSlug} onBack={handleBackToProfile} />;
} 