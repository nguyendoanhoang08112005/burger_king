import { useState, useEffect } from 'react'
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
import { 
  ShoppingBag, 
  User as UserIcon, 
  MapPin, 
  X, 
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
  TrendingUp,
  Package,
  Layers
} from 'lucide-react'

// Utilities
import { formatVND, formatDate } from './utils/format'

// Stores
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useUiStore } from './store/uiStore'

// Axios
import apiClient from './api/axios'

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
  const { user, isAuthenticated, setLogout } = useAuthStore()
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const navigate = useNavigate()

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-premium border-b border-[#E8E8E8] py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-extrabold text-3xl tracking-wider text-primary">HAMBURGER</span>
        <span className="font-extrabold text-3xl tracking-wider text-white bg-primary px-2 py-0.5 rounded-[8px] ml-1">KING</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-wide">
        <Link to="/" className="hover:text-primary transition text-[#1A1A1A]">TRANG CHỦ</Link>
        <Link to="/menu" className="hover:text-primary transition text-[#1A1A1A]">THỰC ĐƠN</Link>
        <Link to="/combos" className="hover:text-primary transition text-[#1A1A1A]">VALUE COMBOS</Link>
        <Link to="/branches" className="hover:text-primary transition text-[#1A1A1A]">CHI NHÁNH</Link>
      </nav>

      <div className="flex items-center gap-4">
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
            {user.role === 'admin' && (
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
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-primary hover:opacity-90 text-white font-semibold px-6 py-2 rounded-[8px] tracking-wide text-sm transition hover:-translate-y-[1px] active:translate-y-0">
            ĐĂNG NHẬP
          </Link>
        )}
      </div>
    </header>
  )
}

// 3. Global Footer
function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#E8E8E8] py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <span className="font-extrabold text-3xl tracking-wider text-primary">HAMBURGER</span>
          <span className="font-extrabold text-3xl tracking-wider text-white bg-primary px-2 py-0.5 rounded-[8px] ml-1">KING</span>
          <p className="text-[#666666] text-sm mt-4 leading-relaxed">
            Chuỗi hamburger cao cấp hàng đầu Việt Nam. Chúng tôi cam kết sử dụng 100% bò Mỹ nhập khẩu nướng lửa hồng thủ công cùng nguyên liệu tươi ngon nhất hàng ngày.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">THỰC ĐƠN</h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li><Link to="/menu?category=burgers-bo" className="hover:text-primary transition">Burgers Bò Mỹ</Link></li>
            <li><Link to="/menu?category=burgers-ga" className="hover:text-primary transition">Burgers Gà Giòn</Link></li>
            <li><Link to="/menu?category=mon-an-kem" className="hover:text-primary transition">Khoai Tây & Ăn Kèm</Link></li>
            <li><Link to="/combos" className="hover:text-primary transition">Value Combo Deals</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">LIÊN HỆ</h3>
          <ul className="space-y-3 text-sm text-[#666666]">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Hotline: 1900 8888</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> 120-122 Lê Lợi, Bến Nghé, Quận 1, TP. HCM</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Giờ mở cửa: 08:00 - 23:00</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-[20px] text-[#1A1A1A] tracking-wider mb-4">NEWSLETTER</h3>
          <p className="text-[#666666] text-sm mb-4">Đăng ký email nhận ưu đãi đặc quyền 20% hôm nay.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
            <button className="bg-primary hover:opacity-90 text-white font-semibold px-4 rounded-[8px] text-sm transition hover:-translate-y-[1px]">ĐĂNG KÝ</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[#E8E8E8] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>© 2026 Hamburger King E-Commerce Platform. All rights reserved.</p>
        <p>Thiết kế bởi Đội ngũ Senior Full-stack Antigravity.</p>
      </div>
    </footer>
  )
}

