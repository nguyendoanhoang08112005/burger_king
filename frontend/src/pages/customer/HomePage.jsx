import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Star,
  Users,
  Utensils,
  MessageSquare,
  Flame,
  Leaf,
  Smile,
  Zap
} from 'lucide-react'
import AOS from 'aos'
import { formatVND } from '../../utils/format'
import ProductCard from '../../components/ui/ProductCard'
import { useHomepage } from '../../hooks/useHomepage'
import { HomePageSkeleton } from '../../components/ui/Skeleton'
import LazyImage from '../../components/ui/LazyImage'
import { useUiStore } from '../../store/uiStore'
import { assetUrl } from '../../utils/adminUtils'

// Floating food elements components for 3D Hero
const BasilLeaf = ({ className = "" }) => (
  <img
    src="/hero-basil-3d.webp"
    alt="Basil Leaf"
    className={`${className} object-contain filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.15)]`}
  />
)

const TomatoSlice = ({ className = "" }) => (
  <img
    src="/hero-tomato-3d.webp"
    alt="Tomato Slice"
    className={`${className} object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)]`}
  />
)

const ChiliSlice = ({ className = "" }) => (
  <img
    src="/hero-chili-3d.webp"
    alt="Red Chili"
    className={`${className} object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)]`}
  />
)

