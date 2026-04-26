import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

// ─── Timeline Components ──────────────────────────────────────
const TimelineIcon = ({ type }) => {
  if (type === 'transaction') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-green-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>
      </div>
    )
  }
  if (type === 'login') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-blue-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
      </div>
    )
  }
  if (type === 'edit') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-yellow-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
      </div>
    )
  }
  if (type === 'export') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-purple-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
      </div>
    )
  }
  if (type === 'add') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-museum-gold/10 flex items-center justify-center border-4 border-white shadow-sm z-10 text-museum-gold">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </div>
    )
  }
  return (
    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm z-10 text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function RiwayatPage() {
  const [historyData, setHistoryData] = useState({
    transactions: [],
    activities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('admin_token')
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur.vercel.app')}/api/history?limit=15`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          setHistoryData({
            transactions: data.data.transactions || [],
            activities: data.data.activities || []
          })
        }
      } catch (err) {
        console.error('Error fetching history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  return (
    <AdminLayout activePage="Riwayat" title="Riwayat" subtitle="Log aktivitas sistem terbaru">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Kolom Kiri - Transaksi Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px] animate-slide-up anim-delay-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-museum-brown">Riwayat Transaksi</h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-md">Terbaru</span>
          </div>
          
          <div className="relative pl-4 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gray-100"></div>

            {loading ? (
              <p className="text-xs text-gray-400 pl-8">Loading riwayat transaksi...</p>
            ) : historyData.transactions.length === 0 ? (
              <p className="text-xs text-gray-400 pl-8">Belum ada riwayat transaksi</p>
            ) : historyData.transactions.map((t) => {
              const timeString = new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              const type = t.category?.type || 'WNI'
              const catName = t.category?.name || 'Lainnya'

              return (
                <div key={t.id} className="relative pl-12 group">
                  <TimelineIcon type="transaction" />
                  <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100 group-hover:bg-white group-hover:border-museum-gold/30 group-hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-museum-brown">Transaksi #{t.id}</span>
                      <span className="text-[10px] font-bold text-museum-gold">{timeString}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{t.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}>{type}</span>
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{catName}</span>
                      <span className="bg-green-50 text-green-600 border border-green-100 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{t.payment || 'Cash'}</span>
                      <span className="bg-white text-museum-brown border border-gray-200 shadow-sm text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{formatRupiah(t.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kolom Kanan - Aktivitas Admin */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px] animate-slide-up anim-delay-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-museum-brown">Aktivitas Admin</h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-md">Terbaru</span>
          </div>

          <div className="relative pl-4 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gray-100"></div>

            {loading ? (
              <p className="text-xs text-gray-400 pl-8">Loading aktivitas admin...</p>
            ) : historyData.activities.length === 0 ? (
              <p className="text-xs text-gray-400 pl-8">Belum ada aktivitas admin</p>
            ) : historyData.activities.map((act) => {
              const timeString = new Date(act.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              let iconType = 'edit'
              if (act.action.toLowerCase().includes('login')) iconType = 'login'
              else if (act.action.toLowerCase().includes('export')) iconType = 'export'
              else if (act.action.toLowerCase().includes('tambah')) iconType = 'add'
              else if (act.action.toLowerCase().includes('transaksi')) iconType = 'transaction'

              return (
                <div key={act.id} className="relative pl-12 group">
                  <TimelineIcon type={iconType} />
                  <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100 group-hover:bg-white group-hover:border-blue-300 group-hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-museum-brown">{act.action}</span>
                      <span className="text-[10px] font-bold text-gray-400">{timeString}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{act.details || 'System Activity'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 px-2 py-1 rounded">Admin ID: {act.adminId}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
