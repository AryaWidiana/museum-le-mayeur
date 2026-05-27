import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'


const baseURL = import.meta.env.VITE_API_URL || '/api';
// ─── Helpers ─────────────────────────────────────────────────
const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

/** ✅ Gunakan tanggal lokal (bukan ISO UTC) untuk menghindari timezone offset */
function toLocalDateKey(dateStr) {
  const d = new Date(dateStr)
  // Format: YYYY-M-D menggunakan waktu lokal perangkat
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Buat array 7 hari terakhir { day, dateKey } dari hari ini ke belakang (local time) */
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      day: DAY_LABELS[d.getDay()],
      dateKey: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
    }
  })
}

function formatRp(num) {
  if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(2) + ' M'
  if (num >= 1000000) return 'Rp ' + num.toLocaleString('id-ID')
  return 'Rp ' + num.toLocaleString('id-ID')
}

// ─── Simple Bar Chart ───────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value))
  const yLabels = [0, max * 0.25, max * 0.5, max * 0.75, max]

  return (
    <div className="flex items-end gap-1 h-[220px] mt-4 relative pl-12 pr-2">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 w-10 text-right">
        {[...yLabels].reverse().map((v, i) => (
          <span key={i}>{v >= 1000000 ? (v/1000000).toFixed(1) + 'jt' : (v/1000).toFixed(0) + 'k'}</span>
        ))}
      </div>
      {data.map((d, i) => {
        const pct = Math.max((d.value / max) * 100, 2)
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
            <div
              className="w-full max-w-[38px] rounded-t-xl bg-gradient-to-t from-museum-brown to-[#9a7b54] shadow-[0_4px_12px_rgba(82,56,31,0.15)] transition-all duration-500 group-hover:from-museum-gold group-hover:to-[#eec560] group-hover:shadow-[0_8px_16px_rgba(212,175,55,0.3)] group-hover:-translate-y-1 cursor-pointer relative"
              style={{ height: `${pct}%` }}
            >
              {/* Tooltip on Hover */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {formatRp(d.value)}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 mt-3 group-hover:text-museum-gold transition-colors">{d.day}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stats Card ─────────────────────────────────────────────
function StatCard({ icon, iconBg, value, change, period }) {
  return (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col justify-between min-h-[120px] group transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-museum-gold/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[11px] text-museum-brown/50 font-bold uppercase tracking-wider bg-gray-50/50 px-2.5 py-1 rounded-full">{period}</span>
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-black text-museum-brown leading-tight tracking-tight">{value}</p>
        <p className="text-[11px] font-bold text-green-600 mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
          {change}
        </p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────
export default function AdminDashboard() {
  const [chartTab, setChartTab] = useState('Minggu')
  const [visitorTab, setVisitorTab] = useState('Hari Ini')
  const [visitorStatus, setVisitorStatus] = useState('WNI')

  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalTransaction: 0,
    bulanIniRevenue: 0,
    tahunIniRevenue: 0,
    transactions: [],
    weeklyData: getLast7Days().map(d => ({ day: d.day, value: 0 })),
    monthlyData: MONTH_LABELS.map(m => ({ day: m, value: 0 })),
  })

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${baseURL}/dashboard`, { headers })
        const data = await res.json()
        if (res.ok && data.success) {
          const txList = data.data.transactions || []
          const now = new Date()

          const bulanIni = txList
            .filter(t => { const d = new Date(t.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
            .reduce((s, t) => s + Number(t.totalPrice || 0), 0)

          const tahunIni = txList
            .filter(t => new Date(t.createdAt).getFullYear() === now.getFullYear())
            .reduce((s, t) => s + Number(t.totalPrice || 0), 0)

          // ✅ Weekly: group by LOCAL date to fix timezone shift
          const dailyRevenue = {}
          txList.forEach(t => {
            const key = toLocalDateKey(t.createdAt)
            dailyRevenue[key] = (dailyRevenue[key] || 0) + Number(t.totalPrice || 0)
          })
          const weekly = getLast7Days().map(({ day, dateKey }) => ({
            day,
            value: dailyRevenue[dateKey] || 0,
          }))

          // Monthly: group by month index (0-11) for current year
          const monthRevenue = Array(12).fill(0)
          txList
            .filter(t => new Date(t.createdAt).getFullYear() === now.getFullYear())
            .forEach(t => {
              const m = new Date(t.createdAt).getMonth()
              monthRevenue[m] += Number(t.totalPrice || 0)
            })
          const monthly = MONTH_LABELS.map((label, i) => ({ day: label, value: monthRevenue[i] }))

          setDashboardData(prev => ({
            ...prev,
            totalRevenue: data.data.totalRevenue || 0,
            totalTransaction: data.data.totalTransaction || 0,
            transactions: txList,
            bulanIniRevenue: bulanIni,
            tahunIniRevenue: tahunIni,
            weeklyData: weekly,
            monthlyData: monthly,
          }))
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
      }
    }

    const fetchStatistics = async () => {
      try {
        const res = await fetch(`${baseURL}/statistics`, { headers })
        const data = await res.json()
        if (res.ok && data.success) {
          // Map PENDAPATAN (bukan jumlah pengunjung) per hari ke 7 hari terakhir
          // Kita gunakan data transactions dari dashboard yang sudah ter-fetch
          // Fetch ulang via endpoint dashboard untuk mendapat revenue per hari
          const revenueMap = {}
          ;(data.data.pengunjungPerHari || []).forEach(({ tanggal, totalPengunjung }) => {
            // pengunjungPerHari hanya ada jumlah; kita perlukan revenue —
            // gunakan setDashboardData callback agar bisa akses transactions
            revenueMap[tanggal] = totalPengunjung // akan di-override di bawah
          })

          // Override dengan revenue asli dari transactions state
          setDashboardData(prev => {
            const dailyRevenue = {}
            prev.transactions.forEach(t => {
              const dateStr = new Date(t.createdAt).toISOString().split('T')[0]
              dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + Number(t.totalPrice || 0)
            })
            const weekly = getLast7Days().map(({ day, date }) => ({
              day,
              value: dailyRevenue[date] || 0,
            }))
            return { ...prev, weeklyData: weekly }
          })
        }
      } catch (err) {
        console.error('Error fetching statistics:', err)
      }
    }

    fetchDashboard()
  }, [])

  // Process visitor status
  const processedVisitors = { WNI: [], WNA: [] }
  const ticketCounts = {}
  dashboardData.transactions.forEach(t => {
    const type = t.category?.type || 'WNI'
    const name = t.category?.name || 'Lainnya'
    if (!ticketCounts[type]) ticketCounts[type] = {}
    if (!ticketCounts[type][name]) ticketCounts[type][name] = 0
    ticketCounts[type][name] += 1
  })

  ;['WNI', 'WNA'].forEach(type => {
    if (ticketCounts[type]) {
      processedVisitors[type] = Object.entries(ticketCounts[type]).map(([label, value]) => ({ label, value }))
    }
  })

  // Global status control logic
  const [globalStatus, setGlobalStatus] = useState('Buka')
  const [statusSaving, setStatusSaving] = useState(false)
  const isAdminSuper = sessionStorage.getItem('admin_role') === 'SUPER_ADMIN'

  const handleStatusChange = async (newStatus) => {
    setGlobalStatus(newStatus)
    setStatusSaving(true)
    try {
      // Mock API call based on user's instruction to use fetch API with state management
      await fetch(`${baseURL}/settings/status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <AdminLayout activePage="Dashboard" title="Dashboard" subtitle="Ringkasan data hari ini">
      <div className="space-y-6">
        
        {/* Master Status Control for Super Admin */}
        {isAdminSuper && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-museum-brown flex items-center gap-2">
                <svg className="w-4 h-4 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Master Status Operasional
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Kontrol status operasional museum secara global untuk pengunjung.</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 relative">
              {['Buka', 'Tutup Sementara/Renovasi', 'Libur Hari Raya'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusSaving}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all whitespace-nowrap ${
                    globalStatus === s
                      ? s === 'Buka' ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                        : s === 'Libur Hari Raya' ? 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/30'
                        : 'bg-red-500 text-white shadow-sm shadow-red-500/30'
                      : 'text-gray-500 hover:text-museum-brown hover:bg-white disabled:opacity-50'
                  }`}
                >
                  {s}
                </button>
              ))}
              {statusSaving && (
                <div className="absolute right-[-24px] top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-museum-gold/30 border-t-museum-gold rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBg="bg-museum-gold/15" value={formatRp(dashboardData.totalRevenue)} change="Real-time data" period="Total Pendapatan"
          />
          <StatCard
            icon={<svg className="w-5 h-5 text-museum-brown" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
            iconBg="bg-museum-brown/10" value={formatRp(dashboardData.bulanIniRevenue)} change="Bulan berjalan" period="Bulan Ini"
          />
          <StatCard
            icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
            iconBg="bg-green-100" value={formatRp(dashboardData.tahunIniRevenue)} change="Tahun berjalan" period="Tahun Ini"
          />
          <StatCard
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            iconBg="bg-museum-gold/15" value={dashboardData.totalTransaction.toLocaleString()} change="Real-time data" period="Total Transaksi"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          {/* Weekly Revenue Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-museum-brown">
                {chartTab === 'Minggu' ? 'Pendapatan Mingguan' : 'Pendapatan Bulanan'}
              </h3>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                {['Minggu', 'Bulan'].map((tab) => (
                  <button key={tab} onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 text-[10px] font-semibold transition-all ${chartTab === tab ? 'bg-white text-museum-brown shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >{tab}</button>
                ))}
              </div>
            </div>
            <BarChart data={chartTab === 'Minggu' ? dashboardData.weeklyData : dashboardData.monthlyData} />
          </div>

          {/* Visitor Summary */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-museum-brown">Ringkasan Pengunjung</h3>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                {['Hari Ini', 'Bulan Ini', 'Tahun Ini'].map((tab) => (
                  <button key={tab} onClick={() => setVisitorTab(tab)}
                    className={`px-2.5 py-1.5 text-[10px] font-semibold transition-all ${visitorTab === tab ? 'bg-white text-museum-brown shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >{tab}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {['WNI', 'WNA'].map((s) => (
                <button key={s} onClick={() => setVisitorStatus(s)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${visitorStatus === s ? 'bg-museum-gold text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                >{s === 'WNI' ? '🇮🇩' : '✈️'} {s}</button>
              ))}
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {processedVisitors[visitorStatus]?.length > 0 ? processedVisitors[visitorStatus].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-museum-brown" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-museum-brown">{item.value.toLocaleString()}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
