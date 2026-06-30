import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Clock, Mail, Send, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AOS from 'aos'
import apiClient from '../../api/axios'
import { useUiStore } from '../../store/uiStore'

export default function BranchesPage() {
  const { t, i18n } = useTranslation()
  const publicSettings = useUiStore(state => state.publicSettings)

  // Fetch branches (cached for 30 minutes, depends on language)
  const { data: branches = [], isLoading: loading } = useQuery({
    queryKey: ['branches', i18n.language],
    queryFn: () => apiClient.get('/branches').then(r => r.data || []),
    staleTime: 30 * 60 * 1000,
  })

  // Feedback Form State
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Refresh AOS animations once data loaded
  useEffect(() => {
    if (!loading) {
      setTimeout(() => AOS.refresh(), 0)
    }
  }, [loading])

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()

    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) {
      toast.error(t('complaint.describe_issue_required') || 'Please fill in all required fields')
      return
    }

    setSubmitting(true)
    
    apiClient.post('/contacts', {
      name: formName,
      phone: formPhone,
      email: formEmail,
      message: formMessage
    })
      .then(() => {
        setSubmitting(false)
        setSubmitSuccess(true)
        toast.success(t('contact.success') || 'Gửi liên hệ thành công!')
        // Reset form
        setFormName('')
        setFormPhone('')
        setFormEmail('')
        setFormMessage('')
      })
      .catch(err => {
        setSubmitting(false)
        const errMsg = err.response?.data?.message || t('common.error') || 'Đã xảy ra lỗi, vui lòng thử lại.'
        toast.error(errMsg)
      })
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFAF5]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pt-24 md:pt-32 pb-16 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A]">
      {/* Header section */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Phone className="w-3.5 h-3.5" />
          {t('nav.branches')}
        </span>
        <h1 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-primary uppercase">
          {t('branch.system_title')} & {t('contact.form_title')}
        </h1>
        <p className="text-xs text-[#666666] max-w-md mx-auto mt-2">
          {t('branch.system_subtitle')}
        </p>
      </div>

      {/* Split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Branch Locations */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-bold text-xl text-[#2C1A16] uppercase border-b border-primary/20 pb-3 flex items-center gap-2" data-aos="fade-right">
            <MapPin className="w-5 h-5 text-primary" />
            {t('branch.location_title')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {branches.map((b, index) => (
              <div 
                key={b.id} 
                data-aos="fade-up" 
                data-aos-delay={index * 100} 
                className="p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-glass hover:shadow-premium transition-all duration-300 group hover:border-primary/20"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">{b.name}</h4>
                  <p className="text-xs text-[#666666] leading-relaxed mt-2">{b.address}</p>
                  
                  <div className="mt-4 space-y-1.5 text-xs text-[#666666]">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" /> 
                      {b.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" /> 
                      {t('branch.service_hours_with_time', { time: `${b.open_time.slice(0, 5)} - ${b.close_time.slice(0, 5)}` })}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E8E8]">
                  <a 
                    href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full block text-center bg-[#F8F8F8] hover:bg-primary hover:text-white border border-[#E8E8E8] hover:border-primary text-[#1A1A1A] font-semibold py-2.5 rounded-[8px] text-xs tracking-wider transition-all duration-200"
                  >
                    {t('branch.direction').toUpperCase()}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support & Feedback Form */}
        <div className="lg:col-span-5 bg-white border border-[#E8E8E8] rounded-2xl p-8 shadow-glass space-y-8 relative overflow-hidden" data-aos="fade-left">
          {/* Subtle colored accent strip at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-[#FF8C00]" />

          {/* Form / Success Notification */}
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <CheckCircle2 className="w-16 h-16 text-[#28A745] mx-auto animate-float" />
              <h3 className="font-bold text-lg text-[#2C1A16]">
                {t('common.success') || 'Thank You!'}
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed max-w-sm mx-auto">
                {t('contact.success')}
              </p>
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="mt-4 px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider uppercase rounded-[8px] hover:opacity-90 transition active:scale-95"
              >
                {t('common.back') || 'Go Back'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-[#2C1A16] uppercase tracking-wide border-b border-[#E8E8E8] pb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                {t('contact.form_title')}
              </h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="contact_name" className="block text-xs font-semibold text-[#2C1A16] mb-1.5">{t('contact.name')} <span className="text-primary">*</span></label>
                  <input
                    type="text"
                    id="contact_name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t('contact.name')}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-3 px-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contact_phone" className="block text-xs font-semibold text-[#2C1A16] mb-1.5">{t('contact.phone')} <span className="text-primary">*</span></label>
                    <input
                      type="tel"
                      id="contact_phone"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder={t('contact.phone')}
                      className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-3 px-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_email" className="block text-xs font-semibold text-[#2C1A16] mb-1.5">{t('contact.email')}</label>
                    <input
                      type="email"
                      id="contact_email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder={t('contact.email')}
                      className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-3 px-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact_message" className="block text-xs font-semibold text-[#2C1A16] mb-1.5">{t('contact.message')} <span className="text-primary">*</span></label>
                  <textarea
                    id="contact_message"
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder={t('contact.message')}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-3 px-4 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:opacity-95 disabled:opacity-50 text-white font-semibold py-3.5 rounded-[8px] text-xs tracking-widest uppercase transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('contact.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {t('contact.submit')}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Customer Support Information Cards */}
          <div className="pt-6 border-t border-[#E8E8E8] space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#2C1A16] uppercase tracking-wide mb-1">
                {t('contact.info_title')}
              </h4>
              <p className="text-[11px] text-[#666666]">
                {t('contact.info_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] hover:border-primary/15 transition">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500 text-[10px] uppercase">Hotline</p>
                  <p className="font-bold text-[#2C1A16] text-sm">{publicSettings?.['general.hotline'] || '1900 8888'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] hover:border-primary/15 transition">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500 text-[10px] uppercase">Email</p>
                  <p className="font-bold text-[#2C1A16] text-sm">{publicSettings?.['general.email'] || 'support@hamburgerking.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
