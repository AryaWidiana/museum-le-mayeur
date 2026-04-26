import React, { Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import BrushFilter from './components/BrushFilter'

// Lazy-load admin pages — only downloaded when the user navigates to them
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'))
const CashierPage = React.lazy(() => import('./pages/CashierPage'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const TransaksiPage = React.lazy(() => import('./pages/TransaksiPage'))
const StatistikPage = React.lazy(() => import('./pages/StatistikPage'))
const LaporanPage = React.lazy(() => import('./pages/LaporanPage'))
const ManajemenKategoriPage = React.lazy(() => import('./pages/ManajemenKategoriPage'))
const RiwayatPage = React.lazy(() => import('./pages/RiwayatPage'))
const ProfilPage = React.lazy(() => import('./pages/ProfilPage'))

// Lazy-load below-the-fold sections for faster initial paint
const Statistik = React.lazy(() => import('./sections/Statistik'))
const TentangMuseum = React.lazy(() => import('./sections/TentangMuseum'))
const VisiMisi = React.lazy(() => import('./sections/VisiMisi'))
const TiketJadwal = React.lazy(() => import('./sections/TiketJadwal'))
const KoleksiMuseum = React.lazy(() => import('./sections/KoleksiMuseum'))
const SejarahMuseum = React.lazy(() => import('./sections/SejarahMuseum'))
const Footer = React.lazy(() => import('./sections/Footer'))

// Loading spinner for admin pages
function AdminFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#F8F6F1]">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-museum-gold/30 border-t-museum-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-museum-brown/60 font-medium">Memuat halaman...</p>
      </div>
    </div>
  )
}

// Minimal loading placeholder that matches the page aesthetic
function SectionFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-museum-gold/30 border-t-museum-gold rounded-full animate-spin" />
    </div>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/admin') {
    return <Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>
  }

  if (path === '/kasir') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><CashierPage /></Suspense>
  }

  if (path === '/dashboard') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>
  }

  if (path === '/transaksi') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><TransaksiPage /></Suspense>
  }

  if (path === '/statistik-admin') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><StatistikPage /></Suspense>
  }

  if (path === '/laporan') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><LaporanPage /></Suspense>
  }

  if (path === '/manajemen-kategori') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><ManajemenKategoriPage /></Suspense>
  }

  if (path === '/riwayat') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><RiwayatPage /></Suspense>
  }

  if (path === '/profil') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <Suspense fallback={<AdminFallback />}><ProfilPage /></Suspense>
  }

  return (
    <div className="min-h-screen bg-museum-beige">
      <BrushFilter />
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Statistik />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TentangMuseum />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <VisiMisi />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <TiketJadwal />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <KoleksiMuseum />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SejarahMuseum />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </div>
  )
}

export default App
