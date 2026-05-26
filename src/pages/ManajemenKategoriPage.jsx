import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

const BASE = 'http://localhost:5000'

function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function formatRp(num) {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID')
}

// ─── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-6" /></td>
      <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-32" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-16" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-24" /></td>
      <td className="px-6 py-4 text-right"><div className="h-6 bg-gray-200 rounded w-28 ml-auto" /></td>
    </tr>
  )
}

// ─── Category Form Modal (Add / Edit) ─────────────────────────
function CategoryModal({ open, mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', type: 'WNI', price: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setErr('')
      setForm(
        mode === 'edit' && initial
          ? { name: initial.name, type: initial.type, price: String(initial.price) }
          : { name: '', type: 'WNI', price: '' }
      )
    }
  }, [open, mode, initial])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.type || !form.price) { setErr('Semua field wajib diisi'); return }
    const priceNum = parseInt(form.price)
    if (isNaN(priceNum) || priceNum < 0) { setErr('Harga harus berupa angka positif'); return }

    try {
      setSaving(true)
      setErr('')
      const url = mode === 'edit' ? `${BASE}/api/categories/${initial.id}` : `${BASE}/api/categories`
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ name: form.name, type: form.type, price: priceNum }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSaved(data.data, mode)
        onClose()
      } else {
        setErr(data.message || 'Gagal menyimpan kategori')
      }
    } catch {
      setErr('Tidak dapat terhubung ke server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <h3 className="font-bold text-museum-brown text-lg mb-6">
          {mode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h3>
        {err && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-4">{err}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis */}
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1.5 block">Jenis Pengunjung</label>
            <div className="grid grid-cols-2 gap-2">
              {['WNI', 'WNA'].map(t => (
                <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    form.type === t
                      ? t === 'WNI' ? 'bg-red-500 text-white border-red-500' : 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}>
                  {t === 'WNI' ? '🇮🇩' : '✈️'} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Nama Kategori</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Contoh: Dewasa, Pelajar, Shooting..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>

          {/* Harga */}
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Harga Tiket (Rp)</label>
            <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Contoh: 10000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-museum-brown/60 text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-museum-gold text-white text-sm font-semibold hover:bg-[#d4af37] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</>
                : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function DeleteModal({ open, category, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  if (!open || !category) return null

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setErr('')
      const res = await fetch(`${BASE}/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onDeleted(category.id)
        onClose()
      } else {
        setErr(data.message || 'Gagal menghapus kategori')
      }
    } catch {
      setErr('Tidak dapat terhubung ke server')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 className="font-bold text-museum-brown text-lg mb-2">Hapus Kategori?</h3>
        <p className="text-sm text-gray-500 mb-1">
          Anda akan menghapus kategori <strong className="text-museum-brown">{category.name}</strong> ({category.type})
        </p>
        <p className="text-xs text-red-400 mb-6">Aksi ini tidak dapat dibatalkan dan dapat mempengaruhi data transaksi.</p>
        {err && <p className="text-xs text-red-500 mb-4">{err}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-museum-brown/60 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menghapus...</>
              : 'Ya, Hapus'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function ManajemenKategoriPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('Semua')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ─── Fetch categories ──────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${BASE}/api/categories`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) {
        setCategories(data.data || [])
      } else {
        setError(data.message || 'Gagal memuat data kategori')
      }
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // ─── Handlers ──────────────────────────────────────────────
  const openAdd = () => { setModalMode('add'); setEditTarget(null); setModalOpen(true) }

  const openEdit = (cat) => { setModalMode('edit'); setEditTarget(cat); setModalOpen(true) }

  const openDelete = (cat) => { setDeleteTarget(cat); setDeleteModalOpen(true) }

  const handleSaved = (savedCat, mode) => {
    if (mode === 'edit') {
      setCategories(prev => prev.map(c => c.id === savedCat.id ? savedCat : c))
    } else {
      setCategories(prev => [...prev, savedCat])
    }
  }

  const handleDeleted = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  // ─── Filter ────────────────────────────────────────────────
  const filteredData = categories.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    const matchJenis = filterJenis === 'Semua' || item.type === filterJenis
    return matchSearch && matchJenis
  })


  return (
    <AdminLayout
      activePage="Manajemen Kategori"
      title="Manajemen Kategori"
      subtitle="Kelola kategori tiket museum"
    >
      <div className="flex flex-col h-full space-y-6">

        {/* ─── Header Controls ──────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-bold text-museum-brown mr-2">Data Kategori</h3>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-museum-brown placeholder:text-gray-400 outline-none focus:border-museum-gold focus:bg-white w-[180px] transition-all" />
            </div>

            {/* Filter Jenis */}
            <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-0.5">
              {['Semua', 'WNI', 'WNA'].map((jenis) => (
                <button key={jenis} onClick={() => setFilterJenis(jenis)}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    filterJenis === jenis ? 'bg-white text-museum-brown shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {jenis}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-gray-400">{loading ? '...' : `${filteredData.length} kategori`}</span>
          </div>

          <button onClick={openAdd}
            className="flex items-center gap-2 bg-museum-gold text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#d4af37] transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Kategori
          </button>
        </div>

        {/* ─── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
            <button onClick={fetchCategories} className="ml-auto text-xs underline hover:no-underline">Coba lagi</button>
          </div>
        )}

        {/* ─── Table ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#F8F6F1] shadow-sm">
                <tr className="text-museum-brown border-b border-gray-200">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[60px]">No</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Nama Kategori</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Jenis Pengunjung</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Harga Tiket</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[150px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        <p className="text-sm font-semibold">
                          {categories.length === 0 ? 'Belum ada kategori' : 'Tidak ada hasil untuk pencarian ini'}
                        </p>
                        {categories.length > 0 && (
                          <button onClick={() => { setSearch(''); setFilterJenis('Semua') }}
                            className="mt-2 text-xs text-museum-gold underline hover:no-underline">Reset filter</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-museum-gold/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-semibold text-museum-brown/50">{idx + 1}</td>
                      <td className="px-6 py-4 text-xs font-bold text-museum-brown">{row.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                          row.type === 'WNI' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {row.type === 'WNI' ? '🇮🇩' : '✈️'} {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-museum-brown/90 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                          {formatRp(row.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(row)}
                            className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-yellow-100 transition-colors border border-yellow-100/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => openDelete(row)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors border border-red-100/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}
      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        initial={editTarget}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
      <DeleteModal
        open={deleteModalOpen}
        category={deleteTarget}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={handleDeleted}
      />
    </AdminLayout>
  )
}
