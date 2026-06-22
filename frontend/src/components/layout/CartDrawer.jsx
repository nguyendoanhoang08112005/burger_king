import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatVND } from '../../utils/format'

export default function CartDrawer() {
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
                        {t('product.topping')}: {item.toppings.map(t => t.name).join(', ')}
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
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition hover:-translate-y-[1px] active:translate-y-0 flex items-center justify-center gap-2 shadow-glass animate-pulse-gold-once"
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
