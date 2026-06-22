import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useUiStore } from '../../store/uiStore'
import LanguageSwitcher from '../LanguageSwitcher'
import { assetUrl, logoSizeValue } from '../../utils/adminUtils'
import { usePrefetch } from '../../hooks/usePrefetch'

export function BrandLogo({
  className = '',
  containerClassName = 'h-14 w-[260px] max-w-full',
  imageClassName = 'object-contain',
  textClassName = 'text-3xl',
}) {
  const logo = useUiStore(state => state.publicSettings['general.logo'])
  const logoWidth = useUiStore(state => state.publicSettings['general.logo_width'])
  const logoHeight = useUiStore(state => state.publicSettings['general.logo_height'])
  const storeName = useUiStore(state => state.publicSettings['general.store_name'])

  if (logo) {
    return (
      <span className={`inline-flex items-center ${containerClassName} ${className}`}>
        <img
          src={assetUrl(logo)}
          alt={storeName || 'Hamburger King'}
          style={{
            width: logoSizeValue(logoWidth, '260px'),
            height: logoSizeValue(logoHeight, '64px'),
          }}
          className={`max-h-full max-w-full ${imageClassName}`}
        />
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center ${containerClassName} ${className}`}>
      <img
        src="/logo.svg"
        alt={storeName || 'Hamburger King'}
        style={{
          width: logoSizeValue(logoWidth, '260px'),
          height: logoSizeValue(logoHeight, '64px'),
        }}
        className={`max-h-full max-w-full ${imageClassName}`}
      />
    </span>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const { user, isAuthenticated, setLogout } = useAuthStore()
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const publicSettings = useUiStore(state => state.publicSettings) || {}
  const navigate = useNavigate()
  const location = useLocation()
  const { prefetchMenu } = usePrefetch()

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const navClass = (path) => (
    location.pathname === path
      ? 'text-primary font-bold transition'
      : 'text-[#2C1A16] hover:text-primary transition'
  )
  const homeUrl = publicSettings['appearance.header_nav_home_url'] || '/'
  const menuUrl = publicSettings['appearance.header_nav_menu_url'] || '/menu'
  const branchesUrl = publicSettings['appearance.header_nav_branches_url'] || '/branches'
  const blogUrl = publicSettings['appearance.header_nav_blog_url'] || '/blog'

  const handleHomeClick = (event) => {
    event.preventDefault()
    if (location.pathname === homeUrl) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate(homeUrl)
  }

  const homeLabel = publicSettings['appearance.header_nav_home'] || t('nav.home')
  const menuLabel = publicSettings['appearance.header_nav_menu'] || t('nav.menu')
  const branchesLabel = publicSettings['appearance.header_nav_branches'] || t('nav.branches')
  const blogLabel = publicSettings['appearance.header_nav_blog'] || t('nav.blog')

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-premium border-b border-[#E8E8E8] py-4 px-6 md:px-12 flex items-center justify-between">
      <a href={homeUrl} onClick={handleHomeClick} className="flex h-16 items-center gap-2 overflow-hidden">
        <BrandLogo containerClassName="h-16 w-[220px] sm:w-[280px] max-w-[38vw]" />
      </a>

      <nav className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-wide">
        <a href={homeUrl} onClick={handleHomeClick} className={navClass(homeUrl)}>{homeLabel}</a>
        <Link to={menuUrl} onMouseEnter={prefetchMenu} className={navClass(menuUrl)}>{menuLabel}</Link>
        <Link to={branchesUrl} className={navClass(branchesUrl)}>{branchesLabel}</Link>
        <Link to={blogUrl} className={location.pathname.startsWith(blogUrl) ? 'text-primary font-bold transition' : 'text-[#2C1A16] hover:text-primary transition'}>{blogLabel}</Link>
      </nav>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher variant="default" />

        {/* Cart Trigger */}
        <button 
          onClick={() => setCartDrawerOpen(true)}
          className="relative p-2.5 rounded-full bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#2C1A16] transition hover:-translate-y-[1px] active:translate-y-0"
        >
          <ShoppingBag className="w-5.5 h-5.5" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white animate-pulse-gold">
              {totalQuantity}
            </span>
          )}
        </button>

        {/* User Account / Login */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition text-[#2C1A16] text-sm bg-[#F5F5F5] hover:bg-[#E8E8E8] px-4 py-2 rounded-full border border-[#E8E8E8]">
              {user?.avatar ? (
                <img src={assetUrl(user.avatar)} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-primary" />
              )}
              <span className="hidden sm:inline font-semibold">{user.name}</span>
            </Link>
            {['admin', 'staff'].includes(user.role) && (
              <Link to="/admin" className="bg-[#FFC72C] text-[#2C1A16] px-4 py-2 rounded-[8px] text-xs font-semibold hover:opacity-90 hover:-translate-y-[1px] transition">
                {t('nav.admin').toUpperCase()}
              </Link>
            )}
            <button 
              onClick={() => {
                setLogout()
                navigate('/')
              }} 
              className="text-[#666666] hover:text-primary transition text-xs font-semibold"
            >
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2 rounded-[8px] tracking-wide text-sm transition hover:-translate-y-[1px] active:translate-y-0">
            {t('nav.login').toUpperCase()}
          </Link>
        )}
      </div>
    </header>
  )
}
