import React, { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useUser } from '../context/UserContext'

const baseURL = import.meta.env.VITE_API_URL || '/api';

// ─── Helpers ──────────────────────────────────────────────────
function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

// ─── Status badge styles ──────────────────────────────────────
const STATUS_STYLES = {
  Hadir: { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  Libur: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
}

// ─── Profile Field ────────────────────────────────────────────
function ProfileField({ label, value, loading }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-[10px] text-gray-400 font-medium mb-1">{label}</p>
      {loading
        ? <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        : <p className="text-xs font-semibold text-museum-brown">{value || '-'}</p>
      }
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ title, value, subtitle, colorClass, barColor, icon, loading }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start justify-between">
      <div>
        {loading
          ? <div className="h-8 bg-gray-200 rounded w-12 animate-pulse mb-1" />
          : <h4 className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</h4>
        }
        <p className="text-xs font-bold text-museum-brown">{title}</p>
        <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`w-5 h-5 ${colorClass}`}>{icon}</div>
        <div className="flex items-end gap-1 h-8 mt-2">
          <div className={`w-1.5 h-3 ${barColor} rounded-t-sm`} />
          <div className={`w-1.5 h-6 ${barColor} rounded-t-sm`} />
          <div className={`w-1.5 h-4 ${barColor} rounded-t-sm`} />
          <div className={`w-1.5 h-8 ${barColor} rounded-t-sm`} />
        </div>
      </div>
    </div>
  )
}

// ─── Activity Item ────────────────────────────────────────────
function ActivityItem({ activity, onDelete, deleting }) {
  const d = new Date(activity.date)
  const dateNum = d.getDate()
  const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
  const dateDay = dayNames[d.getDay()]
  const fullDate = formatDate(activity.date)
  // For backwards compatibility, map 'Buka' to 'Hadir' and 'Tutup' to 'Libur' in UI if old data exists
  const statusLabel = activity.status === 'Buka' ? 'Hadir' : (activity.status === 'Tutup' ? 'Libur' : activity.status)
  const style = STATUS_STYLES[statusLabel] || STATUS_STYLES['Hadir']

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm group">
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
        <span className="text-sm font-bold text-museum-brown leading-none">{dateNum}</span>
        <span className="text-[10px] text-gray-400 mt-1">{dateDay}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-museum-brown truncate">{activity.desc}</h5>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style.badge}`}>
            {statusLabel}
          </span>
          <span className="text-[10px] text-gray-400 truncate flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fullDate}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(activity.id)}
        disabled={deleting === activity.id}
        title="Hapus kegiatan"
        className="ml-1 w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 disabled:opacity-50"
      >
        {deleting === activity.id
          ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </button>
    </div>
  )
}

