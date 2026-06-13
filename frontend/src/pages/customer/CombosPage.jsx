import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import AOS from 'aos'
import apiClient from '../../api/axios'
import { formatVND } from '../../utils/format'

export default function CombosPage() {
  const { t, i18n } = useTranslation()
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/combos')
      .then(res => {
        setCombos(res.data)
        setLoading(false)
        setTimeout(() => AOS.refresh(), 0)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [i18n.language])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFAF5]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A]">
      <div className="text-center mb-12">
        <h1 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-primary uppercase">{t('combo.saving_title')}</h1>
        <p className="text-xs text-[#666666] max-w-sm mx-auto mt-2">
          {t('combo.page_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {combos.map((combo, index) => (
          <div key={combo.id} data-aos="zoom-in" data-aos-delay={index * 100} className="flex flex-col sm:flex-row gap-6 p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium text-left">
            <img 
              src={combo.image} 
              alt={combo.name} 
              className="w-full sm:w-48 h-48 object-cover rounded-xl shrink-0"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">{t('combo.badge')}</span>
                <h3 className="font-semibold text-xl text-[#1A1A1A] uppercase tracking-wide mt-1">{combo.name}</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-2">{combo.description}</p>

                {/* Combos sub-items */}
                {combo.items && (
                  <div className="mt-4 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{t('combo.includes')}</span>
                    {combo.items.map((ci) => (
                      <div key={ci.id} className="text-xs text-[#666666] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>x{ci.quantity} {ci.product?.name} (Size {ci.size})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8E8E8]">
                <span className="font-semibold text-2xl text-[#1A1A1A]">{formatVND(combo.price)}</span>
                <Link 
                  to="/menu" 
                  className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px] active:translate-y-0"
                >
                  {t('combo.buy_now')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
