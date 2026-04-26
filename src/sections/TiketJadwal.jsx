import React, { useState } from 'react'
import { useReveal, useStaggerReveal } from '../hooks/useScrollAnimation'

const ticketDataWNI = [
  { category: 'Dewasa', price: 'Rp 10.000' },
  { category: 'Anak-anak', price: 'Rp 10.000' },
  { category: 'Mahasiswa', price: 'Rp 10.000' },
  { category: 'Mahasiswa Luar Bali', price: 'Rp 10.000' },
  { category: 'Pelajar', price: 'Rp 10.000' },
  { category: 'Pelajar Luar Bali', price: 'Rp 10.000' },
  { category: 'Prewedding', price: 'Rp 10.000' },
  { category: 'Shooting', price: 'Rp 10.000' },
  { category: 'Balita (dibawah 3 tahun)', price: 'GRATIS', isFree: true },
]

const ticketDataWNA = [
  { category: 'Dewasa', price: 'Rp 10.000' },
  { category: 'Anak-anak', price: 'Rp 10.000' },
  { category: 'Prewedding', price: 'Rp 10.000' },
  { category: 'Shooting', price: 'Rp 10.000' },
  { category: 'Balita (dibawah 3 tahun)', price: 'GRATIS', isFree: true },
]

const infoCards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    title: 'Pameran Berlangsung',
    desc: 'Pameran koleksi tetap lukisan Le Mayeur dan artefak budaya Bali sedang berlangsung. Nikmati lebih dari 400 karya autentik.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Highlight Koleksi',
    desc: 'Lukisan-lukisan karya Adrien-Jean Le Mayeur de Merpres bertema kehidupan Bali, menampilkan keindahan Ni Pollok sebagai model utama.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    title: 'Berita Budaya',
    desc: 'Bergabunglah dalam program workshop seni dan kebudayaan yang diadakan setiap bulan di lingkungan museum.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Panduan Kunjungan',
    desc: 'Tersedia pemandu wisata berbahasa Indonesia dan Inggris. Fotografi non-flash diperbolehkan. Pakaian sopan diwajibkan.',
  },
]

// Jadwal state now managed dynamically inside the component

