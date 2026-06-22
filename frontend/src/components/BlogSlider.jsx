import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function BlogSlider({ posts = [] }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!posts.length) return undefined

    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % posts.length)
      }, 4000)
    }

    return () => clearInterval(timerRef.current)
  }, [isHovered, posts.length])

  if (!posts.length) return null

  return (
    <section className="py-16 bg-[#FFFAF5]">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-[#D62300] font-semibold text-sm uppercase tracking-widest text-center mb-2">
          {t('blog.slider_eyebrow')}
        </p>
        <h2 data-aos="fade-up" className="text-3xl font-bold text-center text-gray-900 mb-10">
          {t('blog.slider_title')}
        </h2>

        <div
          className="relative overflow-hidden rounded-2xl shadow-lg bg-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="min-w-full grid grid-cols-1 md:grid-cols-2 hover:opacity-95 transition-opacity">
                <div className="relative h-72 overflow-hidden">
                  <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center text-left">
                  <span className="text-xs font-semibold text-[#D62300] uppercase tracking-wider mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-[#D62300] font-semibold text-sm hover:gap-3 transition-all group w-fit"
                  >
                    {t('common.see_more')}
                    <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {posts.map((post, index) => (
              <button
                type="button"
                key={post.id}
                onClick={() => setCurrent(index)}
                aria-label={t('blog.slide_to', { index: index + 1 })}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current ? 'w-6 bg-[#D62300]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrent(prev => (prev === 0 ? posts.length - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors text-gray-700"
            aria-label={t('blog.previous')}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrent(prev => (prev + 1) % posts.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors text-gray-700"
            aria-label={t('blog.next')}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default BlogSlider
