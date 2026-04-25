import React from 'react'
import heroBg from '../assets/optimized/heroo-bg.webp'
import { useParallax } from '../hooks/useScrollAnimation'

export default function Hero() {
  const [parallaxRef, parallaxOffset] = useParallax(0.2)

  return (
    <section
      id="beranda"
      className="hero-section relative z-20 w-full"
      ref={parallaxRef}
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroBg}
          alt="Museum Le Mayeur Background"
          className="w-full h-[120%] object-cover object-bottom parallax-bg"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Content — staggered entrance */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-20 md:pb-28">
        <div className="text-center px-6 max-w-3xl">
          {/* Location tag */}
          <p className="hero-anim-location text-museum-gold/80 text-[11px] md:text-xs tracking-[0.35em] uppercase font-medium mb-6">
            Denpasar &nbsp;&middot;&nbsp; Bali &nbsp;&middot;&nbsp; Indonesia
          </p>

          {/* Main Title */}
          <h1 className="hero-anim-title-1 font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-2 drop-shadow-lg">
            <span className="italic">Museum</span>
          </h1>
          <h1 className="hero-anim-title-2 font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.1] mb-8 drop-shadow-lg">
            <span className="text-museum-gold italic">Le Mayeur</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-anim-subtitle text-white/75 text-sm md:text-[15px] font-light tracking-wide mb-10 leading-relaxed max-w-lg mx-auto">
            Pusat pelestarian budaya dan seni yang merangkum kekayaan peradaban
            Nusantara dalam suasana yang megah dan penuh makna.
          </p>

          {/* CTA Button */}
          <a
            href="#tentang"
            className="hero-anim-cta hero-cta-btn inline-flex items-center gap-3 border border-museum-gold/70 text-museum-gold hover:bg-museum-gold hover:text-museum-brown-dark px-8 py-3 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-400 hover:shadow-lg hover:shadow-museum-gold/20"
          >
            Explore Museum
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll indicator at bottom */}
      <div className="hero-anim-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-medium">Scroll</span>
        <div className="hero-scroll-line w-[1px] h-6 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
      </div>

    </section>
  )
}
