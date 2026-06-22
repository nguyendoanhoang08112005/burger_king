import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import AOS from 'aos'
import apiClient from '../../api/axios'
import ProductCard from '../../components/ui/ProductCard'
import { MenuPageSkeleton, ProductCardSkeleton } from '../../components/ui/Skeleton'

export default function MenuPage({ onSelectProduct }) {
  const { t, i18n } = useTranslation()
  const ITEMS_PER_PAGE = 9
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('sort_order')
  const [currentPage, setCurrentPage] = useState(1)

  const activeCategory = searchParams.get('category') || ''

  // Fetch categories (cached for 30 minutes, depends on language)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then(r => r.data),
    staleTime: 30 * 60 * 1000,
  })

  // Fetch products (cached for 5 minutes, depends on filters and language)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { page: currentPage, category: activeCategory, search, sortBy, locale: i18n.language }],
    queryFn: () => apiClient.get('/products', {
      params: {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
        sort_by: sortBy,
        category: activeCategory || undefined,
        search: search || undefined,
      }
    }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const products = productsData?.data || []
  const totalPages = productsData?.last_page || 1
  const loading = categoriesLoading || productsLoading

  // Trigger AOS animation when loading completes
  useEffect(() => {
    if (!loading) {
      setTimeout(() => AOS.refresh(), 0)
    }
  }, [loading])

  const handleCategorySelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams)
    if (!slug || activeCategory === slug) {
      nextParams.delete('category')
    } else {
      nextParams.set('category', slug)
    }
    setCurrentPage(1)
    setSearchParams(nextParams)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
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

  if (loading && categories.length === 0) {
    return <MenuPageSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 flex flex-col md:flex-row gap-6 bg-[#FFFAF5] text-[#1A1A1A]">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 text-left">
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-glass">
          <h3 className="font-bold text-xl text-primary tracking-wide uppercase mb-4">{t('menu.category_title')}</h3>
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0">
            <button
              data-aos="fade-right"
              onClick={() => handleCategorySelect('')}
              className={`text-left text-xs font-semibold px-4 py-2.5 rounded-[10px] border transition whitespace-nowrap md:whitespace-normal cursor-pointer ${
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
                className={`text-left text-xs font-semibold px-4 py-2.5 rounded-[10px] border transition whitespace-nowrap md:whitespace-normal cursor-pointer ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
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
                  className="px-4 py-2 rounded-[8px] bg-white border border-[#E8E8E8] text-xs font-semibold text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition cursor-pointer"
                >
                  {t('common.previous_arrow')}
                </button>
                {getPageNumbers().map((page, index) => page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-9 px-3 py-2 rounded-[8px] border text-xs font-semibold transition cursor-pointer ${
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
                  className="px-4 py-2 rounded-[8px] bg-white border border-[#E8E8E8] text-xs font-semibold text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition cursor-pointer"
                >
                  {t('common.next_arrow')}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
