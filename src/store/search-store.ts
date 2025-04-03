import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface SearchState {
  query: string
  activeTab: string
  results: any[] 
  isLoading: boolean
  setQuery: (query: string) => void
  setActiveTab: (tab: string) => void
  search: (q?: string) => Promise<void>
  clearHistory: () => Promise<void>
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      activeTab: 'todo',
      results: [],
      isLoading: false,
      
      setQuery: (query: string) => set({ query }),
      
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      
      search: async (q?: string) => {
        const query = q || get().query
        
        if (!query || query.length < 2) {
          set({ results: [] })
          return
        }
        
        set({ isLoading: true })
        
        try {
          // Comentar o eliminar esta parte para evitar duplicados con page.tsx
          // La inserción debe hacerse solo en un lugar (ya lo hace handleSearch)
          /*
          // Guardar la búsqueda en historial
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            console.log('Guardando búsqueda para usuario:', user.id)
            const { error } = await supabase.from('user_searches').insert({
              query,
              user_id: user.id
            })
            
            if (error) {
              console.error('Error al guardar búsqueda:', error)
            }
          }
          */
          
          // Ejecutar búsqueda
          const searchTerms = query.trim().split(/\s+/).join(' & ')
          const { data, error } = await supabase.rpc('search_content', {
            search_term: searchTerms
          })
          
          if (error) throw error
          
          set({ results: data || [] })
        } catch (error) {
          console.error('Error al buscar:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      clearHistory: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            console.error('Usuario no autenticado, no se puede borrar historial')
            return
          }
          
          const { error } = await supabase
            .from('user_searches')
            .delete()
            .eq('user_id', user.id)
            
          if (error) {
            console.error('Error al borrar historial de búsquedas:', error)
          }
        } catch (error) {
          console.error('Error al borrar historial:', error)
        }
      }
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({ 
        query: state.query,
        activeTab: state.activeTab
      })
    }
  )
) 