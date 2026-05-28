import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

const baseURL = import.meta.env.VITE_API_URL || '/api'

function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-6" /></td>
      <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-32" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-24" /></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-20" /></td>
      <td className="px-6 py-4 text-right"><div className="h-6 bg-gray-200 rounded w-28 ml-auto" /></td>
    </tr>
  )
}

function UserModal({ open, mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'ADMIN' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setErr('')
      setShowPassword(false)
      setForm(
        mode === 'edit' && initial
          ? { name: initial.name || '', username: initial.username || '', password: '', role: initial.role || 'ADMIN' }
          : { name: '', username: '', password: '', role: 'ADMIN' }
      )
    }
  }, [open, mode, initial])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.username || (mode === 'add' && !form.password)) {
      setErr('Nama, username, dan password wajib diisi untuk pengguna baru')
      return
    }

    try {
      setSaving(true)
      setErr('')
      const url = mode === 'edit' ? `${baseURL}/users/${initial.id}` : `${baseURL}/users`
      const method = mode === 'edit' ? 'PUT' : 'POST'
      
      const payload = { ...form }
      if (mode === 'edit' && !payload.password) {
        delete payload.password // don't send empty password if not changing
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSaved(data.data || { id: mode === 'edit' ? initial.id : Date.now(), ...payload }, mode)
        onClose()
      } else {
        setErr(data.message || 'Gagal menyimpan data pengguna')
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
          {mode === 'edit' ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        </h3>
        {err && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-4">{err}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Nama Lengkap</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nama pengguna"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Username</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Username unik"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Password {mode === 'edit' && '(Kosongkan jika tidak diubah)'}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="******"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-museum-brown focus:outline-none">
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1.5 block">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {['ADMIN', 'SUPER_ADMIN'].map(t => (
                <button type="button" key={t} onClick={() => setForm(f => ({ ...f, role: t }))}
                  className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    form.role === t
                      ? 'bg-museum-brown text-white border-museum-brown'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}>
                  {t === 'ADMIN' ? 'Kasir (Admin)' : 'Super Admin'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-museum-brown/60 text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-museum-gold text-white text-sm font-semibold hover:bg-[#d4af37] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
              {saving
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</>
                : mode === 'edit' ? 'Simpan' : 'Tambah'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ open, user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')

  if (!open || !user) return null

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setErr('')
      const res = await fetch(`${baseURL}/users/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onDeleted(user.id)
        onClose()
      } else {
        setErr(data.message || 'Gagal menghapus pengguna')
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
        <h3 className="font-bold text-museum-brown text-lg mb-2">Hapus Pengguna?</h3>
        <p className="text-sm text-gray-500 mb-1">
          Anda akan menghapus akun <strong className="text-museum-brown">{user.username}</strong>
        </p>
        <p className="text-xs text-red-400 mb-6">Aksi ini tidak dapat dibatalkan.</p>
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

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editTarget, setEditTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${baseURL}/users`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) {
        setUsers(data.data || [])
      } else {
        // Fallback for demo when backend is not ready
        setUsers([
          { id: 1, name: 'Admin Utama', username: 'admin', role: 'SUPER_ADMIN' },
          { id: 2, name: 'Kasir Satu', username: 'kasir1', role: 'ADMIN' },
        ])
        console.warn('Backend route /users not found, using fallback data.')
      }
    } catch {
      // Mock data when network fails entirely
      setUsers([
        { id: 1, name: 'Admin Utama', username: 'admin', role: 'SUPER_ADMIN' },
        { id: 2, name: 'Kasir Satu', username: 'kasir1', role: 'ADMIN' },
      ])
      setError('Tidak dapat terhubung ke server. Data dummy ditampilkan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openAdd = () => { setModalMode('add'); setEditTarget(null); setModalOpen(true) }
  const openEdit = (user) => { setModalMode('edit'); setEditTarget(user); setModalOpen(true) }
  const openDelete = (user) => { setDeleteTarget(user); setDeleteModalOpen(true) }

  const handleSaved = (savedUser, mode) => {
    if (mode === 'edit') {
      setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u))
    } else {
      setUsers(prev => [...prev, savedUser])
    }
  }

  const handleDeleted = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const filteredData = users.filter(item => {
    const term = search.toLowerCase()
    return (item.name?.toLowerCase() || '').includes(term) || (item.username?.toLowerCase() || '').includes(term)
  })

  return (
    <AdminLayout activePage="Manajemen Pengguna" title="Manajemen Pengguna" subtitle="Kelola akun kasir dan admin">
      <div className="flex flex-col h-full space-y-6">

        {/* ─── Header Controls ──────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-bold text-museum-brown mr-2">Data Pengguna</h3>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengguna..."
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-museum-brown placeholder:text-gray-400 outline-none focus:border-museum-gold focus:bg-white w-[220px] transition-all" />
            </div>

            <span className="text-[10px] text-gray-400">{loading ? '...' : `${filteredData.length} pengguna`}</span>
          </div>

          <button onClick={openAdd}
            className="flex items-center gap-2 bg-museum-gold text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#d4af37] transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Pengguna
          </button>
        </div>

        {/* ─── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 text-sm text-yellow-700 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
            <button onClick={fetchUsers} className="ml-auto text-xs underline hover:no-underline">Tutup</button>
          </div>
        )}

        {/* ─── Cards Grid ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse h-[200px]"></div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-base font-semibold">{users.length === 0 ? 'Belum ada data pengguna' : 'Tidak ada hasil pencarian'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map(row => (
                <div key={row.id} className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  {/* Role Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase border ${
                      row.role === 'SUPER_ADMIN' ? 'bg-museum-brown/10 text-museum-brown border-museum-brown/20 shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {row.role === 'SUPER_ADMIN' && '👑 '} {row.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-museum-gold/30 to-museum-brown/20 flex items-center justify-center text-museum-brown font-black text-xl shadow-inner border-2 border-white overflow-hidden shrink-0">
                      {row.profilePic ? (
                        <img src={row.profilePic} alt={row.name || row.username} className="w-full h-full object-cover" />
                      ) : (
                        (row.name || row.username || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-museum-brown leading-tight">{row.name || '-'}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">@{row.username}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-50/50 rounded-xl p-3 border border-green-100/50 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest mb-1">Hadir</p>
                      <p className="text-lg font-black text-green-600 leading-none">{row.stats?.hadir ?? 0} <span className="text-[10px] font-semibold text-green-600/50">hr</span></p>
                    </div>
                    <div className="bg-yellow-50/50 rounded-xl p-3 border border-yellow-100/50 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-yellow-600/70 uppercase tracking-widest mb-1">Libur</p>
                      <p className="text-lg font-black text-yellow-600 leading-none">{row.stats?.libur ?? 0} <span className="text-[10px] font-semibold text-yellow-600/50">hr</span></p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button onClick={() => openEdit(row)}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 border border-transparent transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      Edit
                    </button>
                    <button onClick={() => openDelete(row)}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-transparent transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UserModal open={modalOpen} mode={modalMode} initial={editTarget} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      <DeleteModal open={deleteModalOpen} user={deleteTarget} onClose={() => setDeleteModalOpen(false)} onDeleted={handleDeleted} />
    </AdminLayout>
  )
}
