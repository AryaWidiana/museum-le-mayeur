import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

const baseURL = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

function formatRupiah(num) {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID')
}

function formatTanggal(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

// ─── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-6" /></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-2 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-16" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-12 ml-auto" /></td>
    </tr>
  )
}

// ─── Category badge colors ────────────────────────────────────
function KategoriBadge({ name }) {
  const map = {
    'Dewasa': 'bg-gray-50 text-gray-600 border-gray-200',
    'Anak - anak': 'bg-orange-50 text-orange-600 border-orange-100',
    'Anak-anak': 'bg-orange-50 text-orange-600 border-orange-100',
    'Pelajar': 'bg-purple-50 text-purple-600 border-purple-100',
    'Pelajar Luar Bali': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Mahasiswa': 'bg-blue-50 text-blue-600 border-blue-100',
    'Mahasiswa Luar Bali': 'bg-cyan-50 text-cyan-600 border-cyan-100',
    'Prewedding': 'bg-pink-50 text-pink-600 border-pink-100',
    'Shooting': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  const cls = map[name] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {name}
    </span>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function TransaksiPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters (client-side)
  const [search, setSearch] = useState('')
  const [filterPembayaran, setFilterPembayaran] = useState('Semua')
  const [filterKategori, setFilterKategori] = useState('Semua')
  const [filterType, setFilterType] = useState('Semua')
  const [timeTab, setTimeTab] = useState('Semua')

  // Pagination
  const [page, setPage] = useState(1)
  const LIMIT = 10

  // ─── State Management untuk Modal Edit & Delete ─────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  const [editName, setEditName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // ─── Export PDF (Print) ───────────────────────────────────
  const handleExportPDF = async () => {
    try {
      await fetch(`${baseURL}/logs/export`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ description: 'Admin mengekspor laporan transaksi ke PDF' })
      })
    } catch { /* ignore error */ }

    const printWindow = window.open('', '_blank')
    const rows = filtered.map((t, idx) => {
      const payment = t.payment || t.paymentMethod || 'Tunai'
      const tanggal = t.createdAt
        ? new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '-'
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#555">${idx + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:600;color:#3b2a1a">${t.name || '-'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666">${t.category?.type || '-'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666">${t.category?.name || '-'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666">${payment}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:700;color:#3b2a1a;text-align:right">Rp ${Number(t.totalPrice||0).toLocaleString('id-ID')}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888">${tanggal}</td>
        </tr>`
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html><html><head>
        <title>Laporan Transaksi - Museum Le Mayeur</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; margin: 24px; color: #3b2a1a; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { font-size: 12px; color: #888; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #f8f6f1; }
          th { padding: 10px 12px; font-size: 11px; text-align: left; color: #8b6a3b; text-transform: uppercase; letter-spacing: .05em; }
          th:last-child, td:last-child { text-align: right; }
          tfoot td { padding: 10px 12px; font-size: 13px; font-weight: 700; }
          @media print { @page { margin: 1cm; } }
        </style>
      </head><body>
        <h1>Laporan Transaksi Museum Le Mayeur</h1>
        <p>Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • ${filtered.length} transaksi ditampilkan</p>
        <table>
          <thead><tr>
            <th>No</th><th>Nama Pengunjung</th><th>Status</th><th>Kategori</th><th>Pembayaran</th><th>Harga</th><th>Tanggal</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td colspan="5" style="border-top:2px solid #e5d38a;padding-top:10px">Total (${filtered.length} transaksi)</td>
            <td style="border-top:2px solid #e5d38a;padding-top:10px;text-align:right">
              Rp ${filtered.reduce((s, t) => s + Number(t.totalPrice||0), 0).toLocaleString('id-ID')}
            </td>
            <td style="border-top:2px solid #e5d38a"></td>
          </tr></tfoot>
        </table>
      </body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 400)
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [txRes, catRes] = await Promise.all([
        fetch(`${baseURL}/transactions?limit=${LIMIT}&page=${page}`, { headers: authHeaders() }),
        fetch(`${baseURL}/categories`, { headers: authHeaders() })
      ])

      const txData = await txRes.json()
      const catData = await catRes.json()

      if (txRes.ok && txData.success) {
        setTransactions(txData.data || [])
      } else {
        setError(txData.message || 'Gagal memuat data transaksi')
      }

      if (catRes.ok && catData.success) {
        setCategories(catData.data || [])
      }

    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Actions ────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editName || !editCategoryId || !selectedTransaction) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`${baseURL}/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name: editName, categoryId: parseInt(editCategoryId) })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? data.data : t))
        setIsEditModalOpen(false)
        setSelectedTransaction(null)
      } else {
        alert(data.message || 'Gagal mengedit transaksi')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return
    setIsDeleting(true)

    try {
      const res = await fetch(`${baseURL}/transactions/${selectedTransaction.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id))
        setIsDeleteModalOpen(false)
        setSelectedTransaction(null)
      } else {
        alert(data.message || 'Gagal menghapus transaksi')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setIsDeleting(false)
    }
  }

  // ─── Filter: date range ─────────────────────────────────────
  const filterByTime = (t) => {
    if (timeTab === 'Semua') return true
    const now = new Date()
    const created = new Date(t.createdAt)
    if (timeTab === 'Hari Ini') {
      return created.toDateString() === now.toDateString()
    }
    if (timeTab === 'Bulan Ini') {
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }
    if (timeTab === 'Tahun Ini') {
      return created.getFullYear() === now.getFullYear()
    }
    return true
  }

  // ─── Apply all filters ────────────────────────────────────
  const filtered = transactions.filter(t => {
    const name = t.name || ''
    const kategori = t.category?.name || ''
    const type = t.category?.type || ''
    const payment = t.payment || t.paymentMethod || ''

    const matchSearch = !search
      || name.toLowerCase().includes(search.toLowerCase())
    const matchPembayaran = filterPembayaran === 'Semua' || payment === filterPembayaran
    const matchKategori = filterKategori === 'Semua' || kategori === filterKategori
    const matchType = filterType === 'Semua' || type === filterType
    return matchSearch && matchPembayaran && matchKategori && matchType && filterByTime(t)
  })

  // ─── Build filter options from fetched data ───────────────
  const allKategori = ['Semua', ...new Set(transactions.map(t => t.category?.name).filter(Boolean))]
  const allPembayaran = ['Semua', 'Cash', 'QRIS']

  const headerAction = (
    <button
      onClick={handleExportPDF}
      className="flex items-center gap-2 bg-museum-brown text-white px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-museum-brown-dark transition-all shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export PDF
    </button>
  )

  return (
    <AdminLayout activePage="Transaksi" title="Transaksi" subtitle="Riwayat data transaksi pengunjung" headerAction={headerAction}>
      <div className="flex flex-col h-full space-y-4 relative z-0">

        {/* ─── Filters Row ─────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-museum-brown mr-1">
            <svg className="w-5 h-5 text-museum-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filter
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              id="search-pengunjung"
              name="searchPengunjung"
              value={search}
              onChange={(e) => { setSearch(e.target.value) }}
              placeholder="Cari nama pengunjung..."
              className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-museum-brown placeholder:text-gray-400 outline-none focus:border-museum-gold focus:bg-white w-[180px] transition-all"
            />
          </div>

          {/* Filter Type WNI/WNA */}
          <select
            id="filter-type"
            name="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-museum-brown outline-none focus:border-museum-gold cursor-pointer transition-colors"
          >
            <option value="Semua">WNI & WNA</option>
            <option value="WNI">WNI</option>
            <option value="WNA">WNA</option>
          </select>

          {/* Filter Pembayaran */}
          <select
            id="filter-pembayaran"
            name="filterPembayaran"
            value={filterPembayaran}
            onChange={(e) => setFilterPembayaran(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-museum-brown outline-none focus:border-museum-gold cursor-pointer transition-colors"
          >
            {allPembayaran.map(p => (
              <option key={p} value={p}>{p === 'Semua' ? 'Semua Pembayaran' : p}</option>
            ))}
          </select>

          {/* Filter Kategori */}
          <select
            id="filter-kategori"
            name="filterKategori"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-museum-brown outline-none focus:border-museum-gold cursor-pointer transition-colors"
          >
            {allKategori.map(k => (
              <option key={k} value={k}>{k === 'Semua' ? 'Semua Kategori' : k}</option>
            ))}
          </select>

          <div className="flex-1" />

          {/* Time Tabs */}
          <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-0.5">
            {['Semua', 'Hari Ini', 'Bulan Ini', 'Tahun Ini'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                  timeTab === tab ? 'bg-white text-museum-brown shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Result count */}
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {loading ? '...' : `${filtered.length} data`}
          </span>
        </div>

        {/* ─── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
            <button onClick={fetchData} className="ml-auto text-xs underline hover:no-underline">Coba lagi</button>
          </div>
        )}

        {/* ─── Table ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#F8F6F1] shadow-sm">
                <tr className="text-museum-brown border-b border-gray-200">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[60px]">No</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Informasi Pengunjung</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Kategori</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Pembayaran</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider px-6 py-4">Harga</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p className="text-sm font-semibold">
                          {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil untuk filter ini'}
                        </p>
                        {transactions.length > 0 && (
                          <button onClick={() => { setSearch(''); setFilterPembayaran('Semua'); setFilterKategori('Semua'); setFilterType('Semua'); setTimeTab('Semua') }}
                            className="mt-2 text-xs text-museum-gold underline hover:no-underline">
                            Reset filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => {
                    const payment = t.payment || t.paymentMethod || 'Tunai'
                    const isCash = payment === 'Tunai' || payment === 'Cash'
                    const typeLabel = t.category?.type || '-'
                    return (
                      <tr key={t.id} className="hover:bg-museum-gold/5 transition-colors group">
                        <td className="px-6 py-4 text-xs font-semibold text-museum-brown/50">{(page - 1) * LIMIT + idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-museum-gold/10 text-museum-gold flex items-center justify-center font-bold text-sm border border-museum-gold/20 group-hover:scale-105 transition-transform">
                              {(t.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-museum-brown leading-tight mb-0.5">{t.name || '-'}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${typeLabel === 'WNA' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                                  {typeLabel}
                                </span>
                                <span>•</span>
                                <span>{formatTanggal(t.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <KategoriBadge name={t.category?.name || '-'} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                            isCash ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {isCash ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /></svg>
                            )}
                            {payment}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-museum-brown">{formatRupiah(t.totalPrice)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(t)
                                setEditName(t.name)
                                setEditCategoryId(t.categoryId || '')
                                setIsEditModalOpen(true)
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                              title="Edit Transaksi"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.125l-2.816.93a.75.75 0 01-.95-.95l.93-2.816a4.5 4.5 0 011.125-1.89l13.416-13.415z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L22.125 9.75M2.25 21h19.5" /></svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransaction(t)
                                setIsDeleteModalOpen(true)
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                              title="Hapus Transaksi"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ──────────────────────────────────── */}
          {!loading && transactions.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-gray-50/50">
              <span className="text-[11px] text-gray-400">
                Halaman {page} • Menampilkan {filtered.length} dari {transactions.length} transaksi
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-museum-brown hover:bg-museum-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={transactions.length < LIMIT}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-museum-brown hover:bg-museum-gold/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal Edit Transaksi ──────────────────────────────────── */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setIsEditModalOpen(false)
            setSelectedTransaction(null)
          }}
        >
          {selectedTransaction && (
            <div 
              className="relative z-[10000] w-full max-w-md p-6 bg-white rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Edit Data Transaksi</h3>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedTransaction(null)
                  }} 
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                
                {/* Warning Alert */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3 items-start">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                    <strong className="font-bold">⚠️ Perhatian:</strong> Setiap perubahan pada data transaksi ini akan dicatat secara permanen di dalam sistem Riwayat Log.
                  </p>
                </div>

                <div>
                  <label htmlFor="edit-nama" className="block text-xs font-bold text-gray-800 mb-1.5">Nama / Informasi Pengunjung</label>
                  <input
                    type="text"
                    id="edit-nama"
                    name="editNama"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-900 rounded-lg outline-none focus:border-museum-gold focus:ring-2 focus:ring-museum-gold/30 transition-all bg-white"
                    placeholder="Contoh: Rombongan SMP 1..."
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-kategori" className="block text-xs font-bold text-gray-800 mb-1.5">Kategori Tiket</label>
                  <select
                    id="edit-kategori"
                    name="editKategori"
                    required
                    value={editCategoryId}
                    onChange={e => setEditCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-900 rounded-lg outline-none focus:border-museum-gold focus:ring-2 focus:ring-museum-gold/30 transition-all bg-white"
                  >
                    <option value="" disabled>Pilih Kategori Baru</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="text-gray-900">{c.type} - {c.name} (Rp {c.price.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                    Mengubah kategori akan menyesuaikan ulang harga transaksi.
                  </p>
                </div>
                
                <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setSelectedTransaction(null)
                    }} 
                    className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-museum-brown rounded-lg hover:bg-museum-brown-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ─── Modal Konfirmasi Hapus ──────────────────────── */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setIsDeleteModalOpen(false)
            setSelectedTransaction(null)
          }}
        >
          {selectedTransaction && (
            <div 
              className="relative z-[10000] w-full max-w-md p-6 bg-white rounded-xl shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 border-4 border-red-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
              
              <p className="text-sm text-gray-600 mb-5 px-4">
                Anda akan menghapus transaksi atas nama <strong className="text-gray-900 font-bold">{selectedTransaction?.name}</strong>.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left mb-6 shadow-inner">
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                  <strong className="font-bold">⚠️ Peringatan:</strong> Aksi penghapusan ini tidak dapat dibatalkan. Data akan hilang, dan aksi ini akan dicatat secara permanen di dalam sistem Riwayat Log.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setSelectedTransaction(null)
                  }} 
                  className="flex-1 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteConfirm} 
                  disabled={isDeleting} 
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    'Ya, Hapus Transaksi'
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
