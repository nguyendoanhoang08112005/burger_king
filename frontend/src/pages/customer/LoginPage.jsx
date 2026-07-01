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
  const navigate = useNavigate()
  const location = useLocation()

  // State for Sign In
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // State for Sign Up
  const [name, setName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)

  const setLogin = useAuthStore(state => state.setLogin)
  const showToast = useUiStore(state => state.showToast)
  const from = location.state?.from || '/'

  // Determine active form based on pathname
  const isSignUp = location.pathname === '/register'

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginLoading(true)

    apiClient.post('/auth/login', { email, password })
      .then(res => {
        setLogin(res.data.user, res.data.access_token)
        showToast(t('auth.login_success_welcome'))
        setLoginLoading(false)
        navigate(from, { replace: true })
      })
      .catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('auth.login_error'), 'error')
        setLoginLoading(false)
      })
  }

  const handleRegister = (e) => {
    e.preventDefault()

    if (regPassword !== passwordConfirm) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setRegisterLoading(true)
    apiClient.post('/auth/register', { 
      name, 
      email: regEmail, 
      password: regPassword, 
      password_confirmation: passwordConfirm, 
      phone 
    }).then(res => {
      setLogin(res.data.user, res.data.access_token)
      showToast(t('auth.register_success_welcome'))
      setRegisterLoading(false)
      navigate('/')
    }).catch(err => {
      console.error(err)
      showToast(err.response?.data?.message || t('auth.register_error'), 'error')
      setRegisterLoading(false)
    })
  }

  return (
    <div className="auth-wrapper">
      <div className={`auth-card-container ${isSignUp ? 'right-panel-active' : ''}`}>
        
        {/* Sign Up Form Container */}
        <div className={`auth-form-container auth-sign-up-container ${isSignUp ? 'block' : 'hidden md:block'}`}>
          <form onSubmit={handleRegister} className="h-full flex flex-col justify-center px-10 md:px-16 py-8 bg-white space-y-4">
            <div className="text-center mb-2">
              <BrandLogo className="justify-center mx-auto mb-2" containerClassName="h-12 w-[200px]" />
              <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide">{t('auth.member_register_title')}</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.name')}</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.email_address')}</label>
                <input 
                  type="email" 
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.phone')}</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909xxxxxx"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.password')}</label>
                  <input 
                    type="password" 
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t('auth.password_min_placeholder')}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.confirm_password')}</label>
                  <input 
                    type="password" 
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder={t('auth.confirm_password_placeholder')}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={registerLoading}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[10px] tracking-wider text-sm transition duration-200 hover:-translate-y-[1px] active:translate-y-0 flex justify-center items-center gap-2 cursor-pointer mt-5"
            >
              {registerLoading ? t('auth.registering') : t('auth.register_new_account')}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile switch trigger */}
            <div className="md:hidden text-center text-xs text-gray-500 pt-2">
              {t('auth.has_account')}{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-bold tracking-wide transition cursor-pointer"
              >
                {t('auth.login_now')}
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Form Container */}
        <div className={`auth-form-container auth-sign-in-container ${isSignUp ? 'hidden md:block' : 'block'}`}>
          <form onSubmit={handleLogin} className="h-full flex flex-col justify-center px-10 md:px-16 py-8 bg-white space-y-6">
            <div className="text-center mb-2">
              <BrandLogo className="justify-center mx-auto mb-2" containerClassName="h-12 w-[200px]" />
              <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide">{t('auth.member_login_title')}</h2>
            </div>

            <div className="space-y-4.5">
              <div>
                <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.email_address')}</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.5px] text-[#888888] mb-1.5 uppercase">{t('auth.password')}</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[12px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition duration-250"
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
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[10px] tracking-wider text-sm transition duration-200 hover:-translate-y-[1px] active:translate-y-0 flex justify-center items-center gap-2 cursor-pointer mt-5"
            >
              {loginLoading ? t('auth.logging_in') : t('auth.login_now')}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile switch trigger */}
            <div className="md:hidden text-center text-xs text-gray-500 pt-2">
              {t('auth.no_account')}{' '}
              <button 
                type="button" 
                onClick={() => navigate('/register')}
                className="text-primary hover:underline font-bold tracking-wide transition cursor-pointer"
              >
                {t('auth.new_member_register')}
              </button>
            </div>
          </form>
        </div>

        {/* Sliding Overlay Container */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            
            {/* Overlay Left (Sign In trigger when active) */}
            <div className="auth-overlay-panel auth-overlay-left">
              <h1 className="text-4xl font-extrabold tracking-wider mb-4 !text-white" style={{ color: '#FFFFFF' }}>
                {t('auth.welcome_back_title', 'Chào Bạn Quay Lại!')}
              </h1>
              <p className="text-sm leading-relaxed max-w-[300px] text-white opacity-90 mb-8 font-medium">
                {t('auth.welcome_back_desc', 'Đăng nhập với tài khoản của bạn để đặt hàng và nhận nhiều ưu đãi hấp dẫn.')}
              </p>
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="px-10 py-3 border-2 border-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition duration-200 cursor-pointer text-white"
              >
                {t('auth.login_now')}
              </button>
            </div>

            {/* Overlay Right (Sign Up trigger when inactive) */}
            <div className="auth-overlay-panel auth-overlay-right">
              <h1 className="text-4xl font-extrabold tracking-wider mb-4 !text-white" style={{ color: '#FFFFFF' }}>
                {t('auth.welcome_title', 'Chào Bạn Mới!')}
              </h1>
              <p className="text-sm leading-relaxed max-w-[300px] text-white opacity-90 mb-8 font-medium">
                {t('auth.welcome_desc_overlay', 'Đăng ký tài khoản thành viên để bắt đầu hành trình thưởng thức ẩm thực tuyệt hảo.')}
              </p>
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="px-10 py-3 border-2 border-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition duration-200 cursor-pointer text-white"
              >
                {t('auth.register_new_account')}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
