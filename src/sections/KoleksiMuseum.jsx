import React from 'react'
import { useReveal } from '../hooks/useScrollAnimation'

// Import all gallery images (optimized WebP)
import foto1 from '../assets/optimized/galeri/Foto 1.webp'
import foto2 from '../assets/optimized/galeri/Foto 2.webp'
import foto3 from '../assets/optimized/galeri/Foto 3.webp'
import foto4 from '../assets/optimized/galeri/Foto 4.webp'
import foto5 from '../assets/optimized/galeri/Foto 5.webp'
import foto6 from '../assets/optimized/galeri/Foto 6.webp'
import foto7 from '../assets/optimized/galeri/Foto 7.webp'
import foto8 from '../assets/optimized/galeri/Foto 8.webp'
import foto9 from '../assets/optimized/galeri/Foto 9.webp'
import foto10 from '../assets/optimized/galeri/Foto 10.webp'
import foto11 from '../assets/optimized/galeri/Foto 11.webp'
import foto12 from '../assets/optimized/galeri/Foto 12.webp'
import foto13 from '../assets/optimized/galeri/Foto 13.webp'
import foto14 from '../assets/optimized/galeri/Foto 14.webp'
import foto15 from '../assets/optimized/galeri/Foto 15.webp'
import foto16 from '../assets/optimized/galeri/Foto 16.webp'
import foto17 from '../assets/optimized/galeri/Foto 17.webp'
import foto18 from '../assets/optimized/galeri/Foto 18.webp'
import foto19 from '../assets/optimized/galeri/Foto 19.webp'
import foto20 from '../assets/optimized/galeri/Foto 20.webp'
import foto21 from '../assets/optimized/galeri/Foto 21.webp'
import foto22 from '../assets/optimized/galeri/Foto 22.webp'
import foto23 from '../assets/optimized/galeri/Foto 23.webp'
import foto24 from '../assets/optimized/galeri/Foto 24.webp'
import foto25 from '../assets/optimized/galeri/Foto 25.webp'
import foto26 from '../assets/optimized/galeri/Foto 26.webp'
import foto27 from '../assets/optimized/galeri/Foto 27.webp'
import foto28 from '../assets/optimized/galeri/Foto 28.webp'
import foto29 from '../assets/optimized/galeri/Foto 29.webp'
import foto30 from '../assets/optimized/galeri/Foto 30.webp'
import foto31 from '../assets/optimized/galeri/Foto 31.webp'
import foto32 from '../assets/optimized/galeri/Foto 32.webp'
import foto33 from '../assets/optimized/galeri/Foto 33.webp'
import foto34 from '../assets/optimized/galeri/Foto 34.webp'

const allImages = [
  foto1, foto2, foto3, foto4, foto5, foto6, foto7, foto8,
  foto9, foto10, foto11, foto12, foto13, foto14, foto15, foto16,
  foto17, foto18, foto19, foto20, foto21, foto22, foto23, foto24,
  foto25, foto26, foto27, foto28, foto29, foto30, foto31, foto32,
  foto33, foto34,
]

export default function KoleksiMuseum() {
  const scrollImages = [...allImages, ...allImages]

  const [headerRef, headerVisible] = useReveal({ threshold: 0.3 })
  const [galleryRef, galleryVisible] = useReveal({ threshold: 0.05 })

  const trackRef = React.useRef(null)
  const offsetRef = React.useRef(0)
  const rafRef = React.useRef(null)
  const isDraggingRef = React.useRef(false)
  const dragStartX = React.useRef(0)
  const dragOffsetStart = React.useRef(0)
  const speed = 1.2

  React.useEffect(() => {
    const tick = () => {
      if (!isDraggingRef.current && trackRef.current) {
        offsetRef.current -= speed
        const halfWidth = trackRef.current.scrollWidth / 2
        if (Math.abs(offsetRef.current) >= halfWidth) {
          offsetRef.current += halfWidth
        }
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleMouseDown = (e) => {
    isDraggingRef.current = true
    dragStartX.current = e.clientX
    dragOffsetStart.current = offsetRef.current
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    const dx = e.clientX - dragStartX.current
    offsetRef.current = dragOffsetStart.current + dx
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
    }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    if (trackRef.current) trackRef.current.style.cursor = ''
  }

  const handleTouchStart = (e) => {
    isDraggingRef.current = true
    dragStartX.current = e.touches[0].clientX
    dragOffsetStart.current = offsetRef.current
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return
    const dx = e.touches[0].clientX - dragStartX.current
    offsetRef.current = dragOffsetStart.current + dx
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
    }
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  return (
    <section id="koleksi" className="py-24 bg-museum-beige overflow-hidden">
      {/* Header — scale reveal */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div
          ref={headerRef}
          className={`text-center reveal-scale ${headerVisible ? 'visible' : ''}`}
        >
          <p className="tracking-[0.3em] text-museum-gold/70 text-[11px] uppercase font-medium mb-3">
            Koleksi Museum Le Mayeur
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-museum-brown mb-4">
            Harta{' '}
            <span className="text-museum-gold italic">Nusantara</span>
          </h2>
          <div className="ornament-divider my-5">
            <span className="text-museum-gold text-base">✦</span>
          </div>
        </div>
      </div>

      {/* Scrolling Gallery — fade-in reveal */}
      <div
        ref={galleryRef}
        className={`relative reveal-fade ${galleryVisible ? 'visible' : ''}`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-museum-beige to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-museum-beige to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex items-stretch gap-4 select-none"
          style={{ width: 'max-content', cursor: 'grab', willChange: 'transform' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {scrollImages.map((img, idx) => (
            <div
              key={idx}
              className="gallery-item flex-shrink-0 relative overflow-hidden"
              style={{ height: '320px' }}
            >
              <div className="h-full border-2 border-museum-gold/40 p-[3px] bg-museum-beige">
                <img
                  src={img}
                  alt={`Koleksi Museum Le Mayeur ${(idx % allImages.length) + 1}`}
                  className="h-full w-auto object-cover block pointer-events-none"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
