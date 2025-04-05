"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, MoreVertical, X, Reply } from "lucide-react";
import Link from "next/link";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import UserAvatar from "./user-avatar";
import SocialButton from "./social-button";
import { supabase } from "@/lib/supabase/client";
import { CommentWithDetails, Comment, Profile } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";
import { getPostComments } from "@/lib/services/posts";

interface CommentsProps {
  postId: string;
  commentsCount?: number;
  hideButton?: boolean;
  forceShowComments?: boolean;
}

const CommentsComponent = (props: CommentsProps) => {
  const {
    postId,
    commentsCount = 0,
    hideButton = false,
    forceShowComments = false
  } = props;

  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [showComments, setShowComments] = useState(forceShowComments);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useDeviceDetect();
  const [replyingTo, setReplyingTo] = useState<CommentWithDetails | null>(null);
  const { toast } = useToast();

  // Referencias para los textareas
  const newCommentRef = useRef<HTMLTextAreaElement>(null);
  const replyRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({});

  useEffect(() => {
    setShowComments(forceShowComments);
  }, [forceShowComments]);

  // Cargar comentarios de Supabase
  useEffect(() => {
    async function fetchComments() {
      if ((showComments || sheetOpen) && comments.length === 0) {
        setIsLoading(true);
        try {
          // Obtener comentarios principales (sin parent_comment_id)
          const { data, error } = await supabase
            .from('comments')
            .select(`
              *,
              author:user_id(*)
            `)
            .eq('post_id', postId)
            .is('parent_comment_id', null)
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          if (data && data.length > 0) {
            // Mapear los datos al formato CommentWithDetails
            const formattedComments: CommentWithDetails[] = data.map(item => ({
              comment: {
                id: item.id,
                content: item.content,
                user_id: item.user_id,
                post_id: item.post_id,
                parent_comment_id: item.parent_comment_id,
                upvotes: item.upvotes,
                downvotes: item.downvotes,
                created_at: item.created_at,
                updated_at: item.updated_at
              },
              author: item.author as Profile
            }));

            // Cargar las respuestas para cada comentario
            for (const comment of formattedComments) {
              const { data: replies, error: repliesError } = await supabase
                .from('comments')
                .select(`
                  *,
                  author:user_id(*)
                `)
                .eq('parent_comment_id', comment.comment.id)
                .order('created_at', { ascending: true }); // Aseguramos orden cronológico

              if (!repliesError && replies && replies.length > 0) {
                comment.replies = replies.map(reply => ({
                  comment: {
                    id: reply.id,
                    content: reply.content,
                    user_id: reply.user_id,
                    post_id: reply.post_id,
                    parent_comment_id: reply.parent_comment_id,
                    upvotes: reply.upvotes,
                    downvotes: reply.downvotes,
                    created_at: reply.created_at,
                    updated_at: reply.updated_at
                  },
                  author: reply.author as Profile
                }));
              }
            }

            setComments(formattedComments);
          }
        } catch (error) {
          console.error("Error al cargar comentarios:", error);
          toast({
            title: "Error al cargar comentarios",
            description: "No se pudieron cargar los comentarios. Inténtalo de nuevo más tarde.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchComments();
  }, [showComments, sheetOpen, comments.length, postId, toast]);

  // Manejar la apertura de comentarios según el dispositivo
  const handleCommentsClick = () => {
    if (isMobile) {
      setSheetOpen(true);
    } else {
      setShowComments(!showComments);
    }
  };

  // Manejar el envío de un nuevo comentario
  const handleSubmitComment = async () => {
    const commentContent = newCommentRef.current?.value?.trim();
    if (!commentContent) return;
    
    try {
      // Verificar si el usuario está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Inicia sesión para comentar",
          description: "Necesitas iniciar sesión para poder comentar en las publicaciones.",
          variant: "default"
        });
        return;
      }
      
      // Insertar el comentario en Supabase
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: commentContent,
          user_id: user.id,
          post_id: postId,
          parent_comment_id: null
        })
        .select(`
          *,
          author:user_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Crear el objeto CommentWithDetails
        const newCommentObj: CommentWithDetails = {
          comment: {
            id: data.id,
            content: data.content,
            user_id: data.user_id,
            post_id: data.post_id,
            parent_comment_id: data.parent_comment_id,
            upvotes: 0,
            downvotes: 0,
            created_at: data.created_at,
            updated_at: data.updated_at
          },
          author: data.author as Profile
        };
        
        // Añadir el nuevo comentario al inicio de la lista
        setComments([newCommentObj, ...comments]);
        
        // Limpiar el textarea usando la referencia
        if (newCommentRef.current) {
          newCommentRef.current.value = "";
        }
        
        toast({
          title: "Comentario publicado",
          description: "Tu comentario ha sido publicado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al publicar comentario:", error);
      toast({
        title: "Error al publicar comentario",
        description: "No se pudo publicar tu comentario. Inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    }
  };

  // Manejar el envío de una respuesta a un comentario
  const handleSubmitReply = async () => {
    if (!replyingTo) return;
    
    const replyTextarea = replyRefs.current[replyingTo.comment.id];
    const replyText = replyTextarea?.value?.trim();
    
    if (!replyText) return;

    try {
      // Verificar si el usuario está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Inicia sesión para responder",
          description: "Necesitas iniciar sesión para poder responder a los comentarios.",
          variant: "default"
        });
        return;
      }
      
      // Insertar la respuesta en Supabase
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: replyText,
          user_id: user.id,
          post_id: postId,
          parent_comment_id: replyingTo.comment.id
        })
        .select(`
          *,
          author:user_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Crear el objeto CommentWithDetails para la respuesta
        const newReply: CommentWithDetails = {
          comment: {
            id: data.id,
            content: data.content,
            user_id: data.user_id,
            post_id: data.post_id,
            parent_comment_id: data.parent_comment_id,
            upvotes: 0,
            downvotes: 0,
            created_at: data.created_at,
            updated_at: data.updated_at
          },
          author: data.author as Profile
        };

        // Función recursiva para añadir la respuesta al comentario correcto
        const addReplyToComment = (comment: CommentWithDetails): CommentWithDetails => {
          if (comment.comment.id === replyingTo.comment.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => addReplyToComment(reply))
            };
          }
          return comment;
        };

        setComments(comments.map(comment => addReplyToComment(comment)));
        
        // Limpiar el textarea y cerrar el formulario de respuesta
        if (replyTextarea) {
          replyTextarea.value = "";
        }
        setReplyingTo(null);
        
        toast({
          title: "Respuesta publicada",
          description: "Tu respuesta ha sido publicada correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al publicar respuesta:", error);
      toast({
        title: "Error al publicar respuesta",
        description: "No se pudo publicar tu respuesta. Inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    }
  };

  // Manejar clic en responder
  const handleReplyClick = (comment: CommentWithDetails) => {
    setReplyingTo(comment);
    
    // Foco en el textarea de respuesta después de que el DOM se actualice
    setTimeout(() => {
      const replyTextarea = replyRefs.current[comment.comment.id];
      if (replyTextarea) {
        replyTextarea.focus();
      }
    }, 0);
  };

  // Cancelar respuesta
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    // Para fechas más antiguas, mostrar la fecha completa
    return date.toLocaleDateString();
  };

  // Componente para ingresar una respuesta
  const ReplyInput = ({ comment }: { comment: CommentWithDetails }) => (
    <div className="mt-4 flex items-start gap-3">
      <div className="w-10 h-10 flex-shrink-0">
        <UserAvatar
          text="U"
          size="md"
        />
      </div>
      <div className="flex-1 relative">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Respondiendo a <span className="font-medium text-gray-700">{comment.author.username}</span></span>
          <button
            onClick={handleCancelReply}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            aria-label="Cancelar respuesta"
          >
            <X size={14} />
          </button>
        </div>
        <textarea
          ref={(el) => {
            replyRefs.current[comment.comment.id] = el;
            return undefined;
          }}
          placeholder={`Escribe una respuesta a ${comment.author.username}...`}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 min-h-[60px] resize-none pr-10"
          autoFocus
        />
        <button
          onClick={handleSubmitReply}
          className={`absolute right-2 bottom-2 p-1.5 rounded-full text-purple-600 hover:bg-purple-50`}
          aria-label="Enviar respuesta"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // Renderizar un comentario individual
  const renderComment = (comment: CommentWithDetails, isReply = false) => (
    <div
      key={comment.comment.id}
      className={`${isReply ? "ml-10 pl-4 pt-4 border-l border-gray-200" : "p-4"}`}
      id={`comment-${comment.comment.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex-shrink-0">
          <UserAvatar
            text={comment.author.avatar_url || comment.author.username?.charAt(0).toUpperCase() || "U"}
            size="md"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div>
              <Link href={`/perfil/${comment.author.username}`} className="text-sm font-medium text-gray-900 hover:text-purple-700">
                {comment.author.username || "Usuario"}
              </Link>
              <span className="text-xs text-gray-500 ml-2">• {formatRelativeTime(comment.comment.created_at)}</span>
            </div>
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-gray-100 p-1 text-gray-500">
              <MoreVertical size={15} />
            </Button>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed mt-1">{comment.comment.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <SocialButton
              icon={ThumbsUp}
              label={comment.comment.upvotes}
              size="sm"
              variant={comment.comment.upvotes > 0 ? "active" : "default"}
              className="h-7 text-xs px-1.5"
            />
            <SocialButton
              icon={ThumbsDown}
              label={comment.comment.downvotes}
              size="sm"
              className="h-7 text-xs px-1.5"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReplyClick(comment)}
              className="text-xs text-gray-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-7 ml-2 rounded"
            >
              <Reply size={14} className="mr-1" />
              <span>Responder</span>
            </Button>
          </div>
          
          {replyingTo?.comment.id === comment.comment.id && (
            <ReplyInput comment={comment} />
          )}
          
          {comment.replies && comment.replies.map(reply => (
            renderComment(reply, true)
          ))}
        </div>
      </div>
    </div>
  );

  // Componente para ingresar un comentario nuevo
  const CommentInput = () => (
    <div className="flex items-start gap-3 pt-4">
      <div className="w-10 h-10 flex-shrink-0">
        <UserAvatar
          text="U"
          size="md"
        />
      </div>
      <div className="flex-1 relative">
        <textarea
          ref={newCommentRef}
          placeholder="Escribe un comentario..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 min-h-[80px] resize-none pr-10"
        />
        <button
          onClick={handleSubmitComment}
          className="absolute right-2 bottom-2 p-1.5 rounded-full text-purple-600 hover:bg-purple-50"
          aria-label="Enviar comentario"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // Re-declarar explícitamente CommentsContent
  const CommentsContent = () => (
    <>
      <div className="px-4 pb-4 border-b border-gray-100">
         <CommentInput />
      </div>
      <div className="divide-y divide-gray-100">
        {comments.length > 0 ? (
           comments.map(comment => renderComment(comment))
        ) : (
           <div className="p-4 text-center text-sm text-gray-500">No hay comentarios todavía.</div>
        )}
      </div>
    </>
  );

  return (
    <>
      {!hideButton && !forceShowComments && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1.5 text-xs h-8 text-gray-600 hover:bg-gray-100 rounded-lg"
          onClick={handleCommentsClick}
        >
          <MessageSquare size={16} />
          <span>{commentsCount}</span>
        </Button>
      )}

      {forceShowComments && <CommentsContent />}

      {showComments && !isMobile && !forceShowComments && (
        <div className="absolute left-0 right-0 mt-3 mx-3 z-10">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Comentarios ({commentsCount})</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => setShowComments(false)}
              >
                Ocultar
              </Button>
            </div>
            
            <div className="p-3">
              <CommentsContent />
            </div>
          </div>
        </div>
      )}

      {!forceShowComments && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="h-[70vh] px-4 py-4">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-center text-base">Comentarios ({commentsCount})</SheetTitle>
            </SheetHeader>
            
            <div className="overflow-y-auto h-[calc(100%-150px)] py-2">
              {comments.map(comment => renderComment(comment))}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 pb-4 px-4 pt-2 bg-white border-t border-gray-100">
              <CommentInput />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default CommentsComponent; 