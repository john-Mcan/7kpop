'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSearchStore } from '@/store/search-store'

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function GlobalSearchBar({ placeholder = "Buscar fanverse...", className = "", onSearch }: GlobalSearchBarProps) {
  const { query, setQuery, search } = useSearchStore()
  const [localQuery, setLocalQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Sincronizar con URL si estamos en la página explorar
    if (pathname === '/explorar') {
      const q = searchParams.get('q')
      if (q) {
        setLocalQuery(q)
        setQuery(q)
      }
    }
  }, [pathname, searchParams, setQuery])
  
  // Añadir efecto para sincronizar el input con los cambios en el store global
  useEffect(() => {
    // Sincronizar el estado local con el estado global cuando éste cambie
    // El estado global se limpia desde handleSearch en la página explorar
    setLocalQuery(query);
  }, [query]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!localQuery.trim()) return;
    
    setQuery(localQuery)
    
    // Si ya estamos en la página explorar, actualizar los resultados sin navegar
    if (pathname === '/explorar') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', localQuery)
      router.replace(`/explorar?${params.toString()}`)
      await search(localQuery)
      // Si hay una función onSearch proporcionada, llamarla después de buscar
      if (onSearch) {
        onSearch(localQuery)
      }
    } else {
      // Si estamos en otra página, navegar a explorar con la consulta
      router.push(`/explorar?q=${encodeURIComponent(localQuery)}`)
      
      // Limpiar el campo después de la navegación
      // Esto es especialmente útil cuando se busca desde la página principal
      setTimeout(() => {
        setLocalQuery('')
      }, 100)
    }
  }
  
  return (
    <form onSubmit={handleSearch} className={`relative w-full ${className}`}>
      <input 
        type="search" 
        placeholder={placeholder}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </button>
    </form>
  )
} 