import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useSearchStore } from "@/store/search-store";
import Link from "next/link";
import UserAvatar from "./ui/user-avatar";
import { formatDistanceStrict } from "date-fns";
import { User } from 'lucide-react';
import { es } from "date-fns/locale";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  content?: string;
  author_id?: string;
  author_name?: string;
  created_at: string;
  fandom_id?: string;
  fandom_name?: string;
  fandom_avatar_url?: string | null;
  fandom_slug?: string;
  slug?: string;
  post_image_url?: string | null;
  rank?: number;
}

export default function SearchResults() {
  const { results, isLoading, activeTab, query } = useSearchStore();
  
  if (!query) return null;
  
  const filteredResults = activeTab === 'todo' 
    ? results 
    : results.filter((item: SearchResult) => {
        if (activeTab === 'posts') return item.type === 'post';
        if (activeTab === 'usuarios') return item.type === 'user';
        if (activeTab === 'fandoms') return item.type === 'fandom';
        return false;
      });
      
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  
  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
      </div>
    );
  }
  
  return (
    <>
      <TabsContent value="todo" className="mt-0">
        <div className="space-y-6">
          {renderResultGroup('Posts', filteredResults.filter((r: SearchResult) => r.type === 'post'), renderPostResult)}
          {renderResultGroup('Usuarios', filteredResults.filter((r: SearchResult) => r.type === 'user'), renderUserResult)}
          {renderResultGroup('Fandoms', filteredResults.filter((r: SearchResult) => r.type === 'fandom'), renderFandomResult)}
        </div>
      </TabsContent>
      
      <TabsContent value="posts" className="mt-0">
        <div className="space-y-3">
          {filteredResults.map((item: SearchResult) => renderPostResult(item))}
        </div>
      </TabsContent>
      
      <TabsContent value="usuarios" className="mt-0">
        <div className="space-y-3">
          {filteredResults.map((item: SearchResult) => renderUserResult(item))}
        </div>
      </TabsContent>
      
      <TabsContent value="fandoms" className="mt-0">
        <div className="space-y-3">
          {filteredResults.map((item: SearchResult) => renderFandomResult(item))}
        </div>
      </TabsContent>
    </>
  );
}

function renderResultGroup(title: string, items: SearchResult[], renderFunction: (item: SearchResult) => JSX.Element) {
  if (items.length === 0) return null;
  
  return (
    <div key={`group-${title.toLowerCase()}`}>
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="space-y-3">
        {items.slice(0, 3).map((item, index) => (
          <div key={item.id || `${title}-${index}`}>
            {renderFunction(item)}
          </div>
        ))}
      </div>
      {items.length > 3 && (
        <div className="mt-2 text-right">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-purple-600"
            onClick={() => useSearchStore.getState().setActiveTab(
              title === 'Posts' ? 'posts' : 
              title === 'Usuarios' ? 'usuarios' : 'fandoms'
            )}
          >
            Ver más {title.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  );
}

function renderPostResult(post: SearchResult) {
  const isFandomPost = !!post.fandom_id;
  const postUrl = isFandomPost
    ? `/fandoms/${post.fandom_slug || ''}/posts/${post.slug || post.id}`
    : (post.author_name ? `/perfil/${post.author_name}` : '#');
    
  const imageUrl = post.post_image_url;
  const fandomAvatar = post.fandom_avatar_url;
  const fandomName = post.fandom_name;

  const formattedDate = post.created_at ? formatDistanceStrict(new Date(post.created_at), new Date(), { addSuffix: true, locale: es }) : '';

  return (
    <div key={post.id} className="relative">
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden">
        {imageUrl && (
          <div className="w-full h-32 sm:h-40 bg-gray-100 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={`Imagen de ${post.title}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        )}
        
        <CardContent className="p-3 sm:p-4">
          {isFandomPost && fandomName && (
             <div className="flex items-center gap-1.5 mb-1.5">
                <UserAvatar 
                    src={fandomAvatar}
                    text={fandomName.charAt(0)}
                    size="sm"
                />
                <Link 
                    href={`/fandoms/${post.fandom_slug || ''}`} 
                    className="text-xs font-medium text-purple-600 hover:underline"
                >
                    {fandomName}
                </Link>
            </div>
          )}
          
          <Link href={postUrl} className="block text-md font-semibold text-gray-800 hover:text-purple-700 transition-colors mb-1 leading-tight">
            {post.title}
          </Link>
          
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            {!isFandomPost && <User size={12} className="text-gray-400" />}
            {post.author_name && (
              <>
                {!isFandomPost ? null : <span>por</span>}
                 <Link 
                    href={`/perfil/${post.author_name}`}
                    className="font-medium text-gray-600 hover:text-purple-700 hover:underline"
                 >
                    @{post.author_name}
                 </Link>
                <span>•</span>
              </>
            )}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
          
          <div className="text-sm text-gray-600 line-clamp-2">
            {post.content?.substring(0, 150)} {post.content && post.content.length > 150 ? '...' : ''}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderUserResult(user: SearchResult) {
  const profileUrl = `/perfil/${user.title || user.id}`;
  
  return (
    <Card key={user.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={profileUrl} className="text-md font-medium hover:text-purple-600 transition-colors truncate block">
              @{user.title}
            </Link>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {user.content || 'Sin biografía'} 
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-sm flex-shrink-0">
            Ver Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderFandomResult(fandom: SearchResult) {
  const fandomUrl = `/fandoms/${fandom.slug || fandom.id}`;

  return (
    <Card key={fandom.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <UserAvatar 
                src={fandom.fandom_avatar_url}
                text={fandom.title.charAt(0)}
                size="md"
            />
            <div className="flex-1 min-w-0">
              <Link href={fandomUrl} className="text-md font-medium hover:text-purple-600 transition-colors truncate block">
                {fandom.title}
              </Link>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {fandom.content || 'Sin descripción'}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-sm text-purple-600 border-purple-200 hover:bg-purple-50 flex-shrink-0">
            Visitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 