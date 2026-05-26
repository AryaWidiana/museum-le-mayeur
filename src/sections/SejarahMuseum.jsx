import React from 'react'
import { useReveal, useStaggerReveal } from '../hooks/useScrollAnimation'

import sejarah1 from '../assets/optimized/sejarah/Sejarah 1.webp'
import sejarah2 from '../assets/optimized/sejarah/Sejarah 2.webp'
import sejarah3 from '../assets/optimized/sejarah/Sejarah 3.webp'
import sejarah4 from '../assets/optimized/sejarah/Sejarah 4.webp'
import sejarah5 from '../assets/optimized/sejarah/Sejarah 5.webp'
import sejarah6 from '../assets/optimized/sejarah/Sejarah 6.webp'
import sejarah7 from '../assets/optimized/sejarah/Sejarah 7.webp'

const timelineData = [
  { year: '1880', title: 'Kelahiran sang pelukis', desc: 'Adrien-Jean Le Mayeur de Merprès lahir di Ixelles, Brussels, Belgia. Ia tumbuh dalam lingkungan seni yang kaya, belajar di Académie Royale dan aktif berkarya sebagai pelukis Impresionis di Eropa dan Afrika Utara sebelum mengenal Bali.', image: sejarah1 },
  { year: '1932', title: 'Kedatangan di Bali', desc: 'Le Mayeur tiba di Bali dan jatuh cinta pada keindahan alam serta budaya pulau ini. Ia memutuskan untuk tinggal di Pantai Sanur, dimana alam dan budaya menjadi inspirasi utama karya seninya yang menangkap esensi kehidupan Bali.', image: sejarah2 },
  { year: '1935', title: 'Cinta & Inspirasi: Ni Pollok', desc: 'Le Mayeur bertemu dan menikahi Ni Pollok, seorang penari legong terkenal yang kemudian menjadi model dan inspirasi utamanya. Hubungan mereka melahirkan karya-karya lukisan legendaris yang menggambarkan keindahan budaya Bali.', image: sejarah3 },
  { year: '1952', title: 'Rumah Menjadi Museum', desc: 'Rumah Le Mayeur di Sanur resmi menjadi studio seni pribadi. Tahun demi tahun, koleksi lukisan dan karya seni terus bertambah, menjadikan rumahnya sebagai galeri seni dan warisan budaya Indonesia yang tak ternilai.', image: sejarah4 },
  { year: '1958', title: 'Kepergian Le Mayeur', desc: 'Le Mayeur meninggal dunia di Belgia. Koleksinya secara resmi mulai dikelola oleh pemerintah Indonesia sebagai warisan budaya penting. Ni Pollok yang setia menjaga karya suaminya dengan penuh dedikasi.', image: sejarah5 },
  { year: '1985', title: 'Diresmikan sebagai Museum Negara', desc: 'Pemerintah Indonesia meresmikan koleksi Le Mayeur di Sanur sebagai Museum Negara resmi. Langkah bersejarah ini menjadikan ratusan karya seni Le Mayeur dapat dinikmati publik sebagai warisan budaya Indonesia.', image: sejarah6 },
  { year: 'Kini', title: 'Warisan yang Hidup', desc: 'Museum Le Mayeur terus berdiri megah di Pantai Sanur, Bali. Dengan koleksi lebih dari 100 karya lukisan, ribuan wisatawan dari seluruh dunia mengunjungi museum ini setiap tahun untuk menyaksikan keindahan karya seni dan merasakan atmosfer romantis kisah cinta Le Mayeur dan Ni Pollok yang abadi.', image: sejarah7 },
]

const highlights = [
  { icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>), title: 'Le Mayeur', subtitle: 'Pelukis Belgia pencinta Bali' },
  { icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>), title: 'Ni Pollok', subtitle: 'Penari legong, jiwa karya Le Mayeur' },
  { icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>), title: 'Lokasi: Bali', subtitle: '650+ karya koleksi nyata abadi' },
  { icon: (<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>), title: 'Penting di Dunia Museum', subtitle: 'Warisan budaya dunia yang abadi' },
]

