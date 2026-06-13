import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'

const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

export default function PublicSettingsLoader() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [maintenance, setMaintenance] = useState(null)
  const setPublicSettings = useUiStore(state => state.setPublicSettings)
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  useEffect(() => {
    let ignore = false
    apiClient.get('/settings/public')
      .then(({ data }) => {
        if (ignore) return
        const settings = data.data || {}
        setPublicSettings(settings)
        const root = document.documentElement

        if (settings['appearance.primary_color']) root.style.setProperty('--color-primary', settings['appearance.primary_color'])
        if (settings['appearance.secondary_color']) root.style.setProperty('--color-secondary', settings['appearance.secondary_color'])
        if (settings['appearance.font_family']) root.style.setProperty('--font-main', settings['appearance.font_family'])
        if (settings['seo.meta_title']) document.title = settings['seo.meta_title']

        const description = document.querySelector('meta[name="description"]') || document.createElement('meta')
        description.setAttribute('name', 'description')
        description.setAttribute('content', settings['seo.meta_description'] || '')
        if (!description.parentNode) document.head.appendChild(description)

        const favicon = settings['general.favicon']
        if (favicon) {
          const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
          link.setAttribute('rel', 'icon')
          link.setAttribute('href', assetUrl(favicon))
          if (!link.parentNode) document.head.appendChild(link)
        }

        setMaintenance(settings['general.maintenance_mode'] ? settings['general.maintenance_message'] : null)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [setPublicSettings, currentLang])

  if (!maintenance || isAdminRoute) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] bg-primary text-white text-center text-sm font-semibold px-4 py-2">
      {maintenance}
    </div>
  )
}
