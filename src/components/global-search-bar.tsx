'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSearchStore } from '@/store/search-store'
import { X } from 'lucide-react'

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function GlobalSearchBar({ placeholder = "Buscar fanverse...", className = "", onSearch }: GlobalSearchBarProps) {
  const { query: globalQuery, setQuery: setGlobalQuery, resetSearch } = useSearchStore()
  const [localQuery, setLocalQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (globalQuery !== localQuery) {
      setLocalQuery(globalQuery)
    }
  }, [globalQuery])
  
  useEffect(() => {
    if (pathname === '/explorar') {
      const q = searchParams.get('q') || ''
      if (q !== globalQuery) {
        setGlobalQuery(q)
        if (!q && globalQuery) {
          resetSearch()
        }
      }
    }
  }, [pathname, searchParams, globalQuery, setGlobalQuery, resetSearch])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
  }

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = localQuery.trim()
    
    if (pathname === '/explorar' && onSearch) {
      onSearch(trimmedQuery)
    } else {
      if (!trimmedQuery) return
      setGlobalQuery(trimmedQuery)
      router.push(`/explorar?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }, [localQuery, pathname, onSearch, router, setGlobalQuery])

  const handleClearSearch = useCallback(() => {
    setLocalQuery('')
    resetSearch()
    
    if (pathname === '/explorar') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      router.replace(`/explorar?${params.toString()}`, { scroll: false })
      
      if (onSearch) {
        onSearch('')
      }
    }
  }, [resetSearch, pathname, router, searchParams, onSearch])

  return (
    <form onSubmit={handleSearchSubmit} className={`relative w-full ${className}`}>
      <input 
        type="search" 
        placeholder={placeholder}
        value={localQuery}
        onChange={handleInputChange}
        className="w-full py-2 pl-4 pr-16 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
      />
      {localQuery && (
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
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 p-1"
        aria-label="Buscar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </button>
    </form>
  )
} 