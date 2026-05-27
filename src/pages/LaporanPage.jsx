import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'


const baseURL = import.meta.env.VITE_API_URL || '/api';
function formatRp(num) {
  if (!num) return 'Rp 0'
  return 'Rp ' + Number(num).toLocaleString('id-ID')
}

function formatRpShort(num) {
  if (!num) return 'Rp 0'
  if (num >= 1_000_000_000) return 'Rp ' + (num / 1_000_000_000).toFixed(1) + ' M'
  if (num >= 1_000_000) return 'Rp ' + (num / 1_000_000).toFixed(1) + ' Jt'
  return 'Rp ' + Number(num).toLocaleString('id-ID')
}

// ─── Stat Card Component ─────────────────────────────────────
function LaporanStatCard({ icon, iconBg, title, value, subtitle, accentColor, loading }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${accentColor} border-t border-r border-b border-gray-100 flex flex-col justify-between`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{title}</span>
      </div>
      <div>
        {loading ? (
          <div className="h-7 bg-gray-200 rounded w-32 animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-museum-brown leading-tight">{value}</p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function LaporanPage() {
  const [visitorStatus, setVisitorStatus] = useState('WNI')
  const [timeTab, setTimeTab] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalTransaction: 0, totalRevenue: 0, avgHarian: 0 })
  const [tableData, setTableData] = useState({ WNI: [], WNA: [] })

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const fetchAll = async () => {
      try {
        setLoading(true)

        // 1. Dashboard summary untuk stat cards
        const dashRes = await fetch(`${baseURL}/dashboard`, { headers })
        const dashData = await dashRes.json()

        // 2. Semua transaksi untuk tabel kategori
        const txRes = await fetch(`${baseURL}/transactions?limit=500`, { headers })
        const txData = await txRes.json()

        if (dashRes.ok && dashData.success) {
          const total = dashData.data.totalTransaction || 0
          const revenue = Number(dashData.data.totalRevenue) || 0

          // Hitung hari unik dari transaksi untuk rata-rata harian
          const allTx = txData.data || []
          const uniqueDays = new Set(
            allTx.map(t => new Date(t.createdAt).toISOString().split('T')[0])
          ).size
          const avg = uniqueDays > 0 ? Math.round(revenue / uniqueDays) : 0

          setStats({ totalTransaction: total, totalRevenue: revenue, avgHarian: avg })

          // Hitung pendapatan & jumlah per kategori nama
          const wniMap = {}
          const wnaMap = {}

          allTx.forEach(t => {
            const type = t.category?.type || 'WNI'
            const name = t.category?.name || 'Lainnya'
            const price = Number(t.totalPrice) || 0
            const map = type === 'WNI' ? wniMap : wnaMap
            if (!map[name]) map[name] = { jumlah: 0, pendapatan: 0 }
            map[name].jumlah += 1
            map[name].pendapatan += price
          })

          const toTable = (map) => {
            const entries = Object.entries(map)
            const totalPend = entries.reduce((s, [, v]) => s + v.pendapatan, 0)
            return entries.map(([kategori, v]) => ({
              kategori,
              jumlah: v.jumlah,
              pendapatan: v.pendapatan,
              presentase: totalPend > 0 ? Math.round((v.pendapatan / totalPend) * 100) + '%' : '0%',
            })).sort((a, b) => b.pendapatan - a.pendapatan)
          }

          setTableData({ WNI: toTable(wniMap), WNA: toTable(wnaMap) })
        }
      } catch (err) {
        console.error('Error fetching laporan:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const currentData = visitorStatus === 'WNI' ? tableData.WNI : tableData.WNA

  return (
    <AdminLayout activePage="Laporan" title="Laporan" subtitle="Ringkasan Laporan Pendapatan">
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <LaporanStatCard
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            iconBg="bg-museum-gold/15" title="Total Transaksi"
            value={stats.totalTransaction.toLocaleString('id-ID')}
            subtitle="Semua transaksi tercatat" accentColor="border-l-museum-gold" loading={loading}
          />
          <LaporanStatCard
            icon={<span className="text-lg font-bold text-museum-brown">Rp</span>}
            iconBg="bg-museum-brown/10" title="Total Pendapatan"
            value={formatRpShort(stats.totalRevenue)}
            subtitle="Total keseluruhan" accentColor="border-l-museum-brown" loading={loading}
          />
          <LaporanStatCard
            icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
            iconBg="bg-green-100" title="Rata-rata Harian"
            value={formatRpShort(stats.avgHarian)}
            subtitle="per hari aktif" accentColor="border-l-green-500" loading={loading}
          />
        </div>

        {/* Detail per Kategori Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <h3 className="text-sm font-bold text-museum-brown">Detail per Kategori</h3>

            <div className="flex gap-4">
              {/* WNI / WNA Toggle */}
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {['WNI', 'WNA'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setVisitorStatus(s)}
                    className={`px-4 py-1.5 text-[11px] font-semibold transition-all ${
                      visitorStatus === s
                        ? 'bg-white text-museum-brown shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Time Tabs (UI only — filter bisa ditambahkan nanti) */}
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {['Semua', 'Hari Ini', 'Bulan Ini'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeTab(tab)}
                    className={`px-3 py-1.5 text-[10px] font-semibold transition-all ${
                      timeTab === tab
                        ? 'bg-white text-museum-brown shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F6F1] text-museum-brown">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-4 py-3">Kategori</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-4 py-3">Jumlah</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-4 py-3">Pendapatan</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-4 py-3">Presentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 rounded w-32" /></td>
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                      <td className="px-4 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    </tr>
                  ))
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-gray-400 py-10">
                      Belum ada data {visitorStatus}
                    </td>
                  </tr>
                ) : currentData.map((row, idx) => {
                  const pctValue = parseInt(row.presentase.replace('%', ''))
                  const dotColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500']
                  const dotColor = dotColors[idx % dotColors.length]

                  return (
                    <tr key={idx} className="hover:bg-museum-gold/5 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className="text-xs font-bold text-museum-brown">{row.kategori}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-museum-brown">{row.jumlah}</span>
                          <span className="text-[10px] text-gray-400 font-medium">Orang</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-museum-brown/90 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white transition-colors">
                          {formatRp(row.pendapatan)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-museum-brown w-8">{row.presentase}</span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${dotColor} opacity-80`}
                              style={{ width: `${pctValue}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