export default function TiketJadwal() {
  const [activeTab, setActiveTab] = useState('WNI')
  const [animating, setAnimating] = useState(false)
  const [jadwal, setJadwal] = useState([
    { hari: 'Senin - Sabtu', jam: '09.00 - 15.00 WITA' },
    { hari: 'Minggu', jam: 'Reservasi', isSpecial: true },
    { hari: 'Hari Libur Nasional', jam: 'Menyesuaikan', isSpecial: true }
  ])

  const [headerRef, headerVisible] = useReveal({ threshold: 0.3 })
  const [leftRef, leftVisible] = useStaggerReveal({ threshold: 0.1 })
  const [rightRef, rightVisible] = useReveal({ threshold: 0.15 })

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/schedule`);
        const result = await res.json().catch(() => ({}));
        
        if (result.success && result.data) {
          let dynamicJadwal = [];
          
          // Use dynamic hours if available, otherwise fallback
          if (result.data.schedule) {
            const formatTime = (isoString) => {
              const d = new Date(isoString);
              // Format HH.MM (e.g. 09.00)
              return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' }).replace(':', '.');
            };
            const openTimeStr = formatTime(result.data.schedule.openTime);
            const closeTimeStr = formatTime(result.data.schedule.closeTime);
            dynamicJadwal.push({ hari: 'Senin - Sabtu', jam: `${openTimeStr} - ${closeTimeStr} WITA` });
            dynamicJadwal.push({ hari: 'Minggu', jam: 'Reservasi', isSpecial: true });
          } else {
            dynamicJadwal.push({ hari: 'Senin - Sabtu', jam: '09.00 - 15.00 WITA' });
            dynamicJadwal.push({ hari: 'Minggu', jam: 'Reservasi', isSpecial: true });
          }

          // Inject specific holidays/closures
          if (result.data.activities && result.data.activities.length > 0) {
            result.data.activities.forEach(act => {
              const d = new Date(act.date);
              const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              dynamicJadwal.push({
                hari: `${dateStr} (${act.desc})`,
                jam: act.status.toUpperCase(),
                isSpecial: true,
                isClosed: true
              });
            });
          } else {
            dynamicJadwal.push({ hari: 'Hari Libur Nasional', jam: 'Menyesuaikan', isSpecial: true });
          }

          setJadwal(dynamicJadwal);
        }
      } catch (error) {
        console.error("Failed to load schedule:", error);
      }
    };
    fetchSchedule();
  }, []);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return
    setAnimating(true)
    setTimeout(() => {
      setActiveTab(tab)
      setAnimating(false)
    }, 200)
  }

  const currentData = activeTab === 'WNI' ? ticketDataWNI : ticketDataWNA

  return (
    <section id="tiket" className="py-24 bg-museum-beige">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header — reveal scale */}
        <div
          ref={headerRef}
          className={`text-center mb-14 reveal-scale ${headerVisible ? 'visible' : ''}`}
        >
          <p className="text-museum-gold text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Informasi Kunjungan
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-museum-brown mb-5">
            Tiket & <span className="text-museum-gold italic">Jadwal</span>
          </h2>
          <p className="text-museum-brown/50 text-sm max-w-xl mx-auto leading-relaxed italic">
            Ticket Museum Le Mayeur – Info Terbaru & Sorotan Budaya. Rencanakan
            kunjungan Anda untuk pengalaman budaya yang tak terlupakan.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left Column - Info Cards — stagger from left */}
          <div
            ref={leftRef}
            className={`space-y-5 stagger-children ${leftVisible ? 'visible' : ''}`}
          >
            {infoCards.map((card, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 border border-museum-gold/15 bg-white/60 hover:bg-white hover:border-museum-gold/30 hover:shadow-md transition-all duration-400"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-museum-gold/30 text-museum-gold/70">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-museum-brown mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-museum-brown/55 text-xs leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Ticket Card — slide from right */}
          <div
            ref={rightRef}
            className={`bg-museum-brown-dark overflow-hidden reveal-right ${rightVisible ? 'visible' : ''}`}
          >
            <div className="px-6 pt-6 pb-0">
              <span className="inline-block bg-museum-gold/20 border border-museum-gold/40 text-museum-gold text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
                Harga Resmi 2026
              </span>
            </div>

            <div className="px-6 pt-5 pb-4">
              <h3 className="font-serif text-2xl md:text-3xl text-white leading-snug">
                Tiket Masuk
                <br />
                <span className="text-museum-gold">Museum Le Mayeur</span>
              </h3>
            </div>

            <div className="px-6 pb-5">
              <div className="inline-flex bg-museum-brown/60 p-1">
                {['WNI', 'WNA'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabSwitch(tab)}
                    className={`px-6 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${activeTab === tab
                        ? 'bg-museum-gold text-museum-brown-dark'
                        : 'text-white/50 hover:text-white'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div
                className={`space-y-3 transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
              >
                {currentData.map((item, idx) => (
                  <div
                    key={`${activeTab}-${idx}`}
                    className="flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-museum-gold rounded-full flex-shrink-0" />
                      <span className="text-white/80 text-sm font-medium">{item.category}</span>
                    </div>
                    {item.isFree ? (
                      <span className="bg-museum-gold text-museum-brown-dark text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                        Gratis
                      </span>
                    ) : (
                      <span className="text-museum-gold font-serif font-bold text-sm">
                        {item.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-6 mb-6 border border-white/10 bg-white/5 p-5">
              <h4 className="text-museum-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                Jam Operasional
              </h4>
              <div className="space-y-3">
                {jadwal.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-white/70 text-sm font-medium truncate pr-4">{item.hari}</span>
                    <span className={`text-sm flex-shrink-0 ${item.isClosed ? 'text-red-400 font-bold tracking-widest' : item.isSpecial
                        ? 'text-museum-gold/80 italic underline underline-offset-2'
                        : 'text-museum-gold font-serif font-semibold'
                      }`}>
                      {item.jam}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
