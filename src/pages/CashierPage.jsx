import React, { useState, useEffect } from 'react'
import cashierBg from '../assets/cashier/cashier-bg.webp'

const ticketCategories = {
  WNI: [
    { label: 'Dewasa', price: 10000 },
    { label: 'Anak - anak', price: 10000 },
    { label: 'Pelajar', price: 10000 },
    { label: 'Pelajar Luar Bali', price: 10000 },
    { label: 'Mahasiswa', price: 10000 },
    { label: 'Mahasiswa Luar Bali', price: 10000 },
    { label: 'Prewedding', price: 10000 },
    { label: 'Shooting', price: 10000 },
  ],
  WNA: [
    { label: 'Dewasa', price: 50000 },
    { label: 'Anak - anak', price: 25000 },
    { label: 'Prewedding', price: 100000 },
    { label: 'Shooting', price: 100000 },
  ],
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function getTodayString() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

// Confirmation Modal
function ConfirmModal({ open, onConfirm, onCancel, data, isSubmitting }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-museum-gold/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-museum-brown mb-2">Apakah Anda Yakin?</h3>
        <p className="text-museum-brown/60 text-sm mb-6">
          Konfirmasi pemesanan tiket untuk <strong>{data?.nama || '-'}</strong> dengan total <strong>{formatRupiah(data?.total || 0)}</strong>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg border-2 border-museum-brown/20 text-museum-brown/70 font-medium text-sm hover:bg-museum-brown/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-museum-gold text-white font-medium text-sm hover:bg-museum-gold-light transition-colors shadow-lg shadow-museum-gold/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </>
            ) : 'Ya, Pesan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Success Toast
function SuccessToast({ show }) {
  if (!show) return null
  return (
    <div className="fixed top-6 right-6 z-[110] bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <span className="text-sm font-medium">Tiket berhasil dipesan!</span>
    </div>
  )
}

export default function CashierPage() {
  const [nama, setNama] = useState('')
  const [asal, setAsal] = useState('')
  const [tanggal, setTanggal] = useState(getTodayString())
  const [status, setStatus] = useState('WNI')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)

  // Preload background image
  useEffect(() => {
    const img = new Image()
    img.src = cashierBg
    img.onload = () => setBgLoaded(true)
  }, [])

  const tickets = ticketCategories[status]
  const selectedTicket = selectedCategory !== null ? tickets[selectedCategory] : null
  const total = selectedTicket ? selectedTicket.price : 0

  const handlePesan = () => {
    if (!nama || selectedCategory === null) return
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const token = sessionStorage.getItem('admin_token');

      // Fix ticketType format from "Anak - anak" to "Anak-anak" to match database
      const formattedTicketType = selectedTicket.label === 'Anak - anak' ? 'Anak-anak' : selectedTicket.label;

      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur.vercel.app')}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nama,
          category: status, // "WNI" atau "WNA"
          ticketType: formattedTicketType, // "Dewasa", "Anak-anak", dll
          payment: paymentMethod
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        // Simpan notifikasi detail ke localStorage
        const existingNotifsStr = localStorage.getItem('admin_notifications_list')
        const existingNotifs = existingNotifsStr ? JSON.parse(existingNotifsStr) : []
        const newNotif = {
          id: Date.now(),
          nama: nama,
          kategori: selectedTicket?.label || status,
          pembayaran: paymentMethod,
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }

        // Simpan max 10 notifikasi terbaru
        const updatedNotifs = [newNotif, ...existingNotifs].slice(0, 10)
        localStorage.setItem('admin_notifications_list', JSON.stringify(updatedNotifs))

        // Tetap trigger unread count
        const currentNotifs = parseInt(localStorage.getItem('admin_notifications_count') || '0', 10)
        localStorage.setItem('admin_notifications_count', (currentNotifs + 1).toString())

        // Dispatch custom storage event for same-tab updates
        window.dispatchEvent(new Event('storage'))

        setShowConfirm(false)
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          // Reset form
          setNama('')
          setAsal('')
          setSelectedCategory(null)
        }, 2500)
      } else {
        alert(data.message || 'Gagal memproses transaksi');
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Transaction Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-museum-brown" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background with progressive fade-in */}
      <img
        src={cashierBg}
        alt=""
        fetchpriority="high"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mt-auto pb-4 animate-slide-up">
          <h1 className="font-serif text-3xl md:text-4xl text-museum-brown">
            Museum <em className="text-museum-gold">Le Mayeur</em>
          </h1>
          <p className="text-museum-gold text-sm font-medium tracking-wider mt-1">
            Self - Service Kasir
          </p>
        </header>

        {/* Main 3-column layout */}
        <div className="px-4 md:px-8 pb-8 mb-auto">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-5 items-stretch">

            {/* LEFT - Data Pengunjung */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-museum-gold/10 flex flex-col animate-slide-up anim-delay-100">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-museum-brown/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                <span className="text-sm font-semibold text-museum-brown/80">Data Pengunjung</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-museum-brown/70 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukan nama.."
                    className="w-full border border-museum-brown/15 rounded-lg px-4 py-2.5 text-sm text-museum-brown bg-white placeholder:text-museum-brown/30 outline-none focus:border-museum-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-museum-brown/70 mb-1.5">Asal/Kota</label>
                  <input
                    type="text"
                    value={asal}
                    onChange={(e) => setAsal(e.target.value)}
                    placeholder="Contoh: Denpasar"
                    className="w-full border border-museum-brown/15 rounded-lg px-4 py-2.5 text-sm text-museum-brown bg-white placeholder:text-museum-brown/30 outline-none focus:border-museum-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-museum-brown/70 mb-1.5">Tanggal Kunjungan</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tanggal}
                      readOnly
                      className="w-full border border-museum-brown/15 rounded-lg px-4 py-2.5 text-sm text-museum-brown bg-white outline-none"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-museum-brown/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="mt-8">
                <label className="block text-xs font-semibold text-museum-brown/70 mb-2">Metode Pembayaran</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'Cash'
                      ? 'bg-museum-gold text-white shadow-md'
                      : 'bg-white border border-museum-brown/15 text-museum-brown/60 hover:border-museum-gold/40'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    Cash
                  </button>
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    </svg>
                    QRIS
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER - Kategori Tiket */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-museum-gold/10 animate-slide-up anim-delay-200">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-museum-brown/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
                <span className="text-sm font-semibold text-museum-brown/80">Kategori Tiket</span>
              </div>

              {/* WNI / WNA Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => { setStatus('WNI'); setSelectedCategory(null) }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${status === 'WNI'
                    ? 'bg-museum-gold text-white shadow-md'
                    : 'bg-white border border-museum-brown/15 text-museum-brown/60 hover:border-museum-gold/40'
                    }`}
                >
                  🇮🇩 WNI
                </button>
                <button
                  onClick={() => { setStatus('WNA'); setSelectedCategory(null) }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${status === 'WNA'
                    ? 'bg-museum-gold text-white shadow-md'
                    : 'bg-white border border-museum-brown/15 text-museum-brown/60 hover:border-museum-gold/40'
                    }`}
                >
                  ✈️ WNA
                </button>
              </div>

              {/* Ticket Grid */}
              <div className="grid grid-cols-2 gap-3">
                {tickets.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(idx)}
                    className={`min-h-[80px] p-4 rounded-lg border-2 text-center transition-all duration-200 flex flex-col items-center justify-center ${selectedCategory === idx
                      ? 'border-museum-gold bg-museum-gold/15 shadow-md'
                      : 'border-museum-gold/20 bg-museum-gold/5 hover:border-museum-gold/50 hover:bg-museum-gold/10'
                      }`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${selectedCategory === idx ? 'text-museum-brown' : 'text-museum-brown/80'}`}>
                      {t.label}
                    </p>
                    <p className={`text-xs ${selectedCategory === idx ? 'text-museum-gold font-bold' : 'text-museum-brown/50'}`}>
                      {formatRupiah(t.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT - Ringkasan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-museum-gold/10 flex flex-col animate-slide-up anim-delay-300">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-museum-brown/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <span className="text-sm font-semibold text-museum-brown/80">Ringkasan</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Nama</span>
                  <span className="text-museum-brown/70 font-medium">{nama || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Asal</span>
                  <span className="text-museum-brown/70 font-medium">{asal || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Tanggal</span>
                  <span className="text-museum-brown/70 font-medium">{tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Status</span>
                  <span className="text-museum-brown/70 font-medium">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Kategori</span>
                  <span className="text-museum-brown/70 font-medium">{selectedTicket ? selectedTicket.label : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-museum-brown/50 text-xs font-semibold uppercase tracking-wider">Pembayaran</span>
                  <span className="text-museum-brown/70 font-medium">{paymentMethod}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 bg-museum-brown/5 rounded-lg p-4 flex justify-between items-center">
                <span className="text-sm font-bold text-museum-brown uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-museum-gold">{formatRupiah(total)}</span>
              </div>

              {/* Pesan Button */}
              <button
                onClick={handlePesan}
                disabled={!nama || selectedCategory === null}
                className="w-full mt-4 py-3 rounded-lg bg-museum-gold text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-museum-gold-light transition-all shadow-lg shadow-museum-gold/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
                Pesan Tiket
              </button>
            </div>
          </div>
        </div>

        {/* Admin button (bottom-left) */}
        <button
          onClick={handleLogout}
          className="fixed bottom-5 left-5 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-museum-gold/20 rounded-full px-4 py-2 text-xs text-museum-brown/60 hover:text-museum-brown hover:border-museum-gold/50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={showConfirm}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        data={{ nama, total }}
      />

      {/* Success Toast */}
      <SuccessToast show={showSuccess} />
    </div>
  )
}
