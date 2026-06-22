import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wrench, Settings } from 'lucide-react'
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
  const maintenance = useUiStore(state => state.maintenanceMessage)
  const setMaintenance = useUiStore(state => state.setMaintenanceMessage)
  const setPublicSettings = useUiStore(state => state.setPublicSettings)
  const publicSettings = useUiStore(state => state.publicSettings)
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

        if (settings['general.maintenance_mode']) {
          const transMsg = settings['general.maintenance_message']
          const msg = typeof transMsg === 'object' ? (transMsg[currentLang] || transMsg.vi || transMsg.en) : transMsg
          setMaintenance(msg || 'Website đang bảo trì, vui lòng quay lại sau.')
        } else {
          setMaintenance(null)
        }
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [currentLang])

  useEffect(() => {
    if (!maintenance || isAdminRoute) return undefined

    const checkMaintenanceAgain = () => {
      apiClient.get('/settings/public')
        .then(({ data }) => {
          const settings = data.data || {}
          if (!settings['general.maintenance_mode']) {
            setMaintenance(null)
            window.location.reload()
          } else {
            const transMsg = settings['general.maintenance_message']
            const msg = typeof transMsg === 'object' ? (transMsg[currentLang] || transMsg.vi || transMsg.en) : transMsg
            setMaintenance(msg || 'Website đang bảo trì, vui lòng quay lại sau.')
          }
        })
        .catch(() => {})
    }

    const intervalId = setInterval(checkMaintenanceAgain, 15000)
    return () => clearInterval(intervalId)
  }, [maintenance, isAdminRoute, currentLang])

  useEffect(() => {
    if (!publicSettings) return

    const favicon = isAdminRoute
      ? publicSettings['general.admin_favicon']
      : publicSettings['general.favicon']

    if (favicon) {
      const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
      link.setAttribute('rel', 'icon')
      link.setAttribute('href', assetUrl(favicon))
      if (!link.parentNode) document.head.appendChild(link)
    }
  }, [publicSettings, isAdminRoute])

  useEffect(() => {
    if (maintenance && !isAdminRoute) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [maintenance, isAdminRoute])

  if (!maintenance || isAdminRoute) return null

  const hotline = publicSettings?.['general.hotline']
  const email = publicSettings?.['general.email']
  const storeName = publicSettings?.['general.store_name'] || 'Hamburger King'
  const logo = publicSettings?.['general.logo']

  const fbUrl = publicSettings?.['general.facebook_url']
  const instaUrl = publicSettings?.['general.instagram_url']
  const ytUrl = publicSettings?.['general.youtube_url']
  const ttUrl = publicSettings?.['general.tiktok_url']
  const zaloUrl = publicSettings?.['general.zalo_url']

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFFAF5]/70 backdrop-blur-md text-[#1A1A1A] overflow-y-auto px-4 py-8">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-4000"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-3000"></div>

      <div className="relative w-full max-w-lg bg-white/95 border border-amber-100/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center shadow-2xl flex flex-col items-center">
        {/* Logo / Brand */}
        {logo ? (
          <img src={assetUrl(logo)} alt={storeName} className="h-16 object-contain mb-8" />
        ) : (
          <h1 className="text-3xl font-extrabold text-primary tracking-wider mb-8">
            {storeName.toUpperCase()}
          </h1>
        )}

        {/* Animated Icon */}
        <div className="relative w-20 h-20 bg-amber-50/50 rounded-2xl flex items-center justify-center border border-amber-100 mb-8 shadow-inner">
          <Settings className="absolute w-12 h-12 text-amber-200/80 animate-spin" style={{ animationDuration: '8s' }} />
          <Wrench className="relative w-7 h-7 text-primary transform -rotate-45" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight uppercase">
          {currentLang === 'vi' ? 'Hệ Thống Đang Bảo Trì' : 'Under Maintenance'}
        </h2>

        {/* Message */}
        <p className="text-[#666666] text-sm md:text-base mb-8 leading-relaxed max-w-md font-medium">
          {maintenance}
        </p>

        {/* Contact Info Card */}
        {(hotline || email) && (
          <div className="w-full bg-[#FFFAF5] border border-amber-100/60 rounded-2xl p-5 mb-8 text-left space-y-3">
            <h3 className="text-xs font-bold text-amber-800 tracking-wider uppercase opacity-85">
              {currentLang === 'vi' ? 'Liên hệ hỗ trợ' : 'Support Contacts'}
            </h3>
            <div className="h-px bg-amber-100/60"></div>
            {hotline && (
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.115-.44.05-1.19.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                </svg>
                <span className="text-sm md:text-base font-bold">{hotline}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                <span className="text-sm md:text-base font-bold truncate">{email}</span>
              </div>
            )}
          </div>
        )}

        {/* Social Media Links */}
        {(fbUrl || instaUrl || ytUrl || ttUrl || zaloUrl) && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-amber-800/80 uppercase">
              {currentLang === 'vi' ? 'Theo dõi chúng tôi' : 'Follow us'}
            </span>
            <div className="flex items-center gap-4">
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-[#1A1A1A] transition-all shadow-sm border border-amber-100/60 transform hover:-translate-y-1" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {instaUrl && (
                <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-[#E1306C] hover:text-white flex items-center justify-center text-[#1A1A1A] transition-all shadow-sm border border-amber-100/60 transform hover:-translate-y-1" title="Instagram">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {ytUrl && (
                <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-[#FF0000] hover:text-white flex items-center justify-center text-[#1A1A1A] transition-all shadow-sm border border-amber-100/60 transform hover:-translate-y-1" title="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11 2.107C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {ttUrl && (
                <a href={ttUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-black hover:text-white flex items-center justify-center text-[#1A1A1A] transition-all shadow-sm border border-amber-100/60 transform hover:-translate-y-1" title="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                  </svg>
                </a>
              )}
              {zaloUrl && (
                <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-[#0068FF] hover:text-white flex items-center justify-center text-[#1A1A1A] transition-all shadow-sm border border-amber-100/60 transform hover:-translate-y-1" title="Zalo">
                  <svg className="w-5.5 h-5.5" fill="currentColor" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 50 50">
                    <path d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892ZM20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17ZM32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947ZM25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184ZM40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181ZM29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
