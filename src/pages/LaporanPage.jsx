import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { downloadPdf } from '../utils/exportPdf'

function formatRp(num) {
  return 'Rp ' + num.toLocaleString('id-ID').replace(/,/g, '.')
}

// ─── Stat Card Component ────────────────────────────────────
function LaporanStatCard({ icon, iconBg, title, value, subtitle, accentColor }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${accentColor} border-t border-r border-b border-gray-100 flex flex-col justify-between`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">{title}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-museum-brown leading-tight">{value}</p>
        <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function LaporanPage() {
  const [visitorStatus, setVisitorStatus] = useState('WNI')
  const [timeTab, setTimeTab] = useState('Bulan Ini')
  
  const [reportData, setReportData] = useState({
    detailKategoriWNI: [],
    detailKategoriWNA: [],
    totalTransaksi: 0,
    totalPendapatan: 0,
    rataRataHarian: 0
  })

  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    // Guard: prevent exporting empty PDF
    if (reportData.totalTransaksi === 0) {
      alert('Tidak ada transaksi pada periode ini. Ubah filter waktu terlebih dahulu.')
      return
    }

    setIsExporting(true)
    await downloadPdf('pdf-laporan', `Laporan_Pendapatan_Museum_${new Date().getTime()}.pdf`)
    
    try {
      const token = sessionStorage.getItem('admin_token')
      await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'export',
          title: 'Export Laporan PDF',
          detail: `Mengekspor laporan pendapatan (Periode: ${timeTab})`
        })
      })
    } catch (e) { console.error('Gagal mencatat log', e) }

    setIsExporting(false)
  }

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('admin_token')
        const response = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/report?timeTab=${timeTab}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          setReportData({
            detailKategoriWNI: data.data.detailKategoriWNI || [],
            detailKategoriWNA: data.data.detailKategoriWNA || [],
            totalTransaksi: data.data.totalTransaksi || 0,
            totalPendapatan: data.data.totalPendapatan || 0,
            rataRataHarian: data.data.rataRataHarian || 0
          })
        }
      } catch (err) {
        console.error('Error fetching report:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [timeTab])

  const currentData = visitorStatus === 'WNI' ? reportData.detailKategoriWNI : reportData.detailKategoriWNA

  const headerAction = (
    <button 
      onClick={handleExportPDF}
      disabled={isExporting}
      className="flex items-center gap-2 bg-museum-brown text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-museum-brown-dark transition-all shadow-sm disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {isExporting ? 'Mengekspor...' : 'Export PDF'}
    </button>
  )

  return (
    <AdminLayout activePage="Laporan" title="Laporan" subtitle="Ringkasan Laporan Pendapatan" headerAction={headerAction}>
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up anim-delay-100">
          <LaporanStatCard 
            icon={<svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            iconBg="bg-museum-gold/15" title="Total Transaksi" value={reportData.totalTransaksi.toLocaleString()} subtitle={`Transaksi ${timeTab.toLowerCase()}`} accentColor="border-l-museum-gold"
          />
          <LaporanStatCard 
            icon={<span className="text-lg font-bold text-museum-brown">$</span>}
            iconBg="bg-museum-brown/10" title="Total Pendapatan" value={formatRp(reportData.totalPendapatan)} subtitle={timeTab} accentColor="border-l-museum-brown"
          />
          <LaporanStatCard 
            icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
            iconBg="bg-green-100" title="Rata-rata Harian" value={formatRp(reportData.rataRataHarian)} subtitle="per hari" accentColor="border-l-green-500"
          />
        </div>

        {/* Detail per Kategori Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full animate-slide-up anim-delay-200">
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

              {/* Time Tabs */}
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {['Hari Ini', 'Bulan Ini', 'Tahun Ini'].map((tab) => (
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
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 text-xs">Loading data...</td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 text-xs">Belum ada transaksi</td>
                  </tr>
                ) : (
                  currentData.map((row, idx) => {
                    const pctValue = parseInt(row.presentase.replace('%', ''))
                    // Rotate colors for category indicators
                    const dotColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500']
                    const dotColor = dotColors[idx % dotColors.length]
                    
                    return (
                      <tr key={idx} className="hover:bg-museum-gold/5 transition-colors group">
                        {/* Kategori */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                            <span className="text-xs font-bold text-museum-brown">{row.kategori}</span>
                          </div>
                        </td>
                        
                        {/* Jumlah */}
                        <td className="px-4 py-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-museum-brown">{row.jumlah}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Orang</span>
                          </div>
                        </td>
                        
                        {/* Pendapatan */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-museum-brown/90 px-2.5 py-1 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-white transition-colors">
                            {formatRp(row.pendapatan)}
                          </span>
                        </td>
                        
                        {/* Presentase */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-museum-brown w-8">{row.presentase}</span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${dotColor} opacity-80`} 
                                style={{ width: `${pctValue}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ═══════════ PDF TEMPLATE (hidden, captured by exportPdf.js clone strategy) ═══════════ */}
      <div style={{ overflow: 'hidden', height: 0, position: 'relative' }}>
        <div id="pdf-laporan" style={{
          width: '1122px',
          background: '#fff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          color: '#2D1810',
          boxSizing: 'border-box',
          padding: '48px 64px',
        }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
              MUSEUM LE MAYEUR
            </h1>
            <p style={{ fontSize: '11px', color: '#7C6A5C', margin: 0 }}>
              Jl. Hang Tuah, Sanur, Denpasar Selatan, Kota Denpasar, Bali
            </p>
          </div>

          <div style={{ borderBottom: '3px double #2D1810', marginBottom: '24px', paddingBottom: '4px' }}>
            <div style={{ borderBottom: '1px solid #2D1810' }} />
          </div>

          <h2 style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>
            LAPORAN RINGKASAN PENDAPATAN
          </h2>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#888', margin: '0 0 24px 0' }}>
            Periode: {timeTab} &nbsp;|&nbsp; Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* ── SUMMARY CARDS ── */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Total Transaksi', value: reportData.totalTransaksi.toLocaleString(), unit: 'transaksi', bg: '#FFF8F0', border: '#E8C87A' },
              { label: 'Total Pendapatan', value: formatRp(reportData.totalPendapatan), unit: timeTab, bg: '#F8F6F1', border: '#A08060' },
              { label: 'Rata-rata Harian', value: formatRp(reportData.rataRataHarian), unit: 'per hari', bg: '#F0FFF4', border: '#48BB78' },
            ].map((card, i) => (
              <div key={i} style={{
                flex: 1,
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: '8px',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', margin: '0 0 6px 0' }}>{card.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 2px 0', color: '#2D1810' }}>{card.value}</p>
                <p style={{ fontSize: '9px', color: '#aaa', margin: 0 }}>{card.unit}</p>
              </div>
            ))}
          </div>

          {/* ── WNI TABLE ── */}
          <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', borderBottom: '2px solid #E8C87A', paddingBottom: '6px', display: 'inline-block' }}>
            Detail Pendapatan — WNI
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#2D1810', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Kategori</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Jumlah</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Pendapatan</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {reportData.detailKategoriWNI.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: '#aaa', border: '1px solid #e5e5e5' }}>Belum ada transaksi WNI</td></tr>
              ) : reportData.detailKategoriWNI.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#FAFAF8' : '#fff' }}>
                  <td style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{row.kategori}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{row.jumlah} Orang</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{formatRp(row.pendapatan)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.presentase}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── WNA TABLE ── */}
          <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', borderBottom: '2px solid #E8C87A', paddingBottom: '6px', display: 'inline-block' }}>
            Detail Pendapatan — WNA
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#2D1810', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Kategori</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Jumlah</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Pendapatan</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {reportData.detailKategoriWNA.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: '#aaa', border: '1px solid #e5e5e5' }}>Belum ada transaksi WNA</td></tr>
              ) : reportData.detailKategoriWNA.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#FAFAF8' : '#fff' }}>
                  <td style={{ padding: '9px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{row.kategori}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{row.jumlah} Orang</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{formatRp(row.pendapatan)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.presentase}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* ── SIGNATURE ── */}
          <div style={{ marginTop: '48px', textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '56px' }}>Petugas Penanggung Jawab,</p>
            <p style={{ fontSize: '12px', fontWeight: '700', textDecoration: 'underline', margin: '0 0 2px 0' }}>{sessionStorage.getItem('admin_name') || 'Admin'}</p>
            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Museum Le Mayeur</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
