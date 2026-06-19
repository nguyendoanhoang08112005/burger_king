import React, { useState, useEffect, useRef } from 'react'

const LazyImage = ({ src, alt, className, placeholder = '/placeholder-food.jpg' }) => {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      {inView && (
        <img
          src={src || placeholder}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={e => { 
            e.target.src = placeholder
            setLoaded(true)
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}

export default LazyImage