// 4. Cart Drawer Overlay
function CartDrawer() {
  const { cartDrawerOpen, setCartDrawerOpen, showToast } = useUiStore()
  const { cartItems, updateQuantity, removeItem, getCartTotals } = useCartStore()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()

  if (!cartDrawerOpen) return null

  const totals = getCartTotals()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setCartDrawerOpen(false)
      showToast('Vui lòng đăng nhập để đặt hàng!', 'error')
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
            <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide">GIỎ HÀNG CỦA BẠN</h2>
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
              <h3 className="font-bold text-xl text-gray-400 uppercase tracking-wide">GIỎ HÀNG TRỐNG</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
                Đừng để bụng đói! Khám phá ngay thực đơn burger nướng lửa hồng thơm lừng thôi nào.
              </p>
              <button 
                onClick={() => {
                  setCartDrawerOpen(false)
                  navigate('/menu')
                }}
                className="mt-6 bg-primary hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-[8px] tracking-wide text-sm transition hover:-translate-y-[1px]"
              >
                XEM THỰC ĐƠN
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
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Size {item.size}
                      </span>
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
                <span>Tạm tính</span>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Tiết kiệm deal hot</span>
                  <span>-{formatVND(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Mã giảm giá</span>
                  <span>-{formatVND(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span className="text-[#1A1A1A] font-semibold">
                  {totals.shippingFee === 0 ? 'Miễn phí' : formatVND(totals.shippingFee)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-3 flex justify-between items-center">
              <span className="font-bold text-[18px] tracking-normal uppercase text-[#1A1A1A]">TỔNG CỘNG</span>
              <span className="font-bold text-2xl text-primary">{formatVND(totals.total)}</span>
            </div>

            {/* Checkout Trigger */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 shadow-glass"
            >
              TIẾN HÀNH THANH TOÁN
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
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E8E8] py-3 px-6 flex justify-around items-center text-[#666666] shadow-premium">
      <Link to="/" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">TRANG CHỦ</span>
      </Link>
      <Link to="/menu" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">THỰC ĐƠN</span>
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
        <span className="text-[10px] font-semibold tracking-wide">GIỎ HÀNG</span>
      </button>
      <Link to="/profile" className="flex flex-col items-center gap-1 hover:text-primary transition">
        <span className="text-[10px] font-semibold tracking-wide">CÁ NHÂN</span>
      </Link>
    </div>
  )
}

// --- POPULAR / SHARED SCREEN PORTION COMPONENTS ---

// Product Card
function ProductCard({ product, onSelect, index = 0 }) {
  const addItem = useCartStore(state => state.addItem)
  const showToast = useUiStore(state => state.showToast)

  const hasSale = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price)

  const handleQuickAdd = (e) => {
    e.stopPropagation()
    addItem(product, 'S', [], 1)
    showToast(`Đã thêm ${product.name} (Size S) vào giỏ hàng!`)
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

      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#F5F5F5]">
        <img 
          src={product.thumbnail} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-4">
          <span className="text-xs text-white font-semibold">Bấm để tuỳ chỉnh size & toppings</span>
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
  const addItem = useCartStore(state => state.addItem)
  const showToast = useUiStore(state => state.showToast)
  
  const [size, setSize] = useState('S')
  const [selectedToppings, setSelectedToppings] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [allToppings, setToppings] = useState([])

  useEffect(() => {
    // Fetch toppings list
    apiClient.get('/products')
      .then(() => {
        setToppings([
          { id: 1, name: 'Phô Mai Cheddar Lá', price: 10000.00, category: 'cheese', icon: '🧀' },
          { id: 2, name: 'Thịt Xông Khói Giòn', price: 15000.00, category: 'meat', icon: '🥓' },
          { id: 3, name: 'Hành Tây Xào Caramel', price: 5000.00, category: 'veggie', icon: '🧅' },
          { id: 4, name: 'Sốt BBQ Đặc Biệt', price: 5000.00, category: 'sauce', icon: '🏺' }
        ])
      })
  }, [product])

  if (!product) return null

  // Calculate pricing
  let basePrice = parseFloat(product.sale_price ?? product.base_price)
  
  // Size pricing upcharges
  const sizeModel = product.sizes?.find(s => s.size === size)
  if (sizeModel) {
    basePrice += parseFloat(sizeModel.extra_price)
  }

  // Topping pricing upcharges
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + parseFloat(t.price), 0)
  const unitPrice = basePrice + toppingsPrice
  const totalCost = unitPrice * quantity

  const handleToppingToggle = (topping) => {
    const isSelected = selectedToppings.some(t => t.id === topping.id)
    if (isSelected) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id))
    } else {
      setSelectedToppings([...selectedToppings, topping])
    }
  }

  const handleAdd = () => {
    addItem(product, size, selectedToppings, quantity)
    showToast(`Đã thêm ${quantity} ${product.name} (Size ${size}) vào giỏ hàng!`)
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

          {/* Size radio pickers */}
          <div className="mt-6">
            <h4 className="font-bold text-[20px] text-[#1A1A1A] tracking-wide uppercase mb-3">CHỌN KÍCH CỠ</h4>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((s) => {
                const sModel = product.sizes?.find(sz => sz.size === s)
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

          {/* Premium topping selections */}
          <div className="mt-6">
            <h4 className="font-bold text-[20px] text-[#1A1A1A] tracking-wide uppercase mb-3">THÊM TOPPING CAO CẤP</h4>
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
                      <span className="text-lg">{topping.icon}</span>
                      <span className="text-xs font-bold text-[#1A1A1A]">{topping.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-primary">+{formatVND(topping.price)}</span>
                  </div>
                )
              })}
            </div>
          </div>

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
              <span className="text-[10px] text-gray-400 uppercase font-bold">TỔNG TIỀN</span>
              <span className="text-xl font-semibold text-primary">{formatVND(totalCost)}</span>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="mt-5 w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 shadow-glass"
          >
            THÊM VÀO GIỎ HÀNG
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
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeatured] = useState([])
  const [combos, setCombos] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get('/banners'),
      apiClient.get('/categories'),
      apiClient.get('/products?is_featured=1'),
      apiClient.get('/combos'),
      apiClient.get('/branches')
    ]).then(([bannersRes, catsRes, productsRes, combosRes, branchesRes]) => {
      setBanners(bannersRes.data)
      setCategories(catsRes.data)
      setFeatured(productsRes.data.data || [])
      setCombos(combosRes.data)
      setBranches(branchesRes.data)
      setLoading(false)
      setTimeout(() => AOS.refresh(), 0)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  // Use seeded hero banner as active backdrop
  const activeHero = banners.find(b => b.position === 'hero') || {
    title: 'BURGER LỬA HỒNG - ĐẬM ĐÀ VỊ KHÓI',
    subtitle: 'Trải nghiệm dòng burger cao cấp nướng bằng tay ngập tràn nhân thịt bò Mỹ tươi.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200'
  }

  return (
    <div className="bg-[#FFFAF5] text-[#1A1A1A]">
      {/* Premium Hero Banner */}
      <section className="relative w-full h-[65vh] flex items-center bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={activeHero.image} 
            alt="Burger Hero Backdrop" 
            className="w-full h-full object-cover opacity-70 animate-scale-slow"
          />
          <div className="absolute inset-0 bg-[#FFFAF5]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <span className="text-[#FFC72C] font-semibold text-lg tracking-widest uppercase mb-3 block animate-float">BẾP THỦ CÔNG HOẠT ĐỘNG ONLINE</span>
          <h1 className="font-extrabold text-[clamp(36px,5vw,64px)] leading-none text-white tracking-[-0.5px] uppercase max-w-2xl drop-shadow-lg">
            {activeHero.title}
          </h1>
          <p className="text-sm md:text-base text-white max-w-md mt-6 leading-relaxed">
            {activeHero.subtitle}
          </p>
          <div className="flex gap-4 mt-8">
            <Link 
              to="/menu" 
              className="bg-primary hover:opacity-90 text-white font-semibold px-8 py-3.5 rounded-[8px] text-sm tracking-widest transition hover:-translate-y-[1px]"
            >
              ĐẶT HÀNG NGAY
            </Link>
            <Link 
              to="/combos" 
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-[8px] text-sm tracking-widest transition"
            >
              VALUE COMBOS
            </Link>
          </div>
        </div>
      </section>

      {/* Category grid navigations */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">THỰC ĐƠN ĐA DẠNG</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">Tuyển chọn các hương vị đỉnh cao tinh chế thủ công.</p>
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
              <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">SẢN PHẨM NỔI BẬT</h2>
              <p className="text-xs text-[#666666] mt-1">Được đề xuất nhiều nhất từ các đầu bếp danh tiếng.</p>
            </div>
            <Link to="/menu" className="flex items-center gap-1 text-primary hover:opacity-85 font-bold text-xs tracking-wider uppercase transition">
              Xem tất cả <ChevronRight className="w-4 h-4" />
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
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">SAVING VALUE COMBOS</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">Bữa ăn thịnh soạn tiết kiệm tới 35% cho gia đình & bạn bè.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {combos.map((combo, index) => (
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
                  <Link 
                    to="/menu"
                    className="bg-[#FFC72C] text-[#1A1A1A] font-semibold px-5 py-2.5 rounded-[8px] text-xs tracking-wide hover:opacity-90 hover:-translate-y-[1px] transition"
                  >
                    MUA COMBO
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-white border-t border-[#E8E8E8] py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-bold text-primary text-lg tracking-wider block mb-3 uppercase">CÂU CHUYỆN THƯƠNG HIỆU</span>
          <h2 className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase leading-tight">ĐẰNG SAU CHIẾC HAMBURGER NƯỚNG LỬA HỒNG TUYỆT HẢO</h2>
          <p className="text-sm text-[#666666] leading-relaxed mt-6">
            Mỗi chiếc bánh Hamburger tại Hamburger King được tạo ra từ niềm đam mê thuần túy đối với nghệ thuật ẩm thực. Chúng tôi nướng thịt bò Mỹ nguyên bản trên ngọn lửa nướng hồng rực để giữ lại vị thịt đậm đà, mọng nước đặc trưng của khói bếp. Sự kết hợp giữa lớp vỏ bánh brioche nướng bơ mềm mại, phô mai Cheddar béo ngậy tan chảy, cùng các loại rau củ trồng hữu cơ sạch tạo nên một kiệt tác thực thụ ngay trên đĩa ăn của bạn.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600" 
            alt="Juicy flame grilling burger patty" 
            className="w-full h-80 object-cover rounded-2xl mt-10 shadow-premium"
          />
        </div>
      </section>

      {/* Branches maps */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#1A1A1A] uppercase">ĐỊA CHỈ CHI NHÁNH</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">Dễ dàng tìm thấy các cửa hàng Hamburger King gần bạn nhất.</p>
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
                <span className="text-gray-400">Giờ mở cửa: {b.open_time.slice(0, 5)} - {b.close_time.slice(0, 5)}</span>
                <a 
                  href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary font-bold hover:opacity-80 uppercase tracking-wide transition"
                >
                  Bản đồ
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
  }, [activeCategory, search, sortBy, currentPage])

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
          <h3 className="font-bold text-xl text-primary tracking-wide uppercase mb-4">DANH MỤC</h3>
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
              TẤT CẢ
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
          <h3 className="font-bold text-xl text-primary tracking-wide uppercase mb-4">SẮP XẾP</h3>
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-[#F8F8F8] border border-[#E8E8E8] text-xs text-[#1A1A1A] rounded-[10px] px-4 py-3 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          >
            <option value="sort_order">Mặc định</option>
            <option value="price_asc">Giá: Thấp tới Cao</option>
            <option value="price_desc">Giá: Cao xuống Thấp</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Search Header */}
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Tìm kiếm chiếc Hamburger nướng lửa hồng của bạn..." 
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] px-5 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
          />
        </div>

        <h2 data-aos="fade-up" className="sr-only">THỰC ĐƠN ĐA DẠNG</h2>

        {/* Grids */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4 stroke-1" />
            <h4 className="font-bold text-xl text-gray-500 uppercase tracking-wide">KHÔNG TÌM THẤY SẢN PHẨM</h4>
            <p className="text-gray-400 text-sm mt-1">Vui lòng thử tìm kiếm với cụm từ khác.</p>
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
                  ← Trước
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
  }, [])

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
        <h1 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-primary uppercase">SAVING VALUE COMBOS</h1>
        <p className="text-xs text-[#666666] max-w-sm mx-auto mt-2">
          Các thực đơn hoàn hảo dành cho tiệc nhóm, ghép đôi, hoặc chiêu đãi bản thân với mức giá tiết kiệm lên tới 35% hàng ngày!
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
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">COMBO TIẾT KIỆM</span>
                <h3 className="font-semibold text-xl text-[#1A1A1A] uppercase tracking-wide mt-1">{combo.name}</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-2">{combo.description}</p>

                {/* Combos sub-items */}
                {combo.items && (
                  <div className="mt-4 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">MÓN BAO GỒM:</span>
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
  }, [])

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
        <h1 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-primary uppercase">HỆ THỐNG CỬA HÀNG</h1>
        <p className="text-xs text-[#666666] max-w-sm mx-auto mt-2">
          Hamburger King hoạt động 3 chi nhánh trung tâm sẵn sàng giao nóng hổi trong vòng 20 phút.
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
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Giờ phục vụ: {b.open_time.slice(0, 5)} - {b.close_time.slice(0, 5)}</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8E8E8] flex gap-2">
              <a 
                href={`https://www.google.com/maps?q=${b.lat},${b.lng}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full text-center bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
              >
                TÌM ĐƯỜNG ĐI
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
        showToast('Đăng nhập thành công! Chào mừng quay trở lại.')
        setLoading(false)
        navigate(from, { replace: true })
      })
      .catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.', 'error')
        setLoading(false)
      })
  }

  return (
    <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
        <div className="text-center mb-8">
          <span className="font-extrabold text-3xl tracking-wider text-primary">HAMBURGER</span>
          <span className="font-extrabold text-3xl tracking-wider text-white bg-primary px-2 py-0.5 rounded-[8px] ml-1">KING</span>
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide mt-6">ĐĂNG NHẬP THÀNH VIÊN</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">ĐỊA CHỈ EMAIL</label>
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
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">MẬT KHẨU</label>
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
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP NGAY'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline font-bold tracking-wide transition">
            ĐĂNG KÝ THÀNH VIÊN MỚI
          </Link>
        </div>
      </div>
    </div>
  )
}

function Register() {
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
      showToast('Mật khẩu xác nhận không khớp.', 'error')
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
      showToast('Đăng ký thành viên mới thành công! Chào mừng bạn gia nhập vương quốc Burger.')
      setLoading(false)
      navigate('/')
    }).catch(err => {
      console.error(err)
      showToast(err.response?.data?.message || 'Lỗi đăng ký tài khoản. Vui lòng kiểm tra lại thông tin.', 'error')
      setLoading(false)
    })
  }

  return (
    <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
        <div className="text-center mb-8">
          <span className="font-extrabold text-3xl tracking-wider text-primary">HAMBURGER</span>
          <span className="font-extrabold text-3xl tracking-wider text-white bg-primary px-2 py-0.5 rounded-[8px] ml-1">KING</span>
          <h2 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-wide mt-6">ĐĂNG KÝ THÀNH VIÊN</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">HỌ VÀ TÊN</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">ĐỊA CHỈ EMAIL</label>
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
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">SỐ ĐIỆN THOẠI</label>
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
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">MẬT KHẨU</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">XÁC NHẬN MẬT KHẨU</label>
            <input 
              type="password" 
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2"
          >
            {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ TÀI KHOẢN MỚI'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold tracking-wide transition">
            ĐĂNG NHẬP NGAY
          </Link>
        </div>
      </div>
    </div>
  )
}

// 6. Checkout Screen (includes multi-address selections, Mock Payment redirections)
// Refactored to light theme with custom borders, rounded inputs, and premium typography
function Checkout() {
  const { cartItems, getCartTotals, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore()
  const { showToast } = useUiStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [deliveryType, setDelivery] = useState('delivery')
  const [paymentMethod, setPayment] = useState('cod')
  const [couponInput, setCouponInput] = useState('')
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  
  // Custom manual address input
  const [manualAddress, setManualAddress] = useState({
    recipient_name: '',
    phone: '',
    province: 'Thành phố Hồ Chí Minh',
    district: '',
    ward: '',
    street: '',
  })

  // Scheduler options
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const totals = getCartTotals(deliveryType)

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
  }, [])

  if (cartItems.length === 0) {
    return <Navigate to="/menu" />
  }

  const handleApplyCoupon = () => {
    if (!couponInput) return
    apiClient.post('/cart/apply-coupon', { code: couponInput, subtotal: totals.subtotal })
      .then(res => {
        applyCoupon(res.data)
        showToast('Áp dụng mã giảm giá thành công!')
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || 'Mã giảm giá không hợp lệ.', 'error')
      })
  }

  const handleCheckoutSubmit = () => {
    setLoading(true)

    const payload = {
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      coupon_code: coupon ? coupon.code : null,
      note,
      scheduled_at: isScheduled ? scheduledAt : null,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
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
        }
      } else {
        // Validate manual input
        if (!manualAddress.recipient_name || !manualAddress.phone || !manualAddress.district || !manualAddress.ward || !manualAddress.street) {
          showToast('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.', 'error')
          setLoading(false)
          return
        }
        payload.address = manualAddress
      }
    }

    apiClient.post('/orders', payload)
      .then(res => {
        clearCart()
        showToast('Đơn hàng đã được đặt thành công!')
        setLoading(false)
        
        // Redirect to either local mock payment gateway or order-tracking
        if (res.data.payment_url) {
          // If the gateway is online, let's redirect
          window.location.href = res.data.payment_url
        } else {
          navigate(`/orders/tracking/${res.data.order.order_code}`)
        }
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || 'Lỗi thanh toán. Vui lòng kiểm tra lại giỏ hàng.', 'error')
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
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 1 ? 'text-primary' : 'text-[#999999]'}`}>THÔNG TIN</span>
        </div>
        <div className={`h-0.5 flex-1 transition-smooth ${step >= 2 ? 'bg-primary' : 'bg-[#E8E8E8]'}`} />
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-smooth ${
            step >= 2 ? 'border-primary bg-primary text-white' : 'border-[#E8E8E8] bg-[#E8E8E8] text-[#999999]'
          }`}>2</span>
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 2 ? 'text-primary' : 'text-[#999999]'}`}>THANH TOÁN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checkout Forms */}
        <main className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">HÌNH THỨC NHẬN HÀNG</h2>
              
              {/* Delivery Type toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDelivery('delivery')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] ${
                    deliveryType === 'delivery' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  GIAO HÀNG TẬN NƠI
                </button>
                <button 
                  onClick={() => setDelivery('pickup')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] ${
                    deliveryType === 'pickup' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  TỰ ĐẾN LẤY BÁNH
                </button>
              </div>

              {/* Address Book Selections */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">ĐỊA CHỈ GIAO HÀNG</h3>
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
                            {addr.is_default && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-[8px] font-bold uppercase">Mặc định</span>}
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
                        <span>Sử dụng địa chỉ khác</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Manual Address Input Card */}
                  {!selectedAddress && (
                    <div className="p-5 rounded-2xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Tên người nhận</label>
                        <input 
                          type="text" 
                          placeholder="Nguyễn Văn A" 
                          value={manualAddress.recipient_name}
                          onChange={(e) => setManualAddress({ ...manualAddress, recipient_name: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Số điện thoại</label>
                        <input 
                          type="tel" 
                          placeholder="09xxxxxx" 
                          value={manualAddress.phone}
                          onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Quận / Huyện</label>
                        <input 
                          type="text" 
                          placeholder="Quận 1" 
                          value={manualAddress.district}
                          onChange={(e) => setManualAddress({ ...manualAddress, district: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Phường / Xã</label>
                        <input 
                          type="text" 
                          placeholder="Phường Bến Nghé" 
                          value={manualAddress.ward}
                          onChange={(e) => setManualAddress({ ...manualAddress, ward: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Số nhà, Tên đường</label>
                        <input 
                          type="text" 
                          placeholder="120 Lê Lợi" 
                          value={manualAddress.street}
                          onChange={(e) => setManualAddress({ ...manualAddress, street: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Scheduler option */}
              <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">THỜI GIAN NHẬN</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsScheduled(false)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] ${
                      !isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    GIAO NGAY BÂY GIỜ
                  </button>
                  <button 
                    onClick={() => setIsScheduled(true)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] ${
                      isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    HẸN GIỜ ĐẶT TRƯỚC
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
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Ghi chú đơn hàng</label>
                <textarea 
                  placeholder="Ghi chú thêm cho đầu bếp (VD: không lấy rau, nhiều sốt BBQ...)" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 mt-6 flex justify-center items-center gap-2"
              >
                TIẾP TỤC: PHƯƠNG THỨC THANH TOÁN
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">PHƯƠNG THỨC THANH TOÁN</h2>
              
              <div className="space-y-2">
                {[
                  { id: 'cod', name: 'Tiền mặt khi nhận hàng (COD)', icon: <CreditCard className="w-5 h-5 text-gray-400" /> },
                  { id: 'vnpay', name: 'Thanh toán trực tuyến VNPay', icon: <CreditCard className="w-5 h-5 text-gray-400" /> },
                  { id: 'momo', name: 'Ví điện tử MoMo', icon: <CreditCard className="w-5 h-5 text-gray-400" /> },
                  { id: 'loyalty', name: 'Thanh toán bằng điểm tích lũy', icon: <Gift className="w-5 h-5 text-gray-400" /> },
                ].map((pay) => (
                  <div 
                    key={pay.id}
                    onClick={() => setPayment(pay.id)}
                    className={`flex items-center justify-between p-4 rounded-[10px] border cursor-pointer transition-smooth hover:-translate-y-[1px] ${
                      paymentMethod === pay.id 
                        ? 'border-primary bg-primary/5 text-[#1A1A1A]' 
                        : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {pay.icon}
                      <span className="text-xs font-semibold text-[#1A1A1A]">{pay.name}</span>
                    </div>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === pay.id ? 'border-primary text-primary' : 'border-gray-400'
                    }`}>
                      {paymentMethod === pay.id && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </span>
                  </div>
                ))}
              </div>

              {paymentMethod === 'loyalty' && (
                <p className="text-[10px] text-gray-400 italic">
                  Quy đổi: 1 điểm = 100 ₫ giảm giá trực tiếp. Đơn hàng sẽ được khấu trừ điểm nạp sẵn.
                </p>
              )}

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-3.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                >
                  QUAY LẠI
                </button>
                <button 
                  onClick={handleCheckoutSubmit}
                  disabled={loading}
                  className="w-1/2 bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-xs transition shadow-glass flex justify-center items-center gap-2 hover:-translate-y-[1px] active:translate-y-0"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Refactored Light Card "Tóm tắt đơn hàng" */}
        <aside className="space-y-6" data-aos="fade-left">
          <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium">
            <h3 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide mb-4">TÓM TẮT ĐƠN HÀNG</h3>
            
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
                      <p className="text-[13px] text-[#888888] mt-1">
                        Size {item.size} {item.toppings.length > 0 && `+ ${item.toppings.map(t => t.name).join(', ')}`}
                      </p>
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
                placeholder="Nhập mã giảm giá..." 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-secondary text-[#1A1A1A] font-bold px-4 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
              >
                ÁP DỤNG
              </button>
            </div>

            {coupon && (
              <div className="mt-2 flex items-center justify-between bg-primary/10 border border-primary/20 text-xs px-3 py-2 rounded-[10px]">
                <span className="text-primary font-semibold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-primary" /> {coupon.code}</span>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-black transition font-semibold">XÓA</button>
              </div>
            )}

            {/* Price lines */}
            <div className="border-t border-[#E8E8E8] pt-4 mt-4 space-y-2 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>Tiết kiệm deal hot</span>
                  <span>-{formatVND(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>Mã giảm giá</span>
                  <span>-{formatVND(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span className="text-[#1A1A1A] font-semibold">
                  {totals.shippingFee === 0
                    ? 'Miễn phí' 
                    : formatVND(totals.shippingFee)
                  }
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-3 mt-4 flex justify-between items-center">
              <span className="font-bold text-[20px] uppercase tracking-wide text-[#666666]">TỔNG CỘNG</span>
              
              {/* Product Total: DM Sans 24px primary red */}
              <span className="font-bold text-2xl text-primary">
                {formatVND(totals.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// 7. Interactive Mock Payment screens
function PaymentMock() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const orderCode = params.get('order_code')
  const amount = params.get('amount')
  const gateway = params.get('gateway')

  const handleSimulate = (status) => {
    // Call backend payment callback
    apiClient.get(`/payment/${gateway}/callback?order_code=${orderCode}&status=${status}`)
      .then(() => {
        navigate(`/orders/tracking/${orderCode}?payment=${status}`)
      }).catch(err => {
        console.error(err)
        navigate(`/orders/tracking/${orderCode}?payment=failed`)
      })
  }

  return (
    <div className="min-h-[80vh] bg-[#FFFAF5] text-[#1A1A1A] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E8E8] shadow-premium text-center space-y-6 animate-float">
        <div className="h-16 w-16 bg-primary/10 border border-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-float">
          <CreditCard className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CỔNG THANH TOÁN THỬ NGHIỆM</span>
          <h2 className="font-bold text-3xl text-[#1A1A1A] uppercase tracking-wide mt-2">
            MOCK GATEWAY {gateway?.toUpperCase()}
          </h2>
          <p className="text-xs text-[#666666] mt-2 leading-relaxed">
            Chào mừng bạn đến cổng thanh toán giả lập. Bạn đang thanh toán đơn hàng: <strong className="text-primary">{orderCode}</strong>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Số tiền thanh toán</span>
            <span className="text-primary font-bold text-sm">{formatVND(parseFloat(amount))}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <button 
            onClick={() => handleSimulate('success')}
            className="w-full bg-[#FFC72C] hover:opacity-90 text-[#1A1A1A] font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0"
          >
            GIẢ LẬP GIAO DỊCH THÀNH CÔNG
          </button>
          <button 
            onClick={() => handleSimulate('failed')}
            className="w-full bg-[#F5F5F5] hover:bg-[#E8E8E8] border border-[#E8E8E8] text-[#666666] font-semibold py-3.5 rounded-[8px] tracking-wider text-xs transition"
          >
            GIẢ LẬP GIAO DỊCH THẤT BẠI / HỦY
          </button>
        </div>
      </div>
    </div>
  )
}

// 8. Order List & Tracking Screen (Timeline)
function OrderDetailTracking() {
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const showToast = useUiStore(state => state.showToast)

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrder()
    const paymentStatus = params.get('payment')
    if (paymentStatus === 'success') {
      showToast('Thanh toán đơn hàng thành công!')
    } else if (paymentStatus === 'failed') {
      showToast('Giao dịch thanh toán thất bại hoặc bị hủy.', 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleCancel = () => {
    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này chứ?')) {
      apiClient.post(`/orders/${code}/cancel`)
        .then(() => {
          showToast('Đơn hàng đã được hủy thành công!')
          loadOrder()
        }).catch(err => {
          console.error(err)
          showToast(err.response?.data?.message || 'Không thể hủy đơn hàng này.', 'error')
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
    { id: 'pending', name: 'Chờ Xử Lý' },
    { id: 'confirmed', name: 'Đã Xác Nhận' },
    { id: 'preparing', name: 'Đang Chuẩn Bị' },
    { id: 'delivering', name: 'Đang Giao Bánh' },
    { id: 'delivered', name: 'Đã Nhận Bánh' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E8E8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">ĐƠN HÀNG CỦA BẠN</span>
          <h1 className="font-bold text-3xl text-[#1A1A1A] uppercase tracking-wide mt-1">MÃ ĐƠN: {order.order_code}</h1>
          <p className="text-xs text-gray-500 mt-1">Đặt lúc: {formatDate(order.created_at)}</p>
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button 
              onClick={handleCancel}
              className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
            >
              HỦY ĐƠN HÀNG
            </button>
          )}
          <Link 
            to="/profile?tab=orders"
            className="bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
          >
            LỊCH SỬ ĐƠN
          </Link>
        </div>
      </div>

      {/* Timeline tracker */}
      {!isCancelled ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] mb-8 shadow-glass">
          <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase mb-6 text-center">TRẠNG THÁI GIAO HÀNG</h3>
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
          <h3 className="font-bold text-xl text-primary uppercase tracking-wide">ĐƠN HÀNG ĐÃ BỊ HỦY</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm">
            Đơn hàng đã được hủy thành công. Bất kỳ điểm tích lũy hoặc giá trị khấu trừ nào đã được hoàn lại đầy đủ vào tài khoản của bạn.
          </p>
        </div>
      )}

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items lists */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4 shadow-glass">
          <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase">CHI TIẾT MÓN ĂN</h3>
          <div className="divide-y divide-[#E8E8E8]">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between text-xs">
                <div>
                  <p className="font-bold text-[#1A1A1A]">{item.product_name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Size {item.size}</p>
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
              <span>Tạm tính</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-primary font-semibold">
                <span>Giảm giá</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>{parseFloat(order.shipping_fee) === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E8E8E8] pt-3 text-sm font-bold text-[#1A1A1A] mt-2">
              <span className="font-semibold text-sm">TỔNG CỘNG</span>
              <span className="text-primary font-semibold text-base">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery / Pickup address card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-glass">
          <div>
            <h3 className="font-bold text-lg text-primary uppercase tracking-[0.3px]">THÔNG TIN GIAO HÀNG</h3>
            {order.delivery_type === 'delivery' && order.address ? (
              <div className="mt-4 text-xs space-y-2">
                <p className="text-[#1A1A1A] font-bold">{order.address.recipient_name} - {order.address.phone}</p>
                <p className="text-[#666666] leading-relaxed">
                  {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                </p>
                <p className="text-gray-400 text-[10px] pt-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Giao từ chi nhánh Quận 1
                </p>
              </div>
            ) : (
              <div className="mt-4 text-xs text-[#666666]">
                <p className="text-[#1A1A1A] font-bold">Khách tự đến lấy bánh</p>
                <p className="mt-2">Chi nhánh: Hamburger King Lê Lợi</p>
                <p className="text-[10px] text-gray-500 mt-1">120 Lê Lợi, Bến Nghé, Quận 1, TP. HCM</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-[#E8E8E8] mt-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Thanh toán</span>
              <span className="text-[#1A1A1A] font-bold uppercase">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Trạng thái</span>
              <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-primary' : 'text-primary/70'}`}>
                {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 9. Profile Management Dashboard (wishlist, loyalty balance, addresses)
function Profile() {
  const { user, updateUser, setLogout } = useAuthStore()
  const { showToast } = useUiStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const activeTab = searchParams.get('tab') || 'info'

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [addresses, setAddresses] = useState([])
  const [loyalty, setLoyalty] = useState({ balance: 0, transactions: [] })
  const [notifications, setNotifications] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [orders, setOrders] = useState([])

  // Addresses Form fields
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Nhà riêng',
    recipient_name: '',
    phone: '',
    province: 'Thành phố Hồ Chí Minh',
    district: '',
    ward: '',
    street: '',
    is_default: false
  })

  const loadData = () => {
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
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    // Simulate updating user
    updateUser({ name, phone })
    showToast('Cập nhật thông tin cá nhân thành công!')
  }

  const handleCreateAddress = (e) => {
    e.preventDefault()
    apiClient.post('/addresses', newAddress)
      .then(res => {
        setAddresses([res.data, ...addresses])
        setShowAddressForm(false)
        showToast('Thêm địa chỉ mới thành công!')
      }).catch(err => {
        console.error(err)
        showToast('Lỗi lưu địa chỉ.', 'error')
      })
  }

  const handleDeleteAddress = (id) => {
    if (window.confirm('Bạn muốn xóa địa chỉ này?')) {
      apiClient.delete(`/addresses/${id}`)
        .then(() => {
          setAddresses(addresses.filter(a => a.id !== id))
          showToast('Xóa địa chỉ thành công.')
        })
    }
  }

  const handleMarkNotificationRead = (id) => {
    apiClient.post(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n))
        showToast('Đã đánh dấu đọc.')
      })
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A] flex flex-col md:flex-row gap-8">
      {/* Side Tabs */}
      <aside className="w-full md:w-64 shrink-0 p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-glass">
        <div className="space-y-2">
          {[
            { id: 'info', name: 'THÔNG TIN CÁ NHÂN', icon: <UserIcon className="w-4 h-4" /> },
            { id: 'orders', name: 'LỊCH SỬ ĐƠN HÀNG', icon: <Package className="w-4 h-4" /> },
            { id: 'addresses', name: 'SỔ ĐỊA CHỈ', icon: <MapPin className="w-4 h-4" /> },
            { id: 'loyalty', name: 'LỊCH SỬ ĐIỂM LOYALTY', icon: <Gift className="w-4 h-4" /> },
            { id: 'notifications', name: 'THÔNG BÁO', icon: <Bell className="w-4 h-4" /> },
            { id: 'wishlist', name: 'DANH SÁCH YÊU THÍCH', icon: <Heart className="w-4 h-4" /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
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
          ĐĂNG XUẤT
        </button>
      </aside>

      {/* Tab Panels */}
      <main className="flex-1 p-6 rounded-2xl bg-white border border-[#E8E8E8] min-h-[50vh] shadow-glass">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">THÔNG TIN CÁ NHÂN</h2>
            
            {/* Loyalty Point Widget */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex justify-between items-center animate-float">
              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A]">Điểm Loyalty của bạn</h4>
                <p className="text-[10px] text-gray-400 mt-1">Tích lũy từ việc ăn Hamburger mỗi ngày.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-3xl text-primary">{user.loyalty_balance || 0}</span>
                <span className="text-xs text-primary font-semibold">Điểm</span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              <button 
                type="submit" 
                className="bg-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
              >
                CẬP NHẬT THÔNG TIN
              </button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">LỊCH SỬ ĐƠN HÀNG</h2>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400">Bạn chưa đặt đơn hàng nào.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-white flex flex-col sm:flex-row justify-between gap-4 shadow-glass">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">Mã đơn: {o.order_code}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Ngày đặt: {formatDate(o.created_at)}</p>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">Món ăn: {o.items?.map(i => i.product_name).join(', ')}</p>
                  </div>
                  <div className="flex flex-col sm:items-end justify-between">
                    <span className="font-heading text-lg text-primary">{formatVND(o.total)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        o.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                      }`}>{o.status}</span>
                      <Link 
                        to={`/orders/tracking/${o.order_code}`}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Theo dõi
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-3">
              <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px]">SỔ ĐỊA CHỈ</h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="bg-primary text-white font-semibold px-4 py-2 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
              >
                THÊM ĐỊA CHỈ MỚI
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Tên gợi nhớ (VD: Nhà riêng, Văn phòng)</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Tên người nhận</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Số điện thoại nhận hàng</label>
                  <input 
                    type="tel" 
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Quận / Huyện</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Phường / Xã</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.ward}
                    onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">Số nhà, Tên đường</label>
                  <input 
                    type="text" 
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-[#E8E8E8]"
                  />
                  <span className="text-xs text-gray-500">Đặt làm địa chỉ giao hàng mặc định</span>
                </div>

                <div className="sm:col-span-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(false)}
                    className="bg-white hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition"
                  >
                    HỦY
                  </button>
                  <button 
                    type="submit" 
                    className="bg-primary hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
                  >
                    LƯU ĐỊA CHỈ
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-white flex flex-col justify-between shadow-glass">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                      {addr.is_default && <span className="text-[10px] bg-[#FFC72C] text-[#1A1A1A] px-2 py-0.5 rounded-[8px] font-bold uppercase">Mặc định</span>}
                    </div>
                    <p className="text-xs font-semibold text-[#1A1A1A] mt-3">{addr.recipient_name} - {addr.phone}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex justify-end">
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-primary hover:opacity-80 p-1.5 transition text-xs font-bold"
                    >
                      Xóa địa chỉ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">LỊCH SỬ ĐIỂM LOYALTY</h2>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 animate-float">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">THÀNH VIÊN KHÁCH HÀNG THÂN THIẾT</span>
                <h3 className="font-bold text-2xl text-[#1A1A1A] uppercase tracking-[0.3px] mt-1">ĐIỂM THƯỞNG LOYALTY</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-4xl text-primary">{loyalty.balance}</span>
                <span className="text-xs text-primary font-semibold">Điểm khả dụng</span>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <span className="text-[10px] text-gray-400 font-bold block mb-2 uppercase">LỊCH SỬ GIAO DỊCH CHI TIỆT:</span>
              {loyalty.transactions.length === 0 ? (
                <p className="text-xs text-gray-400">Chưa có giao dịch tích điểm nào.</p>
              ) : (
                loyalty.transactions.map((tr) => (
                  <div key={tr.id} className="p-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1A1A1A] leading-tight">{tr.description}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{formatDate(tr.created_at)}</p>
                    </div>
                    <span className="font-bold text-sm text-primary">
                      {tr.type === 'earn' ? '+' : '-'}{tr.points} Điểm
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">THÔNG BÁO CỦA BẠN</h2>
            
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400">Không có thông báo mới.</p>
              ) : (
                notifications.map((n) => {
                  const unread = !n.read_at
                  return (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition ${
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
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="text-[10px] text-primary hover:opacity-80 transition font-bold"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">DANH SÁCH YÊU THÍCH</h2>
            {wishlist.length === 0 ? (
              <p className="text-xs text-gray-400">Danh sách yêu thích của bạn đang trống.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map((w) => (
                  <div key={w.id} className="flex gap-4 p-3 rounded-xl border border-[#E8E8E8] bg-white shadow-glass">
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
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        ĐẶT MUA NGAY
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// 10. Admin Panel & Dashboard Management (includes charts & reports)
function Admin() {
  const { user } = useAuthStore()
  const { showToast } = useUiStore()
  
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')

  // Products CRUD states
  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  
  // New Product Modal fields
  const [newP, setNewP] = useState({
    name: '',
    category_id: '',
    base_price: '',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
    description: 'Thơm ngon nướng lửa hồng nguyên bản đặc trưng của Hamburger King.'
  })

  // Coupons state
  const [coupons, setCoupons] = useState([])
  const [newC, setNewC] = useState({
    code: '',
    type: 'percent',
    value: '',
    min_order: '0',
    usage_limit: '100'
  })

  const loadAdminData = () => {
    setLoading(true)
    apiClient.get('/admin/dashboard')
      .then(res => {
        setStats(res.data)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })

    if (tab === 'orders') {
      apiClient.get('/admin/orders').then(res => setOrders(res.data.data || []))
    } else if (tab === 'products') {
      Promise.all([
        apiClient.get('/admin/products'),
        apiClient.get('/admin/categories')
      ]).then(([pRes, cRes]) => {
        setProducts(pRes.data)
        setCats(cRes.data)
      })
    } else if (tab === 'coupons') {
      apiClient.get('/admin/coupons').then(res => setCoupons(res.data))
    }
  }

  useEffect(() => {
    if (user?.role !== 'admin') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleUpdateOrderStatus = (orderId, status) => {
    apiClient.post(`/admin/orders/${orderId}/status`, { status })
      .then(() => {
        showToast('Cập nhật trạng thái đơn hàng thành công!')
        loadAdminData()
      }).catch(err => {
        console.error(err)
        showToast('Lỗi cập nhật đơn.', 'error')
      })
  }

  const handleCreateProduct = (e) => {
    e.preventDefault()
    apiClient.post('/admin/products', newP)
      .then(res => {
        setProducts([...products, res.data.product])
        showToast('Thêm sản phẩm mới thành công!')
      }).catch(err => {
        console.error(err)
        showToast('Lỗi thêm sản phẩm.', 'error')
      })
  }

  const handleDeleteProduct = (id) => {
    if (window.confirm('Xóa sản phẩm này chứ? (Soft Delete)')) {
      apiClient.delete(`/admin/products/${id}`)
        .then(() => {
          setProducts(products.filter(p => p.id !== id))
          showToast('Xóa sản phẩm thành công.')
        })
    }
  }

  const handleCreateCoupon = (e) => {
    e.preventDefault()
    apiClient.post('/admin/coupons', newC)
      .then(res => {
        setCoupons([res.data.coupon, ...coupons])
        showToast('Tạo mã giảm giá mới thành công!')
      }).catch(err => {
        console.error(err)
        showToast('Lỗi tạo mã giảm giá.', 'error')
      })
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />
  }

  if (loading && !stats) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFAF5]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E8E8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-primary font-bold uppercase tracking-wider">HỆ THỐNG QUẢN TRỊ VIÊN</span>
          <h1 className="font-extrabold text-2xl text-[#1A1A1A] uppercase tracking-[0.3px] mt-1">DASHBOARD TRUNG TÂM</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'orders', name: 'ĐƠN HÀNG', icon: <Package className="w-4 h-4" /> },
            { id: 'products', name: 'SẢN PHẨM (CRUD)', icon: <Layers className="w-4 h-4" /> },
            { id: 'coupons', name: 'MÃ GIẢM GIÁ', icon: <Tag className="w-4 h-4" /> },
          ].map((t) => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`font-semibold px-4 py-2 rounded-[8px] text-xs tracking-wider transition flex items-center gap-1.5 ${
                tab === t.id ? 'bg-[#FFC72C] text-[#1A1A1A] font-bold shadow' : 'bg-white border border-[#E8E8E8] text-gray-500 hover:border-gray-400'
              }`}
            >
              {t.icon}
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Widgets */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'TỔNG DOANH THU', value: formatVND(stats.metrics.total_sales), icon: <TrendingUp className="w-6 h-6 text-primary" />, bg: 'bg-[#FFC72C]/10 border-[#FFC72C]/20' },
            { title: 'ĐƠN HÀNG CHỜ', value: stats.metrics.pending_orders, icon: <Package className="w-6 h-6 text-primary animate-float" />, bg: 'bg-primary/5 border-primary/10' },
            { title: 'KHÁCH HÀNG', value: stats.metrics.active_customers, icon: <UserIcon className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-500/5 border-blue-500/10' },
            { title: 'MÓN ĂN TRÊN KỆ', value: stats.metrics.total_products, icon: <Layers className="w-6 h-6 text-green-500" />, bg: 'bg-green-500/5 border-green-500/10' },
          ].map((w, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${w.bg} flex justify-between items-center shadow-glass`}>
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{w.title}</span>
                <h4 className="font-heading text-xl md:text-2xl text-[#1A1A1A] mt-2 leading-none">{w.value}</h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                {w.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Panels */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] min-h-[40vh] shadow-glass">
        {tab === 'orders' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">BÀN XỬ LÝ ĐƠN HÀNG</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[#E8E8E8]">
                <thead>
                  <tr className="text-gray-400 font-bold uppercase tracking-wide">
                    <th className="pb-3">Mã đơn</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Thời gian</th>
                    <th className="pb-3">Món ăn</th>
                    <th className="pb-3">Tổng cộng</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3 text-right">Xử lý nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8] text-[#666666]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F8F8F8] transition">
                      <td className="py-4 font-bold text-[#1A1A1A]">{o.order_code}</td>
                      <td className="py-4">{o.user?.name ?? 'Khách lẻ'} - {o.address?.phone ?? 'N/A'}</td>
                      <td className="py-4">{formatDate(o.created_at)}</td>
                      <td className="py-4 truncate max-w-xs">{o.items?.map(i => i.product_name).join(', ')}</td>
                      <td className="py-4 font-bold text-primary">{formatVND(o.total)}</td>
                      <td className="py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          o.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                        }`}>{o.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <select 
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-white border border-[#E8E8E8] text-[10px] text-[#1A1A1A] rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="confirmed">Xác nhận</option>
                          <option value="preparing">Đang nấu</option>
                          <option value="delivering">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product Form */}
              <form onSubmit={handleCreateProduct} className="w-full sm:w-80 shrink-0 p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] space-y-4">
                <h3 className="font-bold text-base text-primary uppercase tracking-[0.3px]">THÊM BÁNH MỚI</h3>
                
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Tên sản phẩm</label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: Bacon Cheese Deluxe" 
                    value={newP.name}
                    onChange={(e) => setNewP({ ...newP, name: e.target.value })}
                    className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Danh mục</label>
                  <select 
                    required
                    value={newP.category_id}
                    onChange={(e) => setNewP({ ...newP, category_id: e.target.value })}
                    className="w-full bg-white border border-[#E8E8E8] text-xs text-[#1A1A1A] rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="">Chọn danh mục</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Giá gốc (VND)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="99000" 
                    value={newP.base_price}
                    onChange={(e) => setNewP({ ...newP, base_price: e.target.value })}
                    className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary hover:opacity-90 text-white font-semibold py-2.5 rounded-lg text-xs tracking-wider uppercase transition hover:-translate-y-[1px]"
                >
                  LƯU LÊN KỆ BÁNH
                </button>
              </form>

              {/* Products list grid */}
              <div className="flex-1 overflow-x-auto">
                <h3 className="font-bold text-base text-[#1A1A1A] uppercase tracking-[0.3px] mb-4">SẢN PHẨM HIỆN TẠI TRÊN KỆ</h3>
                <table className="w-full text-left text-xs divide-y divide-[#E8E8E8]">
                  <thead>
                    <tr className="text-gray-400 font-bold uppercase tracking-wide">
                      <th className="pb-3">Hình</th>
                      <th className="pb-3">Tên sản phẩm</th>
                      <th className="pb-3">Danh mục</th>
                      <th className="pb-3">Giá bán</th>
                      <th className="pb-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E8] text-[#666666]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8F8F8] transition">
                        <td className="py-3">
                          <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                        </td>
                        <td className="py-3 font-bold text-[#1A1A1A]">{p.name}</td>
                        <td className="py-3">{p.category?.name ?? 'N/A'}</td>
                        <td className="py-3 font-semibold text-primary text-sm">{formatVND(p.base_price)}</td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-primary hover:opacity-80 p-1.5 transition text-xs font-semibold"
                          >
                            Xóa bánh
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="w-full sm:w-80 shrink-0 p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] space-y-4">
                <h3 className="font-bold text-base text-primary uppercase tracking-[0.3px]">TẠO MÃ GIẢM GIÁ</h3>
                
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Mã CODE</label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: BURGERVIP" 
                    value={newC.code}
                    onChange={(e) => setNewC({ ...newC, code: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Kiểu giảm</label>
                  <select 
                    value={newC.type}
                    onChange={(e) => setNewC({ ...newC, type: e.target.value })}
                    className="w-full bg-white border border-[#E8E8E8] text-xs text-[#1A1A1A] rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="percent">Giảm theo %</option>
                    <option value="fixed">Giảm tiền mặt</option>
                    <option value="free_ship">Miễn phí ship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-1 uppercase">Giá trị giảm</label>
                  <input 
                    type="number" 
                    required
                    placeholder="VD: 20 (% hoặc VND)" 
                    value={newC.value}
                    onChange={(e) => setNewC({ ...newC, value: e.target.value })}
                    className="w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary hover:opacity-90 text-white font-semibold py-2.5 rounded-lg text-xs tracking-wider uppercase transition hover:-translate-y-[1px]"
                >
                  TẠO MÃ NGAY
                </button>
              </form>

              {/* Coupons list */}
              <div className="flex-1 overflow-x-auto">
                <h3 className="font-bold text-base text-[#1A1A1A] uppercase tracking-[0.3px] mb-4">DANH SÁCH MÃ GIẢM GIÁ HOẠT ĐỘNG</h3>
                <table className="w-full text-left text-xs divide-y divide-[#E8E8E8]">
                  <thead>
                    <tr className="text-gray-400 font-bold uppercase tracking-wide">
                      <th className="pb-3">Mã giảm giá</th>
                      <th className="pb-3">Loại giảm</th>
                      <th className="pb-3">Giá trị</th>
                      <th className="pb-3">Đơn tối thiểu</th>
                      <th className="pb-3">Lượt dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E8] text-[#666666]">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F8F8F8] transition">
                        <td className="py-3 font-bold text-[#1A1A1A] flex items-center gap-1.5"><Tag className="w-4 h-4 text-primary" /> {c.code}</td>
                        <td className="py-3 uppercase font-semibold text-xs">{c.type}</td>
                        <td className="py-3 text-primary font-semibold text-sm">{c.type === 'percent' ? `${c.value}%` : formatVND(c.value)}</td>
                        <td className="py-3">{formatVND(c.min_order)}</td>
                        <td className="py-3">{c.used_count} / {c.usage_limit ?? 'Vô hạn'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- MAIN ROUTER APP ---

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
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
      <div className="min-h-screen bg-[#FFFAF5] text-[#1A1A1A] flex flex-col antialiased selection:bg-primary selection:text-white pb-16 md:pb-0">
        <AosRefresh />
        
        {/* Global Toast Alerts */}
        <Toast />

        {/* Global Navbar */}
        <Header />

        {/* Floating Cart Drawer */}
        <CartDrawer />

        {/* Router Pages Switch */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home onSelectProduct={setSelectedProduct} />} />
            <Route path="/menu" element={<Menu onSelectProduct={setSelectedProduct} />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/branches" element={<Branches />} />
            
            {/* Authentications */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Checkout & tracking */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/checkout/payment-mock" element={<PaymentMock />} />
            <Route path="/orders/tracking/:code" element={<OrderDetailTracking />} />
            
            {/* Customer & Admin panels */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>

        {/* Bottom Nav on Mobile devices */}
        <MobileNav />

        {/* Global Footer */}
        <Footer />

        {/* Product details customizer dialog overlay */}
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
    </Router>
  )
}

export default App
