import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Plus } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/axios'
import { formatVND } from '../../utils/format'

import LazyImage from './LazyImage'
import { usePrefetch } from '../../hooks/usePrefetch'

export default function ProductCard({ product, onSelect, index = 0 }) {
  const { t } = useTranslation()
  const { prefetchProduct } = usePrefetch()
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
      onMouseEnter={() => prefetchProduct(product.slug)}
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
        <LazyImage 
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
