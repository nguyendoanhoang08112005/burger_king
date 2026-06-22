import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../api/axios'
import { formatDate } from '../../utils/format'
import LazyImage from '../../components/ui/LazyImage'
 
function BlogDetailPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()

  // Fetch individual post detail (cached for 5 minutes)
  const { data: post = null, isLoading: postLoading } = useQuery({
    queryKey: ['post', { slug, locale: i18n.language }],
    queryFn: () => apiClient.get(`/posts/${slug}`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch featured posts for related section (cached for 10 minutes)
  const { data: featured = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['posts_featured', { locale: i18n.language }],
    queryFn: () => apiClient.get('/posts/featured').then(r => r.data || []),
    staleTime: 10 * 60 * 1000,
  })

  const related = useMemo(() => {
    return featured.filter(item => item.slug !== slug).slice(0, 3)
  }, [featured, slug])

  const loading = postLoading || featuredLoading
 
  const categories = useMemo(() => {
    return [...new Set(
      related.map(item => item.post_category?.name || item.category)
        .concat(post?.post_category?.name || post?.category || [])
    )].filter(Boolean)
  }, [post, related])
 
  const tags = useMemo(() => {
    if (Array.isArray(post?.tags_details) && post.tags_details.length > 0) {
      return post.tags_details.map(t => t.name)
    }
    if (Array.isArray(post?.tags) && post.tags.length > 0) {
      return post.tags
    }
    // Fallback: gom nhóm danh mục nếu tags trống
    return [...new Set(
      [post?.post_category?.name || post?.category]
        .concat(related.map(item => item.post_category?.name || item.category))
    )].filter(Boolean)
  }, [post, related])
 
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
      <LazyImage src={post.thumbnail} alt={post.title} className="w-full max-h-[500px] object-cover" />
 
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <nav className="text-xs text-[#666666] mb-8 text-left">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-primary">{t('blog.title')}</Link>
          <span className="mx-2">›</span>
          <span className="text-[#1A1A1A]">{post.title}</span>
        </nav>
 
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] gap-10">
          <article className="bg-white border border-[#E8E8E8] rounded-2xl p-6 md:p-10 shadow-glass text-left">
            <span className="text-xs text-primary font-bold uppercase tracking-widest">
              {post.post_category?.name || post.category}
            </span>
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
              className="blog-content text-[15px] leading-[1.8] text-[#333333] space-y-5 mt-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
 
          <aside className="space-y-6 text-left">
            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-glass">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">{t('blog.related_posts')}</h2>
              <div className="space-y-4">
                {related.map(item => (
                  <Link key={item.id} to={`/blog/${item.slug}`} className="flex gap-3 group">
                    <LazyImage src={item.thumbnail} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs text-primary font-bold uppercase">
                        {item.post_category?.name || item.category}
                      </p>
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
