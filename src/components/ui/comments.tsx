"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, MoreVertical, X } from "lucide-react";
import Link from "next/link";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import UserAvatar from "./user-avatar";
import SocialButton from "./social-button";

// Tipos de datos para comentarios
interface CommentAuthor {
  name: string;
  username: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  author: CommentAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
}

interface CommentsProps {
  postId: number;
  commentsCount: number;
  initialComments?: Comment[];
  hideButton?: boolean;
  forceShowComments?: boolean;
}

const CommentsComponent: React.FC<CommentsProps> = ({ 
  postId, 
  commentsCount,
  initialComments = [],
  hideButton = false,
  forceShowComments = false 
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showComments, setShowComments] = useState(forceShowComments);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { isMobile } = useDeviceDetect();
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    setShowComments(forceShowComments);
  }, [forceShowComments]);

  // Cargar comentarios (simulado)
  useEffect(() => {
    if ((showComments || sheetOpen) && comments.length === 0) {
      // Datos de ejemplo (en un caso real, se cargarían de la API)
      const mockComments: Comment[] = [
        {
          id: 1,
          content: "¡Me encanta este contenido! Estoy tan emocionada con el nuevo álbum.",
          author: {
            name: "Laura Sánchez",
            username: "laurablink",
            avatar: "L"
          },
          createdAt: "2h",
          likes: 24,
          dislikes: 1,
          replies: [
            {
              id: 3,
              content: "Coincido totalmente, las canciones son increíbles.",
              author: {
                name: "Carlos Méndez",
                username: "carlosfan",
                avatar: "C"
              },
              createdAt: "1h",
              likes: 8,
              dislikes: 0,
            }
          ]
        },
        {
          id: 2,
          content: "¿Alguien sabe cuándo saldrá el video musical completo?",
          author: {
            name: "Miguel Torres",
            username: "miguekpop",
            avatar: "M"
          },
          createdAt: "45m",
          likes: 12,
          dislikes: 0,
        },
      ];
      
      setComments(initialComments.length > 0 ? initialComments : mockComments);
    }
  }, [showComments, sheetOpen, comments.length, initialComments]);

  // Manejar la apertura de comentarios según el dispositivo
  const handleCommentsClick = () => {
    if (isMobile) {
      setSheetOpen(true);
    } else {
      setShowComments(!showComments);
    }
  };

  // Manejar el envío de un nuevo comentario
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: Date.now(),
      content: newComment,
      author: {
        name: "Usuario Actual",
        username: "current_user",
        avatar: "U"
      },
      createdAt: "ahora",
      likes: 0,
      dislikes: 0
    };
    
    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  // Manejar el envío de una respuesta a un comentario
  const handleSubmitReply = () => {
    if (!replyContent.trim() || !replyingTo) return;

    const newReply: Comment = {
      id: Date.now(),
      content: replyContent,
      author: {
        name: "Usuario Actual",
        username: "current_user",
        avatar: "U"
      },
      createdAt: "ahora",
      likes: 0,
      dislikes: 0
    };

    // Función recursiva para añadir la respuesta al comentario correcto
    const addReplyToComment = (comment: Comment): Comment => {
      if (comment.id === replyingTo.id) {
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
    setReplyContent("");
    setReplyingTo(null);
  };

  // Manejar clic en responder
  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    setReplyContent("");
  };

  // Cancelar respuesta
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  // Renderizar un comentario individual
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`py-3 ${!isReply ? "border-b border-gray-100" : "pl-4 ml-6 mt-3 border-l-2 border-gray-100"}`}
    >
      <div className="flex gap-2">
        <UserAvatar
          text={comment.author.avatar || comment.author.username}
          username={comment.author.username}
          linkToProfile={true}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/perfil/${comment.author.username}`} className="text-sm font-medium text-gray-900 hover:text-purple-700">
              {comment.author.username}
            </Link>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-xs">{comment.createdAt}</span>
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-gray-100 p-1">
                <MoreVertical size={14} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
          <div className="flex items-center gap-1 mt-2">
            <SocialButton
              icon={ThumbsUp}
              label={comment.likes}
              size="sm"
              variant={comment.likes > 0 ? "active" : "default"}
              className="h-6 text-xs px-1"
            />
            <SocialButton
              icon={ThumbsDown}
              label={comment.dislikes}
              size="sm"
              className="h-6 text-xs px-1"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleReplyClick(comment)}
              className="text-xs text-gray-500 hover:text-purple-700 hover:bg-transparent p-0 h-auto ml-2"
            >
              Responder
            </Button>
          </div>
          
          {replyingTo?.id === comment.id && (
            <ReplyInput comment={comment} />
          )}
          
          {comment.replies && comment.replies.map(reply => (
            renderComment(reply, true)
          ))}
        </div>
      </div>
    </div>
  );

  // Componente para ingresar una respuesta
  const ReplyInput = ({ comment }: { comment: Comment }) => (
    <div className="flex items-start gap-2 mt-3 ml-8 pl-4 border-l-2 border-gray-100">
      <UserAvatar 
        text="U"
        size="sm"
      />
      <div className="flex-1 relative">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <span>Respondiendo a <span className="font-medium">{comment.author.username}</span></span>
          <button 
            onClick={handleCancelReply}
            className="ml-2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={14} />
          </button>
        </div>
        <textarea
          placeholder={`Escribe una respuesta a ${comment.author.username}...`}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 min-h-[60px] pr-10"
          autoFocus
        />
        <button 
          onClick={handleSubmitReply}
          disabled={!replyContent.trim()}
          className={`absolute right-2 bottom-2 p-1.5 rounded-full ${
            replyContent.trim() 
              ? "text-purple-600 hover:bg-purple-50" 
              : "text-gray-300"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // Componente para ingresar un comentario
  const CommentInput = () => (
    <div className="flex items-start gap-3 mt-4">
      <UserAvatar 
        text="U"
        size="sm"
      />
      <div className="flex-1 relative">
        <textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 min-h-[80px] pr-10"
        />
        <button 
          onClick={handleSubmitComment}
          disabled={!newComment.trim()}
          className={`absolute right-2 bottom-2 p-1.5 rounded-full ${
            newComment.trim() 
              ? "text-purple-600 hover:bg-purple-50" 
              : "text-gray-300"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // Renderizar contenido de comentarios directamente
  const CommentsContent = () => (
    <>
      <CommentInput />
      <div className="mt-4">
        {comments.map(comment => renderComment(comment))}
      </div>
    </>
  );

  return (
    <>
      {/* Botón para mostrar comentarios (opcionalmente oculto) */}
      {!hideButton && (
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

      {/* Para pantallas de PC, mostrar directamente el contenido si forceShowComments es true */}
      {forceShowComments && !isMobile && (
        <CommentsContent />
      )}

      {/* Visualización inline para escritorio si no es forzado */}
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

      {/* Bottom Sheet para móvil */}
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
    </>
  );
};

export default CommentsComponent; 