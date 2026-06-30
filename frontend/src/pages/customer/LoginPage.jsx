import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { BrandLogo } from '../../components/layout/Header'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setLogin = useAuthStore(state => state.setLogin)
  const showToast = useUiStore(state => state.showToast)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)

    apiClient.post('/auth/login', { email, password })
      .then(res => {
        setLogin(res.data.user, res.data.access_token)
        showToast(t('auth.login_success_welcome'))
        setLoading(false)
        navigate(from, { replace: true })
      })
      .catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('auth.login_error'), 'error')
        setLoading(false)
      })
  }

  return (
    <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center pt-28 pb-16 px-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium text-left">
        <div className="text-center mb-8">
          <BrandLogo className="justify-center mx-auto" containerClassName="h-16 w-[260px]" />
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide mt-6">{t('auth.member_login_title')}</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.email_address')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.password')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />
            <div className="flex justify-end mt-2">
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:underline font-semibold transition"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading ? t('auth.logging_in') : t('auth.login_now')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-primary hover:underline font-bold tracking-wide transition">
            {t('auth.new_member_register')}
          </Link>
        </div>
      </div>
    </div>
  )
}
