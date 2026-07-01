import { useState, useEffect, lazy, Suspense, useRef } from 'react'
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useLocation,
  Navigate,
} from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Toaster } from 'react-hot-toast'

// Layout Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import MobileNav from './components/layout/MobileNav'
import CartDrawer from './components/layout/CartDrawer'

// UI Components & Loaders
import Toast from './components/ui/Toast'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ProductDetailModal from './components/ui/ProductDetailModal'
import PublicSettingsLoader from './components/ui/PublicSettingsLoader'
import RealTimeNotificationLoader from './components/ui/RealTimeNotificationLoader'

// Other storefront pages / components
import ScrollToTopButton from './components/ScrollToTopButton'
import ChatWidget from './components/chat/ChatWidget'

// Lazy load Pages
const Home = lazy(() => import('./pages/customer/HomePage'))
const Menu = lazy(() => import('./pages/customer/MenuPage'))
const Branches = lazy(() => import('./pages/customer/BranchesPage'))
const Login = lazy(() => import('./pages/customer/LoginPage'))
const Register = lazy(() => import('./pages/customer/RegisterPage'))
const ForgotPassword = lazy(() => import('./pages/customer/ForgotPasswordPage'))
const Checkout = lazy(() => import('./pages/customer/CheckoutPage'))
const OrderDetailTracking = lazy(() => import('./pages/customer/OrderTrackingPage'))
const Profile = lazy(() => import('./pages/customer/ProfilePage'))
const BlogPage = lazy(() => import('./pages/customer/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/customer/BlogDetailPage'))
const AdminPanel = lazy(() => import('./admin/AdminPanel'))
const About = lazy(() => import('./pages/customer/AboutPage'))
const Privacy = lazy(() => import('./pages/customer/PrivacyPage'))
const Terms = lazy(() => import('./pages/customer/TermsPage'))
const Delivery = lazy(() => import('./pages/customer/DeliveryPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFFAF5]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Utilities & Stores
import { initDarkMode } from './utils/darkMode'
import { useAuthStore } from './store/authStore'
import apiClient from './api/axios'

function AosRefresh() {
  const location = useLocation()

  useEffect(() => {
    AOS.refresh()
  }, [location.pathname])

  return null
}

function SessionGuard() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isCheckingRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const checkSession = async () => {
      if (document.visibilityState !== 'visible') return
      if (isCheckingRef.current) return
      isCheckingRef.current = true
      try {
        await apiClient.get('/profile')
      } catch (err) {
        // Axios interceptor will auto-logout on 401/423
      } finally {
        isCheckingRef.current = false
      }
    }

    checkSession()
    const interval = window.setInterval(checkSession, 30000)
    window.addEventListener('focus', checkSession)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkSession)
    }
  }, [isAuthenticated])

  return null
}

function AppShell({ selectedProduct, setSelectedProduct }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) {
      document.documentElement.classList.add('admin-page')
      document.body.classList.add('admin-page')
    } else {
      document.documentElement.classList.remove('admin-page')
      document.body.classList.remove('admin-page')
    }
  }, [isAdminRoute])

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
        {!isAdminRoute && <ChatWidget onSelectProduct={setSelectedProduct} />}

        {/* Router Pages Switch */}
        <div className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/" element={<Home onSelectProduct={setSelectedProduct} />} />
              <Route path="/menu" element={<Menu onSelectProduct={setSelectedProduct} />} />
              <Route path="/combos" element={<Navigate to="/menu?category=combo-meals" replace />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              
              {/* Authentications */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Checkout & tracking */}
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders/tracking/:code" element={<OrderDetailTracking />} />
              
              {/* Customer & Admin panels */}
              <Route path="/profile" element={<Profile onSelectProduct={setSelectedProduct} />} />
              
              {/* Policies & Info */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/delivery" element={<Delivery />} />
            </Routes>
          </Suspense>
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
