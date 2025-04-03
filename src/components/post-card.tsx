import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    slug: string;
    created_at: string;
    profiles: {
      username: string;
    };
    fandoms: {
      slug: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  // Extraer posibles tags del contenido (simplificado)
  const tags = post.content.split(' ').slice(0, 3).map(tag => `#${tag}`);
  
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <Link href={`/fandoms/${post.fandoms.slug}/posts/${post.slug}`} className="text-md font-medium hover:text-purple-600 transition-colors">
          {post.title}
        </Link>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <span>{post.profiles.username}</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString('es')}</span>
        </div>
        <div className="flex gap-1 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 