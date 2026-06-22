import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Plus, Phone } from 'lucide-react'
import AOS from 'aos'
import { formatVND } from '../../utils/format'
import ProductCard from '../../components/ui/ProductCard'
import BlogSlider from '../../components/BlogSlider'
import { useHomepage } from '../../hooks/useHomepage'
import { HomePageSkeleton } from '../../components/ui/Skeleton'
import LazyImage from '../../components/ui/LazyImage'

export default function HomePage({ onSelectProduct }) {
  const { t } = useTranslation()
  const { data, isLoading } = useHomepage()
  const [heroIndex, setHeroIndex] = useState(0)

  const banners = data?.banners ?? []
  const categories = data?.categories ?? []
  const featuredProducts = data?.featured_products ?? []
  const combos = data?.combos ?? []
  const comboProducts = data?.combo_products ?? []
  const branches = data?.branches ?? []
  const blogPosts = data?.blog_posts ?? []

  const heroBanners = banners.filter(b => b.position === 'hero')
  const activeHero = heroBanners[heroIndex] || heroBanners[0]

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => AOS.refresh(), 0)
    }
  }, [isLoading])

  useEffect(() => {
    setHeroIndex(0)
  }, [data])

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setHeroIndex(index => (index + 1) % heroBanners.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [heroBanners.length])

  if (isLoading) {
    return <HomePageSkeleton />
  }

  const findSellableComboProduct = (combo) => {
    const comboSlug = String(combo?.slug || '')
    const sellableSlug = comboSlug.replace(/-set$/, '')
    return comboProducts.find(product => product.slug === sellableSlug)
      || comboProducts.find(product => String(product.name || '').toLowerCase() === String(combo?.name || '').toLowerCase())
  }

  return (
    <div className="bg-[#FFFAF5] text-[#2C1A16]">
      {/* Premium Hero Banner */}
      <section className="relative flex h-[640px] w-full items-center overflow-hidden bg-black pb-24 lg:h-[680px]">
        <div className="absolute inset-0 z-0">
          {activeHero?.image && (
            <LazyImage
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
              to="/menu?category=combo-meals" 
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
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#2C1A16] uppercase">{t('home.menu_title').toUpperCase()}</h2>
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
              <LazyImage 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <div className="relative z-10">
                <h4 className="font-semibold text-lg text-[#2C1A16] uppercase group-hover:text-primary transition">
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
              <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#2C1A16] uppercase">{t('home.featured_title')}</h2>
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
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#2C1A16] uppercase">{t('combo.saving_title')}</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">{t('combo.home_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {combos.map((combo, index) => {
            const sellableCombo = findSellableComboProduct(combo)

            return (
              <div key={combo.id} data-aos="zoom-in" data-aos-delay={index * 100} className="flex flex-col sm:flex-row gap-6 p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-glass">
                <LazyImage
                  src={combo.image}
                  alt={combo.name}
                  className="w-full sm:w-44 h-44 object-cover rounded-xl"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xl text-[#2C1A16] uppercase tracking-wide">{combo.name}</h4>
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
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#FFC72C] text-[#2C1A16] transition hover:-translate-y-[1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
          <h2 data-aos="fade-up" className="font-bold text-[clamp(24px,3vw,36px)] text-[#2C1A16] uppercase">{t('branch.location_title')}</h2>
          <p className="text-xs text-[#666666] max-w-xs mx-auto mt-2">{t('branch.location_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b, index) => (
            <div key={b.id} data-aos="fade-up" data-aos-delay={index * 120} className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-premium hover:border-gray-300 transition">
              <div>
                <h4 className="font-bold text-sm text-[#2C1A16]">{b.name}</h4>
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
