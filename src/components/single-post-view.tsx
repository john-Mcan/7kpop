"use client";

import React from "react";
import { useState } from "react";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share, Flag, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentsComponent from "./ui/comments";
import SharePost from "./ui/share-post";
import ReportPost from "./ui/report-post";
import Link from "next/link";

interface SinglePostViewProps {
  postSlug: string;
  onBack: () => void;
}

// Interfaces para los tipos de posts
interface PostAuthor {
  name: string;
  username: string;
  favoriteGroups: string[];
}

interface PostFandom {
  name: string;
  avatar: string;
}

interface PostVotes {
  up: number;
  down: number;
}

interface Post {
  id: number;
  slug: string;
  fandom: PostFandom;
  author: PostAuthor;
  title: string;
  content: string;
  image?: string;
  video?: string;
  url?: string;
  votes: PostVotes;
  comments: number;
  createdAt: string;
}

export default function SinglePostView({ postSlug, onBack }: SinglePostViewProps) {
  const [showComments, setShowComments] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Encontrar un post adecuado en base al slug
  const post = getPostBySlug(postSlug);

  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  // Manejadores para compartir y reportar modales
  const handleShareOpenChange = (isOpen: boolean) => {
    setIsShareOpen(isOpen);
    // Si se está abriendo el modal de compartir, cerrar el de reportar
    if (isOpen) {
      setIsReportOpen(false);
    }
  };

  const handleReportOpenChange = (isOpen: boolean) => {
    setIsReportOpen(isOpen);
    // Si se está abriendo el modal de reportar, cerrar el de compartir
    if (isOpen) {
      setIsShareOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Post</h1>
      </div>
      
      {/* Añadimos min-h-[600px] para asegurar que el contenedor tenga una altura mínima */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] relative">
        {/* Cabecera del post */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
              {post.author.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <div className="font-medium">{post.author.name}</div>
              <div className="text-gray-500 text-sm">@{post.author.username}</div>
            </div>
          </div>
        </div>
        
        {/* Contenido del post */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
          
          {/* Texto del post con enlaces clickeables */}
          <div className="text-gray-700 mb-4">
            {post.content.split(' ').map((word, index) => {
              if (word.match(/^https?:\/\//i)) {
                return (
                  <React.Fragment key={index}>
                    <a 
                      href={word} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      {word}
                    </a>
                    {' '}
                  </React.Fragment>
                );
              }
              return <React.Fragment key={index}>{word} </React.Fragment>;
            })}
          </div>
          
          {/* Renderizado de medios (imágenes, videos, enlaces) */}
          {post.image && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img 
                src={String(post.image).match(/^https?:\/\//) || String(post.image).startsWith('/') ? post.image : 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop'}
                alt={post.title}
                className="w-full object-cover max-h-[500px] block"
                onError={(e) => {
                  if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop') {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            </div>
          )}
          
          {post.video && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 mb-4 aspect-video">
              <iframe
                src={post.video}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}
          
          {post.url && (
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-blue-600" />
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-words"
                >
                  {post.url}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Acciones del post */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-600 flex items-center gap-1.5">
              <ThumbsUp size={18} />
              <span>{post.votes.up}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 flex items-center gap-1.5">
              <ThumbsDown size={18} />
              <span>{post.votes.down}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 flex items-center gap-1.5"
              onClick={toggleComments}
            >
              <MessageSquare size={18} />
              <span>{post.comments}</span>
            </Button>
          </div>
          
          <div className="flex space-x-1 relative z-30">
            <SharePost 
              postTitle={post.title} 
              postSlug={post.slug}
              isReportOpen={isReportOpen}
              onOpenChange={handleShareOpenChange}
            />
            <ReportPost 
              postId={post.id}
              postSlug={post.slug}
              isShareOpen={isShareOpen}
              onOpenChange={handleReportOpenChange}
            />
          </div>
        </div>
        
        {/* Comentarios */}
        {showComments && (
          <div className="border-t border-gray-100">
            <CommentsComponent 
              postId={post.id} 
              commentsCount={post.comments}
              forceShowComments={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Función para obtener un post por slug
function getPostBySlug(slug: string): Post {
  // Definir posts de ejemplo
  const allPosts: Post[] = [
    {
      id: 1,
      slug: "nueva-pelicula-del-mcu",
      fandom: {
        name: "Marvel",
        avatar: "M",
      },
      author: {
        name: "Maria Gonzalez",
        username: "maria_marvel",
        favoriteGroups: ["Marvel", "DC Comics", "Star Wars"],
      },
      title: "Nueva película del MCU",
      content: "Alguien más está emocionado por la nueva película? No puedo esperar a verla. El teaser se ve increíble! He sido fan del MCU desde Iron Man y cada nueva entrega me emociona. Los rumores sobre los nuevos personajes que se unirán al universo son fascinantes. ¿Qué opinan ustedes sobre la dirección que está tomando el MCU en esta fase?",
      image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop",
      url: "https://marvel.com/movies",
      votes: {
        up: 342,
        down: 12,
      },
      comments: 56,
      createdAt: "2h",
    },
    {
      id: 2,
      slug: "concierto-en-ciudad-de-mexico",
      fandom: {
        name: "Taylor Swift",
        avatar: "T",
      },
      author: {
        name: "Carlos Ramirez",
        username: "carlosmusic",
        favoriteGroups: ["Taylor Swift", "Musica", "Conciertos"],
      },
      title: "Concierto en Ciudad de México",
      content: "El concierto en Ciudad de México fue una experiencia increíble. La energía de los artistas y el público fue algo inolvidable. Alguien más asistió? Fue mi primer concierto de esta magnitud y estoy completamente impresionado! Visiten la página oficial para más fechas: https://www.taylorswift.com/events",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
      votes: {
        up: 215,
        down: 5,
      },
      comments: 87,
      createdAt: "5h",
    },
    {
      id: 3,
      slug: "nuevo-anime-imperdible-esta-temporada",
      fandom: {
        name: "Anime",
        avatar: "A",
      },
      author: {
        name: "Ana Martinez",
        username: "ana_anime",
        favoriteGroups: ["Anime", "Manga", "Cosplay"],
      },
      title: "Nuevo anime imperdible esta temporada",
      content: "He estado viendo la nueva serie que acaba de salir y es impresionante. La animación es fluida y la historia te atrapa desde el primer capítulo. Alguien más la está siguiendo?",
      image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=800&auto=format&fit=crop",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      votes: {
        up: 178,
        down: 3,
      },
      comments: 34,
      createdAt: "8h",
    }
  ];
  
  // Buscar por slug o devolver un post genérico
  const foundPost = allPosts.find(post => post.slug === slug);
  
  if (foundPost) {
    return foundPost;
  }
  
  // Si no se encuentra, devuelve un post genérico con el slug en el título
  return {
    id: 999,
    slug: slug,
    fandom: {
      name: "Fanverse",
      avatar: "F",
    },
    author: {
      name: "Usuario",
      username: "usuario123",
      favoriteGroups: ["Fanverse"],
    },
    title: "Publicación sobre " + slug,
    content: "Esta es una publicación de ejemplo para el slug '" + slug + "'. En la versión final, este contenido se cargará desde la base de datos. Puedes visitar nuestro sitio web: https://fanverse.example.com",
    image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=800&auto=format&fit=crop",
    votes: {
      up: 42,
      down: 7,
    },
    comments: 15,
    createdAt: "1h",
  };
} 