import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, MapPin, Clock, Mail } from 'lucide-react'
import { BrandLogo } from './Header'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import toast from 'react-hot-toast'

export default function Footer() {
  const { t } = useTranslation()
  const publicSettings = useUiStore(state => state.publicSettings)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    apiClient.post('/newsletter', { email })
      .then(res => {
        setSubmitting(false)
        toast.success(res.data?.message || t('toast_newsletter_success') || 'Đăng ký nhận tin thành công!')
        setEmail('')
      })
      .catch(err => {
        setSubmitting(false)
        const errMsg = err.response?.data?.message || t('toast_newsletter_error') || 'Đăng ký nhận tin thất bại!'
        toast.error(errMsg)
      })
  }

  const fbUrl = publicSettings?.['general.facebook_url']
  const instaUrl = publicSettings?.['general.instagram_url']
  const ytUrl = publicSettings?.['general.youtube_url']
  const ttUrl = publicSettings?.['general.tiktok_url']
  const zaloUrl = publicSettings?.['general.zalo_url']

  return (
    <footer className="w-full bg-white border-t border-[#E8E8E8] py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.35fr_0.85fr_1.25fr_1.35fr] gap-8 lg:gap-6 mb-8">
        <div>
          <BrandLogo containerClassName="h-12 w-[220px]" />
          <p className="text-[#666666] text-sm mt-4 leading-relaxed">
            {publicSettings?.['appearance.footer_brand_desc'] || t('footer.brand_desc')}
          </p>

          {/* Social media links */}
          {(fbUrl || instaUrl || ytUrl || ttUrl || zaloUrl) && (
            <div className="flex items-center gap-3 mt-6">
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-[#666666] transition-all shadow-sm" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {instaUrl && (
                <a href={instaUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#E1306C] hover:text-white flex items-center justify-center text-[#666666] transition-all shadow-sm" title="Instagram">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {ytUrl && (
                <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#FF0000] hover:text-white flex items-center justify-center text-[#666666] transition-all shadow-sm" title="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {ttUrl && (
                <a href={ttUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-black hover:text-white flex items-center justify-center text-[#666666] transition-all shadow-sm" title="TikTok">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
                  </svg>
                </a>
              )}
              {zaloUrl && (
                <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#0068FF] hover:text-white flex items-center justify-center text-[#666666] transition-all shadow-sm" title="Zalo">
                  <svg className="w-4.5 h-4.5" fill="currentColor" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 50 50">
                    <path d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892ZM20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17ZM32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947ZM25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184ZM40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181ZM29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">
            {publicSettings?.['appearance.footer_menu_title'] || t('nav.menu').toUpperCase()}
          </h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li><Link to="/menu?category=burgers-bo" className="hover:text-primary transition">{t('footer.menu_beef_burgers')}</Link></li>
            <li><Link to="/menu?category=burgers-ga" className="hover:text-primary transition">{t('footer.menu_chicken_burgers')}</Link></li>
            <li><Link to="/menu?category=mon-an-kem" className="hover:text-primary transition">{t('footer.menu_sides')}</Link></li>
            <li><Link to="/menu?category=combo-meals" className="hover:text-primary transition">{t('footer.menu_combo_deals')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">
            {publicSettings?.['appearance.footer_contact_title'] || t('footer.contact').toUpperCase()}
          </h3>
          <ul className="space-y-3 text-sm text-[#666666]">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> 
              {t('footer.hotline', { phone: publicSettings?.['appearance.footer_hotline'] || publicSettings?.['general.hotline'] || '1900 8888' })}
            </li>
            {(publicSettings?.['appearance.footer_email'] || publicSettings?.['general.email']) && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" /> 
                <span className="truncate">
                  {publicSettings?.['appearance.footer_email'] || publicSettings?.['general.email']}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 
              <span>
                {publicSettings?.['appearance.footer_address'] || publicSettings?.['general.address'] || t('footer.address')}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> 
              {t('footer.opening_hours', { time: publicSettings?.['appearance.footer_hours'] || '08:00 - 23:00' })}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">
            {publicSettings?.['appearance.footer_newsletter_title'] || t('footer.newsletter').toUpperCase()}
          </h3>
          <p className="text-[#666666] text-sm mb-4">
            {publicSettings?.['appearance.footer_newsletter_desc'] || t('footer.newsletter_desc')}
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input 
              type="email" 
              required
              disabled={submitting}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('footer.newsletter_placeholder')}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200 disabled:opacity-60"
            />
            <button 
              type="submit"
              disabled={submitting}
              className="bg-primary hover:opacity-90 text-white font-semibold px-4 rounded-[8px] text-sm transition hover:-translate-y-[1px] disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('footer.newsletter_button').toUpperCase()
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[#E8E8E8] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>{publicSettings?.['appearance.footer_copyright'] || t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <p>{publicSettings?.['appearance.footer_credit'] || t('footer.credit')}</p>
      </div>
    </footer>
  )
}
