import { useEffect, useState } from 'react'

function ScrollToTopButton() {
  const [scrollPercent, setScrollPercent] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      setScrollPercent(percent)
      setVisible(scrollTop > 200)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const size = 52
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-6 z-40 w-[52px] h-[52px] flex items-center justify-center group"
      aria-label="Scroll to top"
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E8E8E8"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D62300"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>

      <span className="relative z-10 w-9 h-9 rounded-full bg-[#D62300] flex items-center justify-center group-hover:bg-[#b51e00] transition-colors duration-200 shadow-lg">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </span>
    </button>
  )
}

export default ScrollToTopButton
