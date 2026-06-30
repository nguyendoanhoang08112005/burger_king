import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Menu, X } from 'lucide-react'
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
  const publicSettings = useUiStore(s => s.publicSettings) || {}
  const { user, setLogout } = useAuthStore()
  const cartCount = useCartStore(s => s.cartItems.reduce((sum, item) => sum + item.quantity, 0))
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { prefetchMenu } = usePrefetch()

  // Scroll effect to transition header background
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Home URL resolves from appearance settings
  const homeUrl = publicSettings['appearance.header_nav_home_url'] || '/'
  const menuUrl = publicSettings['appearance.header_nav_menu_url'] || '/menu'
  const branchesUrl = publicSettings['appearance.header_nav_branches_url'] || '/branches'
  const blogUrl = publicSettings['appearance.header_nav_blog_url'] || '/blog'

  const navItems = [
    {
      label: publicSettings['appearance.header_nav_home'] || t('nav.home'),
      path: homeUrl,
    },
    {
      label: publicSettings['appearance.header_nav_menu'] || t('nav.menu'),
      path: menuUrl,
      prefetch: true,
    },
    {
      label: publicSettings['appearance.header_nav_branches'] || t('nav.branches'),
      path: branchesUrl,
    },
    {
      label: publicSettings['appearance.header_nav_blog'] || t('nav.blog'),
      path: blogUrl,
    },
  ]

  const handleHomeClick = (e) => {
    e.preventDefault()
    if (location.pathname === homeUrl) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(homeUrl)
    }
  }

  const handleLogout = () => {
    setLogout()
    navigate('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300
      ${scrolled ? 'pt-2 px-4 md:px-8' : 'pt-4 px-4 md:px-8'}`}>
      <div className={`w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto transition-all duration-300 px-6 md:px-8 bg-[#FDF6EC] rounded-b-[28px] rounded-t-[16px] border border-[#FBE3B5]/30 shadow-md ${scrolled ? 'py-2.5 shadow-lg' : 'py-4'}`}>

        {/* Logo */}
        <a href={homeUrl} onClick={handleHomeClick}
          className="flex items-center gap-2 flex-shrink-0">
          <img
            src={publicSettings['general.logo'] ? assetUrl(publicSettings['general.logo']) : '/logo.svg'}
            alt={publicSettings['general.store_name'] || 'Hamburger King'}
            className="h-10 w-auto object-contain"
          />
        </a>

        {/* Desktop Nav — center */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map(item => {
            const isHome = item.path === homeUrl
            const isActive = isHome 
              ? location.pathname === homeUrl 
              : location.pathname.startsWith(item.path)

            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={isHome ? handleHomeClick : undefined}
                onMouseEnter={item.prefetch ? prefetchMenu : undefined}
                className={`text-sm font-bold tracking-wide
                  transition-colors duration-200
                  ${isActive
                    ? 'text-[#C8102E]'
                    : 'text-[#5C1A16] hover:text-[#C8102E]'
                  }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">

          {/* Language Switcher */}
          <LanguageSwitcher variant="header" scrolled={true} />

          {/* Cart */}
          <button
            onClick={() => useUiStore.getState().setCartDrawerOpen(true)}
            className="relative p-2 rounded-full cursor-pointer transition-colors hover:bg-black/5 text-[#5C1A16]">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5
                w-5 h-5 bg-[#F5A623] text-[#1A0A00] text-[10px]
                rounded-full flex items-center justify-center
                font-bold border border-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* Profile Link (Avatar + Name) */}
              <Link to="/profile" className="flex items-center gap-2 group cursor-pointer">
                {user.avatar ? (
                  <img
                    src={assetUrl(user.avatar)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#C8102E]/20 group-hover:border-[#C8102E] transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-sm group-hover:bg-[#8A151B] transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold hidden xl:block text-[#5C1A16] group-hover:text-[#C8102E] transition-colors">
                  {user.name}
                </span>
              </Link>
              
              {/* Admin badge */}
              {(user.role === 'admin' || user.role === 'staff') && (
                <Link to="/admin"
                  className="bg-[#F5A623] text-[#1A0A00]
                    text-xs font-bold px-3 py-1.5 rounded-full
                    hover:opacity-90 transition uppercase
                    tracking-wide">
                  Admin
                </Link>
              )}

              <button onClick={handleLogout}
                className="text-sm font-medium cursor-pointer text-[#5C1A16]/80 hover:text-[#C8102E] transition-colors ml-1">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login"
              className="bg-[#C8102E] hover:bg-[#8A151B]
                text-white text-sm font-bold px-6 py-2.5
                rounded-full transition-all
                hover:-translate-y-0.5 tracking-wide shadow-md">
              {t('nav.login')}
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg cursor-pointer transition text-[#5C1A16] hover:bg-black/5">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FDF6EC] border-t border-[#FBE3B5]/30
          rounded-b-[20px] shadow-lg px-6 py-4 space-y-2 pointer-events-auto mt-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-semibold
                text-[#5C1A16] hover:text-[#C8102E]
                border-b border-[#FBE3B5]/20 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
