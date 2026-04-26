import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

function formatRp(num) {
  if (num >= 1000000000) return 'Rp ' + (num / 1000000000).toFixed(2) + ' M'
  if (num >= 1000000) return 'Rp ' + num.toLocaleString('id-ID')
  return 'Rp ' + num.toLocaleString('id-ID')
}

// ─── Simple Bar Chart ───────────────────────────────────────
function BarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-end gap-1 h-[220px] mt-4 relative pl-12 pr-2 animate-pulse">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] w-10 text-right">
          {[...Array(5)].map((_, i) => <div key={i} className="h-2 bg-gray-200 rounded w-full ml-auto"></div>)}
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full max-w-[38px] rounded-t-xl bg-gray-200" style={{ height: `${30 + Math.random() * 50}%` }}></div>
            <div className="w-6 h-2 bg-gray-100 rounded mt-3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) return <div className="h-[220px] mt-4 flex items-center justify-center text-gray-400 text-xs">Belum ada data</div>

  const max = Math.max(...data.map(d => d.value), 1) // avoid div by zero
  const yLabels = [0, max * 0.25, max * 0.5, max * 0.75, max]

  return (
    <div className="flex items-end gap-1 h-[220px] mt-4 relative pl-12 pr-2">
      <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 w-10 text-right">
        {[...yLabels].reverse().map((v, i) => (
          <span key={i}>{v >= 1000000 ? (v/1000000).toFixed(1) + 'jt' : v >= 1000 ? (v/1000).toFixed(0) + 'k' : v.toFixed(0)}</span>
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
function StatCard({ icon, iconBg, value, change, period, loading }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[110px]">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{period}</span>
      </div>
      <div>
        {loading ? (
          <div className="animate-pulse space-y-2 mt-1">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold text-museum-brown leading-tight">{value}</p>
            <p className="text-[10px] text-green-600 mt-1">↑ {change}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────
export default function AdminDashboard() {
  const [chartTab, setChartTab] = useState('Minggu')
  const [visitorTab, setVisitorTab] = useState('Hari Ini')
  const [visitorStatus, setVisitorStatus] = useState('WNI')
  const [loading, setLoading] = useState(true)

  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalTransaction: 0,
    transactions: [],
    weeklyData: []
  })

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('admin_token')
        const response = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/dashboard?timeTab=${visitorTab}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          setDashboardData({
            totalRevenue: data.data.totalRevenue || 0,
            totalTransaction: data.data.totalTransaction || 0,
            transactions: data.data.transactions || [],
            weeklyData: data.data.weeklyData || []
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [visitorTab])

  // Process visitor status based on real fetched data
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

  return (
    <AdminLayout activePage="Dashboard" title="Dashboard" subtitle="Ringkasan data real-time">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 animate-slide-up anim-delay-100">
          <StatCard
            loading={loading}
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBg="bg-museum-gold/15" value={formatRp(dashboardData.totalRevenue)} change={`Data ${visitorTab.toLowerCase()}`} period="Total Pendapatan"
          />
          <StatCard
            loading={loading}
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            iconBg="bg-museum-gold/15" value={dashboardData.totalTransaction.toLocaleString()} change={`Data ${visitorTab.toLowerCase()}`} period="Total Transaksi"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
          {/* Weekly Revenue Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-slide-up anim-delay-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-museum-brown">Pendapatan 7 Hari Terakhir</h3>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <button className="px-3 py-1.5 text-[10px] font-semibold transition-all bg-white text-museum-brown shadow-sm">
                  Mingguan
                </button>
              </div>
            </div>
            <BarChart data={dashboardData.weeklyData} loading={loading} />
          </div>

          {/* Visitor Summary */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-slide-up anim-delay-300">
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
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                      <div className="w-20 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="w-10 h-4 bg-gray-200 rounded" />
                  </div>
                ))
              ) : processedVisitors[visitorStatus]?.length > 0 ? (
                processedVisitors[visitorStatus].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-museum-brown" />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-museum-brown">{item.value.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi di filter ini</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
