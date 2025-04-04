"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share, Flag, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommentsComponent from "./ui/comments";
import SharePost from "./ui/share-post";
import ReportPost from "./ui/report-post";
import Link from "next/link";
import UserAvatar from "./ui/user-avatar";
import { getFandomByName } from "@/lib/data/fandoms";
import { getFandomColor } from "@/lib/utils/fandom-colors";
import { getPostBySlug, voteOnPost, getUserVoteOnPost } from "@/lib/services/posts";
import { PostWithDetails, Post } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SinglePostViewProps {
  postSlug: string;
  onBack: () => void;
}

export default function SinglePostView({ postSlug, onBack }: SinglePostViewProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [postData, setPostData] = useState<PostWithDetails | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const postContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Obtener el post y la información del usuario
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Obtener el post con sus detalles
        const fetchedPostData = await getPostBySlug(postSlug);
        setPostData(fetchedPostData);
        
        // Obtener información del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && fetchedPostData) {
          setUserId(user.id);
          // Obtener el voto del usuario en este post si existe
          const userVoteData = await getUserVoteOnPost(fetchedPostData.post.id, user.id);
          if (userVoteData) {
            setUserVote(userVoteData.vote_type);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error al cargar la publicación",
          description: "No se pudo cargar la publicación solicitada.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [postSlug, toast]);

  useEffect(() => {
    const handleScroll = () => {
      if (postContainerRef.current) {
        const topOffset = postContainerRef.current.getBoundingClientRect().top;
        setShowStickyHeader(topOffset < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Manejar votos
  const handleVote = async (voteType: number) => {
    if (!postData || !userId) {
      toast({
        title: "Inicia sesión para votar",
        description: "Necesitas iniciar sesión para poder votar en publicaciones.",
        variant: "default"
      });
      return;
    }

    try {
      const success = await voteOnPost(postData.post.id, voteType);
      
      if (success) {
        // Si el usuario ya había votado igual, se elimina el voto (toggle)
        if (userVote === voteType) {
          setUserVote(null);
          // Actualizar contador según el tipo de voto eliminado
          if (voteType === 1) {
            setPostData({
              ...postData,
              post: {
                ...postData.post,
                upvotes: postData.post.upvotes - 1
              }
            });
          } else {
            setPostData({
              ...postData,
              post: {
                ...postData.post,
                downvotes: postData.post.downvotes - 1
              }
            });
          }
        } 
        // Si el usuario cambia de downvote a upvote
        else if (userVote === -1 && voteType === 1) {
          setUserVote(1);
          setPostData({
            ...postData,
            post: {
              ...postData.post,
              upvotes: postData.post.upvotes + 1,
              downvotes: postData.post.downvotes - 1
            }
          });
        } 
        // Si el usuario cambia de upvote a downvote
        else if (userVote === 1 && voteType === -1) {
          setUserVote(-1);
          setPostData({
            ...postData,
            post: {
              ...postData.post,
              upvotes: postData.post.upvotes - 1,
              downvotes: postData.post.downvotes + 1
            }
          });
        } 
        // Si es un nuevo voto
        else {
          setUserVote(voteType);
          if (voteType === 1) {
            setPostData({
              ...postData,
              post: {
                ...postData.post,
                upvotes: postData.post.upvotes + 1
              }
            });
          } else {
            setPostData({
              ...postData,
              post: {
                ...postData.post,
                downvotes: postData.post.downvotes + 1
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al votar:", error);
      toast({
        title: "Error al procesar el voto",
        description: "No se pudo procesar tu voto. Inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    }
  };

  // Si está cargando o no hay datos, mostrar un estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  // Si no se encuentra el post, mostrar mensaje
  if (!postData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Publicación no encontrada</h2>
        <p className="text-gray-600 mb-4">La publicación que buscas no existe o ha sido eliminada.</p>
        <Button onClick={onBack} variant="outline">
          Volver al feed
        </Button>
      </div>
    );
  }
  
  // Extraer datos del post para facilitar acceso
  const { post, author, fandom } = postData;
  
  // Obtener el slug del fandom para la navegación
  const fandomSlug = fandom.slug || fandom.name.toLowerCase().replace(/\s+/g, '-');
  
  // Obtener el color del fandom para el avatar
  const fandomColorClass = getFandomColor(fandom.name, 'from-to');

  return (
    <div className="space-y-6 relative">
      {showStickyHeader && (
        <div 
          className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm px-3 py-2 flex items-center gap-3 z-40 animate-slideDown" 
          style={{ animationDuration: '0.3s' }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 flex-shrink-0 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={(e) => { 
              e.stopPropagation();
              onBack();
            }}
            aria-label="Volver al feed"
          >
            <ArrowLeft size={20} />
          </Button>

          <div 
            className="flex items-center gap-2 flex-1 overflow-hidden cursor-pointer"
            onClick={scrollToTop}
          >
            {post.image_urls && post.image_urls.length > 0 && (
              <img 
                src={String(post.image_urls[0]).match(/^https?:\/\//) || String(post.image_urls[0]).startsWith('/') 
                  ? post.image_urls[0] 
                  : 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop'} 
                alt="Miniatura"
                className="w-8 h-8 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop') {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            )}
            <h2 className="text-sm font-medium text-gray-800 truncate">
              {post.title}
            </h2>
          </div>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2 h-9 w-9 rounded-full"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </Button>
        
        {/* Avatar y Nombre del Fandom como Link - Avatar más grande */}
        <Link 
          href={`/fandoms/${fandomSlug}`} 
          className="flex items-center gap-3 group" 
          aria-label={`Ver fandom ${fandom.name}`}
        >
          {/* Avatar del Fandom - Cambiar de sm a md */}
          <div className="flex-shrink-0">
            <UserAvatar 
              text={fandom.avatar_url || fandom.name.charAt(0).toUpperCase()}
              size="md" 
            />
          </div>
          {/* Nombre del Fandom */}
          <h1 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
            {fandom.name}
          </h1>
        </Link>
      </div>
      
      <div ref={postContainerRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cabecera del post - Ajustada para elementos de autor más pequeños */}
        <div className="p-3 border-b border-gray-100"> 
          <div className="flex items-center">
            {/* Avatar del autor - Más pequeño */}
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold"> 
              {author.avatar_url ? (
                <img 
                  src={author.avatar_url} 
                  alt={author.username || "Usuario"} 
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.textContent = (author.username || "U").charAt(0).toUpperCase();
                  }}
                />
              ) : (
                (author.username || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="ml-2"> 
              <div className="font-medium text-sm"> 
                {author.username || "Usuario"}
              </div>
              <div className="text-gray-500 text-xs"> 
                @{author.username || "usuario"}
              </div>
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
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img 
                src={String(post.image_urls[0]).match(/^https?:\/\//) || String(post.image_urls[0]).startsWith('/') 
                  ? post.image_urls[0] 
                  : 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop'}
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
          
          {post.video_url && (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 mb-4 aspect-video">
              <iframe
                src={post.video_url}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}
          
          {post.link_url && (
            <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-blue-600" />
                <a 
                  href={post.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-words"
                >
                  {post.link_url}
                </a>
              </div>
            </div>
          )}
        </div>
        
        {/* Acciones del post */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-600 flex items-center gap-1.5 ${userVote === 1 ? "text-purple-700 bg-purple-50" : ""}`}
              onClick={() => handleVote(1)}
            >
              <ThumbsUp size={18} />
              <span>{post.upvotes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-600 flex items-center gap-1.5 ${userVote === -1 ? "text-red-600 bg-red-50" : ""}`}
              onClick={() => handleVote(-1)}
            >
              <ThumbsDown size={18} />
              <span>{post.downvotes}</span>
            </Button>
            <div className="text-gray-600 flex items-center gap-1.5 px-2 py-1 text-sm">
              <MessageSquare size={18} />
              <span>{0}</span> {/* Se actualizará con la cuenta real de comentarios */}
            </div>
          </div>
          
          <div className="flex space-x-1 relative z-30">
            <SharePost 
              postTitle={post.title} 
              postSlug={post.slug || postSlug}
              isReportOpen={isReportOpen}
              onOpenChange={handleShareOpenChange}
            />
            <ReportPost 
              postId={post.id}
              postSlug={post.slug || postSlug}
              isShareOpen={isShareOpen}
              onOpenChange={handleReportOpenChange}
              fandomId={fandom.id}
            />
          </div>
        </div>
        
        {/* Comentarios - Renderizar siempre y forzar visibilidad */}
        <div className="border-t border-gray-100">
          <CommentsComponent 
            postId={post.id} 
            commentsCount={0} // Se actualizará con la cuenta real de comentarios
            forceShowComments={true}
          />
        </div>
      </div>
    </div>
  );
} 