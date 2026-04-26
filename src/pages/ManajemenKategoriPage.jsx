import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

function formatRp(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID').replace(/,/g, '.')
}

export default function ManajemenKategoriPage() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('Semua')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({ name: '', type: 'WNI', price: '' })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredData = categories.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    const matchJenis = filterJenis === 'Semua' || item.type === filterJenis
    return matchSearch && matchJenis
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return
    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await fetch(`${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        fetchCategories()
      } else {
        alert(data.message || 'Gagal menghapus kategori')
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    }
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ name: '', type: 'WNI', price: '' })
    setShowModal(true)
  }

  const openEditModal = (cat) => {
    setEditId(cat.id)
    setFormData({ name: cat.name, type: cat.type, price: cat.price })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const token = sessionStorage.getItem('admin_token')
      const url = editId ? `${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/categories/${editId}` : `${(import.meta.env.DEV ? 'http://localhost:5000' : 'https://museum-le-mayeur.vercel.app')}/api/categories`
      const method = editId ? 'PUT' : 'POST'

      const payload = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price)
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setShowModal(false)
        fetchCategories()
      } else {
        alert(data.message || 'Gagal menyimpan kategori')
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    }
  }

  // Header action dihapus sesuai permintaan

  return (
    <AdminLayout 
      activePage="Manajemen Kategori" 
      title="Manajemen Kategori" 
      subtitle="Kelola kategori tiket museum"
    >
      <div className="flex flex-col h-full space-y-6 relative">
        
        {/* Header Controls & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4 animate-slide-up anim-delay-100">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-bold text-museum-brown mr-2">Data Kategori</h3>
            
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-museum-brown placeholder:text-gray-400 outline-none focus:border-museum-gold focus:bg-white w-[180px] transition-all"
              />
            </div>

            {/* Filter Jenis (Buttons) */}
            <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-0.5">
              {['Semua', 'WNI', 'WNA'].map((jenis) => (
                <button
                  key={jenis}
                  onClick={() => setFilterJenis(jenis)}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    filterJenis === jenis
                      ? 'bg-white text-museum-brown shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {jenis}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-museum-gold text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#d4af37] transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Kategori
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden animate-slide-up anim-delay-200">
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#F8F6F1] shadow-sm">
                <tr className="text-museum-brown border-b border-gray-200">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[60px]">ID</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Nama Kategori</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Jenis Pengunjung</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider px-6 py-4">Harga Tiket</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider px-6 py-4 w-[150px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        <p className="text-sm font-semibold">Tidak ada kategori ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-museum-gold/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-semibold text-museum-brown/50">{row.id}</td>
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
                            onClick={() => openEditModal(row)}
                            className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-yellow-100 transition-colors border border-yellow-100/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(row.id)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors border border-red-100/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-museum-brown mb-4">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Nama Kategori</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none"
                    placeholder="Contoh: Dewasa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Jenis Pengunjung</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none bg-white"
                  >
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Harga (Rp)</label>
                  <input 
                    type="number" required min="0"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none"
                    placeholder="Contoh: 15000"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-museum-gold text-white rounded-lg hover:bg-[#d4af37]">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
