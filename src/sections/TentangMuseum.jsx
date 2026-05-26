import React from 'react'
import tentang1 from '../assets/optimized/tentang-museum/Tentang Museum 1.webp'
import tentang2 from '../assets/optimized/tentang-museum/Tentang Museum 2.webp'
import { useReveal, useParallax, useStaggerReveal } from '../hooks/useScrollAnimation'

const tujuanFungsi = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
    title: 'Edukasi',
    desc: 'Pusat pembelajaran budaya yang membantu memahami akar sejarah dan budaya Indonesia.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
    title: 'Pelestarian',
    desc: 'Menjaga warisan budaya agar tetap lestari dan dikenali generasi mendatang.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v3.818m3 .546V3m0 0h3.375M6.75 7.364l3-1.091" />
      </svg>
    ),
    title: 'Rekreasi Edukatif',
    desc: 'Wisata budaya yang menyenangkan untuk keluarga dan pelajar dari seluruh dunia.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: 'Identitas Nasional',
    desc: 'Menguatkan rasa cinta tanah air dari Sabang hingga Merauke melalui kekayaan budaya.',
  },
]

export default function TentangMuseum() {
  const [img1Ref, img1Visible] = useReveal({ threshold: 0.2 })
  const [img2Ref, img2Visible] = useReveal({ threshold: 0.2 })
  const [textRef, textVisible] = useReveal({ threshold: 0.15 })
  const [cardsRef, cardsVisible] = useStaggerReveal({ threshold: 0.1 })
  const [parallaxRef, parallaxOffset] = useParallax(0.08)

  return (
    <section id="tentang" className="py-24 bg-museum-beige relative overflow-hidden" ref={parallaxRef}>
      {/* Top Decorative Ornament */}
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <svg className="w-[600px] md:w-[800px] h-auto text-museum-gold/40" viewBox="0 0 800 60" fill="none">
          <path d="M400 8 L408 30 L400 52 L392 30 Z" fill="currentColor" opacity="0.5" />
          <path d="M392 30 Q350 30 330 15 Q310 0 280 5 Q250 10 240 25 Q230 40 250 45 Q270 50 280 35 Q290 20 310 20 Q330 20 350 30 Q340 10 310 5 Q280 0 260 15 Q240 30 250 50 Q260 60 280 55 Q300 50 310 35" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M280 35 Q260 30 240 35 Q220 40 210 30 Q200 20 210 10 Q220 0 240 5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M210 30 Q180 30 160 20 Q140 10 120 15 Q100 20 90 35 Q80 50 100 50 Q120 50 130 35 Q140 20 160 25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M408 30 Q450 30 470 15 Q490 0 520 5 Q550 10 560 25 Q570 40 550 45 Q530 50 520 35 Q510 20 490 20 Q470 20 450 30 Q460 10 490 5 Q520 0 540 15 Q560 30 550 50 Q540 60 520 55 Q500 50 490 35" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M520 35 Q540 30 560 35 Q580 40 590 30 Q600 20 590 10 Q580 0 560 5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M590 30 Q620 30 640 20 Q660 10 680 15 Q700 20 710 35 Q720 50 700 50 Q680 50 670 35 Q660 20 640 25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
          <line x1="100" y1="30" x2="380" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="420" y1="30" x2="700" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Staggered Image Layout with parallax + reveal */}
          <div className="relative min-h-[500px] md:min-h-[650px]">
            {/* Photo 1 - slides in from left with parallax float */}
            <div
              ref={img1Ref}
              className={`relative z-10 w-[75%] md:w-[70%] reveal-left ${img1Visible ? 'visible' : ''}`}
              style={{ transform: img1Visible ? `translateY(${parallaxOffset * 0.3}px)` : undefined }}
            >
              <img
                src={tentang1}
                alt="Museum Le Mayeur - Penari Bali"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Photo 2 - slides in from right with opposite parallax */}
            <div
              ref={img2Ref}
              className={`relative z-20 w-[75%] md:w-[70%] ml-auto -mt-10 md:-mt-16 reveal-right ${img2Visible ? 'visible' : ''}`}
              style={{ transform: img2Visible ? `translateY(${parallaxOffset * -0.2}px)` : undefined }}
            >
              <img
                src={tentang2}
                alt="Museum Le Mayeur - Le Mayeur dan Ni Pollok"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Right - Text Content with reveal */}
          <div
            ref={textRef}
            className={`lg:pl-4 reveal-right ${textVisible ? 'visible' : ''}`}
          >
            <p className="text-museum-gold text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Tentang Museum
            </p>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-museum-brown leading-snug mb-6">
              Museum Le Mayeur
              <br />
              Warisan Abadi
              <br />
              Nusantara
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <span className="block w-16 h-[1px] bg-museum-gold/60" />
              <span className="text-museum-gold text-xs">◆</span>
            </div>

            <p className="text-museum-brown/70 leading-relaxed mb-5 text-[13px] md:text-[14px]">
              Museum Le Mayeur adalah salah satu museum paling ikonik di Tanah Air yang
              menyajikan kekayaan budaya bangsa dalam bentuk pameran etnografi dari
              berbagai suku dan daerah di Indonesia.
            </p>

            <p className="text-museum-brown/70 leading-relaxed mb-8 text-[13px] md:text-[14px]">
              Dirancang dengan arsitektur khas yang megah, Museum Le Mayeur tak hanya
              menampilkan benda-benda budaya seperti pakaian adat, senjata tradisional,
              alat musik, dan artefak sejarah, tetapi juga menyuguhkan narasi peradaban
              bangsa Indonesia dari masa ke masa melalui instalasi dan diorama yang
              informatif.
            </p>

            <h3 className="font-serif text-xl md:text-2xl font-semibold text-museum-brown mb-5">
              Tujuan & Fungsi
            </h3>

            {/* 2x2 Cards Grid with stagger reveal */}
            <div
              ref={cardsRef}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children ${cardsVisible ? 'visible' : ''}`}
            >
              {tujuanFungsi.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-museum-gold/25 p-5 hover:border-museum-gold/50 hover:shadow-md hover:shadow-museum-gold/5 transition-all duration-400 bg-white/50"
                >
                  <div className="text-museum-gold/70 mb-3">
                    {item.icon}
                  </div>
                  <h4 className="text-museum-brown font-semibold text-sm mb-2">
                    {item.title}
                  </h4>
                  <p className="text-museum-brown/55 text-xs leading-relaxed">
                    {item.desc}
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