/* Individual timeline card component with its own reveal observer */
function TimelineCard({ item, idx }) {
  const isLeft = idx % 2 === 0
  const [cardRef, cardVisible] = useReveal({ threshold: 0.15, rootMargin: '0px 0px -80px 0px' })

  return (
    <div ref={cardRef} className="relative">
      {/* ── Dot — desktop ── */}
      <div
        className="hidden md:block absolute z-10"
        style={{ left: '50%', top: '32px', transform: 'translateX(-50%)' }}
      >
        <span className={`block w-[14px] h-[14px] rounded-full bg-museum-gold border-[3px] border-museum-brown shadow-[0_0_0_4px_rgba(201,168,76,0.2)] timeline-dot-animated ${cardVisible ? 'visible' : ''}`} />
      </div>

      {/* ── Dot — mobile ── */}
      <div
        className="md:hidden absolute z-10"
        style={{ left: '16px', top: '28px', transform: 'translateX(-50%)' }}
      >
        <span className={`block w-3 h-3 rounded-full bg-museum-gold border-2 border-museum-brown timeline-dot-animated ${cardVisible ? 'visible' : ''}`} />
      </div>

      {/* ── Card with directional slide animation ── */}
      <div
        className={`
          ml-10 md:ml-0
          md:w-[calc(50%-40px)]
          ${isLeft ? 'md:mr-auto md:pr-0' : 'md:ml-auto md:pl-0'}
          ${isLeft ? 'timeline-card-left' : 'timeline-card-right'}
          ${cardVisible ? 'visible' : ''}
        `}
      >
        <div className="sejarah-card group">
          <span className="font-serif text-3xl md:text-4xl font-bold text-museum-gold leading-none">
            {item.year}
          </span>
          <h3 className="font-serif text-lg md:text-xl font-bold text-museum-brown mt-2 mb-3">
            {item.title}
          </h3>
          <p className="text-museum-brown/55 text-[13px] leading-relaxed mb-5">
            {item.desc}
          </p>
          <div className="sejarah-image-frame">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-[180px] md:h-[200px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SejarahMuseum() {
  const [headerRef, headerVisible] = useReveal({ threshold: 0.2 })
  const [highlightRef, highlightVisible] = useStaggerReveal({ threshold: 0.15 })

  return (
    <section id="sejarah" className="py-20 md:py-28 bg-museum-beige overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* ===== Section Header — reveal scale ===== */}
        <div
          ref={headerRef}
          className={`text-center mb-20 reveal-scale ${headerVisible ? 'visible' : ''}`}
        >
          <p className="tracking-[0.3em] text-museum-gold/70 text-[11px] uppercase font-medium mb-3">
            Perjalanan Waktu
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-museum-brown mb-4">
            Sejarah{' '}
            <span className="text-museum-gold italic">Le Mayeur</span>
          </h2>
          <div className="ornament-divider my-5">
            <span className="text-museum-gold text-base">✦</span>
          </div>
          <p className="text-museum-brown/50 text-sm max-w-xl mx-auto leading-relaxed">
            Kisah tentang pelukis Belgia yang menemukan surga di Bali dan mengabadikan keindahannya
            dalam ratusan karya seni yang menjadi warisan dunia.
          </p>
        </div>

        {/* ===== Timeline with animated cards ===== */}
        <div className="relative">
          {/* Center vertical line — desktop */}
          <div
            className="hidden md:block absolute top-0 bottom-0 w-[2px]"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, #C9A84C 5%, #C9A84C 95%, transparent)',
            }}
          />

          {/* Mobile left line */}
          <div
            className="md:hidden absolute top-0 bottom-0 w-[2px]"
            style={{
              left: '16px',
              background: 'linear-gradient(to bottom, transparent, #C9A84C 5%, #C9A84C 95%, transparent)',
            }}
          />

          <div className="space-y-12 md:space-y-20">
            {timelineData.map((item, idx) => (
              <TimelineCard key={idx} item={item} idx={idx} />
            ))}
          </div>
        </div>

        {/* ===== Bottom Highlights — staggered reveal ===== */}
        <div className="mt-20 md:mt-28 pt-12 border-t border-museum-gold/20">
          <div
            ref={highlightRef}
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 stagger-children ${highlightVisible ? 'visible' : ''}`}
          >
            {highlights.map((h, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-full border-2 border-museum-gold/60 flex items-center justify-center mb-3 text-museum-gold transition-all duration-300 group-hover:bg-museum-gold group-hover:text-white group-hover:border-museum-gold group-hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                  {h.icon}
                </div>
                <h4 className="font-serif font-bold text-museum-brown text-sm mb-1">
                  {h.title}
                </h4>
                <p className="text-museum-brown/45 text-[11px] leading-snug max-w-[160px]">
                  {h.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
