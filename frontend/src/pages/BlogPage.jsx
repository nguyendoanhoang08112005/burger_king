import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/axios'
import { formatDate } from '../utils/format'

function BlogPage() {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiClient.get('/posts', { params: { per_page: 9 } }),
      apiClient.get('/banners'),
    ])
      .then(([postsRes, bannersRes]) => {
        setPosts(postsRes.data.data || [])
        setBanners(Array.isArray(bannersRes.data) ? bannersRes.data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(t('blog.load_error'))
        setLoading(false)
      })
  }, [i18n.language, t])

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
    <div className="bg-[#FFFAF5] text-[#1A1A1A]">
      <section className="relative min-h-[360px] flex items-center overflow-hidden bg-black">
        {heroImage && (
          <img
            src={heroImage}
            alt={heroTitle}
            className="absolute inset-0 z-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
        <div className="absolute inset-0 z-10 bg-black/15" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <p className="text-[#FFC72C] text-sm font-bold uppercase tracking-widest mb-3">Blog</p>
          <h1 style={{ color: '#fff' }} className="font-extrabold text-[clamp(36px,6vw,72px)] uppercase leading-none max-w-3xl drop-shadow-lg">
            {heroTitle}
          </h1>
          <p style={{ color: '#fff' }} className="max-w-xl mt-5 text-sm md:text-base leading-relaxed drop-shadow">
            {heroDesc}
          </p>
        </div>
      </section>

      {featured && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-premium">
            <img src={featured.thumbnail} alt={featured.title} className="w-full h-full min-h-[320px] object-cover" />
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{featured.category}</span>
              <h2 className="text-3xl font-bold text-[#1A1A1A] leading-tight">{featured.title}</h2>
              <p className="text-sm text-[#666666] leading-relaxed mt-4">{featured.excerpt}</p>
              <div className="text-xs text-gray-400 mt-5">{formatDate(featured.published_at)} · {t('blog.read_time_with_count', { count: featured.read_time })}</div>
              <Link to={`/blog/${featured.slug}`} className="mt-7 inline-flex w-fit items-center gap-2 bg-primary text-white px-5 py-3 rounded-[8px] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition">
                {t('blog.read_more_arrow')}
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map((post, index) => (
            <article key={post.id} data-aos="fade-up" data-aos-delay={index * 80} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-glass hover:shadow-premium transition">
              <img src={post.thumbnail} alt={post.title} className="w-full aspect-video object-cover" />
              <div className="p-6">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{post.category}</span>
                <h3 className="text-lg font-bold text-[#1A1A1A] mt-2 leading-tight">{post.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed mt-3 line-clamp-3">{post.excerpt}</p>
                <div className="text-[11px] text-gray-400 mt-4">{formatDate(post.published_at)} · {t('blog.read_time_with_count', { count: post.read_time })}</div>
                <Link to={`/blog/${post.slug}`} className="inline-flex mt-5 text-primary text-xs font-bold uppercase tracking-wider hover:opacity-80 transition">
                  {t('blog.read_more_arrow')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default BlogPage