const StarburstBadge = ({ title, value, text, bgColor = '#F5A623', textColor = '#ffffff', className = '' }) => {
  const points = 16
  const outerRadius = 50
  const innerRadius = 41
  let path = ''
  const cx = 50
  const cy = 50
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const x = cx + r * Math.sin(angle)
    const y = cy - r * Math.cos(angle)
    if (i === 0) {
      path += `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  }
  path += ' Z'

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute w-full h-full drop-shadow-[0_5px_10px_rgba(0,0,0,0.18)] animate-spin-slow">
        <path fill={bgColor} d={path} />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none select-none pointer-events-none px-1" style={{ color: textColor }}>
        {title ? (
          <>
            <span className="text-[7px] md:text-[8px] font-extrabold uppercase tracking-tight block opacity-95 mb-0.5">{title}</span>
            <span className="text-[12px] md:text-[13px] font-black uppercase">{value}</span>
          </>
        ) : (
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight leading-[1.1]">{text}</span>
        )}
      </div>
    </div>
  )
}

export default function HomePage({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useHomepage()
  const [testiIndex, setTestiIndex] = useState(0)
  const [activeFaq, setActiveFaq] = useState(null)

  const publicSettings = useUiStore(state => state.publicSettings) || {}
  const publicSettingsLoaded = useUiStore(state => state.publicSettingsLoaded)

  const banners = data?.banners ?? []
  const categories = data?.categories ?? []
  const featuredProducts = data?.featured_products ?? []
  const combos = data?.combos ?? []
  const comboProducts = data?.combo_products ?? []
  const branches = data?.branches ?? []
  const blogPosts = data?.blog_posts ?? []
  const testimonials = data?.testimonials ?? []
  const galleryBanners = data?.gallery_banners ?? []
  const ctaBanner = data?.cta_banner ?? null

  // Dynamically configured deal items (from admin settings)
  const deal1Item = data?.deal1_item ?? combos[0] ?? null
  const deal2Item = data?.deal2_item ?? combos[1] ?? null
  const deal3Item = data?.deal3_item ?? combos[2] ?? combos[1] ?? null

  const heroBanners = banners.filter(b => b.position === 'hero')
  const activeHero = heroBanners[0] || banners[0] || null

  useEffect(() => {
    if (!isLoading && publicSettingsLoaded) {
      setTimeout(() => AOS.refresh(), 0)
    }
  }, [isLoading, publicSettingsLoaded])

  // Auto-slide for Testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setTestiIndex(idx => (idx + 1) % testimonials.length)
    }, 8005)

    return () => window.clearInterval(timer)
  }, [testimonials.length])

  if (isLoading || !publicSettingsLoaded) {
    return <HomePageSkeleton />
  }

  const findSellableComboProduct = (combo) => {
    const comboSlug = String(combo?.slug || '')
    const sellableSlug = comboSlug.replace(/-set$/, '')
    return comboProducts.find(product => product.slug === sellableSlug)
      || comboProducts.find(product => String(product.name || '').toLowerCase() === String(combo?.name || '').toLowerCase())
  }

  // Normalize price regardless of whether item is a combo (uses price) or product (uses base_price)
  const getDealPrice = (item) => item?.base_price ?? item?.price ?? null
  const getDealSalePrice = (item) => item?.sale_price ?? null

  // Select deal item: for products, open directly; for combos, find sellable product
  const selectDealItem = (item) => {
    if (!item) return
    // If the item has base_price it's a product (not a combo set)
    if (item.base_price !== undefined) {
      onSelectProduct?.(item)
    } else {
      const sellable = findSellableComboProduct(item)
      if (sellable) onSelectProduct?.(sellable)
    }
  }

  // Safe parsing helper for JSON settings
  const parseJsonSetting = (key, fallback = []) => {
    const val = publicSettings[key]
    if (!val) return fallback
    if (typeof val === 'object' && val !== null) return val
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch (e) {
        return fallback
      }
    }
    return Array.isArray(val) ? val : fallback
  }

  // Helper to extract translation from public settings JSON fields
  const getPublicTrans = (key, fallback = '') => {
    const val = publicSettings[key]
    if (!val) return fallback
    if (typeof val === 'object' && val !== null) {
      return val[i18n.language] || val.vi || val.en || fallback
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        return parsed[i18n.language] || parsed.vi || parsed.en || fallback
      } catch (e) {
        return val || fallback
      }
    }
    return fallback
  }

  // Get FAQs
  const faqs = parseJsonSetting('homepage.faqs', [])

  // CTA Section configs
  const ctaTitle = ctaBanner?.title || getPublicTrans('homepage.cta_title', i18n.language === 'vi' ? 'Đặt hàng ngay để trải nghiệm vị ngon đỉnh cao giao tận cửa!' : 'Order now to experience the ultimate taste delivered to your door!')
  const ctaSubtitle = ctaBanner?.subtitle || (i18n.language === 'vi' ? 'Đặt hàng ngay để trải nghiệm vị ngon đỉnh cao giao tận cửa!' : 'Order now to experience the ultimate taste delivered to your door!')
  const ctaImage = ctaBanner?.image || (publicSettings['homepage.cta_image'] ? assetUrl(publicSettings['homepage.cta_image']) : '/hero-burger-3d.webp')
  const ctaBtnText = getPublicTrans('homepage.cta_btn', i18n.language === 'vi' ? 'Đặt Hàng Ngay' : 'Order Now')
  const ctaLink = ctaBanner?.link || '/menu'

  // Dynamic Homepage settings titles
  const categoriesSubtitle = getPublicTrans('homepage.categories_subtitle', i18n.language === 'vi' ? 'Danh Mục Món Ăn' : 'Categories')
  const categoriesTitle = getPublicTrans('homepage.categories_title', i18n.language === 'vi' ? 'KHÁM PHÁ CÁC MÓN ĂN PHỔ BIẾN' : 'EXPLORE OUR POPULAR DISHES')

  const dealSubtitle = getPublicTrans('homepage.deal_subtitle', i18n.language === 'vi' ? 'Ưu Đãi Đặc Biệt' : 'Special Offers')
  const dealTitle = getPublicTrans('homepage.deal_title', i18n.language === 'vi' ? 'ƯU ĐÃI THƠM NGON DÀNH CHO BẠN' : 'DELICIOUS DEALS FOR YOU')
  const dealDesc = getPublicTrans('homepage.deal_desc', i18n.language === 'vi' ? 'Thưởng thức những món ăn yêu thích với mức giá không thể bỏ lỡ — luôn tươi ngon và đậm đà hương vị.' : 'Enjoy your favorite meals at unbeatable prices — freshly made and full of flavor with delicious ingredients, great quality, amazing taste.')

  const featuredSubtitle = getPublicTrans('homepage.featured_subtitle', i18n.language === 'vi' ? 'Gợi ý từ bếp trưởng' : "Chef's Recommendation")
  const featuredTitle = getPublicTrans('homepage.featured_title', i18n.language === 'vi' ? 'GỢI Ý TỪ BẾP TRƯỞNG' : "CHEF'S RECOMMENDATION")

  const gallerySubtitle = getPublicTrans('homepage.gallery_badge', i18n.language === 'vi' ? 'KHÔNG GIAN & MÓN ĂN' : 'SPACE & DISHES')
  const galleryTitle = getPublicTrans('homepage.gallery_title', i18n.language === 'vi' ? 'MÃN NHÃN VỚI HƯƠNG VỊ' : 'A FEAST FOR YOUR EYES')

  const blogSubtitle = getPublicTrans('homepage.blog_badge', i18n.language === 'vi' ? 'Tin Tức' : 'News')
  const blogTitle = getPublicTrans('homepage.blog_title', i18n.language === 'vi' ? 'CÔNG THỨC, CÂU CHUYỆN & BÀI VIẾT ẨM THỰC' : 'RECIPES, STORIES & FOOD ARTICLES')

  // Combos mapping for deals (using dynamically configured deal items)
  const combo1 = deal1Item
  const combo2 = deal2Item
  const combo3 = deal3Item
  const activeCombo3 = deal3Item || deal2Item

  // Define dynamic card image paths (use settings override if uploaded, otherwise fallback to static 3D assets)
  const deal1Img = publicSettings['homepage.deal1_image'] ? assetUrl(publicSettings['homepage.deal1_image']) : '/hero-burger-3d.webp'
  const deal2Img = publicSettings['homepage.deal2_image'] ? assetUrl(publicSettings['homepage.deal2_image']) : '/hero-chicken-3d.webp'
  const deal3Img = publicSettings['homepage.deal3_image'] ? assetUrl(publicSettings['homepage.deal3_image']) : '/hero-family-3d.png'

  // Gallery grid data loader (check settings gallery first, fallback to banners DB)
  const hasSettingsGallery = Array.isArray(publicSettings['homepage.gallery_images']) && publicSettings['homepage.gallery_images'].length > 0
  const galleryList = hasSettingsGallery
    ? publicSettings['homepage.gallery_images'].map(item => ({
      image: assetUrl(item.url),
      title: item.title?.[i18n.language] || item.title?.vi || item.title?.en || ''
    }))
    : galleryBanners.map(banner => ({ image: assetUrl(banner.image), title: banner.title }))

  // Render multiple background silhouettes for horizontal cards
  const renderCardSilhouettes = (imgUrl) => {
    if (!imgUrl) return null
    return (
      <>
        {/* Silhouette 1: Bottom left-ish */}
        <img
          src={imgUrl}
          className="absolute -bottom-8 left-[18%] w-44 h-44 object-contain opacity-[0.22] pointer-events-none z-0 rotate-[-15deg]"
          alt=""
        />
        {/* Silhouette 2: Top center-right */}
        <img
          src={imgUrl}
          className="absolute -top-10 left-[48%] w-36 h-36 object-contain opacity-[0.18] pointer-events-none z-0 rotate-[25deg]"
          alt=""
        />
        {/* Silhouette 3: Middle left */}
        <img
          src={imgUrl}
          className="absolute top-[30%] -left-8 w-28 h-28 object-contain opacity-[0.16] pointer-events-none z-0 rotate-[45deg]"
          alt=""
        />
        {/* Silhouette 4: Bottom right behind the main image */}
        <img
          src={imgUrl}
          className="absolute bottom-[20%] right-[10%] w-32 h-32 object-contain opacity-[0.14] pointer-events-none z-0 rotate-[-35deg]"
          alt=""
        />
      </>
    )
  }

  // Render multiple background silhouettes for Card 3 (Tall vertical card)
  const renderCard3Silhouettes = (imgUrl) => {
    if (!imgUrl) return null
    return (
      <>
        {/* Silhouette 1: Top left */}
        <img
          src={imgUrl}
          className="absolute top-[12%] left-[8%] w-56 h-56 object-contain opacity-[0.22] pointer-events-none z-0 rotate-[-12deg]"
          alt=""
        />
        {/* Silhouette 2: Bottom right */}
        <img
          src={imgUrl}
          className="absolute bottom-[22%] right-[4%] w-48 h-48 object-contain opacity-[0.18] pointer-events-none z-0 rotate-[18deg]"
          alt=""
        />
        {/* Silhouette 3: Middle right */}
        <img
          src={imgUrl}
          className="absolute top-[35%] right-[25%] w-36 h-36 object-contain opacity-[0.14] pointer-events-none z-0 rotate-[30deg]"
          alt=""
        />
        {/* Silhouette 4: Bottom left */}
        <img
          src={imgUrl}
          className="absolute bottom-[8%] left-[15%] w-40 h-40 object-contain opacity-[0.16] pointer-events-none z-0 rotate-[-20deg]"
          alt=""
        />
      </>
    )
  }

  return (
    <div className="bg-[var(--color-cream)] text-[var(--color-text-main)] min-h-screen">
      {/* Dynamic float animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-main {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-15px) rotate(1.5deg) scale(1.04); }
        }
        @keyframes float-left-plate {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-18px) rotate(-6deg) scale(1.05); }
        }
        @keyframes float-right-plate {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-22px) rotate(6deg) scale(1.05); }
        }
        @keyframes float-item {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float-main {
          animation: float-main 6s ease-in-out infinite;
        }
        .animate-float-left-plate {
          animation: float-left-plate 7s ease-in-out infinite;
        }
        .animate-float-right-plate {
          animation: float-right-plate 8s ease-in-out infinite;
        }
        .animate-float-item {
          animation: float-item 5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}} />

      {/* ─── SECTION 1: HERO (CENTERED SHOWCASE) ─── */}
      <section className="relative flex flex-col items-center justify-center min-h-[500px] md:min-h-[580px] w-full bg-[#8A151B] pb-16 pt-24 md:pt-28 text-white overflow-visible">
        {/* Background blobs for depth */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* Floating food particles */}
        <TomatoSlice className="absolute left-[8%] top-[18%] w-10 h-10 md:w-14 md:h-14 rotate-12 animate-float-item pointer-events-none z-10" />
        <ChiliSlice className="absolute left-[4%] top-[35%] w-8 h-8 md:w-12 md:h-12 -rotate-12 animate-float-main pointer-events-none z-10" />
        <BasilLeaf className="absolute left-[12%] top-[62%] w-7 h-7 md:w-10 md:h-10 rotate-90 animate-float-item pointer-events-none z-10" />
        <ChiliSlice className="absolute left-[22%] top-[72%] w-8 h-8 md:w-10 md:h-10 -rotate-45 animate-float-main pointer-events-none z-10" />

        <TomatoSlice className="absolute right-[8%] top-[20%] w-12 h-12 md:w-16 md:h-16 -rotate-45 animate-float-main pointer-events-none z-10" />
        <BasilLeaf className="absolute right-[5%] top-[38%] w-8 h-8 md:w-11 md:h-11 rotate-12 animate-float-item pointer-events-none z-10" />
        <ChiliSlice className="absolute right-[16%] top-[60%] w-10 h-10 md:w-12 md:h-12 rotate-[120deg] animate-float-main pointer-events-none z-10" />
        <BasilLeaf className="absolute right-[10%] top-[75%] w-7 h-7 md:w-9 md:h-9 rotate-45 animate-float-item pointer-events-none z-10" />

        <BasilLeaf className="absolute left-[34%] top-[78%] w-6 h-6 md:w-8 md:h-8 -rotate-[30deg] animate-float-item pointer-events-none z-10" />
        <TomatoSlice className="absolute right-[30%] top-[25%] w-8 h-8 md:w-10 md:h-10 rotate-[15deg] animate-float-main pointer-events-none z-10" />

        {/* Side Floating Plates */}
        <div className="absolute left-[-10%] md:left-[-5%] xl:left-[-2%] top-[50%] md:top-[56%] w-36 h-36 md:w-56 md:h-56 xl:w-72 xl:h-72 z-20 pointer-events-none animate-float-left-plate will-change-transform">
          <img src="/hero-salad-3d.webp" alt="Salad" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]" />
        </div>

        <div className="absolute right-[-10%] md:right-[-5%] xl:right-[-2%] top-[54%] md:top-[60%] w-36 h-36 md:w-56 md:h-56 xl:w-72 xl:h-72 z-20 pointer-events-none animate-float-right-plate will-change-transform">
          <img src="/hero-chicken-3d.webp" alt="Fried Chicken" className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]" />
        </div>

        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center space-y-6 flex flex-col items-center">
          <span className="text-[#FBE3B5] font-bold text-xs md:text-sm tracking-widest uppercase inline-block opacity-90">
            • Fresh • Fast • Flavorful
          </span>
          <h1 className="font-extrabold text-[clamp(44px,6.5vw,84px)] leading-[0.95] tracking-tighter uppercase max-w-4xl text-white drop-shadow-md" style={{ color: '#ffffff' }}>
            {activeHero?.title || t('home.hero_title', 'CRAFTED FOR CRAVINGS SERVED WITH PERFECTION')}
          </h1>
          <p className="text-sm md:text-base text-white/85 max-w-2xl leading-relaxed mx-auto" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {activeHero?.subtitle || t('home.hero_desc', 'Chuỗi cửa hàng thức ăn nhanh cao cấp chuẩn vị nướng lửa hồng.')}
          </p>

          {/* Hero Main Image - Center Burger */}
          <div className="relative w-full max-w-[600px] md:max-w-[650px] aspect-square flex items-center justify-center my-2 top-6 md:top-10 mb-[-90px] md:mb-[-140px] z-20 animate-float-main pointer-events-none will-change-transform">
            <img
              src="/hero-burger-3d.webp"
              alt="Gourmet Burger"
              className="w-[90%] h-[90%] object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Curved bottom shape */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[70px] fill-[var(--color-cream)]">
            <path d="M0,40 C300,110 900,110 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* ─── SECTION 2: CATEGORIES (EXPLORE POPULAR DISHES) ─── */}
      {categories.length > 0 && (
        <section className="pt-20 pb-16 md:pt-24 md:pb-20 bg-[var(--color-cream)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-12">
            <div className="space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                {categoriesSubtitle.toUpperCase()}
              </span>
              <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                {categoriesTitle}
              </h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mt-3 rounded-full" />
            </div>

            <div className="flex flex-wrap gap-8 justify-center px-4">
              {categories.map((cat, index) => (
                <Link
                  key={cat.id}
                  data-aos="zoom-in"
                  data-aos-delay={index * 80}
                  to={`/menu?category=${cat.slug}`}
                  className="group shrink-0 flex flex-col items-center text-center transition-all duration-300"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[var(--color-secondary)]/30 bg-[#FBE3B5]/25 shadow-glass group-hover:border-[var(--color-secondary)] group-hover:shadow-premium group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                    <LazyImage
                      src={assetUrl(cat.image)}
                      alt={cat.name}
                      className="w-[80%] h-[80%] object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-[var(--color-dark)] uppercase tracking-wide mt-3 group-hover:text-primary transition-colors duration-200">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] bg-white text-[var(--color-text-muted)] font-bold px-2 py-0.5 rounded-full border border-[#E8E8E8] mt-1 shadow-glass">
                    {cat.products_count ?? 0} {t('product.items_count', i18n.language === 'vi' ? 'món' : 'items')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 3: DEALS (ASYMMETRIC COMBO CARDS) ─── */}
      {combos.length > 0 && (
        <section className="py-20 bg-[#FFF8EE] overflow-visible">
          <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
            <div className="text-center space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                {dealSubtitle.toUpperCase()}
              </span>
              <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                {dealTitle}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                {dealDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-visible">
              {/* Left Side: 2 horizontal cards */}
              <div className="lg:col-span-7 flex flex-col gap-6 justify-between overflow-visible">
                {/* ── Card 1: Orange Gradient ── */}
                {combo1 && (
                  <div className="bg-gradient-to-br from-[#F9A000] via-[#FF5F00] to-[#FF3E00] text-white rounded-[var(--radius-card)] p-6 md:p-8 relative overflow-hidden shadow-premium group transition-all duration-300 hover:shadow-2xl flex-1 min-h-[240px]">
                    {/* Halftone dot pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(235,50,0,0.18)_2.5px,transparent_2.5px)] [background-size:14px_14px] pointer-events-none opacity-40 z-0" />

                    {/* Dynamic background silhouettes matching Card 1 image */}
                    {renderCardSilhouettes(deal1Img)}

                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    {/* Text content - left side */}
                    <div className="relative z-10 max-w-[55%] space-y-3">
                      <span className="bg-white/20 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold inline-block">
                        {t('combo.chef_selection', i18n.language === 'vi' ? "Đầu bếp gợi ý" : "Chef's Selection")}
                      </span>
                      <h3 className="font-black text-xl md:text-2xl lg:text-3xl uppercase tracking-tight leading-tight">{combo1.name}</h3>
                      <p className="text-white/90 text-xs line-clamp-2 leading-relaxed font-medium">{combo1.description}</p>
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        {getDealSalePrice(combo1) && parseFloat(getDealSalePrice(combo1)) < parseFloat(getDealPrice(combo1)) ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealSalePrice(combo1))}</span>
                            <span className="text-sm line-through text-white/60 font-medium">{formatVND(getDealPrice(combo1))}</span>
                          </div>
                        ) : (
                          <span className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealPrice(combo1))}</span>
                        )}
                        <button
                          onClick={() => selectDealItem(combo1)}
                          className="bg-white text-black hover:bg-[var(--color-primary)] hover:text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                        >
                          {t('home.order_now', 'ĐẶT NGAY')} 🔥
                        </button>
                      </div>
                    </div>

                    {/* Starburst badge */}
                    <StarburstBadge
                      title={i18n.language === 'vi' ? "Giảm tới" : "Save up to"}
                      value="40%"
                      bgColor="#FFF8EE"
                      textColor="#FF3E00"
                      className="absolute bottom-4 right-[38%] md:right-[40%] w-16 h-16 z-20"
                    />

                    {/* Main image of Card 1 */}
                    <img
                      src={deal1Img}
                      alt={combo1.name}
                      className="absolute right-[-6%] top-[5%] w-[48%] h-[90%] object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 pointer-events-none z-10"
                    />

                    {/* Decorative garnish */}
                    <BasilLeaf className="absolute left-[3%] bottom-[8%] w-8 h-8 z-20 rotate-45 pointer-events-none animate-float-item opacity-80" />
                  </div>
                )}

                {/* ── Card 2: Deep Red Gradient ── */}
                {combo2 && (
                  <div className="bg-gradient-to-br from-[#8E0E13] to-[#5C0A0C] text-white rounded-[var(--radius-card)] p-6 md:p-8 relative overflow-hidden shadow-premium group transition-all duration-300 hover:shadow-2xl flex-1 min-h-[240px]">
                    {/* Dot pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_2px,transparent_2px)] [background-size:14px_14px] pointer-events-none opacity-30 z-0" />

                    {/* Dynamic background silhouettes matching Card 2 image */}
                    {renderCardSilhouettes(deal2Img)}

                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    {/* Text content - left side */}
                    <div className="relative z-10 max-w-[55%] space-y-3">
                      <span className="bg-white/20 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold inline-block">
                        {t('combo.oven_special', i18n.language === 'vi' ? "Lò nướng đặc biệt" : "Oven Special")}
                      </span>
                      <h3 className="font-black text-xl md:text-2xl lg:text-3xl uppercase tracking-tight leading-tight">{combo2.name}</h3>
                      <p className="text-white/90 text-xs line-clamp-2 leading-relaxed font-medium">{combo2.description}</p>
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        {getDealSalePrice(combo2) && parseFloat(getDealSalePrice(combo2)) < parseFloat(getDealPrice(combo2)) ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealSalePrice(combo2))}</span>
                            <span className="text-sm line-through text-white/60 font-medium">{formatVND(getDealPrice(combo2))}</span>
                          </div>
                        ) : (
                          <span className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealPrice(combo2))}</span>
                        )}
                        <button
                          onClick={() => selectDealItem(combo2)}
                          className="bg-white text-black hover:bg-[var(--color-primary)] hover:text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                        >
                          {t('home.order_now', 'ĐẶT NGAY')} 🔥
                        </button>
                      </div>
                    </div>

                    {/* Starburst badge */}
                    <StarburstBadge
                      title={i18n.language === 'vi' ? "Giảm tới" : "Save up to"}
                      value="50%"
                      bgColor="#FF5F00"
                      textColor="#ffffff"
                      className="absolute bottom-4 right-[38%] md:right-[40%] w-16 h-16 z-20"
                    />

                    {/* Main image of Card 2 */}
                    <img
                      src={deal2Img}
                      alt={combo2.name}
                      className="absolute right-[-6%] top-[5%] w-[48%] h-[90%] object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 pointer-events-none z-10"
                    />

                    {/* Decorative garnish */}
                    <TomatoSlice className="absolute left-[3%] bottom-[8%] w-8 h-8 z-20 -rotate-12 pointer-events-none animate-float-item opacity-80" />
                  </div>
                )}
              </div>

              {/* ── Card 3: Right Side - Tall Green Card ── */}
              <div className="lg:col-span-5 flex overflow-visible">
                {activeCombo3 && (
                  <div className="bg-[#0B4D36] rounded-[var(--radius-card)] p-8 pb-6 flex flex-col text-white relative overflow-visible shadow-premium group transition-all duration-300 hover:shadow-2xl w-full min-h-[500px]">
                    {/* Dot pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none rounded-[var(--radius-card)]" />

                    {/* Dynamic background silhouettes matching Card 3 image */}
                    {renderCard3Silhouettes(deal3Img)}

                    {/* Top section: Title & description */}
                    <div className="space-y-3 text-left relative z-10 max-w-[65%]">
                      <span className="text-[#F5A623] text-[11px] font-bold uppercase tracking-wider block">
                        {t('combo.best_value', i18n.language === 'vi' ? 'TIẾT KIỆM NHẤT' : 'BEST VALUE')}
                      </span>
                      <h3 className="font-extrabold text-2xl md:text-3xl uppercase tracking-tight leading-none text-white">{activeCombo3.name}</h3>
                      <p className="text-white/80 text-xs line-clamp-3 leading-relaxed font-medium">{activeCombo3.description}</p>
                    </div>

                    {/* Middle section: Main image from database - centered & responsive */}
                    <div className="relative flex-1 flex items-center justify-center my-4 z-10">
                      <img
                        src={deal3Img}
                        className="w-72 h-72 md:w-80 md:h-80 object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 pointer-events-none"
                        alt={activeCombo3.name}
                      />
                    </div>

                    {/* Floating 3D ingredients to make the card lively and premium */}
                    <img
                      src="/hero-tomato-3d.webp"
                      className="absolute bottom-[22%] left-[-6%] w-20 h-20 object-contain pointer-events-none rotate-12 group-hover:-translate-x-1 group-hover:translate-y-1 transition duration-700 z-20 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                      alt=""
                    />
                    <img
                      src="/hero-basil-3d.webp"
                      className="absolute top-[8%] left-[-4%] w-12 h-12 object-contain pointer-events-none rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition duration-500 z-20 filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)]"
                      alt=""
                    />
                    <img
                      src="/hero-chili-3d.webp"
                      className="absolute top-[32%] right-[-6%] w-16 h-16 object-contain pointer-events-none -rotate-45 group-hover:-translate-x-1 group-hover:-translate-y-1 transition duration-600 z-20 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
                      alt=""
                    />
                    <img
                      src="/hero-basil-3d.webp"
                      className="absolute bottom-[18%] right-[-5%] w-10 h-10 object-contain pointer-events-none rotate-90 group-hover:translate-x-1 group-hover:translate-y-1 transition duration-500 z-20 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
                      alt=""
                    />

                    {/* Small floating burgers at corners */}
                    <img src="/hero-burger-3d.webp" className="absolute -top-10 -right-6 w-24 h-24 object-contain opacity-90 pointer-events-none rotate-12 group-hover:-translate-y-1 transition duration-500 z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" alt="" />
                    <img src="/hero-burger-3d.webp" className="absolute -bottom-10 -left-10 w-24 h-24 object-contain opacity-90 pointer-events-none -rotate-12 group-hover:translate-y-1 transition duration-500 z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" alt="" />

                    {/* Bottom section: Price & CTA */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10 mt-auto">
                      {getDealSalePrice(activeCombo3) && parseFloat(getDealSalePrice(activeCombo3)) < parseFloat(getDealPrice(activeCombo3)) ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl md:text-3xl font-bold text-[#F5A623] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealSalePrice(activeCombo3))}</span>
                          <span className="text-base line-through text-white/60 font-medium">{formatVND(getDealPrice(activeCombo3))}</span>
                        </div>
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold text-[#F5A623] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{formatVND(getDealPrice(activeCombo3))}</span>
                      )}
                      <button
                        onClick={() => selectDealItem(activeCombo3)}
                        className="bg-white text-black hover:bg-[#FF5F00] hover:text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                      >
                        {t('home.order_now', 'ĐẶT NGAY')} 🔥
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 4: FEATURED PRODUCTS (CHEF'S RECOMMENDATION) ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-[var(--color-cream)] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div className="text-left space-y-4">
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                  {featuredSubtitle.toUpperCase()}
                </span>
                <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                  {featuredTitle}
                </h2>
              </div>
              <Link to="/menu" className="flex items-center gap-1.5 text-primary hover:text-[var(--color-secondary)] font-bold text-sm tracking-wider uppercase transition-colors duration-200 mt-4 md:mt-0">
                {t('common.see_all', 'TẤT CẢ')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((p, index) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} index={index} variant="light" />
              ))}
            </div>
          </div>
        </section>
      )}



      {/* ─── SECTION 8: TESTIMONIALS (WHAT OUR CUSTOMERS SAY) ─── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-[#8A151B] text-white overflow-hidden relative">
          <div className="absolute top-10 left-10 font-serif text-[12rem] font-bold leading-none text-white/5 select-none pointer-events-none">“</div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <span className="text-[var(--color-secondary)] font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full inline-block">
              {t('home.testimonials_badge', 'Ý kiến khách hàng').toUpperCase()}
            </span>
            <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-white uppercase mt-3 mb-12">
              {t('home.testimonials_title', 'WHAT OUR CUSTOMERS SAY')}
            </h2>

            {/* Testimonial Active Card - Split Layout */}
            <div className="relative bg-white/10 rounded-[var(--radius-card)] p-8 md:p-12 border border-white/10 shadow-2xl transition-all duration-500 transform hover:scale-[1.01] flex flex-col md:flex-row gap-8 items-center text-left">
              {/* Left Avatar Frame */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#F5A623] shadow-lg flex-shrink-0 bg-white flex items-center justify-center animate-float-item">
                {testimonials[testiIndex].user_avatar ? (
                  <img src={assetUrl(testimonials[testiIndex].user_avatar)} alt={testimonials[testiIndex].user_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary)] text-white font-extrabold text-2xl uppercase">
                    {testimonials[testiIndex].user_name.slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Right Text details */}
              <div className="flex-1 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonials[testiIndex].rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-white/25'}`}
                    />
                  ))}
                </div>

                <blockquote className="text-base md:text-lg text-white italic font-medium leading-relaxed">
                  “{testimonials[testiIndex].comment}”
                </blockquote>

                <div className="pt-2">
                  <h4 className="font-bold text-base text-white">{testimonials[testiIndex].user_name}</h4>
                  <p className="text-xs text-[var(--color-secondary)] font-bold uppercase tracking-wider mt-0.5">
                    {testimonials[testiIndex].product_name ? `${t('product.ordered', 'Đã mua')}: ${testimonials[testiIndex].product_name}` : t('product.verified_buyer', 'Khách hàng thân thiết')}
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              {testimonials.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6">
                  <button
                    onClick={() => setTestiIndex(idx => (idx - 1 + testimonials.length) % testimonials.length)}
                    className="w-10 h-10 rounded-full bg-white text-[#8A151B] shadow-md hover:bg-[#F5A623] hover:text-[#1A0A00] flex items-center justify-center transition duration-200 border border-white/10 cursor-pointer"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
              {testimonials.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6">
                  <button
                    onClick={() => setTestiIndex(idx => (idx + 1) % testimonials.length)}
                    className="w-10 h-10 rounded-full bg-white text-[#8A151B] shadow-md hover:bg-[#F5A623] hover:text-[#1A0A00] flex items-center justify-center transition duration-200 border border-white/10 cursor-pointer"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bullet Indicators */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestiIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === testiIndex ? 'w-6 bg-[#F5A623]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── SECTION 9: FAQS (2 COLUMNS) ─── */}
      {faqs.length > 0 && (
        <section className="py-20 bg-[var(--color-cream)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left column: Title */}
              <div className="lg:col-span-5 text-left space-y-4" data-aos="fade-right">
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                  {t('home.faq_badge', i18n.language === 'vi' ? 'HỎI ĐÁP' : 'FAQ').toUpperCase()}
                </span>
                <h2 className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                  {t('home.faq_title', i18n.language === 'vi' ? 'CÂU HỎI THƯỜNG GẶP' : 'FREQUENTLY ASKED QUESTIONS')}
                </h2>
                <div className="w-16 h-1 bg-[var(--color-primary)] rounded-full" />
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed pt-2">
                  {t('home.faq_desc', i18n.language === 'vi'
                    ? 'Nếu bạn có bất kỳ câu hỏi nào về dịch vụ, nguyên liệu hoặc giao hàng, vui lòng tham khảo các câu trả lời bên cạnh hoặc liên hệ với chúng tôi.'
                    : 'If you have any questions about our services, ingredients, or delivery, please refer to the answers on the right or contact us.')}
                </p>
              </div>

              {/* Right column: Accordions list */}
              <div className="lg:col-span-7 space-y-4 w-full" data-aos="fade-left">
                {faqs.map((faq, idx) => {
                  const q = i18n.language === 'vi' ? faq.q_vi : faq.q_en
                  const a = i18n.language === 'vi' ? faq.a_vi : faq.a_en
                  const isOpen = activeFaq === idx

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-glass hover:shadow-premium transition duration-300"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-6 text-left font-bold text-sm md:text-base text-[var(--color-dark)] hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      >
                        <span>{q}</span>
                        <span className={`w-8 h-8 rounded-full bg-[var(--color-cream)] flex items-center justify-center transition-transform duration-350 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-500'}`}>
                          <ChevronRight className="w-4 h-4 transform rotate-90" />
                        </span>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] border-t border-[#E8E8E8]' : 'max-h-0'
                          }`}
                      >
                        <p className="p-6 text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line bg-gray-50/50">
                          {a}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 10: GALLERY (A FEAST FOR YOUR EYES) ─── */}
      {galleryList.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                {gallerySubtitle.toUpperCase()}
              </span>
              <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                {galleryTitle}
              </h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mt-3 rounded-full" />
            </div>

            {/* 3-column Grid for 6 items */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {galleryList.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  data-aos="zoom-in"
                  data-aos-delay={index * 80}
                  className="relative overflow-hidden rounded-2xl group shadow-glass aspect-square"
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-110"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold text-sm uppercase tracking-wider">{item.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 11: BLOG (2 COLUMNS STORIES) ─── */}
      {blogPosts.length > 0 && (
        <section className="py-20 bg-[var(--color-cream)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
                {blogSubtitle.toUpperCase()}
              </span>
              <h2 data-aos="fade-up" className="font-extrabold text-[clamp(28px,3.5vw,42px)] text-[var(--color-dark)] uppercase mt-3">
                {blogTitle}
              </h2>
              <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mt-3 rounded-full" />
            </div>

            {/* 2-column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.slice(0, 2).map((post, idx) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  data-aos="fade-up"
                  data-aos-delay={idx * 150}
                  className="group flex flex-col rounded-[var(--radius-card)] bg-white border border-[#E8E8E8]/50 overflow-hidden shadow-glass hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                    <img
                      src={assetUrl(post.thumbnail)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 z-10 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {post.post_category?.name || post.category || 'News'}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] font-semibold">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : ''} • {post.read_time || '5 mins'}
                      </span>
                      <h4 className="font-bold text-base text-[var(--color-dark)] line-clamp-2 mt-2 group-hover:text-primary transition-colors duration-200">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-3 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:text-[var(--color-secondary)] transition-colors duration-200 mt-6 inline-flex items-center gap-1.5">
                      {t('common.see_more', 'Đọc thêm')} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTION 12: CTA BANNER (ORANGE FULL-WIDTH SHOWCASE) ─── */}
      <section className="relative overflow-hidden bg-[#F5A623] py-12 pb-24 text-white text-center">
        {/* Floating foods left and right */}
        {categories[0]?.image && (
          <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white animate-float-left-plate pointer-events-none">
            <img src={assetUrl(categories[0].image)} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {categories[1]?.image && (
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white animate-float-right-plate pointer-events-none">
            <img src={assetUrl(categories[1].image)} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-2xl mx-auto px-6 space-y-6 relative z-10 flex flex-col items-center">
          <span className="text-white bg-white/25 font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full inline-block">
            {t('home.cta_badge', i18n.language === 'vi' ? 'Hôm nay ăn gì?' : 'What to eat today?').toUpperCase()}
          </span>
          <h2 className="font-extrabold text-[clamp(28px,4.5vw,52px)] leading-[1.1] uppercase drop-shadow-sm text-white">
            {ctaTitle}
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg mx-auto">
            {ctaSubtitle}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to={ctaLink}
              className="bg-white hover:bg-[var(--color-primary)] text-[#F5A623] hover:text-white font-extrabold text-xs tracking-wider uppercase px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              {ctaBtnText}
            </Link>
            <Link
              to="/menu"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-[#F5A623] text-white font-extrabold text-xs tracking-wider uppercase px-8 py-4 rounded-full transition-all duration-300 shadow-md"
            >
              {t('home.explore_menu', 'Khám Phá Menu')}
            </Link>
          </div>
        </div>

        {/* Curved shape to footer */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[75px] fill-[#8A151B]" style={{ marginBottom: '-2px' }}>
            <path d="M0,60 C300,20 300,100 600,60 C900,20 900,100 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>
    </div>
  )
}
