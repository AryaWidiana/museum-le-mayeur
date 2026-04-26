import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

// ─── Breakdown Card ─────────────────────────────────────────
function BreakdownCard({ label, value, max, accent = 'museum-brown' }) {
  const pct = Math.max((value / max) * 100, 3)
  const barColor = accent === 'museum-gold' ? 'bg-museum-gold' : 'bg-museum-brown'
  const valueTxt = accent === 'museum-gold' ? 'text-museum-gold' : 'text-museum-brown'

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-museum-brown/70">{label}</span>
        <span className={`text-lg font-bold ${valueTxt}`}>{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-museum-brown/40 mt-1.5">{value} Orang</p>
    </div>
  )
}

// ─── Payment List ──────────────────────────────────────────
function PaymentList({ title, data, icon = '🇮🇩' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-museum-brown">{title}</h3>
      </div>
      <div className="space-y-3">
        {data.length === 0 ? (
           <p className="text-xs text-gray-400 text-center py-4">Belum ada data pembayaran</p>
        ) : data.map((row) => (
          <div key={row.no} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-museum-gold/30 hover:bg-museum-gold/5 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-museum-brown/5 text-museum-brown flex items-center justify-center font-bold text-sm">
                {row.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-museum-brown leading-tight">{row.nama}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{row.tanggal}</p>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${
                row.pembayaran === 'Cash' 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {row.pembayaran}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function StatistikPage() {
  const [statsData, setStatsData] = useState({
    breakdownWNI: [],
    breakdownWNA: [],
    pembayaranWNI: [],
    pembayaranWNA: []
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('admin_token')
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur-pi7e5zsde-aryawidianas-projects.vercel.app')}/api/statistics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          setStatsData({
            breakdownWNI: data.data.breakdownWNI || [],
            breakdownWNA: data.data.breakdownWNA || [],
            pembayaranWNI: data.data.pembayaranWNI || [],
            pembayaranWNA: data.data.pembayaranWNA || []
          })
        }
      } catch (err) {
        console.error('Error fetching statistics:', err)
      }
    }
    fetchStats()
  }, [])

  const breakdownWNI = statsData.breakdownWNI
  const breakdownWNA = statsData.breakdownWNA
  const pembayaranWNI = statsData.pembayaranWNI
  const pembayaranWNA = statsData.pembayaranWNA

  const totalWNI = breakdownWNI.reduce((s, d) => s + d.value, 0)
  const totalWNA = breakdownWNA.reduce((s, d) => s + d.value, 0)
  const maxWNI = breakdownWNI.length > 0 ? Math.max(...breakdownWNI.map(d => d.value)) : 1
  const maxWNA = breakdownWNA.length > 0 ? Math.max(...breakdownWNA.map(d => d.value)) : 1

  return (
    <AdminLayout activePage="Statistik" title="Statistik" subtitle="Analisis data pengunjung">
      <div className="space-y-8">
        {/* Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Breakdown WNI */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-slide-up anim-delay-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇮🇩</span>
                <h3 className="text-sm font-bold text-museum-brown">Breakdown WNI</h3>
              </div>
              <span className="text-xs font-bold text-museum-brown bg-museum-brown/5 px-3 py-1 rounded-full">{totalWNI} Total</span>
            </div>
            {breakdownWNI.length === 0 ? (
               <p className="text-xs text-gray-400 text-center py-4">Belum ada data transaksi WNI</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {breakdownWNI.map((item, idx) => (
                  <BreakdownCard key={idx} label={item.label} value={item.value} max={maxWNI} accent="museum-brown" />
                ))}
              </div>
            )}
          </div>

          {/* Breakdown WNA */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-slide-up anim-delay-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">✈️</span>
                <h3 className="text-sm font-bold text-museum-brown">Breakdown WNA</h3>
              </div>
              <span className="text-xs font-bold text-museum-gold bg-museum-gold/10 px-3 py-1 rounded-full">{totalWNA} Total</span>
            </div>
            {breakdownWNA.length === 0 ? (
               <p className="text-xs text-gray-400 text-center py-4">Belum ada data transaksi WNA</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {breakdownWNA.map((item, idx) => (
                  <BreakdownCard key={idx} label={item.label} value={item.value} max={maxWNA} accent="museum-gold" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-slide-up anim-delay-300">
          <PaymentList title="Metode Pembayaran WNI Terakhir" data={pembayaranWNI} icon="🇮🇩" />
          <PaymentList title="Metode Pembayaran WNA Terakhir" data={pembayaranWNA} icon="✈️" />
        </div>
      </div>
    </AdminLayout>
  )
}
