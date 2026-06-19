import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/axios'

export const usePrefetch = () => {
  const queryClient = useQueryClient()

  const prefetchMenu = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['products', { page: 1 }],
      queryFn: () => apiClient.get('/products?page=1&per_page=9').then(r => r.data),
      staleTime: 5 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: () => apiClient.get('/categories').then(r => r.data),
      staleTime: 30 * 60 * 1000,
    })
  }, [queryClient])

  const prefetchProduct = useCallback((slug) => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => apiClient.get(`/products/${slug}`).then(r => r.data),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])

  return { prefetchMenu, prefetchProduct }
}
