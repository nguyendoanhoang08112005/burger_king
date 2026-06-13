import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Clock } from 'lucide-react'
import AOS from 'aos'
import apiClient from '../../api/axios'

export default function BranchesPage() {
  const { t, i18n } = useTranslation()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/branches')
      .then(res => {
        setBranches(res.data)
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
        <h1 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-primary uppercase">{t('branch.system_title')}</h1>
        <p className="text-xs text-[#666666] max-w-sm mx-auto mt-2">
          {t('branch.system_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {branches.map((b, index) => (
          <div key={b.id} data-aos="fade-up" data-aos-delay={index * 120} className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-premium hover:border-gray-400 transition text-left">
            <div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary animate-float" />
              </div>
              <h4 className="font-bold text-base text-[#1A1A1A]">{b.name}</h4>
              <p className="text-xs text-[#666666] leading-relaxed mt-2">{b.address}</p>
              
              <div className="mt-4 space-y-2 text-xs text-[#666666]">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {b.phone}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {t('branch.service_hours_with_time', { time: `${b.open_time.slice(0, 5)} - ${b.close_time.slice(0, 5)}` })}</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8E8E8] flex gap-2">
              <a 
                href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full text-center bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
              >
                {t('branch.direction').toUpperCase()}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
