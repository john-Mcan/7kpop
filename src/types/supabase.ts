export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Fandom {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string | null;
  created_at: string;
  created_by: string | null;
  slug: string | null;
  category: string | null;
}

export interface Post {
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
  moderation_status: 'pending_review' | 'approved' | 'rejected';
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

export interface PostVote {
  user_id: string;
  post_id: string;
  vote_type: number; // 1 para upvote, -1 para downvote
  created_at: string;
}

export interface CommentVote {
  user_id: string;
  comment_id: string;
  vote_type: number; // 1 para upvote, -1 para downvote
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reason: string;
  post_id: string | null;
  comment_id: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  fandom_id: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface FandomMember {
  user_id: string;
  fandom_id: string;
  joined_at: string;
  status: 'active' | 'muted' | 'banned';
}

export interface FandomModerator {
  user_id: string;
  fandom_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

// Tipos compuestos para la vista de posts
export interface PostWithDetails {
  post: Post;
  author: Profile;
  fandom: Fandom;
  userVote?: PostVote | null;
}

// Tipos compuestos para la vista de comentarios
export interface CommentWithDetails {
  comment: Comment;
  author: Profile;
  userVote?: CommentVote | null;
  replies?: CommentWithDetails[];
} 