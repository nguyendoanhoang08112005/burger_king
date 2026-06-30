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

export default function ProductCard({ product, onSelect, index = 0, variant = 'light' }) {
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

  const isDark = variant === 'dark'

  const hasSale = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price)
  const discountPercentage = hasSale
    ? Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100)
    : 0

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
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1.5 ${
        isDark 
          ? 'bg-white/10 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:bg-white/15 hover:border-white/20' 
          : 'bg-white border border-[#E8E8E8] shadow-glass hover:shadow-premium'
      }`}
    >
      {/* Badge sales */}
      {hasSale && (
        <span className="absolute top-4 left-4 z-10 bg-primary text-white font-semibold text-xs px-3 py-1 rounded-full border border-white/10">
          - {discountPercentage}%
        </span>
      )}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition hover:-translate-y-0.5 ${
          wishlisted 
            ? 'bg-primary text-white border-primary' 
            : isDark 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-[var(--color-secondary)]' 
              : 'bg-white/90 border-white/80 text-[#1A1A1A] hover:text-primary shadow-glass'
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
        <span className={`text-xs font-bold tracking-wider uppercase mb-1 ${isDark ? 'text-[var(--color-secondary)]' : 'text-primary'}`}>
          {product.category?.name ?? 'Hamburger King'}
        </span>
        <h4 className={`font-bold text-base line-clamp-1 transition ${isDark ? 'text-white group-hover:text-[var(--color-secondary)]' : 'text-[#1A1A1A] group-hover:text-primary'}`}>
          {product.name}
        </h4>
        <p className={`text-xs mt-2 line-clamp-2 leading-relaxed flex-1 ${isDark ? 'text-white/70' : 'text-[#666666]'}`}>
          {product.short_description ?? product.description}
        </p>

        {/* Pricing & Add */}
        <div className={`flex items-center justify-between mt-5 pt-3 border-t ${isDark ? 'border-white/10' : 'border-[#E8E8E8]'}`}>
          <div className="flex flex-col">
            {hasSale ? (
              <>
                <span className={`text-xs line-through leading-none mb-0.5 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{formatVND(product.base_price)}</span>
                <span className={`text-lg font-semibold leading-none ${isDark ? 'text-[var(--color-secondary)]' : 'text-primary'}`}>{formatVND(product.sale_price)}</span>
              </>
            ) : (
              <span className={`text-lg font-semibold leading-none ${isDark ? 'text-white' : 'text-primary'}`}>{formatVND(product.base_price)}</span>
            )}
          </div>

          <button 
            onClick={handleQuickAdd}
            className={`p-2.5 rounded-[8px] transition hover:scale-105 ${isDark ? 'bg-white text-[var(--color-primary)] hover:bg-[var(--color-secondary)] hover:text-white' : 'bg-primary hover:opacity-90 text-white'}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
