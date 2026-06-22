import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/axios'

export const usePrefetch = () => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  const prefetchMenu = useCallback(() => {
    const locale = i18n.language
    queryClient.prefetchQuery({
      queryKey: ['products', { page: 1, category: '', search: '', sortBy: 'sort_order', locale }],
      queryFn: () => apiClient.get('/products', {
        params: {
          page: 1,
          per_page: 9,
          sort_by: 'sort_order',
        }
      }).then(r => r.data),
      staleTime: 5 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: () => apiClient.get('/categories').then(r => r.data),
      staleTime: 30 * 60 * 1000,
    })
  }, [queryClient, i18n.language])

  const prefetchProduct = useCallback((slug) => {
    queryClient.prefetchQuery({
      queryKey: ['product', slug],
      queryFn: () => apiClient.get(`/products/${slug}`).then(r => r.data),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])

  return { prefetchMenu, prefetchProduct }
}
