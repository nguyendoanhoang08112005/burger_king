import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../api/axios'
import { formatDate } from '../../utils/format'
import LazyImage from '../../components/ui/LazyImage'
 
function BlogPage() {
  const { t, i18n } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  // Fetch banners (cached for 30 minutes)
  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => apiClient.get('/banners').then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30 * 60 * 1000,
  })

  // Fetch posts (cached for 5 minutes, depends on page and language)
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['posts', { page: currentPage, locale: i18n.language }],
    queryFn: () => apiClient.get('/posts', { params: { per_page: ITEMS_PER_PAGE, page: currentPage } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const posts = postsData?.data || []
  const totalPages = postsData?.last_page || 1
  const loading = bannersLoading || postsLoading
  const error = postsError ? t('blog.load_error') : ''
 
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
 
  const featured = posts[0]
  const gridPosts = posts.slice(1)
  const blogHero = banners.find(banner => banner.position === 'blog_hero')
  const heroImage = blogHero?.image || featured?.thumbnail
  const heroTitle = blogHero?.title || t('blog.hero_title')
  const heroDesc = blogHero?.subtitle || t('blog.hero_desc')
 
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }
 
  if (error) {
    return (
      <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center px-6 text-center">
        <p className="text-sm text-red-600 font-semibold">{error}</p>
      </div>
    )
  }
 
  return (
    <div className="bg-[#FFFAF5] text-[#2C1A16]">
      <section className="relative min-h-[360px] flex items-center overflow-hidden bg-black py-12">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <LazyImage
              src={heroImage}
              alt={heroTitle}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-[#FFFAF5]/30" />
        </div>
 
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <p className="text-[#FFC72C] text-sm font-bold uppercase tracking-widest mb-3">{t('blog.title')}</p>
          <h1 className="font-extrabold text-[clamp(36px,6vw,72px)] uppercase leading-none max-w-3xl text-white drop-shadow-lg">
            {heroTitle}
          </h1>
          <p className="max-w-xl mt-5 text-sm md:text-base leading-relaxed text-white drop-shadow">
            {heroDesc}
          </p>
        </div>
      </section>
 
      {posts.length === 0 ? (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mb-4 stroke-1 animate-pulse" />
          <h4 className="font-bold text-xl text-gray-500 uppercase tracking-wide">{t('blog.no_posts_title', 'CHƯA CÓ BÀI VIẾT NÀO')}</h4>
          <p className="text-gray-400 text-sm mt-2 max-w-md">{t('blog.no_posts_desc', 'Chúng tôi sẽ sớm cập nhật những câu chuyện thú vị về Hamburger King tại đây. Hãy quay lại sau nhé!')}</p>
        </section>
      ) : (
        <>
          {featured && (
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-premium">
                <LazyImage src={featured.thumbnail} alt={featured.title} className="w-full h-full min-h-[320px] object-cover" />
                <div className="p-8 md:p-10 flex flex-col justify-center text-left">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                    {featured.post_category?.name || featured.category}
                  </span>
                  <h2 className="text-3xl font-bold text-[#2C1A16] leading-tight">{featured.title}</h2>
                  <p className="text-sm text-[#666666] leading-relaxed mt-4">{featured.excerpt}</p>
                  <div className="text-xs text-gray-400 mt-5">{formatDate(featured.published_at)} · {t('blog.read_time_with_count', { count: featured.read_time })}</div>
                  <Link to={`/blog/${featured.slug}`} className="mt-7 inline-flex w-fit items-center gap-2 bg-primary text-white px-5 py-3 rounded-[8px] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition">
                    {t('blog.read_more_arrow')}
                  </Link>
                </div>
              </div>
            </section>
          )}
 
          {gridPosts.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post, index) => (
                  <article key={post.id} data-aos="fade-up" data-aos-delay={index * 80} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-glass hover:shadow-premium transition flex flex-col h-full">
                    <LazyImage src={post.thumbnail} alt={post.title} className="w-full aspect-video object-cover" />
                    <div className="p-6 flex flex-col flex-1 text-left">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {post.post_category?.name || post.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#2C1A16] mt-2 leading-tight line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-[#666666] leading-relaxed mt-3 line-clamp-3 flex-1">{post.excerpt}</p>
                      <div className="text-[11px] text-gray-400 mt-4">{formatDate(post.published_at)} · {t('blog.read_time_with_count', { count: post.read_time })}</div>
                      <Link to={`/blog/${post.slug}`} className="inline-flex mt-5 text-primary text-xs font-bold uppercase tracking-wider hover:opacity-80 transition w-fit">
                        {t('blog.read_more_arrow')}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
 
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pb-16">
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
    </div>
  )
}
 
export default BlogPage
