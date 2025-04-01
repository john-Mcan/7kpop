'use client';

import { useRouter } from "next/navigation";
import SinglePostView from "@/components/single-post-view";

interface HomePostHandlerProps {
  postSlug: string;
}

export default function HomePostHandler({ postSlug }: HomePostHandlerProps) {
  const router = useRouter();
  
  // Función para volver al feed desde un post
  const handleBackToFeed = () => {
    router.push('/');
  };

  return <SinglePostView postSlug={postSlug} onBack={handleBackToFeed} />;
} 