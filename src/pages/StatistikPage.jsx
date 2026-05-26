import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

// ─── Breakdown Card ─────────────────────────────────────────
function BreakdownCard({ label, value, max, accent = 'museum-brown' }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 3) : 0
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

// ─── Loading Skeleton ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-10" />
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full" />
    </div>
  )
}

// ─── Payment List ────────────────────────────────────────────
function PaymentList({ title, data, icon = '🇮🇩', loading }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-museum-brown">{title}</h3>
      </div>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-28" />
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-12" />
            </div>
          ))
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada transaksi</p>
        ) : (
          data.map((row, idx) => {
            const tanggal = row.createdAt
              ? new Date(row.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : '-'
            const pembayaran = row.paymentMethod || 'Cash'
            const nama = row.name || '-'
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-museum-gold/30 hover:bg-museum-gold/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-museum-brown/5 text-museum-brown flex items-center justify-center font-bold text-sm">
                    {nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-museum-brown leading-tight">{nama}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{tanggal}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${
                    pembayaran === 'Cash'
                      ? 'bg-green-50 text-green-600 border-green-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {pembayaran}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function StatistikPage() {
  const [loading, setLoading] = useState(true)
  const [breakdown, setBreakdown] = useState({ WNI: [], WNA: [] })
  const [transactions, setTransactions] = useState({ WNI: [], WNA: [] })

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const fetchAll = async () => {
      try {
        setLoading(true)

        // 1. Fetch statistik breakdown WNI/WNA per kategori nama
        const statsRes = await fetch('http://localhost:5000/api/statistics', { headers })
        const statsData = await statsRes.json()

        // 2. Fetch semua transaksi (limit besar untuk statistik)
        const txRes = await fetch('http://localhost:5000/api/transactions?limit=100', { headers })
        const txData = await txRes.json()

        if (statsRes.ok && statsData.success) {
          // Hitung breakdown per nama kategori menggunakan transaksi
          const wniMap = {}
          const wnaMap = {}

          if (txData.success) {
            ;(txData.data || []).forEach(t => {
              const type = t.category?.type || 'WNI'
              const name = t.category?.name || 'Lainnya'
              if (type === 'WNI') {
                wniMap[name] = (wniMap[name] || 0) + 1
              } else {
                wnaMap[name] = (wnaMap[name] || 0) + 1
              }
            })
          }

          setBreakdown({
            WNI: Object.entries(wniMap).map(([label, value]) => ({ label, value })),
            WNA: Object.entries(wnaMap).map(([label, value]) => ({ label, value })),
          })

          // Split transaksi by type untuk payment list (ambil 6 terbaru per kategori)
          const allTx = txData.data || []
          setTransactions({
            WNI: allTx.filter(t => (t.category?.type || 'WNI') === 'WNI').slice(0, 6),
            WNA: allTx.filter(t => t.category?.type === 'WNA').slice(0, 6),
          })
        }
      } catch (err) {
        console.error('Error fetching statistik:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const totalWNI = breakdown.WNI.reduce((s, d) => s + d.value, 0)
  const totalWNA = breakdown.WNA.reduce((s, d) => s + d.value, 0)
  const maxWNI = breakdown.WNI.length > 0 ? Math.max(...breakdown.WNI.map(d => d.value)) : 1
  const maxWNA = breakdown.WNA.length > 0 ? Math.max(...breakdown.WNA.map(d => d.value)) : 1

  return (
    <AdminLayout activePage="Statistik" title="Statistik" subtitle="Analisis data pengunjung">
      <div className="space-y-8">
        {/* Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Breakdown WNI */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇮🇩</span>
                <h3 className="text-sm font-bold text-museum-brown">Breakdown WNI</h3>
              </div>
              <span className="text-xs font-bold text-museum-brown bg-museum-brown/5 px-3 py-1 rounded-full">
                {totalWNI} Total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : breakdown.WNI.length === 0
                  ? <p className="col-span-2 text-sm text-gray-400 text-center py-8">Belum ada data WNI</p>
                  : breakdown.WNI.map((item, idx) => (
                    <BreakdownCard key={idx} label={item.label} value={item.value} max={maxWNI} accent="museum-brown" />
                  ))
              }
            </div>
          </div>

          {/* Breakdown WNA */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">✈️</span>
                <h3 className="text-sm font-bold text-museum-brown">Breakdown WNA</h3>
              </div>
              <span className="text-xs font-bold text-museum-gold bg-museum-gold/10 px-3 py-1 rounded-full">
                {totalWNA} Total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : breakdown.WNA.length === 0
                  ? <p className="col-span-2 text-sm text-gray-400 text-center py-8">Belum ada data WNA</p>
                  : breakdown.WNA.map((item, idx) => (
                    <BreakdownCard key={idx} label={item.label} value={item.value} max={maxWNA} accent="museum-gold" />
                  ))
              }
            </div>
          </div>
        </div>

        {/* Payment Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PaymentList
            title="Metode Pembayaran WNI"
            data={transactions.WNI}
            icon="🇮🇩"
            loading={loading}
          />
          <PaymentList
            title="Metode Pembayaran WNA"
            data={transactions.WNA}
            icon="✈️"
            loading={loading}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
