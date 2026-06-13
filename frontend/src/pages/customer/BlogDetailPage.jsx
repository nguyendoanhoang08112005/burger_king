import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import apiClient from '../../api/axios'
import { formatDate } from '../../utils/format'

function BlogDetailPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.get(`/posts/${slug}`),
      apiClient.get('/posts/featured'),
    ])
      .then(([postRes, relatedRes]) => {
        setPost(postRes.data)
        setRelated((relatedRes.data || []).filter(item => item.slug !== slug).slice(0, 3))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [slug, i18n.language])

  const categories = useMemo(() => [...new Set(related.map(item => item.category).concat(post?.category || []))], [post, related])
  const tags = useMemo(() => [...new Set([post?.category, ...related.map(item => item.category)].filter(Boolean))], [post, related])

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FFFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] bg-[#FFFAF5] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{t('blog.not_found')}</h1>
        <Link to="/blog" className="mt-4 text-primary font-bold">{t('blog.back')}</Link>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFAF5] text-[#1A1A1A]">
      <img src={post.thumbnail} alt={post.title} className="w-full max-h-[500px] object-cover" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <nav className="text-xs text-[#666666] mb-8">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-primary">{t('blog.title')}</Link>
          <span className="mx-2">›</span>
          <span className="text-[#1A1A1A]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] gap-10">
          <article className="bg-white border border-[#E8E8E8] rounded-2xl p-6 md:p-10 shadow-glass">
            <span className="text-xs text-primary font-bold uppercase tracking-widest">{post.category}</span>
            <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold leading-tight mt-3">{post.title}</h1>
            <div className="text-xs text-gray-400 mt-4">
              {formatDate(post.published_at)} · {post.author} · {t('blog.read_time_with_count', { count: post.read_time })}
            </div>

            {post.video_url && (
              <div className="relative aspect-video rounded-xl overflow-hidden my-8 shadow-premium">
                <iframe
                  src={post.video_url}
                  title={post.title}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <div
              className="blog-content text-[15px] leading-[1.8] text-[#333333] space-y-5"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <aside className="space-y-6">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-glass">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">{t('blog.related_posts')}</h2>
              <div className="space-y-4">
                {related.map(item => (
                  <Link key={item.id} to={`/blog/${item.slug}`} className="flex gap-3 group">
                    <img src={item.thumbnail} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs text-primary font-bold uppercase">{item.category}</p>
                      <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-glass">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">{t('blog.categories')}</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <span key={category} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{category}</span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-glass">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">{t('blog.tags')}</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[#F8F8F8] border border-[#E8E8E8] text-xs font-semibold text-[#666666]">{tag}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage
