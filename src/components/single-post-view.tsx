"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, MoreVertical } from "lucide-react";
import UserAvatar from "@/components/ui/user-avatar";
import CommentsComponent from "@/components/ui/comments";
import SharePost from "@/components/ui/share-post";
import ReportPost from "@/components/ui/report-post";
import { getFandomColor } from "@/lib/utils/fandom-colors";
import { getFandomByName } from "@/lib/data/fandoms";

// Datos simulados para los posts (similar a los de post-feed.tsx)
const samplePosts = [
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
    image: "/posts/marvel-movie.jpg",
    votes: {
      up: 342,
      down: 12,
    },
    comments: 56,
    createdAt: "28 marzo 2025",
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
    content: "El concierto en Ciudad de México fue una experiencia increíble. La energía de los artistas y el público fue algo inolvidable. Alguien más asistió? Fue mi primer concierto de esta magnitud y estoy completamente impresionado!",
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
    image: "/posts/anime-show.jpg",
    votes: {
      up: 178,
      down: 3,
    },
    comments: 34,
    createdAt: "8h",
  },
];

type SinglePostViewProps = {
  postSlug: string;
  onBack: () => void;
};

export default function SinglePostView({ postSlug, onBack }: SinglePostViewProps) {
  const [post, setPost] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    // Simular la carga del post
    setIsLoading(true);
    
    // Buscar el post por slug en los datos de muestra
    const foundPost = samplePosts.find(p => p.slug === postSlug);
    
    setTimeout(() => {
      setPost(foundPost || null);
      setIsLoading(false);
    }, 300);
  }, [postSlug]);

  const handleVote = (type: 'up' | 'down') => {
    // Si el usuario ya votó igual, se quita el voto
    if (userVote === type) {
      setUserVote(null);
      setPost((prev: any) => ({
        ...prev,
        votes: {
          ...prev.votes,
          [type]: prev.votes[type] - 1
        }
      }));
    } 
    // Si el usuario votó diferente, se cambia el voto
    else if (userVote !== null) {
      setUserVote(type);
      setPost((prev: any) => ({
        ...prev,
        votes: {
          up: type === 'up' ? prev.votes.up + 1 : prev.votes.up - (userVote === 'up' ? 1 : 0),
          down: type === 'down' ? prev.votes.down + 1 : prev.votes.down - (userVote === 'down' ? 1 : 0)
        }
      }));
    } 
    // Si el usuario no había votado antes
    else {
      setUserVote(type);
      setPost((prev: any) => ({
        ...prev,
        votes: {
          ...prev.votes,
          [type]: prev.votes[type] + 1
        }
      }));
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Post no encontrado</h2>
        <p className="text-gray-600 mb-4">La publicación que buscas no existe o ha sido eliminada.</p>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="rounded-full"
        >
          Volver al feed
        </Button>
      </div>
    );
  }

  // Obtener el slug del fandom para la URL
  const fandom = getFandomByName(post.fandom.name);
  const fandomSlug = fandom?.slug || post.fandom.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 flex items-center text-gray-600 hover:text-purple-700"
        onClick={onBack}
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Volver al feed</span>
      </Button>

      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="p-5 pb-3 flex flex-row items-start gap-3">
          <Link href={`?fandom=${fandomSlug}`} className="flex-shrink-0 w-10 h-10">
            <UserAvatar 
              text={post.fandom.avatar}
              colorClass={getFandomColor(post.fandom.name, 'from-to')}
              size="full"
            />
          </Link>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`?fandom=${fandomSlug}`} className="font-semibold text-sm hover:text-purple-700 transition-colors">
                {post.fandom.name}
              </Link>
              <p className="text-gray-500 text-xs">• {post.createdAt}</p>
            </div>
            <div className="flex items-center mt-1">
              <Link href={`?user=${post.author.username}`} className="text-xs text-gray-600 hover:text-purple-700 transition-colors">
                {post.author.username}
              </Link>
              <div className="ml-2 flex flex-wrap">
                {post.author.favoriteGroups.map((group: string, idx: number) => {
                  const groupFandom = getFandomByName(group);
                  const groupSlug = groupFandom?.slug || group.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link href={`?fandom=${groupSlug}`} key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-purple-700 rounded-full text-[10px] mr-1 mb-1 hover:bg-purple-100 transition-colors">
                      {group}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100">
              <span className="sr-only">Más opciones</span>
              <MoreVertical size={15} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0">
          <h1 className="text-xl font-bold text-gray-900 mt-2 mb-4">{post.title}</h1>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
          
          {post.image && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop"
                alt={post.title}
                className="w-full object-cover max-h-[500px]"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant={userVote === 'up' ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-1.5 ${userVote === 'up' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'text-gray-700 hover:text-purple-700'} rounded-full`}
                onClick={() => handleVote('up')}
              >
                <ThumbsUp size={16} />
                <span>{post.votes.up}</span>
              </Button>
              <Button 
                variant={userVote === 'down' ? 'default' : 'ghost'}
                size="sm"
                className={`flex items-center gap-1.5 ${userVote === 'down' ? 'bg-gray-700 text-white hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900'} rounded-full`}
                onClick={() => handleVote('down')}
              >
                <ThumbsDown size={16} />
                <span>{post.votes.down}</span>
              </Button>
            </div>
            
            <div className="flex items-center">
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
        </CardContent>

        <div className="border-t border-gray-100">
          <div className="p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare size={16} className="mr-2 text-purple-600" />
              Comentarios ({post.comments})
            </h3>
            <CommentsComponent 
              postId={post.id}
              commentsCount={post.comments}
              forceShowComments={true}
            />
          </div>
        </div>
      </Card>
    </div>
  );
} 