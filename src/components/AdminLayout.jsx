import React, { useState, useEffect, useRef } from 'react'

// ─── Icon Components ────────────────────────────────────────
function MenuIcon({ type, className = "w-5 h-5" }) {
  const props = { className, fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24" }
  switch(type) {
    case 'grid': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
    case 'receipt': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
    case 'chart': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    case 'file': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    case 'folder': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
    case 'clock': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'user': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    default: return null
  }
}

const sidebarMenuItems = [
  { section: 'MENU UTAMA', items: [
    { label: 'Dashboard', icon: 'grid', href: '/dashboard' },
    { label: 'Transaksi', icon: 'receipt', href: '/transaksi' },
    { label: 'Statistik', icon: 'chart', href: '/statistik-admin' },
    { label: 'Laporan', icon: 'file', href: '/laporan' },
  ]},
  { section: 'MANAJEMEN', items: [
    { label: 'Manajemen Kategori', icon: 'folder', href: '/manajemen-kategori' },
    { label: 'Riwayat', icon: 'clock', href: '/riwayat' },
    { label: 'Profil', icon: 'user', href: '/profil' },
  ]},
]

export default function AdminLayout({ activePage, title, subtitle, headerAction, children }) {
  // Read admin info from sessionStorage (updated by ProfilPage on edit)
  const [adminName, setAdminName] = useState(() => {
    return sessionStorage.getItem('admin_name') || sessionStorage.getItem('admin_user') || 'Admin'
  })
  const [adminProfilePic, setAdminProfilePic] = useState(() => {
    return sessionStorage.getItem('admin_profile_pic') || null
  })
  const [adminRole, setAdminRole] = useState(() => {
    return sessionStorage.getItem('admin_role') || 'admin'
  })
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [showNotifPopup, setShowNotifPopup] = useState(false)
  const [notifCount, setNotifCount] = useState(() => {
    return parseInt(localStorage.getItem('admin_notifications_count') || '0', 10)
  })
  const [notifList, setNotifList] = useState(() => {
    return JSON.parse(localStorage.getItem('admin_notifications_list') || '[]')
  })

  const menuRef = useRef(null)
  const notifRef = useRef(null)

  // ── GLOBAL PROFILE INITIALIZER ──
  // Fetches profile from backend on EVERY mount to keep Sidebar in sync,
  // even after browser refresh or new login without visiting ProfilPage.
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) return

    const API = import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app'
    fetch(`${API}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json().catch(() => ({})))
      .then(data => {
        if (data.success && data.data?.admin) {
          const a = data.data.admin
          const name = a.name || a.username || 'Admin'
          sessionStorage.setItem('admin_name', name)
          sessionStorage.setItem('admin_user', a.username)
          if (a.profilePic) sessionStorage.setItem('admin_profile_pic', a.profilePic)
          sessionStorage.setItem('admin_role', a.role || 'admin')

          setAdminName(name)
          setAdminProfilePic(a.profilePic || null)
          setAdminRole(a.role || 'admin')
        }
      })
      .catch(() => {}) // silently fail — sessionStorage fallback is already shown
  }, [])

  // Listen for custom event dispatched when profile is updated
  useEffect(() => {
    const handleProfileUpdate = () => {
      setAdminName(sessionStorage.getItem('admin_name') || sessionStorage.getItem('admin_user') || 'Admin')
      setAdminProfilePic(sessionStorage.getItem('admin_profile_pic') || null)
      setAdminRole(sessionStorage.getItem('admin_role') || 'admin')
    }

    window.addEventListener('admin_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('admin_profile_updated', handleProfileUpdate)
  }, [])

  // Listen for localStorage changes (for notifications across tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If event key is undefined (custom event) or matches our keys
      if (!e || !e.key || e.key === 'admin_notifications_count' || e.key === 'admin_notifications_list') {
        setNotifCount(parseInt(localStorage.getItem('admin_notifications_count') || '0', 10))
        setNotifList(JSON.parse(localStorage.getItem('admin_notifications_list') || '[]'))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Handle clicking outside the profile menu to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPopup(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_name')
    sessionStorage.removeItem('admin_profile_pic')
    sessionStorage.removeItem('admin_role')
    window.location.href = '/admin'
  }

  const displayName = adminName
  const roleLabel = adminRole === 'superadmin' ? 'Super Admin' : 'Admin Museum'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6F1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="w-[200px] bg-museum-brown-dark flex flex-col flex-shrink-0">
        {/* Profile */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-museum-gold/30 flex items-center justify-center text-museum-gold font-bold text-sm border border-museum-gold/50 shadow-sm overflow-hidden flex-shrink-0">
            {adminProfilePic ? (
              <img src={adminProfilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">{displayName}</p>
            <p className="text-white/50 text-[10px]">{roleLabel}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {sidebarMenuItems.map((sec) => (
            <div key={sec.section}>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest px-2 mb-2">{sec.section}</p>
              <ul className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = item.label === activePage
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => item.href && (window.location.href = item.href)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-museum-gold text-museum-brown-dark shadow-md'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        } ${!item.href && !isActive ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                      >
                        <MenuIcon type={item.icon} className="w-4 h-4" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Back to Kasir */}
        <div className="p-3">
          <button
            onClick={() => { window.location.href = '/kasir' }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-museum-gold hover:bg-museum-gold-light text-white text-xs font-semibold transition-colors shadow-md shadow-museum-gold/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Kembali ke Kasir
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between relative z-20 animate-slide-up">
          <div>
            <h1 className="text-lg font-bold text-museum-brown">{title}</h1>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {headerAction && (
              <div className="mr-2 border-r border-gray-100 pr-4">
                {headerAction}
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative mr-2" ref={notifRef}>
              <button 
                onClick={() => {
                  setShowNotifPopup(!showNotifPopup)
                  if (!showNotifPopup && notifCount > 0) { // Clear red dot when OPENING
                    setNotifCount(0)
                    localStorage.setItem('admin_notifications_count', '0')
                    window.dispatchEvent(new Event('storage'))
                  }
                }}
                className="text-gray-400 hover:text-museum-brown transition-colors relative flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              {showNotifPopup && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                    <p className="text-xs font-bold text-museum-brown">Notifikasi Terbaru</p>
                    {notifList.length > 0 && (
                      <button 
                        onClick={() => {
                          setNotifList([]);
                          localStorage.removeItem('admin_notifications_list');
                          window.dispatchEvent(new Event('storage'));
                        }}
                        className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifList.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifList.map((notif) => (
                          <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-bold text-museum-brown truncate pr-2">{notif.nama}</p>
                              <span className="text-[9px] text-gray-400 flex-shrink-0">{notif.waktu}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-museum-gold/10 text-museum-gold rounded text-[9px] font-bold">
                                {notif.kategori}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium border-l border-gray-200 pl-2">
                                {notif.pembayaran}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-xs text-gray-400">Belum ada notifikasi baru.</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-50 text-center bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { window.location.href = '/transaksi' }}>
                    <button className="text-[11px] text-museum-gold font-bold">
                      Lihat Semua Transaksi
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-museum-gold/20 flex items-center justify-center text-museum-gold font-bold text-xs border border-museum-gold/30 overflow-hidden flex-shrink-0">
                  {adminProfilePic ? (
                    <img src={adminProfilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-museum-brown leading-tight">{displayName}</p>
                  <p className="text-[10px] text-gray-400">{roleLabel}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-bold text-museum-brown">Akun Anda</p>
                    <p className="text-[10px] text-gray-400 truncate">{displayName}</p>
                  </div>
                  
                  <button 
                    onClick={() => { window.location.href = '/profil' }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-museum-brown hover:bg-museum-gold/5 transition-colors"
                  >
                    <MenuIcon type="user" className="w-4 h-4" />
                    Lihat Profil
                  </button>
                  
                  <div className="border-t border-gray-50 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-scale">
          {children}
        </main>
      </div>
    </div>
  )
}
