import React, { Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import BrushFilter from './components/BrushFilter'
import AdminLogin from './pages/AdminLogin'
import CashierPage from './pages/CashierPage'
import AdminDashboard from './pages/AdminDashboard'
import TransaksiPage from './pages/TransaksiPage'
import StatistikPage from './pages/StatistikPage'
import LaporanPage from './pages/LaporanPage'
import ManajemenKategoriPage from './pages/ManajemenKategoriPage'
import RiwayatPage from './pages/RiwayatPage'
import ProfilPage from './pages/ProfilPage'

// Lazy-load below-the-fold sections for faster initial paint
const Statistik = React.lazy(() => import('./sections/Statistik'))
const TentangMuseum = React.lazy(() => import('./sections/TentangMuseum'))
const VisiMisi = React.lazy(() => import('./sections/VisiMisi'))
const TiketJadwal = React.lazy(() => import('./sections/TiketJadwal'))
const KoleksiMuseum = React.lazy(() => import('./sections/KoleksiMuseum'))
const SejarahMuseum = React.lazy(() => import('./sections/SejarahMuseum'))
const Footer = React.lazy(() => import('./sections/Footer'))

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
    return <AdminLogin />
  }

  if (path === '/kasir') {
    // Protect kasir route — redirect to /admin if not logged in
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <CashierPage />
  }

  if (path === '/dashboard') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <AdminDashboard />
  }

  if (path === '/transaksi') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <TransaksiPage />
  }

  if (path === '/statistik-admin') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <StatistikPage />
  }

  if (path === '/laporan') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <LaporanPage />
  }

  if (path === '/manajemen-kategori') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <ManajemenKategoriPage />
  }

  if (path === '/riwayat') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <RiwayatPage />
  }

  if (path === '/profil') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (!isLoggedIn) {
      window.location.href = '/admin'
      return null
    }
    return <ProfilPage />
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
