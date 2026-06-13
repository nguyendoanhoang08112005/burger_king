import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, MapPin, Clock } from 'lucide-react'
import { BrandLogo } from './Header'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="w-full bg-white border-t border-[#E8E8E8] py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1.35fr_0.85fr_1.25fr_1.35fr] gap-8 lg:gap-6 mb-8">
        <div>
          <BrandLogo containerClassName="h-12 w-[220px]" />
          <p className="text-[#666666] text-sm mt-4 leading-relaxed">
            {t('footer.brand_desc')}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">{t('nav.menu').toUpperCase()}</h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li><Link to="/menu?category=burgers-bo" className="hover:text-primary transition">{t('footer.menu_beef_burgers')}</Link></li>
            <li><Link to="/menu?category=burgers-ga" className="hover:text-primary transition">{t('footer.menu_chicken_burgers')}</Link></li>
            <li><Link to="/menu?category=mon-an-kem" className="hover:text-primary transition">{t('footer.menu_sides')}</Link></li>
            <li><Link to="/combos" className="hover:text-primary transition">{t('footer.menu_combo_deals')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">{t('footer.contact').toUpperCase()}</h3>
          <ul className="space-y-3 text-sm text-[#666666]">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {t('footer.hotline', { phone: '1900 8888' })}</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {t('footer.address')}</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {t('footer.opening_hours', { time: '08:00 - 23:00' })}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">{t('footer.newsletter').toUpperCase()}</h3>
          <p className="text-[#666666] text-sm mb-4">{t('footer.newsletter_desc')}</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder={t('footer.newsletter_placeholder')}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
            <button className="bg-primary hover:opacity-90 text-white font-semibold px-4 rounded-[8px] text-sm transition hover:-translate-y-[1px]">{t('footer.newsletter_button').toUpperCase()}</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[#E8E8E8] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>{t('footer.copyright', { year: 2026 })}</p>
        <p>{t('footer.credit')}</p>
      </div>
    </footer>
  )
}
