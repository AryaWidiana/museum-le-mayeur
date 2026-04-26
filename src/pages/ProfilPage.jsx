import React, { useState, useEffect, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ title, value, subtitle, colorClass, barColor, icon }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-start justify-between">
      <div>
        <h4 className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</h4>
        <p className="text-xs font-bold text-museum-brown">{title}</p>
        <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`w-5 h-5 ${colorClass}`}>
          {icon}
        </div>
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

// ─── Activity Item ───────────────────────────────────────────
function ActivityItem({ dateNum, dateDay, title, badgeText, badgeColor, fullDate }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
        <span className="text-sm font-bold text-museum-brown leading-none">{dateNum}</span>
        <span className="text-[10px] text-gray-400 mt-1">{dateDay}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-museum-brown truncate">{title}</h5>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[10px] text-gray-400 truncate flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fullDate}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function ProfilPage() {
  const [adminData, setAdminData] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Inline Edit State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', username: '', profilePic: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('admin_token')
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur-pi7e5zsde-aryawidianas-projects.vercel.app')}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setAdminData(data.data.admin)
        setActivities(data.data.activities || [])
        
        // Sync session storage just in case it's out of sync
        sessionStorage.setItem('admin_name', data.data.admin.name || data.data.admin.username)
        sessionStorage.setItem('admin_user', data.data.admin.username)
        if (data.data.admin.profilePic) sessionStorage.setItem('admin_profile_pic', data.data.admin.profilePic)
        sessionStorage.setItem('admin_role', data.data.admin.role)
        window.dispatchEvent(new Event('admin_profile_updated'))
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_name')
    sessionStorage.removeItem('admin_profile_pic')
    sessionStorage.removeItem('admin_role')
    sessionStorage.removeItem('admin_logged_in')
    window.location.href = '/admin'
  }

  const toggleEditMode = () => {
    if (!isEditing && adminData) {
      setEditForm({
        name: adminData.name || '',
        username: adminData.username || '',
        profilePic: adminData.profilePic || ''
      })
      setEditError('')
    }
    setIsEditing(!isEditing)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setEditError('Ukuran gambar maksimal 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePic: reader.result }))
        
        // If not explicitly in edit mode, auto-save the picture when uploaded via the pencil icon
        if (!isEditing) {
          saveProfileUpdates({ ...editForm, profilePic: reader.result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfileUpdates = async (formDataToSave) => {
    setEditLoading(true)
    setEditError('')
    try {
      const token = sessionStorage.getItem('admin_token')
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur-pi7e5zsde-aryawidianas-projects.vercel.app')}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formDataToSave.name,
          username: formDataToSave.username,
          profilePic: formDataToSave.profilePic
        })
      })
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        // Update local state
        setAdminData(data.data)
        
        // Update session storage
        sessionStorage.setItem('admin_name', data.data.name || data.data.username)
        sessionStorage.setItem('admin_user', data.data.username)
        if (data.data.profilePic) sessionStorage.setItem('admin_profile_pic', data.data.profilePic)
        
        // Dispatch event so AdminLayout updates instantly
        window.dispatchEvent(new Event('admin_profile_updated'))
        
        setIsEditing(false)
      } else {
        setEditError(data.message || 'Gagal menyimpan perubahan')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setEditError('Terjadi kesalahan pada server')
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    saveProfileUpdates(editForm)
  }

  // Calendar Logic
  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth() // 0-11
  
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const daysShort = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

  // Days in current month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()
  
  const calendarDays = []
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ date: daysInPrevMonth - firstDayOfMonth + i + 1, isCurrentMonth: false })
  }
  
  const today = new Date()
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === monthIndex && today.getFullYear() === year
    calendarDays.push({ date: i, isCurrentMonth: true, isToday: isToday })
  }
  
  const remainingSlots = 42 - calendarDays.length
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({ date: i, isCurrentMonth: false })
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1))

  const adminName = adminData?.name || adminData?.username || 'Admin'
  const profilePic = isEditing ? editForm.profilePic : (adminData?.profilePic || null)
  const joinedDate = adminData ? new Date(adminData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

  const liburCount = activities.filter(a => a.status === 'Libur').length
  const tutupCount = activities.filter(a => a.status === 'Tutup').length

  // Modal State
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityForm, setActivityForm] = useState({ desc: '', date: '', status: 'Libur' })

  const handleAddActivity = async (e) => {
    e.preventDefault()
    try {
      const token = sessionStorage.getItem('admin_token')
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur-pi7e5zsde-aryawidianas-projects.vercel.app')}/api/profile/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityForm)
      })
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setActivities([data.data, ...activities])
        setShowActivityModal(false)
        setActivityForm({ desc: '', date: '', status: 'Libur' })
      } else {
        alert(data.message || 'Gagal menambahkan kegiatan')
      }
    } catch (err) {
      alert('Terjadi kesalahan')
    }
  }

  return (
    <AdminLayout activePage="Profil" title="Profil" subtitle="Informasi akun admin">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch relative">
        
        {/* Left Column: Profile Info (Inline Editing) */}
        <div className="w-full lg:w-[320px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-shrink-0 animate-slide-up anim-delay-100">
          
          {editError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {editError}
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4 group cursor-pointer" onClick={() => {
                if(!isEditing) {
                  setEditForm({
                    name: adminData?.name || '',
                    username: adminData?.username || '',
                    profilePic: adminData?.profilePic || ''
                  })
                }
                fileInputRef.current?.click()
              }}>
              <div className="w-24 h-24 rounded-full bg-museum-brown flex items-center justify-center text-museum-gold text-3xl font-bold border-4 border-white shadow-md overflow-hidden transition-transform group-hover:scale-105">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (isEditing && editForm.name ? editForm.name : adminName).charAt(0).toUpperCase()
                )}
              </div>
              <button 
                title="Ganti Foto Profil"
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-museum-gold hover:bg-[#d4af37] rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white transition-colors z-10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
              </button>
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            
            {!isEditing ? (
              <>
                <h2 className="text-lg font-bold text-museum-brown text-center leading-tight">{adminName}</h2>
                <span className="mt-1.5 px-3 py-1 bg-museum-gold/20 text-museum-gold rounded-full text-[10px] font-bold capitalize">{adminData?.role === 'superadmin' ? 'Super Admin' : 'Admin'} Museum</span>
              </>
            ) : (
              <span className="mt-1.5 px-3 py-1 bg-museum-gold text-white rounded-full text-[10px] font-bold">Mode Edit Profil</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4 flex-1">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  autoFocus
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown font-semibold focus:bg-white focus:border-museum-gold outline-none transition-colors"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  required
                  value={editForm.username} 
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-museum-brown font-semibold focus:bg-white focus:border-museum-gold outline-none transition-colors"
                  placeholder="Username"
                />
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  type="submit" 
                  disabled={editLoading} 
                  className="w-full py-2.5 text-xs font-bold bg-museum-gold text-white rounded-lg hover:bg-[#d4af37] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button 
                  type="button" 
                  onClick={toggleEditMode} 
                  className="w-full py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal Edit
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 flex-1">
              <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer" onClick={toggleEditMode} title="Klik untuk edit nama">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Nama Lengkap</p>
                <p className="text-xs font-semibold text-museum-brown">{adminData?.name || adminData?.username || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer" onClick={toggleEditMode} title="Klik untuk edit username">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Username</p>
                <p className="text-xs font-semibold text-museum-brown">{adminData?.username || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Role</p>
                <p className="text-xs font-semibold text-museum-brown">{adminData?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Bergabung sejak</p>
                <p className="text-xs font-semibold text-museum-brown">{joinedDate}</p>
              </div>
              
              <button 
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                Keluar Akun
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Stats & Calendar */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full animate-slide-up anim-delay-200">
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up anim-delay-300">
            <StatCard 
              title="Kehadiran" value="24" subtitle="24 Hari Aktif" 
              colorClass="text-museum-gold" barColor="bg-museum-gold"
              icon={<svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
            />
            <StatCard 
              title="Libur" value={liburCount} subtitle={`${liburCount} Hari`}
              colorClass="text-gray-500" barColor="bg-gray-400"
              icon={<svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            />
            <StatCard 
              title="Tutup" value={tutupCount} subtitle={`${tutupCount} Hari`}
              colorClass="text-red-500" barColor="bg-red-500"
              icon={<svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            />
          </div>

          {/* Calendar & Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 flex-1 animate-slide-up anim-delay-400">
            
            {/* Dynamic Calendar */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={handlePrevMonth}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-museum-brown hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <h4 className="text-sm font-bold text-museum-brown">{monthNames[monthIndex]} {year}</h4>
                <button 
                  onClick={handleNextMonth}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-museum-brown hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysShort.map(d => (
                  <div key={d} className="text-[10px] font-bold text-museum-brown/60 py-1">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, i) => {
                  if (!item.isCurrentMonth) {
                    return (
                      <div key={i} className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-gray-300">
                        {item.date}
                      </div>
                    )
                  }
                  
                  if (item.isToday) {
                    return (
                      <div key={i} className="h-10 flex items-center justify-center rounded-lg text-xs font-bold text-white bg-museum-gold shadow-sm shadow-museum-gold/40 relative">
                        {item.date}
                      </div>
                    )
                  }

                  const dateObj = new Date(year, monthIndex, item.date)
                  // Highlight days that have an activity
                  const dayActivities = activities.filter(a => {
                    const d = new Date(a.date)
                    return d.getDate() === item.date && d.getMonth() === monthIndex && d.getFullYear() === year
                  })
                  
                  const hasActivity = dayActivities.length > 0
                  const isSunday = i % 7 === 0

                  return (
                    <div key={i} className="h-10 flex items-center justify-center rounded-lg text-xs font-medium text-museum-brown bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                      {isSunday && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                      {hasActivity && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-museum-gold"></span>}
                      {item.date}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activities List */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-museum-brown">Kegiatan Anda</h4>
                <button onClick={() => setShowActivityModal(true)} className="bg-museum-brown text-white px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-museum-brown-dark transition-colors shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Tambah baru
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2 max-h-[300px]">
                {activities.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Belum ada kegiatan</p>
                ) : activities.map((act) => {
                  const d = new Date(act.date)
                  const dayName = daysShort[d.getDay()]
                  const fullDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  
                  return (
                    <ActivityItem 
                      key={act.id}
                      dateNum={d.getDate()} 
                      dateDay={dayName} 
                      title={act.desc} 
                      fullDate={fullDate}
                      badgeText={act.status} 
                      badgeColor={act.status === 'Tutup' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}
                    />
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Tambah Kegiatan */}
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
              <h3 className="text-lg font-bold text-museum-brown mb-4">Tambah Kegiatan Baru</h3>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Deskripsi Kegiatan</label>
                  <input 
                    type="text" required
                    value={activityForm.desc} onChange={e => setActivityForm({...activityForm, desc: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none"
                    placeholder="Contoh: Nyepi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Tanggal</label>
                  <input 
                    type="date" required
                    value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-museum-brown mb-1">Status</label>
                  <select 
                    value={activityForm.status} onChange={e => setActivityForm({...activityForm, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-museum-gold outline-none bg-white"
                  >
                    <option value="Libur">Libur</option>
                    <option value="Tutup">Tutup</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowActivityModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-museum-gold text-white rounded-lg hover:bg-[#d4af37] transition-colors">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
