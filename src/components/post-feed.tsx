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
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  fandom_id: string;
  upvotes: number;
  downvotes: number;
  image_urls: string[] | null;
  video_url: string | null;
  link_url: string | null;
  slug: string | null;
  internal_path: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  fandoms: {
    name: string;
    slug: string;
    avatar_url: string | null;
  } | null;
};

type PostFeedProps = {
  fandomSlug?: string;
  userId?: string;
};

const PostFeed = ({ fandomSlug, userId }: PostFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      setPosts([]);

      try {
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles!user_id ( username, avatar_url ),
            fandoms ( name, slug, avatar_url )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error: dbError } = await query;

        if (dbError) {
          throw dbError;
        }

        setPosts(data || []);

      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError("No se pudieron cargar las publicaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            </CardContent>
            <CardFooter className="p-3 pt-2 flex justify-between border-t border-gray-100 mt-2">
              <div className="flex gap-3">
                <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                 <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                 <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 text-center border border-red-200 shadow-sm">
        <h3 className="text-lg font-medium text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
             {userId ? "Este usuario aún no ha publicado nada" : "No hay publicaciones para mostrar"} 
          </h3>
          <p className="text-gray-600 mb-4">
             {userId ? "Anímale a compartir algo o explora otros perfiles." : "Explora otros fandoms o crea la primera publicación."} 
          </p>
        </div>
      )}
    </div>
  );
};

export const PostCard = ({ post }: { post: Post }) => {
  const [showComments, setShowComments] = useState(false);
  const { isMobile } = useDeviceDetect();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const handleCommentsToggle = () => {
    setShowComments(!showComments);
  };

  const handleShareOpenChange = (isOpen: boolean) => {
    setIsShareOpen(isOpen);
    if (isOpen) {
      setIsReportOpen(false);
    }
  };

  const handleReportOpenChange = (isOpen: boolean) => {
    setIsReportOpen(isOpen);
    if (isOpen) {
      setIsShareOpen(false);
    }
  };

  const isFandomPost = post.fandoms !== null;
  const fandomSlug = post.fandoms?.slug || '';
  const fandomName = post.fandoms?.name || "Post de Perfil";
  const fandomAvatarText = fandomName.charAt(0).toUpperCase();

  const authorUsername = post.profiles?.username || "Usuario Desconocido";
  const authorAvatarUrl = post.profiles?.avatar_url;
  const authorProfileUrl = `/perfil/${authorUsername}`;

  const postUrl = post.internal_path || (isFandomPost ? `/fandoms/${fandomSlug}/posts/${post.slug || post.id}` : authorProfileUrl);

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es });

  const mainImageUrl = post.image_urls && post.image_urls.length > 0 ? post.image_urls[0] : null;

  return (
    <div className="relative">
      <Link href={postUrl} className="absolute inset-0 z-10">
        <span className="sr-only">Ver publicación</span>
      </Link>
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
          {isFandomPost ? (
            <>
              <Link href={`/fandoms/${fandomSlug}`} className="flex-shrink-0 w-8 h-8 relative z-20">
                <UserAvatar 
                  text={fandomAvatarText}
                  size="md"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/fandoms/${fandomSlug}`} className="font-semibold text-xs text-gray-700 hover:text-purple-700 transition-colors relative z-20">
                    {fandomName}
                  </Link>
                  <p className="text-gray-500 text-xs">• {formattedDate}</p>
                </div>
                <div className="flex items-center">
                  <Link href={authorProfileUrl} className="text-xs text-gray-500 hover:text-purple-700 transition-colors relative z-20">
                    por {authorUsername}
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href={authorProfileUrl} className="flex-shrink-0 w-8 h-8 relative z-20">
                 <UserAvatar 
                   text={authorUsername.charAt(0).toUpperCase()}
                   src={authorAvatarUrl}
                   size="md"
                 />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={authorProfileUrl} className="font-semibold text-sm text-gray-800 hover:text-purple-700 transition-colors relative z-20">
                    {authorUsername}
                  </Link>
                  <p className="text-gray-500 text-xs">• {formattedDate}</p>
                </div>
              </div>
            </>
          )}
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-gray-100 relative z-20">
            <span className="sr-only">Mas opciones</span>
            <MoreVertical size={15} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          {isFandomPost && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2 relative hover:text-purple-700 transition-colors">
              {post.title} 
            </h3>
          )}
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
          
          {mainImageUrl && (
            <div className="block mt-3 rounded-lg overflow-hidden bg-gray-100 w-full h-64 relative">
              <img 
                src={mainImageUrl}
                alt={`Imagen de ${fandomName}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop') {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            </div>
          )}

          {post.video_url && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-100 aspect-video relative">
              <iframe
                src={post.video_url}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}

          {post.link_url && (
            <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50 relative">
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-blue-600 flex-shrink-0" />
                <a 
                  href={post.link_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all relative z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.link_url}
                </a>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-2 flex justify-between border-t border-gray-100 mt-2 relative z-20">
          <div className="flex items-center gap-3">
            <SocialButton 
              icon={ThumbsUp} 
              label={post.upvotes}
              variant="active"
            />
            <SocialButton 
              icon={ThumbsDown} 
              label={post.downvotes}
            />
            {isMobile ? (
              <CommentsComponent 
                postId={post.id}
                commentsCount={0}
              />
            ) : (
              <SocialButton 
                icon={MessageSquare} 
                label={0}
                onClick={handleCommentsToggle}
              />
            )}
          </div>
          
          <div className="flex items-center">
            <SharePost 
              postTitle={post.title} 
              postSlug={post.slug || post.id}
              isReportOpen={isReportOpen}
              onOpenChange={handleShareOpenChange}
            />
            <ReportPost 
              postId={post.id}
              postSlug={post.slug || post.id}
              isShareOpen={isShareOpen}
              onOpenChange={handleReportOpenChange}
              fandomId={post.fandom_id}
            />
          </div>
        </CardFooter>
        
        {showComments && !isMobile && (
          <div className="border-t border-gray-100 relative z-20">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Comentarios</h3>
              <CommentsComponent 
                postId={post.id}
                commentsCount={0}
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