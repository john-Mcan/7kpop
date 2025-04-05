'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import IndexSearchResults from '@/components/index-search-results'
import { useClickAway } from '@/hooks/use-click-away'

interface IndexSearchBarProps {
  placeholder?: string;
  className?: string;
}

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

// Tipo más específico para la estructura de datos devuelta por Supabase
type SupabasePostResult = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  slug: string;
  user_id: string;
  profiles: {
    username: string;
  };
  fandom_id: string | null;
  fandoms: {
    name: string;
    slug: string;
    avatar_url: string | null;
  } | null;
}

export default function IndexSearchBar({ placeholder = "Buscar fanverse...", className = "" }: IndexSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  
  useClickAway(searchBarRef, () => {
    setShowResults(false)
  })
  
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }
    
    setIsSearching(true)
    
    try {
      // 1. Buscar fandoms
      const { data: fandomsData, error: fandomsError } = await supabase
        .from('fandoms')
        .select(`
          id, name, description, slug, avatar_url, 
          members:fandom_members(count)
        `)
        .eq('status', 'approved')
        .textSearch('name || description', searchQuery, { type: 'websearch' })
        .limit(3)
      
      if (fandomsError) throw fandomsError
      
      // Formatear resultados de fandoms
      const formattedFandoms: SearchResult[] = fandomsData.map((fandom: any) => ({
        id: fandom.id,
        type: 'fandom',
        title: fandom.name,
        content: fandom.description,
        fandom_slug: fandom.slug,
        fandom_avatar_url: fandom.avatar_url,
        members_count: fandom.members?.count || 0,
        created_at: fandom.created_at || new Date().toISOString()
      }))
      
      // 2. Buscar posts populares con coincidencia
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, title, content, created_at, upvotes, downvotes, slug,
          user_id, profiles:user_id(username),
          fandom_id, fandoms:fandom_id(name, slug, avatar_url)
        `)
        .eq('moderation_status', 'approved')
        .textSearch('title || content', searchQuery, { type: 'websearch' })
        .order('upvotes', { ascending: false })
        .limit(4)
      
      if (postsError) throw postsError
      
      // Formatear resultados de posts
      const formattedPosts: SearchResult[] = postsData.map((post: any) => ({
        id: post.id,
        type: 'post',
        title: post.title,
        content: post.content,
        author_id: post.user_id,
        author_name: post.profiles?.username,
        created_at: post.created_at,
        fandom_id: post.fandom_id,
        fandom_name: post.fandoms?.name,
        fandom_slug: post.fandoms?.slug,
        fandom_avatar_url: post.fandoms?.avatar_url,
        slug: post.slug,
        upvotes: post.upvotes
      }))
      
      // Combinar resultados: primero fandoms, luego posts
      const combinedResults = [...formattedFandoms, ...formattedPosts].slice(0, 5)
      setResults(combinedResults)
    } catch (error) {
      console.error('Error al buscar:', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (query.trim()) {
      setShowResults(true)
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(query)
      }, 300)
    } else {
      setShowResults(false)
      setResults([])
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  
  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }
  
  const handleFocus = () => {
    if (query.trim()) {
      setShowResults(true)
    }
  }

  return (
    <div ref={searchBarRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input 
          type="search" 
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="w-full py-2 pl-4 pr-16 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
        />
        {query && (
          <button 
            type="button" 
            onClick={handleClearSearch} 
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
        <button 
          type="button" 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 p-1"
          aria-label="Buscar"
        >
          <Search size={16} />
        </button>
      </div>
      
      {showResults && (
        <IndexSearchResults 
          query={query}
          results={results}
          isLoading={isSearching}
        />
      )}
    </div>
  )
} 