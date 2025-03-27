"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, MessageSquare, Share, MoreVertical, Flag, Send } from "lucide-react";
import CommentsComponent from "./ui/comments";
import { useState, useEffect } from "react";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import UserAvatar from "./ui/user-avatar";
import SocialButton from "./ui/social-button";
import { getFandomColor } from "@/lib/utils/fandom-colors";
import { getFandomByName, getFandomById, fandomsData } from "@/lib/data/fandoms";

type Post = {
  id: number;
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
  votes: {
    up: number;
    down: number;
  };
  comments: number;
  createdAt: string;
};

const PostFeed = () => {
  // Datos de ejemplo para las publicaciones
  const posts: Post[] = [
    {
      id: 1,
      fandom: {
        name: "BTS",
        avatar: "B",
      },
      author: {
        name: "María González",
        username: "mariakpop",
        favoriteGroups: ["BTS", "BLACKPINK", "TWICE"],
      },
      title: "Nuevo álbum de BTS",
      content: "¿Alguien más está emocionado por el nuevo álbum? No puedo esperar a escuchar las nuevas canciones. ¡El teaser se ve increíble!",
      image: "/posts/bts-album.jpg",
      votes: {
        up: 342,
        down: 12,
      },
      comments: 56,
      createdAt: "2h",
    },
    {
      id: 2,
      fandom: {
        name: "BLACKPINK",
        avatar: "B",
      },
      author: {
        name: "Carlos Ramírez",
        username: "carlosKpop",
        favoriteGroups: ["BLACKPINK", "aespa", "ITZY"],
      },
      title: "Concierto en Ciudad de México",
      content: "El concierto de BLACKPINK en Ciudad de México fue una experiencia increíble. La energía de las chicas y el público fue algo inolvidable. ¿Alguien más asistió?",
      votes: {
        up: 215,
        down: 5,
      },
      comments: 87,
      createdAt: "5h",
    },
    {
      id: 3,
      fandom: {
        name: "TWICE",
        avatar: "T",
      },
      author: {
        name: "Ana Martínez",
        username: "anatwice",
        favoriteGroups: ["TWICE", "Red Velvet", "IVE"],
      },
      title: "Aprendiendo la coreografía de 'Feel Special'",
      content: "He estado practicando la coreografía de 'Feel Special' durante una semana. Es difícil pero muy divertida. ¿Alguien tiene consejos para los pasos más complicados?",
      image: "/posts/twice-dance.jpg",
      votes: {
        up: 178,
        down: 3,
      },
      comments: 34,
      createdAt: "8h",
    },
  ];

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const [showComments, setShowComments] = useState(false);
  const { isMobile } = useDeviceDetect();
  
  const handleCommentsToggle = () => {
    setShowComments(!showComments);
  };

  // Obtener el slug del fandom para la URL
  const fandom = getFandomByName(post.fandom.name);
  const fandomSlug = fandom?.slug || post.fandom.name.toLowerCase();

  return (
    <div className="relative">
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-3 flex flex-row items-start gap-3">
          <Link href={`/fandoms/${fandomSlug}`} className="flex-shrink-0 w-10 h-10">
            <UserAvatar 
              text={post.fandom.avatar}
              colorClass={getFandomColor(post.fandom.name, 'from-to')}
              size="full"
            />
          </Link>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/fandoms/${fandomSlug}`} className="font-semibold text-sm hover:text-purple-700 transition-colors">
                {post.fandom.name}
              </Link>
              <p className="text-gray-500 text-xs">• {post.createdAt}</p>
            </div>
            <div className="flex items-center mt-1">
              <Link href={`/perfil/${post.author.username}`} className="text-xs text-gray-600 hover:text-purple-700 transition-colors">
                {post.author.username}
              </Link>
              <div className="ml-2 flex flex-wrap">
                {post.author.favoriteGroups.map((group, idx) => {
                  const groupFandom = getFandomByName(group);
                  const groupSlug = groupFandom?.slug || group.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link href={`/fandoms/${groupSlug}`} key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-purple-700 rounded-full text-[10px] mr-1 mb-1 hover:bg-purple-100 transition-colors">
                      {group}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100">
            <span className="sr-only">Más opciones</span>
            <MoreVertical size={15} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Link href={`/post/${post.id}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-2 hover:text-purple-700 transition-colors">{post.title}</h3>
          </Link>
          <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
          {post.image && (
            <Link href={`/post/${post.id}`} className="block mt-3 rounded-lg overflow-hidden bg-gray-100 w-full h-64">
              <img 
                src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop"
                alt={`Imagen de ${post.fandom.name}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-2 flex justify-between border-t border-gray-100 mt-2">
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
            <SocialButton 
              icon={Share} 
              label="Compartir"
              className="sm:gap-1"
              labelClassName="hidden sm:inline"
            />
            <SocialButton 
              icon={Flag} 
              className="ml-0.5"
            />
          </div>
        </CardFooter>
      </Card>
      
      {/* Sección de comentarios para escritorio */}
      {showComments && !isMobile && (
        <div className="mt-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Comentarios ({post.comments})</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={handleCommentsToggle}
            >
              Ocultar
            </Button>
          </div>
          
          <div className="p-3">
            {/* Usamos los props hideButton y forceShowComments para evitar que se abra un segundo modal */}
            <CommentsComponent 
              postId={post.id}
              commentsCount={post.comments}
              hideButton={true}
              forceShowComments={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed; 