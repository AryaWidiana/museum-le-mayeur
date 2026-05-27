import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

const baseURL = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = sessionStorage.getItem('admin_token')
  return { 'Authorization': `Bearer ${token}` }
}

// ─── Timeline Icons ───────────────────────────────────────────
const TimelineIcon = ({ type }) => {
  if (type === 'CREATE') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-green-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </div>
    )
  }
  if (type === 'UPDATE') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-blue-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.125l-2.816.93a.75.75 0 01-.95-.95l.93-2.816a4.5 4.5 0 011.125-1.89l13.416-13.415z" /></svg>
      </div>
    )
  }
  if (type === 'DELETE') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-sm z-10 text-red-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
      </div>
    )
  }
  if (type === 'EXPORT') {
    return (
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-museum-gold/20 flex items-center justify-center border-4 border-white shadow-sm z-10 text-museum-gold">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
      </div>
    )
  }
  // Default login / other
  return (
    <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm z-10 text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
    </div>
  )
}

// ─── Skeleton Row ─────────────────────────────────────────────
function SkeletonItem() {
  return (
    <div className="relative pl-12 animate-pulse">
      <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-gray-200 border-4 border-white" />
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function RiwayatPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 15

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${baseURL}/logs?page=${page}&limit=${LIMIT}`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok && data.success) {
        setLogs(data.data || [])
        setTotalPages(data.meta?.totalPages || 1)
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '--:--'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const getActionBadge = (action) => {
    switch(action) {
      case 'CREATE': return <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-green-50 text-green-600 border-green-100">CREATE</span>
      case 'UPDATE': return <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-blue-50 text-blue-600 border-blue-100">UPDATE</span>
      case 'DELETE': return <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-red-50 text-red-600 border-red-100">DELETE</span>
      case 'EXPORT': return <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-museum-gold/10 text-museum-gold border-museum-gold/20">EXPORT</span>
      default: return <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase border bg-gray-50 text-gray-600 border-gray-200">{action}</span>
    }
  }

  const role = sessionStorage.getItem('admin_role') || 'ADMIN'
  const username = sessionStorage.getItem('admin_user') || 'Admin'

  return (
    <AdminLayout activePage="Riwayat" title="Riwayat" subtitle="Log aktivitas sistem terbaru">
      
      {/* ─── Minimalist Session Widget ───────────────────────────── */}
      <div className="mb-6 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] px-5 py-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-museum-brown/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            Sesi Aktif: <span className="font-bold text-museum-brown">{username}</span>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            Role: 
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
              role === 'SUPER_ADMIN' ? 'bg-museum-brown/10 text-museum-brown border-museum-brown/20' : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {role === 'SUPER_ADMIN' ? '👑 Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            Status Keamanan:
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Audit Log Aktif
            </span>
          </div>
        </div>
      </div>

      {/* ─── Audit Log Container (Full Width) ────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden max-h-[calc(100vh-280px)]">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-museum-brown">Daftar Audit Log</h3>
          <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-md border border-gray-100">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute left-[39px] top-6 bottom-6 w-px bg-gray-100" />
          
          <div className="space-y-6 relative">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">
                Belum ada log aktivitas
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="relative pl-12 group">
                  <TimelineIcon type={log.action} />
                  <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100 group-hover:bg-white group-hover:border-museum-gold/30 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-museum-brown">Log #{log.id}</span>
                      <span className="text-[11px] font-bold text-museum-gold">{formatDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-3">{log.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {getActionBadge(log.action)}
                      <span className="bg-white text-gray-500 border border-gray-200 shadow-sm text-[9px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        Oleh Admin
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Sticky Footer */}
        {!loading && totalPages > 1 && (
          <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-bold text-museum-brown bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-bold text-museum-brown bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
