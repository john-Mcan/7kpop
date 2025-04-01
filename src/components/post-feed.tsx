"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, MessageSquare, Share, MoreVertical, Flag, Send, Link as LinkIcon } from "lucide-react";
import CommentsComponent from "./ui/comments";
import { useState, useEffect } from "react";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import UserAvatar from "./ui/user-avatar";
import SocialButton from "./ui/social-button";
import { getFandomColor } from "@/lib/utils/fandom-colors";
import { getFandomByName, getFandomById, getFandomBySlug, fandomsData } from "@/lib/data/fandoms";
import SharePost from "./ui/share-post";
import ReportPost from "./ui/report-post";
import React from "react";

type Post = {
  id: number;
  slug?: string;
  fandom: {
    name: string;
    avatar: string;
  };
  author: {
    name: string;
    username: string;
    favoriteGroups: string[];
  };
  title: string;
  content: string;
  image?: string;
  video?: string;
  url?: string;
  votes: {
    up: number;
    down: number;
  };
  comments: number;
  createdAt: string;
};

type PostFeedProps = {
  fandomSlug?: string;
};

const PostFeed = ({ fandomSlug }: PostFeedProps) => {
  // Datos de ejemplo para las publicaciones
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
      title: "Nueva pelicula del MCU",
      content: "Alguien mas esta emocionado por la nueva pelicula? No puedo esperar a verla. El teaser se ve increible!",
      image: "/posts/marvel-movie.jpg",
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
      title: "Concierto en Ciudad de Mexico",
      content: "El concierto en Ciudad de Mexico fue una experiencia increible. La energia de los artistas y el publico fue algo inolvidable. Alguien mas asistio? Visiten la página oficial para más fechas: https://www.taylorswift.com/events",
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
      content: "He estado viendo la nueva serie que acaba de salir y es impresionante. La animacion es fluida y la historia te atrapa desde el primer capitulo. Alguien mas la esta siguiendo?",
      image: "/posts/anime-show.jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      votes: {
        up: 178,
        down: 3,
      },
      comments: 34,
      createdAt: "8h",
    },
  ];

  // Filtrar posts por fandom si se proporciona un slug
  const posts = fandomSlug 
    ? allPosts.filter(post => {
        const postFandom = getFandomByName(post.fandom.name);
        return postFandom?.slug === fandomSlug;
      })
    : allPosts;

  return (
    <div className="space-y-5">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay publicaciones todavia</h3>
          <p className="text-gray-600 mb-4">Se el primero en compartir algo con la comunidad!</p>
          <Button className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 text-white">
            Crear publicacion
          </Button>
        </div>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const [showComments, setShowComments] = useState(false);
  const { isMobile } = useDeviceDetect();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const handleCommentsToggle = () => {
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

  // Obtener el slug del fandom para la URL
  const fandom = getFandomByName(post.fandom.name);
  const fandomSlug = fandom?.slug || post.fandom.name.toLowerCase();
  
  // URL para el post individual
  const postUrl = `/?post=${post.slug || post.id}`;

  return (
    <div className="relative">
      <Link href={postUrl} className="absolute inset-0 z-10">
        <span className="sr-only">Ver publicación completa</span>
      </Link>
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
          <Link href={`/fandoms/${fandomSlug}`} className="flex-shrink-0 w-8 h-8 relative z-20">
            <UserAvatar 
              text={post.fandom.avatar}
              colorClass={getFandomColor(post.fandom.name, 'from-to')}
              size="full"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/fandoms/${fandomSlug}`} className="font-semibold text-xs text-gray-700 hover:text-purple-700 transition-colors relative z-20">
                {post.fandom.name}
              </Link>
              <p className="text-gray-500 text-xs">• {post.createdAt}</p>
            </div>
            <div className="flex items-center">
              <Link href={`/perfil/${post.author.username}`} className="text-xs text-gray-500 hover:text-purple-700 transition-colors relative z-20">
                {post.author.username}
              </Link>
              <div className="ml-2 flex flex-wrap">
                {post.author.favoriteGroups.map((group, idx) => {
                  const groupFandom = getFandomByName(group);
                  const groupSlug = groupFandom?.slug || group.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link href={`/fandoms/${groupSlug}`} key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-purple-700 rounded-full text-[10px] mr-1 mb-1 hover:bg-purple-100 transition-colors relative z-20">
                      {group}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100 relative z-20">
            <span className="sr-only">Mas opciones</span>
            <MoreVertical size={15} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 relative hover:text-purple-700 transition-colors">{post.title}</h3>
          <div className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
            {post.content.split(' ').map((word, index) => {
              if (word.match(/^(https?:\/\/)/i)) { 
                return (
                  <React.Fragment key={index}>
                    <a 
                      href={word} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words relative z-20"
                      onClick={(e) => e.stopPropagation()} 
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
          
          {post.image && (
            <div className="block mt-3 rounded-lg overflow-hidden bg-gray-100 w-full h-64 relative">
              <img 
                src={String(post.image).match(/^https?:\/\//) ? post.image : 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop'} 
                alt={`Imagen de ${post.fandom.name}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop') {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            </div>
          )}

          {post.video && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 aspect-video relative">
              <iframe
                src={post.video}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}

          {post.url && (
            <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50 relative">
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-blue-600 flex-shrink-0" />
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all relative z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.url}
                </a>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-2 flex justify-between border-t border-gray-100 mt-2 relative z-20">
          <div className="flex items-center gap-3">
            <SocialButton 
              icon={ThumbsUp} 
              label={post.votes.up} 
              variant="active"
            />
            <SocialButton 
              icon={ThumbsDown} 
              label={post.votes.down} 
            />
            {isMobile ? (
              <CommentsComponent 
                postId={post.id}
                commentsCount={post.comments}
              />
            ) : (
              <SocialButton 
                icon={MessageSquare} 
                label={post.comments} 
                onClick={handleCommentsToggle}
              />
            )}
          </div>
          
          <div className="flex items-center">
            <SharePost 
              postTitle={post.title} 
              postSlug={post.slug || post.id.toString()} 
              isReportOpen={isReportOpen}
              onOpenChange={handleShareOpenChange}
            />
            <ReportPost 
              postId={post.id} 
              postSlug={post.slug || post.id.toString()} 
              isShareOpen={isShareOpen}
              onOpenChange={handleReportOpenChange}
            />
          </div>
        </CardFooter>
        
        {showComments && !isMobile && (
          <div className="border-t border-gray-100 relative z-20">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Comentarios ({post.comments})</h3>
              <CommentsComponent 
                postId={post.id}
                commentsCount={post.comments}
                forceShowComments={true}
                hideButton={true}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PostFeed; 