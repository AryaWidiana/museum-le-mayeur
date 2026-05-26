import React from 'react'
import statBg from '../assets/optimized/stat-bg.webp'
import { useReveal, useCounter, useStaggerReveal, useParallax } from '../hooks/useScrollAnimation'

const stats = [
  { value: 1932, label: 'Tahun Berdiri', suffix: '' },
  { value: 400,  label: 'Karya Lukisan', suffix: '+' },
  { value: null, label: 'Warisan Budaya', display: '∞' },
]

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Warisan Abadi',
    desc: 'Menjaga karya seni dan budaya yang telah melampaui batas generasi, menghadirkan kekayaan peradaban dalam setiap sudut ruang pamer.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Jembatan Budaya',
    desc: 'Mempertemukan timur dan barat, tradisi dan modern kias, dalam harmoni yang serasi dari setiap koleksi yang tersimpan dengan penuh kasih.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Identitas Bangsa',
    desc: 'Setiap artefak cermin seri mana jati bangsa Indonesia, beragam, kaya dan bernilai dalam keindahan yang tak ternilai harganya.',
  },
]

function StatCounter({ stat }) {
  const [counterRef, count] = useCounter(stat.value || 0, 2200)

  return (
    <h3
      ref={counterRef}
      className="font-serif text-4xl md:text-5xl font-bold text-museum-gold mb-2 tracking-wider drop-shadow-sm"
    >
      {stat.display ? stat.display : `${count}${stat.suffix}`}
    </h3>
  )
}

export default function Statistik() {
  const [statsRef, statsVisible] = useReveal({ threshold: 0.2 })
  const [featRef, featVisible] = useStaggerReveal({ threshold: 0.15 })
  const [bgRef, bgOffset] = useParallax(0.1)

  return (
    <section className="statistik-section relative" ref={bgRef}>
      {/* ===== Stats area with fitted background ===== */}
      <div className="relative overflow-hidden">
        {/* Background image with parallax */}
        <div className="absolute inset-0 z-0">
          <img
            src={statBg}
            alt=""
            className="w-full h-[120%] object-cover object-center parallax-bg"
            style={{ transform: `translateY(${bgOffset * 0.4}px)` }}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-museum-beige/40" />
        </div>

        {/* Stats content with counter animation */}
        <div
          ref={statsRef}
          className={`relative z-10 max-w-5xl mx-auto px-6 py-14 md:py-20 reveal-up ${statsVisible ? 'visible' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`text-center py-6 ${
                  idx < stats.length - 1 ? 'md:border-r md:border-museum-gold/20' : ''
                }`}
              >
                <StatCounter stat={stat} />
                <p className="text-museum-brown/60 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Feature cards with stagger reveal ===== */}
      <div className="relative z-10">
        <div className="py-16 md:py-20 relative">
          <div className="max-w-5xl mx-auto px-6">
            <div
              ref={featRef}
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children ${featVisible ? 'visible' : ''}`}
            >
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 p-6 md:p-8 border border-museum-gold/20 group hover:shadow-xl hover:shadow-museum-gold/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="text-museum-gold mb-4">
                    {feat.icon}
                  </div>
                  <h4 className="font-serif text-lg font-bold text-museum-brown mb-3">
                    {feat.title}
                  </h4>
                  <p className="text-museum-brown/55 text-[13px] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
