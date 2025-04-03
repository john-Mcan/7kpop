import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useSearchStore } from "@/store/search-store";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  content?: string;
  author_name?: string;
  created_at: string;
  fandom_slug?: string;
  slug?: string;
}

export default function SearchResults() {
  const { results, isLoading, activeTab, query } = useSearchStore();
  
  // Si no hay consulta, no mostrar resultados
  if (!query) return null;
  
  // Filtrar resultados según la pestaña activa
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
    <div>
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="space-y-3">
        {items.slice(0, 3).map(renderFunction)}
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
  return (
    <Card key={post.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <Link href={`/fandoms/${post.fandom_slug || ''}/posts/${post.slug || ''}`} className="text-md font-medium hover:text-purple-600 transition-colors">
          {post.title}
        </Link>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <span>@{post.author_name}</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString('es')}</span>
        </div>
        <div className="text-sm text-gray-600 mt-2 line-clamp-2">
          {post.content?.substring(0, 120)}
        </div>
      </CardContent>
    </Card>
  );
}

function renderUserResult(user: SearchResult) {
  return (
    <Card key={user.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/perfil/${user.title}`} className="text-md font-medium hover:text-purple-600 transition-colors">
              @{user.title}
            </Link>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {user.content || 'Sin biografía'}
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-sm">
            Seguir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderFandomResult(fandom: SearchResult) {
  return (
    <Card key={fandom.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/fandoms/${fandom.slug || ''}`} className="text-md font-medium hover:text-purple-600 transition-colors">
              {fandom.title}
            </Link>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {fandom.content || 'Sin descripción'}
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-sm text-purple-600 border-purple-200 hover:bg-purple-50">
            Seguir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 