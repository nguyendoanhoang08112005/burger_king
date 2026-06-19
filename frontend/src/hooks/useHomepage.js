import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/axios'

export const useHomepage = () => {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: () => apiClient.get('/homepage').then(r => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
