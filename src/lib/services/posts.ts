import { supabase } from "@/lib/supabase/client";
import { Post, PostWithDetails, Profile, Fandom, PostVote } from "@/types/supabase";

/**
 * Obtiene una publicación por su slug con los detalles de autor y fandom
 */
export async function getPostBySlug(slug: string): Promise<PostWithDetails | null> {
  // Obtener el post por su slug
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('moderation_status', 'approved')
    .single();

  if (error || !post) return null;

  // Obtener el autor del post
  const { data: author } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.user_id)
    .single();

  // Obtener el fandom del post
  const { data: fandom } = await supabase
    .from('fandoms')
    .select('*')
    .eq('id', post.fandom_id)
    .single();

  // Construir el objeto completo
  const postWithDetails: PostWithDetails = {
    post: post as Post,
    author: author as Profile,
    fandom: fandom as Fandom
  };

  return postWithDetails;
}

/**
 * Obtiene el voto del usuario actual en una publicación específica
 */
export async function getUserVoteOnPost(postId: string, userId: string): Promise<PostVote | null> {
  const { data, error } = await supabase
    .from('post_votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as PostVote;
}

/**
 * Agrega o actualiza un voto en una publicación
 */
export async function voteOnPost(postId: string, voteType: number): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user || !user.user) return false;
  
  const userId = user.user.id;
  
  // Verificar si el usuario ya votó en esta publicación
  const { data: existingVote } = await supabase
    .from('post_votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();
  
  if (existingVote) {
    // Si ya existe un voto y es del mismo tipo, eliminarlo (toggle)
    if (existingVote.vote_type === voteType) {
      const { error } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      return !error;
    }
    
    // Si ya existe un voto pero es diferente, actualizarlo
    const { error } = await supabase
      .from('post_votes')
      .update({ vote_type: voteType })
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    return !error;
  }
  
  // Si no existe un voto, crear uno nuevo
  const { error } = await supabase
    .from('post_votes')
    .insert([
      { post_id: postId, user_id: userId, vote_type: voteType }
    ]);
  
  return !error;
}

/**
 * Obtener los comentarios de una publicación
 */
export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles: user_id (*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Crea un reporte sobre una publicación
 */
export async function reportPost(postId: string, fandomId: string, reason: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user || !user.user) return false;
  
  const { error } = await supabase
    .from('reports')
    .insert([
      {
        reporter_id: user.user.id,
        post_id: postId,
        fandom_id: fandomId,
        reason: reason
      }
    ]);
  
  return !error;
} 