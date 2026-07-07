import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Home, Utensils, User } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useUiStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

export default function MobileNav() {
  const { t } = useTranslation()
  const { cartItems } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()
  const { user } = useAuthStore()
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E8E8] pt-3 pb-3 pb-safe px-6 flex justify-around items-center text-[#666666] shadow-premium">
      <Link 
        to="/" 
        className="flex flex-col items-center gap-1 transition text-[#666666] hover:text-primary active:text-primary"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-wide">{t('nav.home').toUpperCase()}</span>
      </Link>

      <Link 
        to="/menu" 
        className="flex flex-col items-center gap-1 transition text-[#666666] hover:text-primary active:text-primary"
      >
        <Utensils className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-wide">{t('nav.menu').toUpperCase()}</span>
      </Link>

      <button 
        onClick={() => setCartDrawerOpen(true)}
        className="relative flex flex-col items-center gap-1 transition text-[#666666] hover:text-primary active:text-primary"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalQuantity > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white font-semibold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
            {totalQuantity}
          </span>
        )}
        <span className="text-[10px] font-bold tracking-wide">{t('nav.cart').toUpperCase()}</span>
      </button>

      <Link 
        to={user ? "/profile" : "/login"} 
        className="flex flex-col items-center gap-1 transition text-[#666666] hover:text-primary active:text-primary"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold tracking-wide">
          {t(user ? 'nav.profile' : 'nav.login').toUpperCase()}
        </span>
      </Link>
    </div>
  )
}
