import React from 'react'
import visiMisiBg from '../assets/optimized/Background Visi Misi.webp'
import { useReveal, useStaggerReveal, useParallax } from '../hooks/useScrollAnimation'

const misiItems = [
  { number: '01', title: 'Kumpulkan & Lestarikan', desc: 'Mengumpulkan, merawat, dan melestarikan koleksi budaya dari seluruh penjuru Nusantara.' },
  { number: '02', title: 'Sajikan & Edukasi', desc: 'Menyajikan informasi budaya melalui sajian interaktif dan program pendidikan berkualitas.' },
  { number: '03', title: 'Partisipasi Masyarakat', desc: 'Mendorong keterlibatan aktif komunitas dalam pelestarian budaya lokal dan nasional.' },
  { number: '04', title: 'Digitalisasi Koleksi', desc: 'Mentransformasikan koleksi ke format digital agar dapat diakses oleh generasi masa kini dan mendatang.' },
  { number: '05', title: 'Kualitas SDM', desc: 'Meningkatkan kapasitas sumber daya manusia dalam pengelolaan dan pengembangan museum.' },
]

const tujuanStrategis = [
  { icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" /></svg>), label: 'Pelestarian Budaya' },
  { icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>), label: 'Edukasi Masyarakat' },
  { icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>), label: 'Tumbuhkan Nasionalisme' },
  { icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>), label: 'Dukung Riset Ilmiah' },
  { icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>), label: 'Promosi Budaya Dunia' },
]

export default function VisiMisi() {
  const [headerRef, headerVisible] = useReveal({ threshold: 0.3 })
  const [visiRef, visiVisible] = useReveal({ threshold: 0.2 })
  const [misiRef, misiVisible] = useStaggerReveal({ threshold: 0.1 })
  const [tujuanRef, tujuanVisible] = useStaggerReveal({ threshold: 0.1 })
  const [bgRef, bgOffset] = useParallax(0.12)

  return (
    <section id="visi-misi" className="relative py-20 md:py-28 overflow-hidden" ref={bgRef}>
      {/* Background Image with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={visiMisiBg}
          alt=""
          className="w-full h-[120%] object-cover parallax-bg"
          style={{ transform: `translateY(${bgOffset * 0.5}px)` }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header — scale-in */}
        <div
          ref={headerRef}
          className={`text-center mb-14 reveal-scale ${headerVisible ? 'visible' : ''}`}
        >
          <p className="text-museum-gold text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Arah & Tujuan
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Visi & <span className="text-museum-gold">Misi</span>
          </h2>
        </div>

        {/* === VISI === reveal up */}
        <div
          ref={visiRef}
          className={`mb-14 reveal-up ${visiVisible ? 'visible' : ''}`}
        >
          <p className="text-museum-gold/70 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Visi
          </p>
          <div className="bg-white/5 border border-museum-gold/20 backdrop-blur-sm p-6 md:p-8 shimmer-on-reveal visible">
            <p className="text-white/90 text-sm md:text-base leading-relaxed font-light italic">
              Menjadi pusat pelestarian dan pemajuan budaya bangsa Indonesia melalui penyajian kekayaan budaya dari seluruh nusantara secara edukatif, inspiratif, dan modern.
            </p>
          </div>
        </div>

        {/* === MISI === stagger cards */}
        <div className="mb-16">
          <p className="text-museum-gold/70 text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Misi
          </p>

          <div
            ref={misiRef}
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children ${misiVisible ? 'visible' : ''}`}
          >
            {misiItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-museum-gold/10 border border-museum-gold/20 p-5 md:p-6 hover:bg-museum-gold/15 transition-all duration-400"
              >
                <span className="font-serif text-2xl md:text-3xl font-bold text-museum-gold/80 block mb-2">
                  {item.number}
                </span>
                <h3 className="text-white font-semibold text-sm mb-2">
                  {item.title}
                </h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

            {/* Special 6th card */}
            <div className="bg-museum-gold/10 border border-museum-gold/20 p-5 md:p-6 hover:bg-museum-gold/15 transition-all duration-400">
              <span className="text-museum-gold/80 block mb-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              <h3 className="text-white font-semibold text-sm mb-2">
                Inovasi Berkelanjutan
              </h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Terus berinovasi dalam metode penyajian dan pelestarian koleksi warisan budaya.
              </p>
            </div>
          </div>
        </div>

        {/* === TUJUAN STRATEGIS === */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <span className="flex-1 h-[1px] bg-museum-gold/30" />
            <span className="text-museum-gold text-xs font-semibold uppercase tracking-[0.25em] whitespace-nowrap">
              Tujuan Strategis
            </span>
            <span className="flex-1 h-[1px] bg-museum-gold/30" />
          </div>

          <div
            ref={tujuanRef}
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 stagger-children ${tujuanVisible ? 'visible' : ''}`}
          >
            {tujuanStrategis.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-museum-gold/15 p-4 flex flex-col items-center text-center hover:bg-museum-gold/10 transition-all duration-400"
              >
                <div className="text-museum-gold/70 mb-3">
                  {item.icon}
                </div>
                <p className="text-white/70 text-[11px] leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
