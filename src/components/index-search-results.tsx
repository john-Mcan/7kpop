'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import UserAvatar from "./ui/user-avatar"
import { formatDistanceStrict } from "date-fns"
import { es } from "date-fns/locale"
import { Users } from "lucide-react"

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
  upvotes?: number;
  members_count?: number;
  rank?: number;
}

interface IndexSearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}

export default function IndexSearchResults({ query, results, isLoading }: IndexSearchResultsProps) {
  if (!query.trim()) return null;

  // Separar resultados por tipo
  const fandomResults = results.filter(r => r.type === 'fandom');
  const postResults = results.filter(r => r.type === 'post');
  
  return (
    <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-lg border border-gray-100 shadow-md bg-white overflow-hidden max-h-[80vh] overflow-y-auto">
      <div className="p-3">
        <div className="px-2 py-1 mb-2">
          <h3 className="text-sm font-medium text-gray-700">
            {isLoading 
              ? 'Buscando...' 
              : results.length > 0 
                ? `Resultados para "${query}"` 
                : `No se encontraron resultados para "${query}"`
            }
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {/* Primero mostrar fandoms si hay */}
            {fandomResults.length > 0 && (
              <div className="mb-3">
                {fandomResults.map(result => (
                  <FandomResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
            
            {/* Luego mostrar posts */}
            {postResults.length > 0 && (
              <div>
                {postResults.map(result => (
                  <PostResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-100">
              <Button 
                variant="link" 
                className="w-full justify-center text-purple-600 hover:text-purple-800 font-medium"
                onClick={() => window.open(`/explorar?q=${encodeURIComponent(query)}`, '_blank')}
              >
                Ver más resultados
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No se encontraron resultados para tu búsqueda.
            </p>
            <Button
              variant="link"
              className="mt-2 text-purple-600"
              onClick={() => window.open(`/explorar?q=${encodeURIComponent(query)}`, '_blank')}
            >
              Buscar en Explorar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PostResultCard({ result }: { result: SearchResult }) {
  const isFandomPost = !!result.fandom_id;
  
  const postUrl = isFandomPost 
    ? `/fandoms/${result.fandom_slug || ''}/posts/${result.slug || result.id}`
    : (result.author_name ? `/perfil/${result.author_name}/posts/${result.slug || result.id}` : '#');
  
  const formattedDate = result.created_at 
    ? formatDistanceStrict(new Date(result.created_at), new Date(), { addSuffix: true, locale: es }) 
    : '';

  return (
    <Card className="overflow-hidden border-gray-100 hover:shadow-sm transition-shadow mb-2">
      <CardContent className="p-3">
        {isFandomPost && result.fandom_name && (
          <div className="flex items-center gap-1.5 mb-1">
            <UserAvatar 
              src={result.fandom_avatar_url}
              text={result.fandom_name.charAt(0)}
              size="sm"
            />
            <Link 
              href={`/fandoms/${result.fandom_slug || ''}`} 
              className="text-xs font-medium text-purple-600 hover:underline"
            >
              {result.fandom_name}
            </Link>
          </div>
        )}
        
        <Link href={postUrl} className="block text-sm font-semibold text-gray-800 hover:text-purple-700 transition-colors mb-1 leading-tight">
          {result.title}
        </Link>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          {result.author_name && (
            <>
              {isFandomPost && <span>por</span>}
              <Link 
                href={`/perfil/${result.author_name}`}
                className="font-medium text-gray-600 hover:text-purple-700 hover:underline"
              >
                @{result.author_name}
              </Link>
              <span>•</span>
            </>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          {result.upvotes !== undefined && (
            <>
              <span>•</span>
              <span className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-3 h-3 mr-1"
                >
                  <path d="m19 14-7-7-7 7"></path>
                </svg>
                {result.upvotes}
              </span>
            </>
          )}
        </div>
        
        {result.content && (
          <p className="text-xs text-gray-600 line-clamp-1">
            {result.content.length > 100 ? `${result.content.substring(0, 100)}...` : result.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FandomResultCard({ result }: { result: SearchResult }) {
  const fandomUrl = `/fandoms/${result.fandom_slug || result.id}`;

  return (
    <Card className="overflow-hidden border-gray-100 hover:shadow-sm transition-shadow mb-2">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <UserAvatar 
            src={result.fandom_avatar_url}
            text={result.title.charAt(0)}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <Link href={fandomUrl} className="block text-sm font-semibold text-gray-800 hover:text-purple-700 transition-colors leading-tight">
              {result.title}
            </Link>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <Users size={12} className="text-gray-400" />
              <span>{result.members_count || 0} miembros</span>
            </div>
            
            {result.content && (
              <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                {result.content.length > 100 ? `${result.content.substring(0, 100)}...` : result.content}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 