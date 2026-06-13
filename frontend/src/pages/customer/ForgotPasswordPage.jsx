import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowLeft, Key, Mail, CheckCircle } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { BrandLogo } from '../../components/layout/Header'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1) // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const showToast = useUiStore(state => state.showToast)
  const navigate = useNavigate()

  const handleRequestOtp = (e) => {
    e.preventDefault()
    setLoading(true)

    apiClient.post('/auth/forgot-password', { email })
      .then(res => {
        showToast(t('auth.otp_sent'))
        setStep(2)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('auth.forgot_password_error'), 'error')
        setLoading(false)
      })
  }

  const handleResetPassword = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setLoading(true)

    apiClient.post('/auth/reset-password', {
      email,
      code,
      password,
      password_confirmation: confirmPassword
    })
      .then(res => {
        showToast(t('auth.reset_success'))
        setLoading(false)
        navigate('/login')
      })
      .catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('auth.reset_password_error'), 'error')
        setLoading(false)
      })
  }

  return (
    <div className="min-h-[75vh] bg-[#FFFAF5] flex items-center justify-center p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium text-left animate-fade-in">
        <div className="text-center mb-8">
          <BrandLogo className="justify-center mx-auto" containerClassName="h-16 w-[260px]" />
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide mt-6">
            {step === 1 ? t('auth.forgot_password_title') : t('auth.reset_password_title')}
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
            {step === 1 ? t('auth.forgot_password_desc') : t('auth.reset_password_desc')}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {t('auth.email_address')}
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? t('auth.sending_otp') : t('auth.send_otp')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-3 text-xs mb-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-medium truncate max-w-[200px]">{email}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider whitespace-nowrap"
              >
                {t('common.back')}
              </button>
            </div>

            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                {t('auth.otp_code')}
              </label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm tracking-[4px] text-center font-bold text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.new_password')}</label>
              <input 
                type="password" 
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_min_placeholder')}
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.confirm_new_password')}</label>
              <input 
                type="password" 
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirm_password_placeholder')}
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? t('auth.resetting') : t('auth.reset_password_now')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold tracking-wide transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('auth.login').toUpperCase()}
          </Link>
        </div>
      </div>
    </div>
  )
}
