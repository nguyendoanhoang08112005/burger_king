import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/axios'

export const useHomepage = () => {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: ['homepage', i18n.language],
    queryFn: () => apiClient.get('/homepage').then(r => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
