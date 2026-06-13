import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Star, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatVND } from '../../utils/format'
import { assetUrl, logoSizeValue } from '../../utils/adminUtils'

export default function ProductDetailModal({ product, onClose }) {
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
