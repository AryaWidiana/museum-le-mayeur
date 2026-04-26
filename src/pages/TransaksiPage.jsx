import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { downloadPdf } from '../utils/exportPdf'

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function TransaksiPage() {
  const [search, setSearch] = useState('')
  const [filterPembayaran, setFilterPembayaran] = useState('Semua')
  const [filterKategori, setFilterKategori] = useState('Semua')
  const [timeTab, setTimeTab] = useState('Hari Ini')
  
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (filtered.length === 0) {
      alert('Tidak ada transaksi pada rentang waktu ini. Ubah filter terlebih dahulu.')
      return
    }

    setIsExporting(true)
    await downloadPdf('pdf-transaksi', `Data_Transaksi_Museum_${new Date().getTime()}.pdf`)
    
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
          title: 'Export Transaksi PDF',
          detail: 'Mengekspor data transaksi pengunjung ke PDF'
        })
      })
    } catch (e) { console.error('Gagal mencatat log', e) }

    setIsExporting(false)
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const token = sessionStorage.getItem('admin_token')
        // Using dashboard's existing time filter logic or just passing everything.
        // Actually /api/transactions has it's own logic, but let's just fetch all and filter in frontend for simplicity since take is 100 or so.
        // Or better yet, we can filter in frontend for this demo if data is < 1000.
        const response = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/transactions?limit=500`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          // Map backend transaction to frontend format
          // the api returns data.data as the array of transactions
          const transactionsArray = Array.isArray(data.data) ? data.data : data.data.transactions || [];
          
          const mapped = transactionsArray.map((t, index) => ({
            no: index + 1,
            id: t.id,
            nama: t.name,
            asal: '-', // Asal is not in schema
            tanggal: new Date(t.createdAt).toLocaleDateString('id-ID'),
            kategori: t.category?.name || 'Unknown',
            pembayaran: t.payment === 'Tunai' ? 'Cash' : (t.payment || 'Cash'),
            harga: t.totalPrice,
            createdAt: new Date(t.createdAt)
          }))
          setTransactions(mapped)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  // Get unique values for filters
  const allKategori = ['Semua', ...new Set(transactions.map(t => t.kategori))]
  const allPembayaran = ['Semua', 'Cash', 'QRIS']

  // Filter logic
  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.nama.toLowerCase().includes(search.toLowerCase())
    const matchPembayaran = filterPembayaran === 'Semua' || t.pembayaran === filterPembayaran
    const matchKategori = filterKategori === 'Semua' || t.kategori === filterKategori
    
    // Time filter
    let matchTime = true;
    const now = new Date();
    if (timeTab === 'Hari Ini') {
      matchTime = t.createdAt.toDateString() === now.toDateString()
    } else if (timeTab === 'Bulan Ini') {
      matchTime = t.createdAt.getMonth() === now.getMonth() && t.createdAt.getFullYear() === now.getFullYear()
    } else if (timeTab === 'Tahun Ini') {
      matchTime = t.createdAt.getFullYear() === now.getFullYear()
    }

    return matchSearch && matchPembayaran && matchKategori && matchTime
  })

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
    <AdminLayout activePage="Transaksi" title="Transaksi" subtitle="Kelola data transaksi pengunjung" headerAction={headerAction}>
      <div className="flex flex-col h-full space-y-6">
        {/* Filters Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4 animate-slide-up anim-delay-100">
          <div className="flex items-center gap-2 text-sm font-bold text-museum-brown mr-2">
            <svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filter Data
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pengunjung"
              className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-museum-brown placeholder:text-gray-400 outline-none focus:border-museum-gold focus:bg-white w-[180px] transition-all"
            />
          </div>

          {/* Filter: Pembayaran */}
          <select
            value={filterPembayaran}
            onChange={(e) => setFilterPembayaran(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-museum-brown outline-none focus:border-museum-gold cursor-pointer transition-colors"
          >
            {allPembayaran.map(p => (
              <option key={p} value={p} disabled={p === 'QRIS'}>{p === 'Semua' ? 'Semua pembayaran' : p}</option>
            ))}
          </select>

          {/* Filter: Kategori */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-museum-brown outline-none focus:border-museum-gold cursor-pointer transition-colors"
          >
            {allKategori.map(k => (
              <option key={k} value={k}>{k === 'Semua' ? 'Semua Kategori' : k}</option>
            ))}
          </select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Time Tabs */}
          <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-0.5">
            {['Hari Ini', 'Bulan Ini', 'Tahun Ini', 'Semua Waktu'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all ${
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

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden animate-slide-up anim-delay-200">
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#F8F6F1] shadow-sm">
                <tr className="text-museum-brown border-b border-gray-200">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[60px]">No</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Informasi Pengunjung</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Kategori</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Metode Pembayaran</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider px-6 py-4">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">Loading data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p className="text-sm font-semibold">Tidak ada transaksi ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => (
                    <tr
                      key={t.id}
                      className="hover:bg-museum-gold/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-museum-brown/50">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-museum-gold/10 text-museum-gold flex items-center justify-center font-bold text-sm border border-museum-gold/20 group-hover:scale-105 transition-transform">
                            {t.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-museum-brown leading-tight mb-0.5">{t.nama}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <span>{t.tanggal}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          t.kategori === 'Dewasa' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                          t.kategori === 'Anak-anak' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {t.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                          t.pembayaran === 'Cash' 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {t.pembayaran === 'Cash' ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h1.5v-1.5H18v1.5h1.5v-1.5h-1.5v-1.5h-1.5v1.5h-1.5v1.5z" /></svg>
                          )}
                          {t.pembayaran}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-museum-brown">{formatRupiah(t.harga)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════ PDF TEMPLATE (hidden, captured by exportPdf.js clone strategy) ═══════════ */}
      <div style={{ overflow: 'hidden', height: 0, position: 'relative' }}>
        <div id="pdf-transaksi" style={{
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
            LAPORAN DATA TRANSAKSI PENGUNJUNG
          </h2>
          <p style={{ textAlign: 'center', fontSize: '10px', color: '#888', margin: '0 0 24px 0' }}>
            Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* ── FILTER INFO ── */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Filter Waktu', value: timeTab },
              { label: 'Filter Kategori', value: filterKategori },
              { label: 'Total Transaksi', value: `${filtered.length} transaksi` },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#F8F6F1',
                border: '1px solid #E5E0D5',
                borderRadius: '6px',
                padding: '8px 14px',
              }}>
                <p style={{ fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999', margin: '0 0 3px 0' }}>{item.label}</p>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#2D1810', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* ── DATA TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#2D1810', color: '#fff' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700', fontSize: '10px', width: '40px', borderRight: '1px solid #4A3828' }}>No</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Nama Pengunjung</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Tanggal</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Kategori</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', fontSize: '10px', borderRight: '1px solid #4A3828' }}>Metode</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '10px' }}>Harga</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '14px', textAlign: 'center', color: '#aaa', border: '1px solid #e5e5e5' }}>Tidak ada transaksi</td></tr>
              ) : filtered.map((t, idx) => (
                <tr key={t.id} style={{ background: idx % 2 === 0 ? '#FAFAF8' : '#fff' }}>
                  <td style={{ padding: '8px', textAlign: 'center', fontSize: '9px', color: '#999', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{t.nama}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'left', fontSize: '9px', color: '#666', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{t.tanggal}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{t.kategori}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #eee', borderRight: '1px solid #eee' }}>{t.pembayaran}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #eee' }}>{formatRupiah(t.harga)}</td>
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
