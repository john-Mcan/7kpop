import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, MessageSquare, Share, MoreVertical, Flag } from "lucide-react";

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
  // Colores de los fandoms
  const fandomColors: Record<string, string> = {
    "BTS": "bg-gradient-to-br from-purple-600 to-indigo-600",
    "BLACKPINK": "bg-gradient-to-br from-pink-500 to-purple-600",
    "TWICE": "bg-gradient-to-br from-purple-500 to-pink-500",
    "Stray Kids": "bg-gradient-to-br from-indigo-600 to-blue-500",
    "aespa": "bg-gradient-to-br from-purple-600 to-purple-900",
    "Red Velvet": "bg-gradient-to-br from-red-500 to-purple-600",
    "IVE": "bg-gradient-to-br from-blue-500 to-indigo-600",
    "ITZY": "bg-gradient-to-br from-pink-400 to-red-500",
  };

  const getFandomColor = (name: string) => {
    return fandomColors[name] || "bg-gradient-to-br from-purple-600 to-indigo-600";
  };

  return (
    <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-3 flex flex-row items-start gap-3">
        <Link href={`/fandoms/${post.fandom.name.toLowerCase()}`} className={`w-10 h-10 rounded-full text-white flex-shrink-0 flex items-center justify-center font-semibold ${getFandomColor(post.fandom.name)}`}>
          {post.fandom.avatar}
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/fandoms/${post.fandom.name.toLowerCase()}`} className="font-semibold text-sm hover:text-purple-700 transition-colors">
              {post.fandom.name}
            </Link>
            <p className="text-gray-500 text-xs">• {post.createdAt}</p>
          </div>
          <div className="flex items-center mt-1">
            <Link href={`/perfil/${post.author.username}`} className="text-xs text-gray-600 hover:text-purple-700 transition-colors">
              {post.author.username}
            </Link>
            <div className="ml-2 flex flex-wrap">
              {post.author.favoriteGroups.map((group, idx) => (
                <Link href={`/fandoms/${group.toLowerCase()}`} key={idx} className="inline-block px-1.5 py-0.5 bg-gray-100 text-purple-700 rounded-full text-[10px] mr-1 mb-1 hover:bg-purple-100 transition-colors">
                  {group}
                </Link>
              ))}
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
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs h-8 text-purple-700 hover:bg-purple-50 rounded-lg">
            <ThumbsUp size={16} />
            <span className="font-medium">{post.votes.up}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs h-8 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ThumbsDown size={16} />
            <span>{post.votes.down}</span>
          </Button>
          <Link href={`/post/${post.id}#comments`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs h-8 text-gray-600 hover:bg-gray-100 rounded-lg">
              <MessageSquare size={16} />
              <span>{post.comments}</span>
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-8 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Share size={16} />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-xs h-8 text-gray-600 hover:bg-gray-100 rounded-lg ml-0.5">
            <Flag size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostFeed; 