// ─── Add Activity Modal ───────────────────────────────────────
function AddActivityModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ date: '', desc: '', status: 'Hadir' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) { setForm({ date: '', desc: '', status: 'Hadir' }); setErr('') }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.desc) { setErr('Tanggal dan nama kegiatan wajib diisi'); return }
    try {
      setSaving(true)
      setErr('')
      const res = await fetch(`${baseURL}/activities`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSaved(data.data)
        onClose()
      } else {
        setErr(data.message || 'Gagal menyimpan kegiatan')
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
        <h3 className="font-bold text-museum-brown text-lg mb-6">Tambah Kegiatan</h3>
        {err && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-4">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Tanggal</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Nama Kegiatan</label>
            <input type="text" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Contoh: Upacara Galungan"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Status Kehadiran</label>
            <div className="grid grid-cols-2 gap-2">
              {['Hadir', 'Libur'].map(s => (
                <button type="button" key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    form.status === s
                      ? s === 'Hadir' ? 'bg-green-500 text-white border-green-500'
                        : 'bg-yellow-400 text-white border-yellow-400'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-museum-brown/60 text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-museum-brown text-white text-sm font-semibold hover:bg-museum-brown-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Menyimpan...</>
                : 'Simpan'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditProfileModal({ open, profile, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open && profile) {
      setName(profile.name || '')
      setErr('')
    }
  }, [open, profile])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErr('Nama profil tidak boleh kosong')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`${baseURL}/auth/me`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onSaved(data.data)
        onClose()
      } else {
        setErr(data.message || 'Gagal memperbarui profil')
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
        <h3 className="font-bold text-museum-brown text-lg mb-6">Edit Nama Profil</h3>
        {err && <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-4">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-museum-brown/70 mb-1 block">Nama Lengkap</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Masukkan nama profil Anda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown outline-none focus:border-museum-gold transition-colors" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-museum-brown/60 text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-museum-gold text-white text-sm font-semibold hover:bg-[#d4af37] transition-colors disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ProfilPage() {
  const { updateUser } = useUser() || {}
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  const [activities, setActivities] = useState([])
  const [actLoading, setActLoading] = useState(true)
  const [deleting, setDeleting] = useState(null) // id yang sedang dihapus

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)

  // Calendar
  const [currentDate, setCurrentDate] = useState(new Date())
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()
  const today = new Date()
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ date: daysInPrevMonth - firstDayOfMonth + i + 1, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === monthIndex && today.getFullYear() === year
    // Check if this day has an activity
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(i).padStart(2,'0')}`
    const act = activities.find(a => a.date?.startsWith(dateStr))
    calendarDays.push({ date: i, isCurrentMonth: true, isToday, activity: act })
  }
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ date: i, isCurrentMonth: false })
  }

  // ─── Fetch profile ──────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true)
      const res = await fetch(`${baseURL}/auth/me`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) {
        setProfile(data.data)
        updateUser?.(data.data) // sync global context
      }
    } catch { /* silently fail */ }
    finally { setProfileLoading(false) }
  }, [updateUser])

  // ─── Fetch activities ───────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    try {
      setActLoading(true)
      const res = await fetch(`${baseURL}/activities`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) setActivities(data.data || [])
    } catch { /* silently fail */ }
    finally { setActLoading(false) }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchActivities()
  }, [fetchProfile, fetchActivities])

  // ─── Upload profile photo ─────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar (JPG/PNG/WebP)'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran gambar maksimal 2MB'); return }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const base64 = evt.target.result // data:image/...;base64,...
      // Optimistic preview
      setProfile(prev => prev ? { ...prev, profilePic: base64 } : prev)
      try {
        setUploadingPhoto(true)
        const res = await fetch(`${baseURL}/auth/me`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ profilePic: base64 }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setProfile(data.data)
          updateUser?.(data.data) // sync sidebar & header
        } else {
          alert(data.message || 'Gagal mengupload foto')
          // Revert on failure
          fetchProfile()
        }
      } catch {
        alert('Tidak dapat terhubung ke server')
        fetchProfile()
      } finally {
        setUploadingPhoto(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // ─── Delete activity ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kegiatan ini?')) return
    try {
      setDeleting(id)
      const res = await fetch(`${baseURL}/activities/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setActivities(prev => prev.filter(a => a.id !== id))
      } else {
        alert(data.message || 'Gagal menghapus kegiatan')
      }
    } catch {
      alert('Tidak dapat terhubung ke server')
    } finally {
      setDeleting(null)
    }
  }

  // ─── After add success ──────────────────────────────────────
  const handleActivitySaved = (newActivity) => {
    setActivities(prev => [newActivity, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
  }

  // ─── Stat counts from real data ─────────────────────────────
  const statCounts = activities.reduce((acc, a) => {
    const statusLabel = a.status === 'Buka' ? 'Hadir' : (a.status === 'Tutup' ? 'Libur' : a.status)
    acc[statusLabel] = (acc[statusLabel] || 0) + 1
    return acc
  }, {})

  const displayName = profile?.name || profile?.username || sessionStorage.getItem('admin_user') || 'Admin'
  const displayRole = profile?.role || 'admin'

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    window.location.href = '/admin'
  }

  return (
    <AdminLayout activePage="Profil" title="Profil" subtitle="Informasi akun admin">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">

        {/* ─── Left Column: Profile Info ─────────────────────── */}
        <div className="w-full lg:w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-shrink-0">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {/* Avatar — shows profilePic or initial */}
              <div className="w-24 h-24 rounded-full bg-museum-brown flex items-center justify-center text-museum-gold text-3xl font-bold border-4 border-white shadow-md overflow-hidden">
                {profile?.profilePic
                  ? <img src={profile.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                  : displayName.charAt(0).toUpperCase()
                }
              </div>
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Ganti foto profil"
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-museum-brown transition-colors disabled:opacity-50"
              >
                {uploadingPhoto
                  ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                }
              </button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {profileLoading
              ? <div className="h-5 bg-gray-200 rounded w-36 animate-pulse mb-2" />
              : <h2 className="text-lg font-bold text-museum-brown">{displayName}</h2>
            }
            <span className="mt-1 px-3 py-1 bg-museum-gold/20 text-museum-gold rounded-full text-[10px] font-bold capitalize mb-4">
              {displayRole}
            </span>

            {/* Tombol Edit Profil */}
            <button onClick={() => setShowEditProfileModal(true)}
              className="mt-2 text-[11px] font-bold text-museum-brown bg-gray-50 border border-gray-200 hover:bg-gray-100 px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Edit Nama
            </button>
          </div>

          <div className="space-y-3 flex-1">
            <ProfileField label="Username" value={profile?.username} loading={profileLoading} />
            <ProfileField label="Nama" value={profile?.name} loading={profileLoading} />
            <ProfileField label="Role" value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '-'} loading={profileLoading} />
            <ProfileField label="Bergabung sejak" value={formatDate(profile?.createdAt)} loading={profileLoading} />
          </div>

          <button onClick={handleLogout}
            className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>

        {/* ─── Right Column ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">

          {/* Top Stats — dihitung dari data real AdminActivity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StatCard
              title="Hadir" value={statCounts['Hadir'] || 0} subtitle="Hari staf hadir"
              colorClass="text-green-600" barColor="bg-green-400" loading={actLoading}
              icon={<svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              title="Libur" value={statCounts['Libur'] || 0} subtitle="Hari staf libur"
              colorClass="text-yellow-600" barColor="bg-yellow-400" loading={actLoading}
              icon={<svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" /></svg>}
            />
          </div>

          {/* Calendar & Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 flex-1">

            {/* Dynamic Calendar */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setCurrentDate(new Date(year, monthIndex - 1, 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-museum-brown hover:bg-gray-50 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <h4 className="text-sm font-bold text-museum-brown">{monthNames[monthIndex]} {year}</h4>
                <button onClick={() => setCurrentDate(new Date(year, monthIndex + 1, 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-museum-brown hover:bg-gray-50 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-museum-brown/60 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, i) => {
                  if (!item.isCurrentMonth) {
                    return <div key={i} className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-gray-300">{item.date}</div>
                  }
                  if (item.isToday) {
                    return (
                      <div key={i} className="h-10 flex items-center justify-center rounded-lg text-xs font-bold text-white bg-museum-gold shadow-sm shadow-museum-gold/40 relative">
                        {item.date}
                      </div>
                    )
                  }
                  // Show dot if activity exists on this day
                  const statusLabel = item.activity ? (item.activity.status === 'Buka' ? 'Hadir' : (item.activity.status === 'Tutup' ? 'Libur' : item.activity.status)) : null
                  const actStyle = statusLabel ? STATUS_STYLES[statusLabel] : null
                  return (
                    <div key={i} title={item.activity ? `${item.activity.desc} (${statusLabel})` : undefined}
                      className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-museum-brown bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      {actStyle && (
                        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${actStyle.dot}`} />
                      )}
                      {item.date}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              {activities.length > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  {Object.entries(STATUS_STYLES).map(([status, s]) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-[10px] text-gray-500">{status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activities List */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-museum-brown">Kegiatan Museum</h4>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-museum-brown text-white px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-museum-brown-dark transition-colors shadow-sm"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah baru
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {actLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Belum ada kegiatan</p>
                    <p className="text-[11px] text-gray-300 mt-1">Klik "Tambah baru" untuk menambahkan</p>
                  </div>
                ) : (
                  activities.map(act => (
                    <ActivityItem key={act.id} activity={act} onDelete={handleDelete} deleting={deleting} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddActivityModal open={showAddModal} onClose={() => setShowAddModal(false)} onSaved={handleActivitySaved} />
      <EditProfileModal open={showEditProfileModal} profile={profile} onClose={() => setShowEditProfileModal(false)} onSaved={(data) => {
        setProfile(prev => ({ ...prev, name: data.name }))
        updateUser?.({ ...profile, name: data.name })
      }} />
    </AdminLayout>
  )
}
