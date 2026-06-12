import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useParams, 
  useSearchParams,
  useLocation,
  Navigate
} from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import toast, { Toaster } from 'react-hot-toast'
import { 
  ShoppingBag, 
  User as UserIcon, 
  MapPin, 
  X, 
  ChevronLeft,
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  Phone, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  ArrowRight, 
  Gift, 
  Bell, 
  Heart,
  Package,
  Star,
  Upload
} from 'lucide-react'

// Utilities
import { formatVND, formatDate } from './utils/format'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'

// Stores
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useUiStore } from './store/uiStore'

// Axios
import apiClient from './api/axios'
import BlogSlider from './components/BlogSlider'
import ScrollToTopButton from './components/ScrollToTopButton'
import VietnamAddressSelector from './components/VietnamAddressSelector'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import AdminPanel from './admin/AdminPanel'
import { initDarkMode } from './utils/darkMode'

const apiOrigin = (apiClient.defaults.baseURL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

const assetUrl = value => {
  if (!value) return ''
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value
  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`
}

const getLastCheckoutAddress = () => {
  try {
    return JSON.parse(localStorage.getItem('hk_last_checkout_address') || 'null') || {}
  } catch {
    return {}
  }
}

const logoSizeValue = (value, fallback) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? `${numeric}px` : fallback
}

function BrandLogo({
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
      <span className={`font-extrabold ${textClassName} tracking-wider text-primary`}>HAMBURGER</span>
      <span className={`font-extrabold ${textClassName} tracking-wider text-white bg-primary px-2 py-0.5 rounded-[8px] ml-1`}>KING</span>
    </span>
  )
}

// --- CORE LAYOUT COMPONENTS ---

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

function AosRefresh() {
  const location = useLocation()

  useEffect(() => {
    AOS.refresh()
  }, [location])

  return null
}

function SessionGuard() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const checkSession = () => {
      if (document.visibilityState === 'visible') {
        apiClient.get('/profile').catch(() => {})
      }
    }

    checkSession()
    const interval = window.setInterval(checkSession, 5000)
    window.addEventListener('focus', checkSession)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkSession)
    }
  }, [isAuthenticated])

  return null
}

// 1. Toast Notification
function Toast() {
  const toast = useUiStore(state => state.toast)
  const hideToast = useUiStore(state => state.hideToast)

  if (!toast) return null

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-[8px] px-5 py-4 shadow-premium border transition-all duration-200 animate-float ${
      toast.type === 'error' 
        ? 'bg-white border-primary text-primary' 
        : 'bg-white border-secondary text-secondary'
    }`}>
      {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-secondary" />}
      <span className="font-semibold text-sm text-[#1A1A1A]">{toast.message}</span>
      <button onClick={hideToast} className="text-gray-400 hover:text-black transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// 2. Global Header
function Header() {
  const { t } = useTranslation()
  const { user, isAuthenticated, setLogout } = useAuthStore()
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const navigate = useNavigate()
  const location = useLocation()

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const navClass = (path) => (
    location.pathname === path
      ? 'text-primary font-bold transition'
      : 'text-[#1A1A1A] hover:text-primary transition'
  )
  const handleHomeClick = (event) => {
    event.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-premium border-b border-[#E8E8E8] py-4 px-6 md:px-12 flex items-center justify-between">
      <a href="/" onClick={handleHomeClick} className="flex h-16 items-center gap-2 overflow-hidden">
        <BrandLogo containerClassName="h-16 w-[220px] sm:w-[280px] max-w-[38vw]" />
      </a>

      <nav className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-wide">
        <a href="/" onClick={handleHomeClick} className={navClass('/')}>{t('nav.home')}</a>
        <Link to="/menu" className={navClass('/menu')}>{t('nav.menu')}</Link>
        <Link to="/combos" className={navClass('/combos')}>{t('nav.combos')}</Link>
        <Link to="/branches" className={navClass('/branches')}>{t('nav.branches')}</Link>
        <Link to="/blog" className={location.pathname.startsWith('/blog') ? 'text-primary font-bold transition' : 'text-[#1A1A1A] hover:text-primary transition'}>{t('nav.blog')}</Link>
      </nav>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher variant="default" />

        {/* Cart Trigger */}
        <button 
          onClick={() => setCartDrawerOpen(true)}
          className="relative p-2.5 rounded-full bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] transition hover:-translate-y-[1px] active:translate-y-0"
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
            <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition text-[#1A1A1A] text-sm bg-[#F5F5F5] hover:bg-[#E8E8E8] px-4 py-2 rounded-full border border-[#E8E8E8]">
              <UserIcon className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline font-semibold">{user.name}</span>
            </Link>
            {['admin', 'staff'].includes(user.role) && (
              <Link to="/admin" className="bg-[#FFC72C] text-[#1A1A1A] px-4 py-2 rounded-[8px] text-xs font-semibold hover:opacity-90 hover:-translate-y-[1px] transition">
                ADMIN
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

// 3. Global Footer
function Footer() {
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
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">NEWSLETTER</h3>
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

// 4. Cart Drawer Overlay
function CartDrawer() {
  const { t } = useTranslation()
  const { cartDrawerOpen, setCartDrawerOpen, showToast } = useUiStore()
  const { cartItems, updateQuantity, removeItem, getCartTotals } = useCartStore()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()

  if (!cartDrawerOpen) return null

  const totals = getCartTotals()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setCartDrawerOpen(false)
      showToast(t('cart.login_required'), 'error')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    setCartDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={() => setCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white border-l border-[#E8E8E8] h-full shadow-premium flex flex-col z-10 animate-float-half">
        <div className="p-6 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide">{t('cart.title').toUpperCase()}</h2>
          </div>
          <button 
            onClick={() => setCartDrawerOpen(false)}
            className="p-1 rounded-full hover:bg-[#F5F5F5] transition text-gray-400 hover:text-[#1A1A1A]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4 stroke-1" />
              <h3 className="font-bold text-xl text-gray-400 uppercase tracking-wide">{t('cart.empty').toUpperCase()}</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
                {t('cart.empty_desc')}
              </p>
              <button 
                onClick={() => {
                  setCartDrawerOpen(false)
                  navigate('/menu')
                }}
                className="mt-6 bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-[8px] tracking-wide text-sm transition hover:-translate-y-[1px]"
              >
                {t('nav.menu').toUpperCase()}
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              // Calculate custom topping item price
              let baseItemPrice = parseFloat(item.product.sale_price ?? item.product.base_price)
              const sizeModel = item.product.sizes?.find(s => s.size === item.size)
              if (sizeModel) baseItemPrice += parseFloat(sizeModel.extra_price)

              const toppingsPrice = item.toppings.reduce((sum, t) => sum + parseFloat(t.price), 0)
              const unitTotal = baseItemPrice + toppingsPrice

              return (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white border border-[#E8E8E8] hover:border-gray-300 transition shadow-glass">
                  <img 
                    src={item.product.thumbnail} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#1A1A1A] truncate">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.size && (
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Size {item.size}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatVND(unitTotal)}
                      </span>
                    </div>

                    {/* Toppings detail */}
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        Topping: {item.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-full border border-[#E8E8E8] p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E8E8E8] rounded-full transition text-[#666666] hover:text-[#1A1A1A]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-semibold text-sm text-[#1A1A1A] px-1">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E8E8E8] rounded-full transition text-[#666666] hover:text-[#1A1A1A]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-primary p-1.5 transition rounded-full hover:bg-[#F5F5F5]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#E8E8E8] bg-[#FDFDFD] space-y-4">
            <div className="space-y-2 text-sm text-[#666666]">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-primary">
                  <span>{t('cart.product_savings')}</span>
                  <span>-{formatVND(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>{t('cart.coupon')}</span>
                  <span>-{formatVND(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span className="text-[#1A1A1A] font-semibold">
                  {totals.shippingFee === 0 ? t('cart.free_shipping') : formatVND(totals.shippingFee)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-3 flex justify-between items-center">
              <span className="font-bold text-[18px] tracking-normal uppercase text-[#1A1A1A]">{t('cart.total')}</span>
              <span className="font-bold text-2xl text-primary">{formatVND(totals.total)}</span>
            </div>

            {/* Checkout Trigger */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 shadow-glass"
            >
              {t('cart.checkout').toUpperCase()}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 5. Mobile Navigation Footer
function MobileNav() {
  const { t } = useTranslation()
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E8E8] py-3 px-6 flex justify-around items-center text-[#666666] shadow-premium">
      <Link to="/" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">{t('nav.home').toUpperCase()}</span>
      </Link>
      <Link to="/menu" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">{t('nav.menu').toUpperCase()}</span>
      </Link>
      <button 
        onClick={() => setCartDrawerOpen(true)}
        className="relative flex flex-col items-center gap-1 hover:text-primary transition"
      >
        <ShoppingBag className="w-5 h-5 text-primary" />
        {totalQuantity > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white font-semibold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
            {totalQuantity}
          </span>
        )}
        <span className="text-[10px] font-semibold tracking-wide">{t('nav.cart').toUpperCase()}</span>
      </button>
      <Link to="/profile" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">{t('nav.profile').toUpperCase()}</span>
      </Link>
    </div>
  )
}

// --- POPULAR / SHARED SCREEN PORTION COMPONENTS ---

// Product Card
function ProductCard({ product, onSelect, index = 0 }) {
  const { t } = useTranslation()
  const showToast = useUiStore(state => state.showToast)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const [wishlistOverride, setWishlistOverride] = useState(null)
  const wishlisted = wishlistOverride?.productId === product.id
    ? wishlistOverride.value
    : Boolean(product.wishlisted)

  const hasSale = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price)

  const handleQuickAdd = (e) => {
    e.stopPropagation()
    onSelect(product)
  }

  const handleToggleWishlist = (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      showToast(t('cart.login_required'), 'error')
      navigate('/login', { state: { from: `${location.pathname}${location.search}` || '/menu' } })
      return
    }

    const previous = wishlisted
    setWishlistOverride({ productId: product.id, value: !previous })
    apiClient.post('/wishlist', { product_id: product.id })
      .then(res => {
        setWishlistOverride({ productId: product.id, value: Boolean(res.data.wishlisted) })
        showToast(res.data.message)
      })
      .catch(err => {
        setWishlistOverride({ productId: product.id, value: previous })
        showToast(err.response?.data?.message || t('common.error'), 'error')
      })
  }

  return (
    <div 
      data-aos="fade-up"
      data-aos-delay={index * 80}
      onClick={() => onSelect(product)}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#E8E8E8] overflow-hidden shadow-glass cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-premium"
    >
      {/* Badge sales */}
      {hasSale && (
        <span className="absolute top-4 left-4 z-10 bg-primary text-white font-semibold text-xs px-3 py-1 rounded-full border border-white/10">
          - {product.discount_percentage}%
        </span>
      )}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 shadow-glass transition hover:-translate-y-0.5 ${
          wishlisted ? 'bg-primary text-white' : 'bg-white/90 text-[#1A1A1A] hover:text-primary'
        }`}
        aria-label={t('profile.wishlist_title')}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#F5F5F5]">
        <img 
          src={product.thumbnail} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-4">
          <span className="text-xs text-white font-semibold">{t('product.customize_hint')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-xs text-primary font-bold tracking-wider uppercase mb-1">
          {product.category?.name ?? 'Hamburger King'}
        </span>
        <h4 className="font-bold text-base text-[#1A1A1A] line-clamp-1 group-hover:text-primary transition">
          {product.name}
        </h4>
        <p className="text-xs text-[#666666] mt-2 line-clamp-2 leading-relaxed flex-1">
          {product.short_description ?? product.description}
        </p>

        {/* Pricing & Add */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#E8E8E8]">
          <div className="flex flex-col">
            {hasSale ? (
              <>
                <span className="text-xs text-gray-400 line-through leading-none mb-0.5">{formatVND(product.base_price)}</span>
                <span className="text-lg font-semibold text-primary leading-none">{formatVND(product.sale_price)}</span>
              </>
            ) : (
              <span className="text-lg font-semibold text-primary leading-none">{formatVND(product.base_price)}</span>
            )}
          </div>

          <button 
            onClick={handleQuickAdd}
            className="p-2.5 rounded-[8px] bg-primary hover:opacity-90 text-white transition hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Product Customizer Dialog / Detail modal
function ProductDetailModal({ product, onClose }) {
  const { t, i18n } = useTranslation()
  const addItem = useCartStore(state => state.addItem)
  const showToast = useUiStore(state => state.showToast)
  const initialRatingSummary = {
    count: Number(product?.reviews_count || 0),
    average: Number(product?.reviews_avg_rating || 0),
  }
  
  const [size, setSize] = useState('S')
  const [selectedToppings, setSelectedToppings] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [allToppings, setToppings] = useState([])
  const [ratingSummary, setRatingSummary] = useState(initialRatingSummary)
  const availableSizes = (product?.sizes || [])
    .filter(item => item.is_available !== false)
    .sort((a, b) => ['S', 'M', 'L', 'XL'].indexOf(a.size) - ['S', 'M', 'L', 'XL'].indexOf(b.size))

  useEffect(() => {
    const categoryId = product?.category_id || product?.category?.id
    apiClient.get('/toppings', { params: { category_id: categoryId || undefined } })
      .then(res => setToppings(res.data || []))
      .catch(() => setToppings([]))
  }, [product, i18n.language])

  useEffect(() => {
    if (!product?.slug) return undefined

    let ignore = false
    apiClient.get(`/products/${product.slug}`)
      .then(res => {
        if (!ignore) {
          setRatingSummary({
            count: Number(res.data.reviews_count || 0),
            average: Number(res.data.reviews_avg_rating || 0),
          })
        }
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [product?.slug])

  useEffect(() => {
    if (!availableSizes.length) {
      if (size) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSize('')
      }
      return
    }
    if (!availableSizes.some(item => item.size === size)) {
      setSize(availableSizes[0].size)
    }
  }, [availableSizes, size])

  if (!product) return null

  // Calculate pricing
  let basePrice = parseFloat(product.sale_price ?? product.base_price)
  
  // Size pricing upcharges
  const sizeModel = availableSizes.find(s => s.size === size)
  if (sizeModel) {
    basePrice += parseFloat(sizeModel.extra_price)
  }

  // Topping pricing upcharges
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + parseFloat(t.price), 0)
  const unitPrice = basePrice + toppingsPrice
  const totalCost = unitPrice * quantity
  const reviewCount = ratingSummary.count
  const averageRating = ratingSummary.average

  const handleToppingToggle = (topping) => {
    const isSelected = selectedToppings.some(t => t.id === topping.id)
    if (isSelected) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id))
    } else {
      setSelectedToppings([...selectedToppings, topping])
    }
  }

  const handleAdd = () => {
    const selectedSize = availableSizes.length ? size : ''
    addItem(product, selectedSize, selectedToppings, quantity)
    showToast(selectedSize
      ? t('cart.added_product_quantity', { quantity, name: product.name, size: selectedSize })
      : t('cart.added_product_quantity_simple', { quantity, name: product.name }))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white border border-[#E8E8E8] rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] animate-float-half">
        {/* Gallery Slider section */}
        <div className="w-full md:w-1/2 relative bg-[#F5F5F5] flex flex-col justify-center max-h-[35vh] md:max-h-none">
          <img 
            src={product.thumbnail} 
            alt={product.name} 
            className="w-full h-full object-cover aspect-square"
          />
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-1.5 rounded-full bg-white/80 border border-[#E8E8E8] text-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration details section */}
        <div className="w-full md:w-1/2 p-[28px_32px] flex flex-col overflow-y-auto max-h-[55vh] md:max-h-none">
          <div className="hidden md:flex justify-end">
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#F5F5F5] transition text-gray-400 hover:text-[#1A1A1A]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <span className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
            {product.category?.name ?? 'Hamburger King'}
          </span>
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide">{product.name}</h2>
          <p className="text-xs text-[#666666] leading-relaxed mt-3">{product.description}</p>

          <div className="mt-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">{t('product.customer_reviews')}</h4>
              <div className="flex items-center gap-1 text-[#FFC72C]">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={15} className={star <= Math.round(averageRating) ? 'fill-current' : ''} />
                ))}
                <span className="ml-1 text-xs font-bold text-[#1A1A1A]">{averageRating ? averageRating.toFixed(1) : '-'}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {reviewCount ? t('product.rating_count', { count: reviewCount }) : t('product.no_reviews')}
            </p>
          </div>

          {/* Size radio pickers */}
          {availableSizes.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-[20px] text-[#1A1A1A] tracking-wide uppercase mb-3">{t('product.size').toUpperCase()}</h4>
              <div className={`grid gap-2 ${availableSizes.length >= 4 ? 'grid-cols-4' : availableSizes.length === 3 ? 'grid-cols-3' : availableSizes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {availableSizes.map((sModel) => {
                  const s = sModel.size
                  const extra = sModel ? parseFloat(sModel.extra_price) : 0
                  return (
                    <button 
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex flex-col items-center py-2.5 rounded-[10px] border transition text-sm ${
                        size === s 
                          ? 'bg-primary/10 border-primary text-primary font-semibold' 
                          : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <span className="font-semibold">{s}</span>
                      {extra > 0 && <span className="text-[10px] opacity-80">+{formatVND(extra)}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Premium topping selections */}
          {allToppings.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-[20px] text-[#1A1A1A] tracking-wide uppercase mb-3">{t('product.topping').toUpperCase()}</h4>
              <div className="space-y-2">
                {allToppings.map((topping) => {
                  const isSelected = selectedToppings.some(t => t.id === topping.id)
                  return (
                    <div 
                      key={topping.id}
                      onClick={() => handleToppingToggle(topping)}
                      className={`flex items-center justify-between p-3 rounded-[10px] border cursor-pointer transition ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {topping.image ? (
                          <img src={assetUrl(topping.image)} alt="" className="w-6 h-6 rounded-full object-cover bg-white" />
                        ) : (
                          <span className="text-lg">{topping.category === 'cheese' ? '🧀' : topping.category === 'meat' ? '🥓' : topping.category === 'veggie' ? '🧅' : '🏺'}</span>
                        )}
                        <span className="text-xs font-bold text-[#1A1A1A]">{topping.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">+{formatVND(topping.price)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to cart control panel */}
          <div className="mt-8 pt-4 border-t border-[#E8E8E8] flex items-center justify-between">
            <div className="flex items-center gap-3 bg-[#F8F8F8] rounded-full border border-[#E8E8E8] p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:bg-[#E8E8E8] rounded-full transition text-[#666666] hover:text-[#1A1A1A]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-base text-[#1A1A1A] px-2">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-[#E8E8E8] rounded-full transition text-[#666666] hover:text-[#1A1A1A]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold">{t('cart.total')}</span>
              <span className="text-xl font-semibold text-primary">{formatVND(totalCost)}</span>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="mt-5 w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 shadow-glass"
          >
            {t('product.add_to_cart').toUpperCase()}
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- PORTAL PAGES ---

// 1. Home Page
function Home({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeatured] = useState([])
  const [combos, setCombos] = useState([])
  const [comboProducts, setComboProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const heroBanners = banners.filter(b => b.position === 'hero')
  const activeHero = heroBanners[heroIndex] || heroBanners[0]

  useEffect(() => {
    Promise.all([
      apiClient.get('/banners'),
      apiClient.get('/categories'),
      apiClient.get('/products', { params: { featured: true, limit: 3 } }),
      apiClient.get('/products', { params: { category: 'combo-meals', limit: 50 } }),
      apiClient.get('/combos'),
      apiClient.get('/branches'),
      apiClient.get('/posts/featured')
    ]).then(([bannersRes, catsRes, productsRes, comboProductsRes, combosRes, branchesRes, postsRes]) => {
      setBanners(bannersRes.data)
      setHeroIndex(0)
      setCategories(catsRes.data)
      setFeatured(Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []))
      setComboProducts(Array.isArray(comboProductsRes.data) ? comboProductsRes.data : (comboProductsRes.data.data || []))
      setCombos(combosRes.data)
      setBranches(branchesRes.data)
      setBlogPosts(postsRes.data || [])
      setLoading(false)
      setTimeout(() => AOS.refresh(), 0)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [i18n.language])

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setHeroIndex(index => (index + 1) % heroBanners.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [heroBanners.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  const findSellableComboProduct = (combo) => {
    const comboSlug = String(combo?.slug || '')
    const sellableSlug = comboSlug.replace(/-set$/, '')
    return comboProducts.find(product => product.slug === sellableSlug)
      || comboProducts.find(product => String(product.name || '').toLowerCase() === String(combo?.name || '').toLowerCase())
  }

  return (
    <div className="bg-[#FFFAF5] text-[#1A1A1A]">
      {/* Premium Hero Banner */}
      <section className="relative flex h-[640px] w-full items-center overflow-hidden bg-black pb-24 lg:h-[680px]">
        <div className="absolute inset-0 z-0">
          {activeHero?.image && (
            <img
              key={activeHero.id || activeHero.image}
              src={activeHero.image}
              alt={activeHero.title}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-[#FFFAF5]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <span className="text-[#FFC72C] font-semibold text-lg tracking-widest uppercase mb-3 block animate-float">{t('home.hero_badge').toUpperCase()}</span>
          <h1 className="font-extrabold text-[clamp(34px,4.4vw,58px)] leading-none text-white tracking-[-0.5px] uppercase max-w-2xl drop-shadow-lg">
            {activeHero?.title || t('home.hero_title')}
          </h1>
          <p className="text-sm md:text-base text-white max-w-md mt-6 leading-relaxed">
            {activeHero?.subtitle || t('home.hero_desc')}
          </p>
          <div className="flex gap-4 mt-8">
            <Link 
              to={activeHero?.link || '/menu'}
              className="bg-primary hover:opacity-90 text-white font-semibold px-8 py-3.5 rounded-[8px] text-sm tracking-widest transition hover:-translate-y-[1px]"
            >
              {t('home.order_now').toUpperCase()}
            </Link>
            <Link 
              to="/combos" 
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-[8px] text-sm tracking-widest transition"
            >
              {t('nav.combos').toUpperCase()}
            </Link>
          </div>
        </div>
        {heroBanners.length > 1 && (
          <div className="absolute bottom-8 right-6 z-20 flex items-center gap-3 rounded-full border border-white/20 bg-black/25 px-3 py-2 backdrop-blur md:right-12">
            <button
              type="button"
              onClick={() => setHeroIndex(index => (index - 1 + heroBanners.length) % heroBanners.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {heroBanners.map((banner, index) => (
                <button
                  key={banner.id || `${banner.image}-${index}`}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === heroIndex ? 'w-8 bg-[#FFC72C]' : 'w-2.5 bg-white/60 hover:bg-white'}`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setHeroIndex(index => (index + 1) % heroBanners.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Next banner"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      {/* Category grid navigations */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">{t('home.menu_title').toUpperCase()}</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">{t('home.menu_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <Link 
              key={cat.id} 
              data-aos="zoom-in"
              data-aos-delay={index * 100}
              to={`/menu?category=${cat.slug}`}
              className="group relative h-40 rounded-2xl overflow-hidden border border-[#E8E8E8] shadow-glass cursor-pointer flex flex-col justify-end p-4 transition-all duration-200 hover:-translate-y-1 bg-white hover:shadow-premium"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <div className="relative z-10">
                <h4 className="font-semibold text-lg text-[#1A1A1A] uppercase group-hover:text-primary transition">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-[#666666] mt-1 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured scroll list */}
      <section className="bg-white border-y border-[#E8E8E8] py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">{t('home.featured_title')}</h2>
              <p className="text-xs text-[#666666] mt-1">{t('home.featured_subtitle')}</p>
            </div>
            <Link to="/menu" className="flex items-center gap-1 text-primary hover:opacity-85 font-bold text-xs tracking-wider uppercase transition">
              {t('common.see_all')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.slice(0, 3).map((p, index) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Combo Sets */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">{t('combo.saving_title')}</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">{t('combo.home_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {combos.map((combo, index) => {
            const sellableCombo = findSellableComboProduct(combo)

            return (
              <div key={combo.id} data-aos="zoom-in" data-aos-delay={index * 100} className="flex flex-col sm:flex-row gap-6 p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-glass">
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="w-full sm:w-44 h-44 object-cover rounded-xl"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xl text-[#1A1A1A] uppercase tracking-wide">{combo.name}</h4>
                    <p className="text-xs text-[#666666] leading-relaxed mt-2">{combo.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8E8E8]">
                    <span className="font-semibold text-2xl text-primary">{formatVND(combo.price)}</span>
                    <button
                      type="button"
                      onClick={() => sellableCombo && onSelectProduct?.(sellableCombo)}
                      disabled={!sellableCombo}
                      aria-label={t('product.add_to_cart')}
                      title={t('product.add_to_cart')}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#FFC72C] text-[#1A1A1A] transition hover:-translate-y-[1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <BlogSlider posts={blogPosts} />

      {/* Branches maps */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">{t('branch.location_title')}</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">{t('branch.location_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b, index) => (
            <div key={b.id} data-aos="fade-up" data-aos-delay={index * 120} className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-premium hover:border-gray-300 transition">
              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">{b.name}</h4>
                <p className="text-xs text-[#666666] leading-relaxed mt-2">{b.address}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {b.phone}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex justify-between items-center text-xs">
                <span className="text-gray-400">{t('branch.opening_hours_with_time', { time: `${b.open_time.slice(0, 5)} - ${b.close_time.slice(0, 5)}` })}</span>
                <a 
                  href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary font-bold hover:opacity-80 uppercase tracking-wide transition"
                >
                  {t('branch.map')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// 2. Menu Page
function Menu({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const ITEMS_PER_PAGE = 9
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('sort_order')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const activeCategory = searchParams.get('category') || ''

  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
      sort_by: sortBy,
    }

    if (activeCategory) params.category = activeCategory
    if (search) params.search = search

    Promise.all([
      apiClient.get('/categories'),
      apiClient.get('/products', { params })
    ]).then(([catsRes, productsRes]) => {
      setCategories(catsRes.data)
      setProducts(productsRes.data.data || [])
      setTotalPages(productsRes.data.last_page || 1)
      setLoading(false)
      setTimeout(() => AOS.refresh(), 0)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [activeCategory, search, sortBy, currentPage, i18n.language])

  const handleCategorySelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams)
    if (!slug || activeCategory === slug) {
      nextParams.delete('category')
    } else {
      nextParams.set('category', slug)
    }
    setLoading(true)
    setCurrentPage(1)
    setSearchParams(nextParams)
  }

  const handleSearchChange = (value) => {
    setLoading(true)
    setSearch(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value) => {
    setLoading(true)
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setLoading(true)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages = []
    for (let page = 1; page <= totalPages; page += 1) {
      if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
        pages.push(page)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 flex flex-col md:flex-row gap-6 bg-[#FFFAF5] text-[#1A1A1A]">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-glass">
          <h3 className="font-bold text-xl text-primary tracking-wide uppercase mb-4">{t('menu.category_title')}</h3>
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0">
            <button
              data-aos="fade-right"
              onClick={() => handleCategorySelect('')}
              className={`text-left text-xs font-semibold px-4 py-2.5 rounded-[10px] border transition whitespace-nowrap md:whitespace-normal ${
                activeCategory === '' 
                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                  : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
              }`}
            >
              {t('common.all').toUpperCase()}
            </button>
            {categories.map((cat, index) => (
              <button 
                key={cat.id}
                data-aos="fade-right"
                data-aos-delay={index * 50}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`text-left text-xs font-semibold px-4 py-2.5 rounded-[10px] border transition whitespace-nowrap md:whitespace-normal ${
                  activeCategory === cat.slug 
                    ? 'bg-primary/10 border-primary text-primary font-bold' 
                    : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Sort */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-glass">
          <h3 className="font-bold text-xl text-primary tracking-wide uppercase mb-4">{t('menu.sort_title')}</h3>
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-[#F8F8F8] border border-[#E8E8E8] text-xs text-[#1A1A1A] rounded-[10px] px-4 py-3 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          >
            <option value="sort_order">{t('menu.sort_default')}</option>
            <option value="price_asc">{t('menu.sort_price_asc')}</option>
            <option value="price_desc">{t('menu.sort_price_desc')}</option>
            <option value="newest">{t('menu.sort_newest')}</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Search Header */}
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder={t('menu.search_placeholder')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] px-5 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
          />
        </div>

        <h2 data-aos="fade-up" className="sr-only">{t('home.menu_title')}</h2>

        {/* Grids */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4 stroke-1" />
            <h4 className="font-bold text-xl text-gray-500 uppercase tracking-wide">{t('menu.no_products_title')}</h4>
            <p className="text-gray-400 text-sm mt-1">{t('menu.no_products_desc')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, index) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} index={index} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-[8px] bg-white border border-[#E8E8E8] text-xs font-semibold text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition"
                >
                  {t('common.previous_arrow')}
                </button>
                {getPageNumbers().map((page, index) => page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-9 px-3 py-2 rounded-[8px] border text-xs font-semibold transition ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-[#1A1A1A] border-[#E8E8E8] hover:border-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-[8px] bg-white border border-[#E8E8E8] text-xs font-semibold text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// 3. Combos Page (renders seeded combos lists)
function Combos() {
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
          <div key={combo.id} data-aos="zoom-in" data-aos-delay={index * 100} className="flex flex-col sm:flex-row gap-6 p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
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
                  MUA NGAY
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 4. Store Branches Page
function Branches() {
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
          <div key={b.id} data-aos="fade-up" data-aos-delay={index * 120} className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-premium hover:border-gray-400 transition">
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

// 5. Auth Pages (Login & Register card view)
function Login() {
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
    <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
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
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2"
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

function Register() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const setLogin = useAuthStore(state => state.setLogin)
  const showToast = useUiStore(state => state.showToast)
  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setLoading(true)
    apiClient.post('/auth/register', { 
      name, 
      email, 
      password, 
      password_confirmation: passwordConfirm, 
      phone 
    }).then(res => {
      setLogin(res.data.user, res.data.access_token)
      showToast(t('auth.register_success_welcome'))
      setLoading(false)
      navigate('/')
    }).catch(err => {
      console.error(err)
      showToast(err.response?.data?.message || t('auth.register_error'), 'error')
      setLoading(false)
    })
  }

  return (
    <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
        <div className="text-center mb-8">
          <BrandLogo className="justify-center mx-auto" containerClassName="h-16 w-[260px]" />
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide mt-6">{t('auth.member_register_title')}</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.name')}</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.name_placeholder')}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
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
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.phone')}</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0909xxxxxx"
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
              placeholder={t('auth.password_min_placeholder')}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.confirm_password')}</label>
            <input 
              type="password" 
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder={t('auth.confirm_password_placeholder')}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2"
          >
            {loading ? t('auth.registering') : t('auth.register_new_account')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          {t('auth.has_account')}{' '}
          <Link to="/login" className="text-primary hover:underline font-bold tracking-wide transition">
            {t('auth.login_now')}
          </Link>
        </div>
      </div>
    </div>
  )
}

// 6. Checkout Screen (includes multi-address selections, Mock Payment redirections)
// Refactored to light theme with custom borders, rounded inputs, and premium typography
function usePaymentMethods() {
  const { t } = useTranslation()
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    apiClient.get('/payment-methods')
      .then(res => {
        if (!ignore) setMethods(res.data?.data || [])
      })
      .catch(() => {
        if (!ignore) {
          setMethods([{ key: 'cod', name: t('checkout.cod_method'), icon: 'cod', is_default: true }])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [t])

  return { methods, loading }
}

function paymentIcon(key) {
  if (key === 'loyalty_points') return <Gift className="w-5 h-5 text-yellow-500" />
  return <CreditCard className="w-5 h-5 text-gray-400" />
}

function PaymentMethodSelector({ selected, onChange }) {
  const { methods, loading } = usePaymentMethods()

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(item => <div key={item} className="h-[58px] bg-[#F5F5F5] rounded-[10px] animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {methods.map(method => (
        <div
          key={method.key}
          onClick={() => onChange(method.key)}
          className={`flex items-center justify-between p-4 rounded-[10px] border cursor-pointer transition-smooth hover:-translate-y-[1px] ${
            selected === method.key
              ? 'border-primary bg-primary/5 text-[#1A1A1A]'
              : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentIcon(method.key)}
            <div>
              <span className="text-xs font-semibold text-[#1A1A1A]">{method.name}</span>
              {method.description && <p className="text-[10px] text-gray-400 mt-0.5">{method.description}</p>}
            </div>
          </div>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selected === method.key ? 'border-primary text-primary' : 'border-gray-400'
          }`}>
            {selected === method.key && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </span>
        </div>
      ))}
    </div>
  )
}

function Checkout() {
  const { t, i18n } = useTranslation()
  const { cartItems, getCartTotals, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore()
  const user = useAuthStore(state => state.user)
  const { showToast } = useUiStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [deliveryType, setDelivery] = useState('delivery')
  const [paymentMethod, setPayment] = useState('cod')
  const [couponInput, setCouponInput] = useState('')
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  
  // Custom manual address input
  const [manualAddress, setManualAddress] = useState(() => {
    const savedAddress = getLastCheckoutAddress()
    return {
      recipient_name: savedAddress.recipient_name || user?.name || '',
      phone: savedAddress.phone || user?.phone || '',
      province: savedAddress.province || '',
      district: savedAddress.district || '',
      ward: savedAddress.ward || '',
      street: savedAddress.street || '',
    }
  })

  // Scheduler options
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [loyaltyInfo, setLoyaltyInfo] = useState({
    balance: user?.loyalty_balance || 0,
    vnd_per_point: 100,
    loading: Boolean(user)
  })

  const [shippingCalculation, setShippingCalculation] = useState(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingError, setShippingError] = useState(null)

  // Pickup Branch Selection states
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)

  const totals = getCartTotals(deliveryType)
  const displayShippingFee = deliveryType === 'pickup' ? 0 : (shippingCalculation?.fee ?? (totals.subtotal >= 300000 ? 0 : 15000))
  const displayTotal = Math.max(0, totals.subtotal - totals.couponDiscount + displayShippingFee)

  const loyaltyPointValue = Math.max(1, Number(loyaltyInfo.vnd_per_point) || 100)
  const loyaltyBalance = Math.max(0, Number(loyaltyInfo.balance) || 0)
  const loyaltyAvailableValue = loyaltyBalance * loyaltyPointValue
  const loyaltyPointsNeeded = Math.ceil(displayTotal / loyaltyPointValue)
  const loyaltyShortfall = Math.max(0, loyaltyPointsNeeded - loyaltyBalance)
  const canPayWithLoyalty = Boolean(user) && loyaltyShortfall === 0
  const isShippingInvalid = deliveryType === 'delivery' && (calculatingShipping || !shippingCalculation || shippingCalculation.out_of_range)
  
  const isPickupInvalid = deliveryType === 'pickup' && (!selectedBranch || !manualAddress.recipient_name || !manualAddress.phone)
  const isCheckoutInvalid = isShippingInvalid || isPickupInvalid

  useEffect(() => {
    // Load customer address book
    apiClient.get('/addresses')
      .then(res => {
        setAddresses(res.data)
        const defaultAddr = res.data.find(a => a.is_default) || res.data[0]
        setSelectedAddress(defaultAddr)
      }).catch(err => {
        console.error(err)
      })

    // Load active branches
    apiClient.get('/branches')
      .then(res => {
        setBranches(res.data)
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0])
        }
      }).catch(err => {
        console.error('Failed to load branches:', err)
      })
  }, [])

  useEffect(() => {
    if (!user) return

    let ignore = false
    apiClient.get('/loyalty-points')
      .then(res => {
        if (ignore) return
        setLoyaltyInfo({
          balance: res.data?.balance || 0,
          vnd_per_point: res.data?.vnd_per_point || 100,
          loading: false
        })
      })
      .catch(() => {
        if (!ignore) setLoyaltyInfo(current => ({ ...current, loading: false }))
      })

    return () => {
      ignore = true
    }
  }, [user])

  useEffect(() => {
    if (deliveryType !== 'delivery') {
      setShippingCalculation(null)
      return
    }

    const addr = selectedAddress || manualAddress
    if (!addr || !addr.province || !addr.district) {
      setShippingCalculation(null)
      return
    }

    const timer = setTimeout(() => {
      setCalculatingShipping(true)
      setShippingError(null)

      apiClient.post('/shipping/calculate', {
        order_amount: totals.subtotal,
        lat: addr.lat || null,
        lng: addr.lng || null,
        address: {
          province: addr.province,
          district: addr.district,
          ward: addr.ward,
          street: addr.street
        }
      })
      .then(res => {
        setShippingCalculation(res.data.data)
      })
      .catch(err => {
        console.error('Failed to calculate shipping:', err)
        setShippingError(err.response?.data?.message || t('checkout.shipping_error_fallback'))
      })
      .finally(() => {
        setCalculatingShipping(false)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [deliveryType, selectedAddress, manualAddress.province, manualAddress.district, manualAddress.ward, manualAddress.street, totals.subtotal])

  if (cartItems.length === 0) {
    return <Navigate to="/menu" />
  }

  const handleApplyCoupon = () => {
    if (!couponInput) return
    apiClient.post('/cart/apply-coupon', { code: couponInput, subtotal: totals.subtotal })
      .then(res => {
        applyCoupon(res.data)
        showToast(t('checkout.coupon_applied'))
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.coupon_invalid'), 'error')
      })
  }

  const handleCheckoutSubmit = () => {
    if (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) {
      showToast(t('checkout.loyalty_not_enough', {
        needed: loyaltyPointsNeeded,
        current: loyaltyBalance
      }), 'error')
      return
    }

    setLoading(true)

    const payload = {
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      use_loyalty_points: paymentMethod === 'loyalty_points',
      coupon_code: coupon ? coupon.code : null,
      note,
      scheduled_at: isScheduled ? scheduledAt : null,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size || null,
        toppings: item.toppings.map(t => t.id)
      }))
    }

    if (deliveryType === 'delivery') {
      if (selectedAddress) {
        payload.address = {
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.street,
          lat: selectedAddress.lat || shippingCalculation?.lat || null,
          lng: selectedAddress.lng || shippingCalculation?.lng || null,
        }
      } else {
        // Validate manual input
        if (!manualAddress.recipient_name || !manualAddress.phone || !manualAddress.province || !manualAddress.district || !manualAddress.ward || !manualAddress.street) {
          showToast(t('checkout.address_required'), 'error')
          setLoading(false)
          return
        }
        payload.address = {
          ...manualAddress,
          lat: shippingCalculation?.lat || null,
          lng: shippingCalculation?.lng || null
        }
        localStorage.setItem('hk_last_checkout_address', JSON.stringify(manualAddress))
      }
    } else if (deliveryType === 'pickup') {
      if (!selectedBranch) {
        showToast(t('checkout.branch_required'), 'error')
        setLoading(false)
        return
      }
      if (!manualAddress.recipient_name || !manualAddress.phone) {
        showToast(t('checkout.recipient_info_required'), 'error')
        setLoading(false)
        return
      }
      payload.address = {
        recipient_name: manualAddress.recipient_name,
        phone: manualAddress.phone,
        province: selectedBranch.name,
        district: selectedBranch.address,
        ward: 'pickup',
        street: selectedBranch.phone || '',
        lat: selectedBranch.lat || null,
        lng: selectedBranch.lng || null
      }
    }

    apiClient.post('/orders', payload)
      .then(res => {
        clearCart()
        showToast(t('checkout.order_created'))
        setLoading(false)
        
        // Redirect to the payment gateway URL returned by the backend.
        if (res.data.payment_url) {
          // If the gateway is online, let's redirect
          window.location.href = res.data.payment_url
        } else {
          navigate(`/orders/tracking/${res.data.order.order_code}`)
        }
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.payment_error'), 'error')
        setLoading(false)
      })
  }

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      
      {/* Refactored Light Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-10 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-smooth ${
            step >= 1 ? 'border-primary bg-primary text-white' : 'border-[#E8E8E8] bg-[#E8E8E8] text-[#999999]'
          }`}>1</span>
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 1 ? 'text-primary' : 'text-[#999999]'}`}>{t('checkout.step_info')}</span>
        </div>
        <div className={`h-0.5 flex-1 transition-smooth ${step >= 2 ? 'bg-primary' : 'bg-[#E8E8E8]'}`} />
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-smooth ${
            step >= 2 ? 'border-primary bg-primary text-white' : 'border-[#E8E8E8] bg-[#E8E8E8] text-[#999999]'
          }`}>2</span>
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 2 ? 'text-primary' : 'text-[#999999]'}`}>{t('checkout.step_payment')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checkout Forms */}
        <main className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_method')}</h2>
              
              {/* Delivery Type toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDelivery('delivery')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] ${
                    deliveryType === 'delivery' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  {t('checkout.delivery').toUpperCase()}
                </button>
                <button 
                  onClick={() => setDelivery('pickup')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] ${
                    deliveryType === 'pickup' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  {t('checkout.pickup').toUpperCase()}
                </button>
              </div>

              {/* Address Book Selections */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_address')}</h3>
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-smooth ${
                            selectedAddress?.id === addr.id 
                              ? 'border-primary bg-primary/5 text-[#1A1A1A]' 
                              : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                            {addr.is_default && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-[8px] font-bold uppercase">{t('common.default')}</span>}
                          </div>
                          <p className="text-xs font-semibold text-[#1A1A1A] mt-2">{addr.recipient_name} - {addr.phone}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
                        </div>
                      ))}
                      <div 
                        onClick={() => setSelectedAddress(null)}
                        className={`p-4 rounded-2xl border border-dashed border-[#E8E8E8] cursor-pointer transition-smooth flex flex-col items-center justify-center text-center text-xs text-gray-400 hover:text-[#1A1A1A] hover:border-gray-400 ${
                          !selectedAddress ? 'border-primary text-primary' : 'bg-[#F8F8F8]'
                        }`}
                      >
                        <Plus className="w-5 h-5 mb-1 text-primary" />
                        <span>{t('checkout.use_other_address')}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Manual Address Input Card */}
                  {!selectedAddress && (
                    <div className="p-5 rounded-2xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.recipient_name')}</label>
                        <input 
                          type="text" 
                          placeholder={t('auth.name_placeholder')}
                          value={manualAddress.recipient_name}
                          onChange={(e) => setManualAddress({ ...manualAddress, recipient_name: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.phone')}</label>
                        <input 
                          type="tel" 
                          placeholder="09xxxxxx" 
                          value={manualAddress.phone}
                          onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <VietnamAddressSelector
                        province={manualAddress.province}
                        district={manualAddress.district}
                        ward={manualAddress.ward}
                        street={manualAddress.street}
                        onChange={({ province, district, ward, street }) =>
                          setManualAddress({ ...manualAddress, province, district, ward, street })
                        }
                        theme="storefront"
                      />
                    </div>
                  )}

                  {/* Shipping status/warnings */}
                  {calculatingShipping && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl mt-3 animate-pulse font-semibold">
                      🔄 {t('checkout.calculating')}
                    </div>
                  )}
                  {shippingError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl mt-3 font-semibold">
                      ⚠️ {shippingError}
                    </div>
                  )}
                  {shippingCalculation?.out_of_range && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mt-3 font-semibold">
                      ⚠️ {shippingCalculation.message || t('checkout.out_of_range_error')}
                    </div>
                  )}
                  {shippingCalculation && !shippingCalculation.out_of_range && shippingCalculation.distance_km && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl mt-3 font-semibold space-y-1">
                      {shippingCalculation.nearest_branch_name && (
                        <p>🏪 {t('checkout.fulfilled_by')}: <span className="font-bold text-[#1A1A1A]">{shippingCalculation.nearest_branch_name}</span></p>
                      )}
                      <p>📍 {t('checkout.distance')}: {shippingCalculation.distance_km}km. {t('checkout.estimated')}: {
                        typeof shippingCalculation.estimated === 'object'
                          ? (shippingCalculation.estimated[i18n.language] || shippingCalculation.estimated.vi || '30-45 phút')
                          : (shippingCalculation.estimated || '30-45 phút')
                      }</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Scheduler option */}
              <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_time')}</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsScheduled(false)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] ${
                      !isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    {t('checkout.deliver_now').toUpperCase()}
                  </button>
                  <button 
                    onClick={() => setIsScheduled(true)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] ${
                      isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    {t('checkout.schedule_order').toUpperCase()}
                  </button>
                </div>

                {isScheduled && (
                  <div>
                    <input 
                      type="datetime-local" 
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Order Note */}
              <div className="space-y-2 pt-4 border-t border-[#E8E8E8]">
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.order_note')}</label>
                <textarea 
                  placeholder={t('checkout.order_note_placeholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              {/* Self-pickup branch selection UI */}
              {deliveryType === 'pickup' && (
                <div className="space-y-6 pt-4 border-t border-[#E8E8E8]">
                  {/* Recipient info for pickup */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-[18px] text-[#1A1A1A] uppercase tracking-wide">
                      {t('checkout.recipient_info')}
                    </h3>
                    <div className="p-5 rounded-2xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.5px] text-[#888888] mb-2 uppercase">
                          {t('checkout.recipient_name')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder={t('auth.name_placeholder')}
                          value={manualAddress.recipient_name}
                          onChange={(e) => setManualAddress({ ...manualAddress, recipient_name: e.target.value })}
                          className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[12px] px-[14px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.5px] text-[#888888] mb-2 uppercase">
                          {t('checkout.phone')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="tel" 
                          placeholder="09xxxxxx" 
                          value={manualAddress.phone}
                          onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                          className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[12px] px-[14px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branch selection */}
                  <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                    <h3 className="font-bold text-[18px] text-[#1A1A1A] uppercase tracking-wide">
                      {t('checkout.select_pickup_branch')}
                    </h3>
                    
                    {branches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {branches.map((br) => {
                          const isSelected = selectedBranch?.id === br.id
                          return (
                            <div 
                              key={br.id}
                              onClick={() => setSelectedBranch(br)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:shadow-premium ${
                                isSelected 
                                  ? 'border-primary bg-primary/5 text-[#1A1A1A]' 
                                  : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                  {t('checkout.selected')}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-xs text-[#1A1A1A] mb-1.5 pr-12">{br.name}</h4>
                                <p className="text-[10px] leading-relaxed text-[#666666] mb-2">{br.address}</p>
                              </div>
                              <div className="pt-2 border-t border-dashed border-[#E8E8E8] flex flex-col sm:flex-row sm:justify-between gap-1 text-[9px] text-[#888888]">
                                <span>📞 {t('checkout.branch_hotline')}: <strong className="text-[#1A1A1A]">{br.phone || '-'}</strong></span>
                                <span>🕒 {br.open_time?.substring(0, 5) || '08:00'} - {br.close_time?.substring(0, 5) || '22:00'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-[#E8E8E8] rounded-2xl text-xs text-gray-400 bg-white">
                        ⚠️ {t('checkout.no_active_branches')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                disabled={isCheckoutInvalid}
                className={`w-full font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition flex justify-center items-center gap-2 active:translate-y-0 mt-6 ${
                  isCheckoutInvalid
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 text-white hover:-translate-y-[1px]'
                }`}
              >
                {t('checkout.continue_to_payment')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.payment_method')}</h2>
              
              <PaymentMethodSelector selected={paymentMethod} onChange={setPayment} />

              {paymentMethod === 'loyalty_points' && (
                <div className={`rounded-xl border p-4 text-xs space-y-3 ${
                  canPayWithLoyalty
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-amber-200 bg-amber-50/80'
                }`}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_balance_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">
                        {loyaltyInfo.loading ? t('checkout.loyalty_loading') : `${loyaltyBalance} ${t('profile.points')}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_value_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">{formatVND(loyaltyAvailableValue)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_needed_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">{loyaltyPointsNeeded} {t('profile.points')}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3">
                    <p className="text-[11px] text-gray-500">
                      {t('checkout.loyalty_exchange_note', { value: formatVND(loyaltyPointValue) })}
                    </p>
                    <p className={`font-bold ${canPayWithLoyalty ? 'text-emerald-600' : 'text-amber-700'}`}>
                      {canPayWithLoyalty
                        ? t('checkout.loyalty_enough')
                        : t('checkout.loyalty_shortfall', { points: loyaltyShortfall, amount: formatVND(loyaltyShortfall * loyaltyPointValue) })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-3.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                >
                  {t('checkout.back').toUpperCase()}
                </button>
                <button 
                  onClick={handleCheckoutSubmit}
                  disabled={loading || (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) || isShippingInvalid}
                  className={`w-1/2 font-semibold py-3.5 rounded-[8px] tracking-wider text-xs transition shadow-glass flex justify-center items-center gap-2 active:translate-y-0 ${
                    loading || (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) || isShippingInvalid
                      ? 'bg-gray-300 text-white cursor-not-allowed'
                      : 'bg-primary hover:opacity-90 text-white hover:-translate-y-[1px]'
                  }`}
                >
                  {loading ? t('checkout.processing') : t('checkout.confirm').toUpperCase()}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Refactored light order summary card */}
        <aside className="space-y-6" data-aos="fade-left">
          <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
            <h3 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide mb-4">{t('checkout.order_summary')}</h3>
            
            <div className="divide-y divide-[#E8E8E8] max-h-60 overflow-y-auto mb-4 pr-1">
              {cartItems.map((item) => {
                let baseItemPrice = parseFloat(item.product.sale_price ?? item.product.base_price)
                const sizeModel = item.product.sizes?.find(s => s.size === item.size)
                if (sizeModel) baseItemPrice += parseFloat(sizeModel.extra_price)

                const toppingsPrice = item.toppings.reduce((sum, t) => sum + parseFloat(t.price), 0)
                const unitTotal = baseItemPrice + toppingsPrice

                return (
                  <div key={item.id} className="py-3 flex justify-between text-xs">
                    <div>
                      {/* Product Name DM Sans 15px bold */}
                      <p className="font-bold text-[15px] text-[#1A1A1A] leading-tight">{item.product.name}</p>
                      {/* Sub-info size/quantity DM Sans 13px */}
                      {[
                        item.size ? `Size ${item.size}` : null,
                        ...(item.toppings || []).map(t => t.name)
                      ].filter(Boolean).length > 0 && (
                        <p className="text-[13px] text-[#888888] mt-1">
                          {[
                            item.size ? `Size ${item.size}` : null,
                            ...(item.toppings || []).map(t => t.name)
                          ].filter(Boolean).join(' + ')}
                        </p>
                      )}
                      <p className="text-[13px] text-[#888888] mt-1 font-semibold">x {item.quantity}</p>
                    </div>
                    <span className="text-[#1A1A1A] font-semibold text-sm">{formatVND(unitTotal * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            {/* Coupons input field formatted like fields */}
            <div className="pt-4 border-t border-[#E8E8E8] flex gap-2">
              <input 
                type="text" 
                placeholder={t('checkout.coupon_placeholder')}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-secondary text-[#1A1A1A] font-bold px-4 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
              >
                {t('cart.apply').toUpperCase()}
              </button>
            </div>

            {coupon && (
              <div className="mt-2 flex items-center justify-between bg-primary/10 border border-primary/20 text-xs px-3 py-2 rounded-[10px]">
                <span className="text-primary font-semibold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-primary" /> {coupon.code}</span>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-black transition font-semibold">{t('common.delete').toUpperCase()}</button>
              </div>
            )}

            {/* Price lines */}
            <div className="border-t border-[#E8E8E8] pt-4 mt-4 space-y-2 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('cart.product_savings')}</span>
                  <span>-{formatVND(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('cart.coupon')}</span>
                  <span>-{formatVND(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span className="text-[#1A1A1A] font-semibold">
                  {calculatingShipping ? (
                    <span className="text-gray-400 animate-pulse">{t('checkout.calculating')}</span>
                  ) : deliveryType === 'pickup' ? (
                    t('cart.free_shipping')
                  ) : shippingCalculation?.out_of_range ? (
                    <span className="text-red-500 font-bold">{t('checkout.not_available')}</span>
                  ) : displayShippingFee === 0 ? (
                    t('cart.free_shipping')
                  ) : (
                    formatVND(displayShippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-3 mt-4 flex justify-between items-center">
              <span className="font-bold text-[20px] uppercase tracking-wide text-[#666666]">{t('cart.total')}</span>
              
              {/* Product Total: DM Sans 24px primary red */}
              <span className="font-bold text-2xl text-primary">
                {formatVND(displayTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// 8. Order List & Tracking Screen (Timeline)
function OrderDetailTracking() {
  const { t, i18n } = useTranslation()
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const showToast = useUiStore(state => state.showToast)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)

  const publicSettings = useUiStore(state => state.publicSettings)

  const completedAt = order?.completed_at ? new Date(order.completed_at) : null
  const reviewExpiryDays = Number(publicSettings['review.expiry_days'] || 7)
  const isWithinReviewExpiry = completedAt && (new Date().getTime() - completedAt.getTime()) < reviewExpiryDays * 24 * 60 * 60 * 1000
  
  const complaintExpiryHours = Number(publicSettings['complaint.expiry_hours'] || 24)
  const isWithinComplaintExpiry = completedAt && (new Date().getTime() - completedAt.getTime()) < complaintExpiryHours * 60 * 60 * 1000
  const hasActiveComplaint = order?.complaints?.some(c => ['pending', 'reviewing'].includes(c.status))

  const loadOrder = () => {
    setLoading(true)
    apiClient.get(`/orders/${code}`)
      .then(res => {
        setOrder(res.data)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadOrder()
    const paymentStatus = params.get('payment')
    if (paymentStatus === 'success') {
      showToast(t('order.payment_success'))
    } else if (paymentStatus === 'failed') {
      showToast(t('order.payment_failed'), 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, i18n.language])

  const handleCancel = () => {
    if (window.confirm(t('order.cancel_confirm'))) {
      apiClient.post(`/orders/${code}/cancel`)
        .then(() => {
          showToast(t('order.cancel_success'))
          loadOrder()
        }).catch(err => {
          console.error(err)
          showToast(err.response?.data?.message || t('order.cancel_error'), 'error')
        })
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFAF5]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!order) return <Navigate to="/profile" />

  const steps = [
    { id: 'pending', name: t('order.pending') },
    { id: 'confirmed', name: t('order.confirmed') },
    { id: 'preparing', name: t('order.preparing') },
    { id: 'delivering', name: t('order.delivering') },
    { id: 'completed', name: t('order.completed') || t('order.delivered') },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E8E8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('order.your_order')}</span>
          <h1 className="font-bold text-3xl text-[#1A1A1A] uppercase tracking-wide mt-1">{t('order.code_label', { code: order.order_code })}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('order.placed_at', { date: formatDate(order.created_at) })}</p>
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button 
              onClick={handleCancel}
              className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
            >
              {t('order.cancel').toUpperCase()}
            </button>
          )}
          <Link 
            to="/profile?tab=orders"
            className="bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
          >
            {t('order.history').toUpperCase()}
          </Link>
        </div>
      </div>

      {/* Timeline tracker */}
      {!isCancelled ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] mb-8 shadow-glass">
          <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase mb-6 text-center">{t('order.delivery_status')}</h3>
          <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            {/* Timeline connectors */}
            <div className="absolute top-4 left-4 md:left-0 md:right-0 h-full md:h-0.5 bg-gray-200 z-0" />
            
            {steps.map((st, idx) => {
              const active = idx <= currentStepIndex
              return (
                <div key={st.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center flex-1">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition duration-300 ${
                    active ? 'bg-primary border-primary text-white font-bold' : 'bg-gray-100 border-[#E8E8E8] text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-semibold tracking-wide ${active ? 'text-[#1A1A1A] font-bold' : 'text-gray-400'}`}>
                    {st.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-8 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-primary mb-3 stroke-1 animate-float" />
          <h3 className="font-bold text-xl text-primary uppercase tracking-wide">{t('order.cancelled_title')}</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm">
            {t('order.cancelled_desc')}
          </p>
        </div>
      )}

      {/* Review Invitation Banner */}
      {order.status === 'completed' && !order.order_review && isWithinReviewExpiry && (
        <div className="p-6 rounded-2xl bg-[#FFF5F3] border border-[#FFD9D2] mb-8 shadow-glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h3 className="font-bold text-lg text-[#D62300]">{t('order.write_review')}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('review.invitation_desc')}
            </p>
          </div>
          <button 
            onClick={() => {
              if (order.order_review) {
                showToast(t('order.already_reviewed'), 'error')
                return
              }
              setShowReviewModal(true)
            }}
            className="bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap"
          >
            {t('order.write_review').toUpperCase()}
          </button>
        </div>
      )}

      {/* Already Reviewed Badge */}
      {order.status === 'completed' && order.order_review && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 mb-8 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-green-700">{t('order.already_reviewed')}</span>
        </div>
      )}

      {/* Complaint Timeline Display */}
      {order.complaints && order.complaints.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] mb-8 shadow-glass animate-fade-in">
          <h3 className="font-bold text-lg text-primary uppercase tracking-wide mb-6 text-center">
            {t('order.complaint_timeline_title')}
          </h3>
          <div className="space-y-6">
            {order.complaints.map((complaint) => {
              const timelineSteps = [
                { label: t('order.complaint_status_pending'), done: true, time: formatDate(complaint.created_at) },
                { label: t('order.complaint_status_reviewing'), done: ['reviewing', 'resolved', 'rejected'].includes(complaint.status), time: complaint.status !== 'pending' ? formatDate(complaint.updated_at) : null },
                { 
                  label: complaint.status === 'rejected' ? t('order.complaint_status_rejected') : t('order.complaint_status_resolved'), 
                  done: ['resolved', 'rejected'].includes(complaint.status), 
                  time: ['resolved', 'rejected'].includes(complaint.status) ? formatDate(complaint.resolved_at || complaint.updated_at) : null 
                },
              ]
              return (
                <div key={complaint.id} className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="font-semibold text-gray-500">{t('complaint.type')}: <strong className="text-gray-800">{t(`complaint.type_${complaint.type}`)}</strong></span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      complaint.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      complaint.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t(`order.complaint_status_${complaint.status}`)}
                    </span>
                  </div>
                  
                  {/* Timeline steps */}
                  <div className="relative flex justify-between items-start gap-4 mb-6">
                    <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-200 z-0" />
                    {timelineSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center text-center flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold transition ${
                          step.done ? 'bg-[#D62300] border-[#D62300] text-white font-bold' : 'bg-white border-[#E8E8E8] text-gray-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                        {step.time && <span className="text-[9px] text-gray-400 mt-0.5">{step.time}</span>}
                      </div>
                    ))}
                  </div>

                  {complaint.description && (
                    <div className="mb-4 text-xs bg-gray-50 p-3 rounded-lg text-gray-600">
                      <span className="font-bold text-gray-700 block mb-1">{t('order.complaint_description_label')}:</span>
                      "{complaint.description}"
                    </div>
                  )}

                  {['resolved', 'rejected'].includes(complaint.status) && (
                    <div className="p-4 rounded-xl bg-[#FFFBF0] border border-[#FFEBC2] text-xs space-y-2">
                      <div>
                        <span className="font-semibold text-gray-500">{t('order.complaint_resolution_label')}:</span>
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">{complaint.resolution_type}</span>
                      </div>
                      {complaint.resolution_note && (
                        <div>
                          <span className="font-semibold text-gray-500">{t('order.complaint_resolution_note')}:</span>
                          <p className="mt-1 text-gray-700 italic">"{complaint.resolution_note}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Complaint Trigger Link */}
      {order.status === 'completed' && !hasActiveComplaint && isWithinComplaintExpiry && (
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowComplaintModal(true)}
            className="text-xs text-[#666666] hover:text-[#D62300] font-semibold underline underline-offset-4 cursor-pointer transition"
          >
            {t('order.file_complaint')}
          </button>
        </div>
      )}

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items lists */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4 shadow-glass">
          <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase">{t('order.item_details')}</h3>
          <div className="divide-y divide-[#E8E8E8]">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between text-xs">
                <div>
                  <p className="font-bold text-[#1A1A1A]">{item.product_name}</p>
                  {item.size && (
                    <p className="text-[10px] text-gray-500 mt-1">Size {item.size}</p>
                  )}
                  {item.toppings?.length > 0 && (
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">Toppings: {item.toppings.map(t => t.name).join(', ')}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">x {item.quantity}</p>
                </div>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E8E8E8] pt-4 text-xs space-y-2 text-[#666666]">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-primary font-semibold">
                <span>{t('cart.discount')}</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('cart.shipping')}</span>
              <span>{parseFloat(order.shipping_fee) === 0 ? t('cart.free_shipping') : formatVND(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E8E8E8] pt-3 text-sm font-bold text-[#1A1A1A] mt-2">
              <span className="font-semibold text-sm">{t('cart.total')}</span>
              <span className="text-primary font-semibold text-base">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery / Pickup address card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-glass">
          <div>
            <h3 className="font-bold text-lg text-primary uppercase tracking-[0.3px]">{t('order.delivery_info')}</h3>
            {order.delivery_type === 'delivery' && order.address ? (
              <div className="mt-4 text-xs space-y-2">
                <p className="text-[#1A1A1A] font-bold">{order.address.recipient_name} - {order.address.phone}</p>
                <p className="text-[#666666] leading-relaxed">
                  {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                </p>
                <p className="text-gray-400 text-[10px] pt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {t('order.delivery_from_branch')}
                </p>
              </div>
            ) : (
              <div className="mt-4 text-xs text-[#666666] space-y-2">
                {order.address ? (
                  <>
                    <p className="text-[#1A1A1A] font-bold">{order.address.recipient_name} - {order.address.phone}</p>
                    <p className="mt-2 font-semibold text-[#1A1A1A]">🏪 {order.address.province}</p>
                    <p className="text-[10px] text-gray-500 mt-1">📍 {t('order.pickup_address_label')}: {order.address.district}</p>
                    {order.address.street && (
                      <p className="text-[10px] text-gray-500">📞 {t('order.pickup_hotline_label')}: {order.address.street}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[#1A1A1A] font-bold">{t('order.pickup_customer')}</p>
                    <p className="mt-2">{t('order.pickup_branch')}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{t('order.pickup_address')}</p>
                  </>
                )}
              </div>
            )}
            {order.scheduled_at && (
              <div className="mt-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4 text-xs">
                <p className="font-semibold uppercase tracking-[0.4px] text-gray-400">{t('order.scheduled_at')}</p>
                <p className="mt-1 font-bold text-[#1A1A1A]">{formatDate(order.scheduled_at)}</p>
              </div>
            )}
            {order.note && (
              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs">
                <p className="font-semibold uppercase tracking-[0.4px] text-amber-700">{t('checkout.order_note')}</p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#1A1A1A]">{order.note}</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#E8E8E8] mt-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">{t('order.payment')}</span>
              <span className="text-[#1A1A1A] font-bold uppercase">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">{t('order.status')}</span>
              <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-primary' : 'text-primary/70'}`}>
                {order.payment_status === 'paid' ? t('order.paid') : t('order.unpaid')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && <ReviewFlowModal />}
      {showComplaintModal && <ComplaintFlowModal />}
    </div>
  )

  function ReviewStarsInput({ val, setVal }) {
    return (
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            type="button"
            key={star}
            onClick={() => setVal(star)}
            className="p-1 hover:scale-110 transition cursor-pointer"
          >
            <Star className={`w-6 h-6 ${star <= val ? 'fill-amber-400 text-amber-400 font-bold' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    )
  }

  function ReviewFlowModal() {
    const [step, setStep] = useState(1)
    const [deliveryRating, setDeliveryRating] = useState(5)
    const [packagingRating, setPackagingRating] = useState(5)
    const [overallRating, setOverallRating] = useState(5)
    const [comment, setComment] = useState('')
    const [productReviews, setProductReviews] = useState({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
      if (step === 2 && order.items) {
        const initial = {}
        order.items.forEach(item => {
          if (!initial[item.product_id]) {
            initial[item.product_id] = { rating: 5, comment: '' }
          }
        })
        setProductReviews(initial)
      }
    }, [step])

    const handleOverallSubmitOnly = async () => {
      setSubmitting(true)
      try {
        const res = await apiClient.post('/reviews/order', {
          order_id: order.id,
          delivery_rating: deliveryRating,
          packaging_rating: packagingRating,
          overall_rating: overallRating,
          comment: comment,
          product_reviews: []
        })
        showToast(t('order.review_success'))
        loadOrder()
        setShowReviewModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    const handleAllSubmit = async () => {
      setSubmitting(true)
      try {
        const productReviewsList = Object.entries(productReviews).map(([pId, val]) => ({
          product_id: Number(pId),
          rating: val.rating,
          comment: val.comment
        }))
        const res = await apiClient.post('/reviews/order', {
          order_id: order.id,
          delivery_rating: deliveryRating,
          packaging_rating: packagingRating,
          overall_rating: overallRating,
          comment: comment,
          product_reviews: productReviewsList
        })
        showToast(t('order.review_success'))
        loadOrder()
        setShowReviewModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          onClick={() => setShowReviewModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div className="relative w-full max-w-xl bg-white border border-[#E8E8E8] rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh] animate-float-half p-6">
          <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900">{t('order.order_review')}</h3>
            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-6 text-[#1A1A1A]">
            {step === 1 ? (
              <div className="space-y-5">
                <h4 className="font-bold text-sm text-[#D62300] uppercase tracking-wide">{t('order.step_1_title')}</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.delivery_rating')}</span>
                    <ReviewStarsInput val={deliveryRating} setVal={setDeliveryRating} />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.packaging_rating')}</span>
                    <ReviewStarsInput val={packagingRating} setVal={setPackagingRating} />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.overall_rating')}</span>
                    <ReviewStarsInput val={overallRating} setVal={setOverallRating} />
                  </div>
                </div>

                {overallRating <= 2 && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-800 space-y-2">
                    <p className="font-semibold">{t('order.complaint_prompt')}</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowReviewModal(false)
                        setShowComplaintModal(true)
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-[10px] uppercase cursor-pointer"
                    >
                      {t('order.file_complaint')}
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('order.comment_placeholder')}</span>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={t('order.comment_placeholder')}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOverallSubmitOnly}
                    disabled={submitting}
                    className="flex-1 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? '...' : t('order.submit_step_1') || t('order.submit_review')}
                  </button>
                  {order.items && order.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md cursor-pointer"
                    >
                      {t('order.step_2_title')} →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h4 className="font-bold text-sm text-[#D62300] uppercase tracking-wide">{t('order.step_2_title')}</h4>
                <div className="space-y-5 divide-y divide-gray-100 max-h-[45vh] overflow-y-auto pr-1">
                  {order.items?.map((item, index) => {
                    const pr = productReviews[item.product_id] || { rating: 5, comment: '' }
                    return (
                      <div key={item.id} className={`${index > 0 ? 'pt-4' : ''} space-y-3`}>
                        <p className="font-bold text-xs text-[#1A1A1A]">{item.product_name}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-semibold text-gray-500">{t('order.product_rating')}</span>
                          <ReviewStarsInput val={pr.rating} setVal={(rating) => {
                            setProductReviews(prev => ({
                              ...prev,
                              [item.product_id]: { ...prev[item.product_id], rating }
                            }))
                          }} />
                        </div>
                        <input
                          type="text"
                          value={pr.comment}
                          onChange={e => {
                            const val = e.target.value
                            setProductReviews(prev => ({
                              ...prev,
                              [item.product_id]: { ...prev[item.product_id], comment: val }
                            }))
                          }}
                          placeholder={t('order.product_comment_placeholder')}
                          className="w-full text-xs p-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition cursor-pointer"
                  >
                    ← {t('order.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleAllSubmit}
                    disabled={submitting}
                    className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? '...' : t('order.submit_all')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function ComplaintFlowModal() {
    const [step, setStep] = useState(1)
    const [type, setType] = useState('wrong_item')
    const [description, setDescription] = useState('')
    const [images, setImages] = useState([])
    const [desiredResolution, setDesiredResolution] = useState('redeliver')
    const [selectedItems, setSelectedItems] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
      if (order.items) {
        const initial = {}
        order.items.forEach(item => {
          initial[item.product_id] = { selected: false, issue_type: 'wrong', note: '' }
        })
        setSelectedItems(initial)
      }
    }, [])

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return
      if (images.length + files.length > 5) {
        showToast("Tối đa 5 ảnh bằng chứng.", "error")
        return
      }
      setUploading(true)
      try {
        const uploadedUrls = [...images]
        for (const file of files) {
          const formData = new FormData()
          formData.append('image', file)
          const res = await apiClient.post('/reviews/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (res.data && res.data.url) {
            uploadedUrls.push(res.data.url)
          }
        }
        setImages(uploadedUrls)
        showToast(t('order.review_upload') + ' ✓')
      } catch (err) {
        console.error(err)
        showToast(t('order.review_upload_error'), "error")
      } finally {
        setUploading(false)
      }
    }

    const removeImage = (index) => {
      setImages(prev => prev.filter((_, i) => i !== index))
    }

    const isProductIssue = ['wrong_item', 'missing_item', 'bad_quality'].includes(type)

    const handleNext = () => {
      if (step === 1) {
        if (isProductIssue) {
          setStep(2)
        } else {
          setStep(3)
        }
      } else if (step === 2) {
        const anySelected = Object.values(selectedItems).some(item => item.selected)
        if (!anySelected) {
          showToast("Vui lòng chọn ít nhất một sản phẩm bị lỗi.", "error")
          return
        }
        setStep(3)
      } else if (step === 3) {
        if (!description.trim()) {
          showToast("Vui lòng nhập mô tả sự cố.", "error")
          return
        }
        setStep(4)
      }
    }

    const handlePrev = () => {
      if (step === 2) {
        setStep(1)
      } else if (step === 3) {
        if (isProductIssue) {
          setStep(2)
        } else {
          setStep(1)
        }
      } else if (step === 4) {
        setStep(3)
      }
    }

    const handleSubmit = async () => {
      setSubmitting(true)
      try {
        const itemsList = isProductIssue
          ? Object.entries(selectedItems)
              .filter(([, val]) => val.selected)
              .map(([productId, val]) => ({
                product_id: Number(productId),
                issue_type: val.issue_type,
                note: val.note
              }))
          : []

        await apiClient.post('/complaints', {
          order_id: order.id,
          type: type,
          description: description,
          images: images,
          desired_resolution: desiredResolution,
          items: itemsList
        })

        showToast(t('complaint.success'))
        loadOrder()
        setShowComplaintModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    const visibleSteps = []
    visibleSteps.push({ id: 1, label: t('complaint.step_1') })
    if (isProductIssue) {
      visibleSteps.push({ id: 2, label: t('complaint.step_2') })
    }
    visibleSteps.push({ id: 3, label: t('complaint.step_3') })
    visibleSteps.push({ id: 4, label: t('complaint.step_4') })

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          onClick={() => setShowComplaintModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div className="relative w-full max-w-xl bg-white border border-[#E8E8E8] rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh] animate-float-half p-6">
          <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900">{t('complaint.modal_title')}</h3>
            <button onClick={() => setShowComplaintModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-6 text-[#1A1A1A]">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
              {visibleSteps.map((s, index) => (
                <span key={s.id} className={step === s.id ? 'text-[#D62300]' : ''}>
                  {`${index + 1}. ${s.label}`}
                </span>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('complaint.complaint_type_label')}</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { key: 'wrong_item', label: t('complaint.type_wrong_item') },
                    { key: 'missing_item', label: t('complaint.type_missing_item') },
                    { key: 'bad_quality', label: t('complaint.type_bad_quality') },
                    { key: 'late_delivery', label: t('complaint.type_late_delivery') },
                    { key: 'shipper_attitude', label: t('complaint.type_shipper_attitude') },
                    { key: 'other', label: t('complaint.type_other') },
                  ].map(opt => (
                    <label key={opt.key} className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                      type === opt.key ? 'border-[#D62300] bg-[#FFF5F3] text-[#D62300]' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="complaint_type" 
                        value={opt.key}
                        checked={type === opt.key} 
                        onChange={() => setType(opt.key)}
                        className="accent-primary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('complaint.select_products')}</h4>
                <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1">
                  {order.items?.map(item => {
                    const sItem = selectedItems[item.product_id] || { selected: false, issue_type: 'wrong', note: '' }
                    return (
                      <div key={item.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                        <label className="flex items-center gap-3 text-xs font-semibold text-gray-800 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={sItem.selected}
                            onChange={(e) => {
                              setSelectedItems(prev => ({
                                ...prev,
                                [item.product_id]: { ...prev[item.product_id], selected: e.target.checked }
                              }))
                            }}
                            className="accent-primary"
                          />
                          {item.product_name}
                        </label>
                        {sItem.selected && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-fade-in">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('complaint.issue_detail')}</span>
                              <select
                                value={sItem.issue_type}
                                onChange={(e) => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    [item.product_id]: { ...prev[item.product_id], issue_type: e.target.value }
                                  }))
                                }}
                                className="w-full text-xs p-2 mt-1 bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="wrong">{t('complaint.issue_wrong')}</option>
                                <option value="missing">{t('complaint.issue_missing')}</option>
                                <option value="bad_quality">{t('complaint.issue_bad_quality')}</option>
                                <option value="other">{t('complaint.issue_other')}</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('checkout.order_note')}</span>
                              <input 
                                type="text"
                                value={sItem.note}
                                onChange={(e) => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    [item.product_id]: { ...prev[item.product_id], note: e.target.value }
                                  }))
                                }}
                                placeholder={t('complaint.description_placeholder')}
                                className="w-full text-xs p-2 mt-1 bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.description_label')}</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('complaint.description_placeholder')}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.resolution_label_req')}</span>
                  <select
                    value={desiredResolution}
                    onChange={e => setDesiredResolution(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  >
                    <option value="redeliver">{t('complaint.resolution_redeliver')}</option>
                    <option value="refund_partial">{t('complaint.resolution_refund_partial')}</option>
                    <option value="refund_full">{t('complaint.resolution_refund_full')}</option>
                    <option value="feedback_only">{t('complaint.resolution_feedback_only')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.evidence')}</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 text-[8px] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-primary transition bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span className="text-[8px] font-bold mt-1 uppercase">{t('order.review_upload')}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload} 
                          className="hidden"
                          disabled={uploading} 
                        />
                      </label>
                    )}
                    {uploading && <div className="text-[10px] text-gray-400 animate-pulse font-semibold">{t('order.review_uploading')}</div>}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('order.complaint_step_4_title')}</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs space-y-3">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.type')}</span>
                    <span className="font-bold text-gray-800">{t(`complaint.type_${type}`)}</span>
                  </div>
                  
                  {isProductIssue && (
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block mb-1">{t('complaint.select_products')}</span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-700">
                        {Object.entries(selectedItems)
                          .filter(([, val]) => val.selected)
                          .map(([productId, val]) => {
                            const prodName = order.items?.find(item => item.product_id === Number(productId))?.product_name || `Món #${productId}`
                            return (
                              <li key={productId} className="font-medium">
                                {prodName} ({t(`complaint.issue_${val.issue_type}`)}){val.note ? `: ${val.note}` : ''}
                              </li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.description_label')}</span>
                    <p className="font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.resolution_label_req')}</span>
                    <span className="font-bold text-gray-800">{t(`complaint.resolution_${desiredResolution}`)}</span>
                  </div>

                  {images.length > 0 && (
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block mb-1">{t('order.evidence_label')}</span>
                      <div className="flex gap-2">
                        {images.map((img, idx) => (
                          <img key={idx} src={img} alt="Evidence preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-1/3 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition cursor-pointer"
                >
                  ← {t('order.back')}
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md cursor-pointer"
                >
                  {t('order.continue')} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? '...' : t('complaint.submit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// 9. Profile Management Dashboard (wishlist, loyalty balance, addresses)
function Profile({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const { user, updateUser, setLogout } = useAuthStore()
  const { showToast } = useUiStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const emptyAddress = useCallback(() => ({
    label: t('address.home_label'),
    recipient_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    is_default: false
  }), [t])

  const activeTab = searchParams.get('tab') || 'info'

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [addresses, setAddresses] = useState([])
  const [loyalty, setLoyalty] = useState({ balance: 0, transactions: [] })
  const [notifications, setNotifications] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [orders, setOrders] = useState([])
  const [profilePages, setProfilePages] = useState({})

  const profilePageSizes = {
    orders: 4,
    addresses: 4,
    loyalty: 4,
    notifications: 4,
    wishlist: 4,
  }

  const getProfilePage = (tabId, totalItems) => {
    const size = profilePageSizes[tabId] || 4
    const totalPages = Math.max(1, Math.ceil(totalItems / size))
    return Math.min(profilePages[tabId] || 1, totalPages)
  }

  const getProfilePageItems = (items, tabId) => {
    const size = profilePageSizes[tabId] || 4
    const page = getProfilePage(tabId, items.length)
    return items.slice((page - 1) * size, page * size)
  }

  const renderProfilePagination = (items, tabId) => {
    const size = profilePageSizes[tabId] || 4
    const totalPages = Math.ceil(items.length / size)
    if (totalPages <= 1) return null

    const page = getProfilePage(tabId, items.length)
    const goToPage = (nextPage) => {
      setProfilePages(current => ({
        ...current,
        [tabId]: Math.min(Math.max(1, nextPage), totalPages),
      }))
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(pageNumber => pageNumber <= totalPages)

    return (
      <div className="flex justify-end border-t border-[#E8E8E8] pt-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map(pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-[#F5F5F5]'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Addresses Form fields
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [newAddress, setNewAddress] = useState(() => emptyAddress())

  const loadData = useCallback(() => {
    if (activeTab === 'addresses') {
      apiClient.get('/addresses').then(res => setAddresses(res.data))
    } else if (activeTab === 'loyalty') {
      apiClient.get('/loyalty-points').then(res => setLoyalty(res.data))
    } else if (activeTab === 'notifications') {
      apiClient.get('/notifications').then(res => setNotifications(res.data))
    } else if (activeTab === 'wishlist') {
      apiClient.get('/wishlist').then(res => setWishlist(res.data))
    } else if (activeTab === 'orders') {
      apiClient.get('/orders').then(res => setOrders(res.data.data || []))
    }
  }, [activeTab, i18n.language])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    setProfileSaving(true)

    apiClient.put('/profile', { name, phone })
      .then(res => {
        updateUser(res.data.user || { name, phone })
        showToast(res.data.message || t('profile.update_success'))
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('profile.update_error'), 'error')
      })
      .finally(() => setProfileSaving(false))
  }

  const handleChangePassword = (e) => {
    e.preventDefault()

    if (passwordForm.password !== passwordForm.password_confirmation) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setPasswordSaving(true)
    apiClient.put('/profile/password', passwordForm)
      .then(res => {
        showToast(res.data.message || t('profile.password_changed'))
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        })
        setShowPasswordForm(false)
      })
      .catch(error => {
        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null
        showToast(firstError || error.response?.data?.message || t('profile.password_change_error'), 'error')
      })
      .finally(() => setPasswordSaving(false))
  }

  const resetAddressForm = () => {
    setEditingAddressId(null)
    setNewAddress(emptyAddress())
  }

  useEffect(() => {
    setShowAddressForm(false)
    resetAddressForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const openCreateAddressForm = () => {
    resetAddressForm()
    setShowAddressForm(true)
  }

  const openEditAddressForm = (address) => {
    setEditingAddressId(address.id)
    setNewAddress({
      label: address.label || '',
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      province: address.province || '',
      district: address.district || '',
      ward: address.ward || '',
      street: address.street || '',
      is_default: Boolean(address.is_default)
    })
    setShowAddressForm(true)
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    const request = editingAddressId
      ? apiClient.put(`/addresses/${editingAddressId}`, newAddress)
      : apiClient.post('/addresses', newAddress)

    request
      .then(res => {
        setAddresses(current => (
          editingAddressId
            ? current.map(address => address.id === editingAddressId ? res.data : { ...address, is_default: res.data.is_default ? false : address.is_default })
            : [res.data, ...current.map(address => ({ ...address, is_default: res.data.is_default ? false : address.is_default }))]
        ))
        setShowAddressForm(false)
        resetAddressForm()
        showToast(t(editingAddressId ? 'profile.address_updated' : 'profile.address_created'))
      }).catch(err => {
        console.error(err)
        showToast(t('profile.address_save_error'), 'error')
      })
  }

  const handleDeleteAddress = (event, id) => {
    event.stopPropagation()
    if (window.confirm(t('profile.address_delete_confirm'))) {
      apiClient.delete(`/addresses/${id}`)
        .then(() => {
          setAddresses(addresses.filter(a => a.id !== id))
          if (editingAddressId === id) {
            setShowAddressForm(false)
            resetAddressForm()
          }
          showToast(t('profile.address_deleted'))
        })
    }
  }

  const handleMarkNotificationRead = (id) => {
    apiClient.post(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n))
        showToast(t('profile.notification_marked_read'))
      })
  }

  const openNotification = (notification) => {
    if (!notification.read_at) {
      apiClient.post(`/notifications/${notification.id}/read`)
        .then(() => {
          setNotifications(current => current.map(item => (
            item.id === notification.id ? { ...item, read_at: new Date() } : item
          )))
        })
        .catch(() => {})
    }

    const data = notification.data || {}
    const target = data.action_url || data.url || (data.order_code ? `/orders/tracking/${data.order_code}` : null)
    if (target) {
      navigate(target)
    }
  }

  const handleRemoveWishlist = (event, wishlistItem) => {
    event.stopPropagation()
    const productId = wishlistItem.product?.id
    if (!productId) return

    apiClient.post('/wishlist', { product_id: productId })
      .then(res => {
        setWishlist(current => current.filter(item => item.id !== wishlistItem.id))
        showToast(res.data.message)
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('common.error'), 'error')
      })
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A] flex flex-col md:flex-row gap-8">
      {/* Side Tabs */}
      <aside className="w-full md:w-64 md:self-start md:sticky md:top-28 shrink-0 p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col shadow-glass">
        <div className="space-y-2">
          {[
            { id: 'info', name: t('profile.personal_info'), icon: <UserIcon className="w-4 h-4" /> },
            { id: 'orders', name: t('profile.order_history'), icon: <Package className="w-4 h-4" /> },
            { id: 'addresses', name: t('profile.address_book'), icon: <MapPin className="w-4 h-4" /> },
            { id: 'loyalty', name: t('profile.loyalty_history'), icon: <Gift className="w-4 h-4" /> },
            { id: 'notifications', name: t('profile.notifications').toUpperCase(), icon: <Bell className="w-4 h-4" /> },
            { id: 'wishlist', name: t('profile.wishlist_title'), icon: <Heart className="w-4 h-4" /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setProfilePages(current => ({ ...current, [tab.id]: 1 }))
                setSearchParams({ tab: tab.id })
              }}
              className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-[10px] border transition flex items-center gap-3 ${
                activeTab === tab.id 
                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                  : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            setLogout()
            navigate('/')
          }}
          className="mt-8 w-full bg-primary/10 border border-primary/20 text-primary font-heading py-2.5 rounded-[8px] text-xs tracking-wider uppercase hover:bg-primary/20 transition"
        >
          {t('nav.logout').toUpperCase()}
        </button>
      </aside>

      {/* Tab Panels */}
      <main className="flex-1 p-6 rounded-2xl bg-white border border-[#E8E8E8] min-h-[50vh] shadow-glass">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.personal_info')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.customer_id')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A]">#{user.id}</p>
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.account_role')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A] capitalize">{user.role || t('profile.customer_role')}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t('profile.account_status')}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  {t('profile.active_account')}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.member_since')}</p>
                <p className="mt-2 text-sm font-bold text-[#1A1A1A]">{user.created_at ? formatDate(user.created_at) : '-'}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.name')}</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.login_email')}</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.phone')}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] uppercase">{t('auth.password')}</label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(current => !current)}
                      className="text-[10px] font-bold uppercase tracking-wider text-primary transition hover:opacity-70"
                    >
                      {showPasswordForm ? t('profile.cancel_password_change') : t('profile.change_password')}
                    </button>
                  </div>
                  <input
                    type="password"
                    value="********"
                    disabled
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t border-[#E8E8E8] pt-5">
                <button 
                  type="submit"
                  disabled={profileSaving}
                  className="w-full sm:w-auto bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                >
                  {(profileSaving ? t('profile.saving') : t('profile.update_info')).toUpperCase()}
                </button>
              </div>
            </form>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="max-w-3xl rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.3px] text-[#1A1A1A]">{t('profile.change_password')}</h3>
                  <p className="mt-1 text-xs text-gray-400">{t('profile.password_security')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.current_password')}</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current_password}
                      onChange={event => setPasswordForm(current => ({ ...current, current_password: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.new_password')}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.password}
                      onChange={event => setPasswordForm(current => ({ ...current, password: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.confirm_new_password')}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.password_confirmation}
                      onChange={event => setPasswordForm(current => ({ ...current, password_confirmation: event.target.value }))}
                      className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition"
                  >
                    {(passwordSaving ? t('profile.saving') : t('profile.save_password')).toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="border border-[#E8E8E8] bg-white px-8 py-3 rounded-[8px] text-xs font-semibold tracking-wider text-gray-500 transition hover:border-gray-400"
                  >
                    {t('common.cancel').toUpperCase()}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.order_history')}</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400">{t('order.empty')}</p>
            ) : (
              <>
                {getProfilePageItems(orders, 'orders').map((o) => (
                  <div
                    key={o.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/orders/tracking/${o.order_code}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/orders/tracking/${o.order_code}`)
                      }
                    }}
                    className="p-4 rounded-xl border border-[#E8E8E8] bg-white flex flex-col sm:flex-row justify-between gap-4 shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#1A1A1A]">{t('order.code_label', { code: o.order_code })}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{t('order.date_label', { date: formatDate(o.created_at) })}</p>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t('order.items_label', { items: o.items?.map(i => i.product_name).join(', ') })}</p>
                      {o.scheduled_at && (
                        <p className="text-[10px] text-gray-400 mt-1">{t('order.scheduled_at')}: {formatDate(o.scheduled_at)}</p>
                      )}
                      {o.note && (
                        <p className="text-[10px] text-amber-700 mt-1 line-clamp-2">{t('checkout.order_note')}: {o.note}</p>
                      )}

                    </div>
                    <div className="flex flex-col sm:items-end justify-between">
                      <span className="font-heading text-lg text-primary">{formatVND(o.total)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          o.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>{t(`order.${o.status?.toLowerCase()}`) || o.status}</span>
                        <Link 
                          to={`/orders/tracking/${o.order_code}`}
                          onClick={(event) => event.stopPropagation()}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          {t('order.track')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {renderProfilePagination(orders, 'orders')}
              </>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-3">
              <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px]">{t('profile.address_book')}</h2>
              <button 
                onClick={() => {
                  if (showAddressForm && !editingAddressId) {
                    setShowAddressForm(false)
                  } else {
                    openCreateAddressForm()
                  }
                }}
                className="bg-primary text-white font-semibold px-4 py-2 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
              >
                {t('profile.add_address').toUpperCase()}
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
                    {editingAddressId ? t('profile.edit_address') : t('profile.add_address')}
                  </h3>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.label')}</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.recipient_name')}</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.delivery_phone')}</label>
                  <input 
                    type="tel" 
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <VietnamAddressSelector
                  province={newAddress.province}
                  district={newAddress.district}
                  ward={newAddress.ward}
                  street={newAddress.street}
                  onChange={({ province, district, ward, street }) =>
                    setNewAddress({ ...newAddress, province, district, ward, street })
                  }
                  required={true}
                  theme="storefront"
                />

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-[#E8E8E8]"
                  />
                  <span className="text-xs text-gray-500">{t('address.set_default')}</span>
                </div>

                <div className="sm:col-span-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddressForm(false)
                      resetAddressForm()
                    }}
                    className="bg-white hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition"
                  >
                    {t('common.cancel').toUpperCase()}
                  </button>
                  <button 
                    type="submit" 
                    className="bg-primary hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                  >
                    {t(editingAddressId ? 'profile.update_address' : 'profile.save_address').toUpperCase()}
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E8E8E8] bg-[#F8F8F8] px-5 py-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-xs font-semibold text-gray-500">{t('profile.no_addresses')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getProfilePageItems(addresses, 'addresses').map((addr) => (
                  <div
                    key={addr.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEditAddressForm(addr)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openEditAddressForm(addr)
                      }
                    }}
                    className={`p-4 rounded-xl border bg-white flex flex-col justify-between shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium ${
                      editingAddressId === addr.id ? 'border-primary/60 bg-primary/5' : 'border-[#E8E8E8]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                        {addr.is_default && <span className="text-[10px] bg-[#FFC72C] text-[#1A1A1A] px-2 py-0.5 rounded-[8px] font-bold uppercase">{t('common.default')}</span>}
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A] mt-3">{addr.recipient_name} - {addr.phone}</p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex justify-end">
                      <button 
                        type="button"
                        onClick={(event) => handleDeleteAddress(event, addr.id)}
                        className="rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                        aria-label={t('profile.delete_address')}
                        title={t('profile.delete_address')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderProfilePagination(addresses, 'addresses')}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.loyalty_history')}</h2>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-float">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('profile.loyalty_member_badge')}</span>
                <h3 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-[0.3px] mt-1">{t('profile.loyalty_reward_title')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-4xl text-primary">{loyalty.balance}</span>
                <span className="text-xs text-primary font-semibold">{t('profile.available_points')}</span>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">{t('profile.transaction_history')}</span>
              {loyalty.transactions.length === 0 ? (
                <p className="text-xs text-gray-400">{t('profile.no_loyalty_transactions')}</p>
              ) : (
                getProfilePageItems(loyalty.transactions, 'loyalty').map((tr) => (
                  <div key={tr.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1A1A1A] leading-tight">{tr.description}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{formatDate(tr.created_at)}</p>
                    </div>
                    <span className="font-bold text-sm text-primary">
                      {tr.type === 'earn' ? '+' : '-'}{tr.points} {t('profile.points')}
                    </span>
                  </div>
                ))
              )}
              {renderProfilePagination(loyalty.transactions, 'loyalty')}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.notifications_title')}</h2>
            
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400">{t('profile.no_notifications')}</p>
              ) : (
                getProfilePageItems(notifications, 'notifications').map((n) => {
                  const unread = !n.read_at
                  return (
                    <div 
                      key={n.id} 
                      role="button"
                      tabIndex={0}
                      onClick={() => openNotification(n)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openNotification(n)
                        }
                      }}
                      className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition cursor-pointer hover:-translate-y-0.5 hover:shadow-glass ${
                        unread ? 'bg-primary/5 border-primary/20' : 'bg-white border-[#E8E8E8] opacity-70'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#1A1A1A]">{n.data?.title}</h4>
                          {unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <p className="text-[10px] text-[#666666] leading-relaxed">{n.data?.body}</p>
                        <p className="text-[9px] text-gray-400">{formatDate(n.created_at)}</p>
                      </div>

                      {unread && (
                        <button 
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMarkNotificationRead(n.id)
                          }}
                          className="text-[10px] text-primary hover:opacity-80 transition font-bold"
                        >
                          {t('profile.mark_read')}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
              {renderProfilePagination(notifications, 'notifications')}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.wishlist_title')}</h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-400">{t('profile.wishlist_empty')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getProfilePageItems(wishlist, 'wishlist').map((w) => (
                  <div
                    key={w.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => w.product && onSelectProduct?.(w.product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        if (w.product) onSelectProduct?.(w.product)
                      }
                    }}
                    className="flex gap-4 p-3 rounded-xl border border-[#E8E8E8] bg-white shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium"
                  >
                    <img 
                      src={w.product?.thumbnail} 
                      alt={w.product?.name} 
                      className="w-16 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{w.product?.name}</h4>
                        <span className="text-[10px] text-primary font-semibold mt-1 block">{formatVND(w.product?.base_price)}</span>
                      </div>
                      <Link 
                        to="/menu" 
                        onClick={(event) => event.stopPropagation()}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        {t('product.order_now').toUpperCase()}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => handleRemoveWishlist(event, w)}
                      className="self-start rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                      aria-label={t('profile.remove_wishlist')}
                      title={t('profile.remove_wishlist')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderProfilePagination(wishlist, 'wishlist')}
          </div>
        )}
      </main>
    </div>
  )
}

// --- MAIN ROUTER APP ---

function PublicSettingsLoader() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const [maintenance, setMaintenance] = useState(null)
  const setPublicSettings = useUiStore(state => state.setPublicSettings)
  const { i18n } = useTranslation()
  const currentLang = i18n.language

  useEffect(() => {
    let ignore = false
    apiClient.get('/settings/public')
      .then(({ data }) => {
        if (ignore) return
        const settings = data.data || {}
        setPublicSettings(settings)
        const root = document.documentElement

        if (settings['appearance.primary_color']) root.style.setProperty('--color-primary', settings['appearance.primary_color'])
        if (settings['appearance.secondary_color']) root.style.setProperty('--color-secondary', settings['appearance.secondary_color'])
        if (settings['appearance.font_family']) root.style.setProperty('--font-main', settings['appearance.font_family'])
        if (settings['seo.meta_title']) document.title = settings['seo.meta_title']

        const description = document.querySelector('meta[name="description"]') || document.createElement('meta')
        description.setAttribute('name', 'description')
        description.setAttribute('content', settings['seo.meta_description'] || '')
        if (!description.parentNode) document.head.appendChild(description)

        const favicon = settings['general.favicon']
        if (favicon) {
          const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
          link.setAttribute('rel', 'icon')
          link.setAttribute('href', assetUrl(favicon))
          if (!link.parentNode) document.head.appendChild(link)
        }

        setMaintenance(settings['general.maintenance_mode'] ? settings['general.maintenance_message'] : null)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [setPublicSettings, currentLang])

  if (!maintenance || isAdminRoute) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] bg-primary text-white text-center text-sm font-semibold px-4 py-2">
      {maintenance}
    </div>
  )
}

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const audioCtx = new AudioContext()
    
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      
      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    
    const now = audioCtx.currentTime
    playTone(523.25, now, 0.4) // C5
    playTone(783.99, now + 0.1, 0.5) // G5
  } catch (e) {
    console.error('Failed to play audio notification', e)
  }
}

function RealTimeNotificationLoader() {
  const { user, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loadedIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)

  useEffect(() => {
    isInitializedRef.current = false
    loadedIdsRef.current.clear()

    if (!isAuthenticated) return undefined

    const fetchNotifications = async () => {
      try {
        const { data } = await apiClient.get('/notifications')
        const list = Array.isArray(data) ? data : data?.data || []
        
        if (!isInitializedRef.current) {
          list.forEach(item => {
            if (item?.id) loadedIdsRef.current.add(item.id)
          })
          isInitializedRef.current = true
        } else {
          let hasNew = false
          list.forEach(item => {
            if (item?.id && !loadedIdsRef.current.has(item.id)) {
              loadedIdsRef.current.add(item.id)
              if (!item.read_at) {
                hasNew = true
                
                const nData = item.data || {}
                const title = item.title || nData.title || nData.message || item.message || t('profile.notifications')
                const body = nData.body || nData.content || ''
                const orderCode = nData.order_code || ''

                toast.custom((toastItem) => (
                  <div
                    onClick={() => {
                      toast.dismiss(toastItem.id)
                      if (orderCode) {
                        navigate(`/orders/tracking/${orderCode}`)
                      } else {
                        navigate('/profile?tab=notifications')
                      }
                    }}
                    className={`${
                      toastItem.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-600 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl p-4`}
                  >
                    <div className="flex items-start w-full">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-6 w-6 text-red-600 animate-bounce" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ), { duration: 6000 })
              }
            }
          })

          if (hasNew) {
            playNotificationSound()
          }
        }
      } catch (err) {
        console.error('Failed to fetch user notifications for realtime', err)
      }
    }

    fetchNotifications()

    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user, navigate, t])

  return null
}

function AppShell({ selectedProduct, setSelectedProduct }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className={`min-h-screen text-[#1A1A1A] flex flex-col antialiased selection:bg-primary selection:text-white ${isAdminRoute ? 'bg-[#F4F6F8]' : 'bg-[#FFFAF5] pb-16 md:pb-0'}`}>
        <AosRefresh />
        <SessionGuard />
        <PublicSettingsLoader />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px' },
          }}
        />
        
        {!isAdminRoute && <RealTimeNotificationLoader />}
        
        {/* Global Toast Alerts */}
        {!isAdminRoute && <Toast />}

        {/* Global Navbar */}
        {!isAdminRoute && <Header />}

        {/* Floating Cart Drawer */}
        {!isAdminRoute && <CartDrawer />}
        {!isAdminRoute && <ScrollToTopButton />}

        {/* Router Pages Switch */}
        <div className="flex-1">
          <Routes>
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/" element={<Home onSelectProduct={setSelectedProduct} />} />
            <Route path="/menu" element={<Menu onSelectProduct={setSelectedProduct} />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            
            {/* Authentications */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Checkout & tracking */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders/tracking/:code" element={<OrderDetailTracking />} />
            
            {/* Customer & Admin panels */}
            <Route path="/profile" element={<Profile onSelectProduct={setSelectedProduct} />} />
          </Routes>
        </div>

        {/* Bottom Nav on Mobile devices */}
        {!isAdminRoute && <MobileNav />}

        {/* Global Footer */}
        {!isAdminRoute && <Footer />}

        {/* Product details customizer dialog overlay */}
        {!isAdminRoute && selectedProduct && (
          <ProductDetailModal 
            key={selectedProduct.id}
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
  )
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    initDarkMode()
    AOS.init({
      duration: 500,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      delay: 0,
    })
  }, [])

  return (
    <Router>
      <AppShell selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
    </Router>
  )
}

export default App
