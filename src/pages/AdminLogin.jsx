import React, { useState } from 'react'
import bgImage from '../assets/optimized/heroo-bg.webp'

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'https://museum-le-mayeur-pi7e5zsde-aryawidianas-projects.vercel.app')}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Respons server tidak valid. Pastikan URL Backend benar dan server menyala.');
      }

      if (response.ok && data?.success && data?.data?.token) {
        // Simpan token JWT dan status login
        sessionStorage.setItem('admin_token', data.data.token)
        sessionStorage.setItem('admin_logged_in', 'true')
        sessionStorage.setItem('admin_user', data.data.username || username)
        window.location.href = '/kasir'
      } else {
        setError(data?.message || 'Username atau password salah, atau data payload (token) tidak ditemukan!')
      }
    } catch (err) {
      console.error('Login Error:', err)
      setError(err.message === 'Respons server tidak valid. Pastikan URL Backend benar dan server menyala.' ? err.message : 'Gagal terhubung ke server. Periksa koneksi internet dan URL Vercel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-museum-brown-dark">
      {/* Background Image */}
      <img
        src={bgImage}
        alt="Museum Le Mayeur Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md mx-6 px-8 py-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
        <h1 className="text-center font-serif text-3xl text-white mb-3">
          Login Admin
        </h1>
        <p className="text-center text-white/80 text-sm mb-8 leading-relaxed px-4">
          Akses sistem untuk mengelola data pengunjung Museum Le Mayeur
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="flex border border-museum-gold/40 rounded bg-museum-brown-dark/30 backdrop-blur-sm transition-colors focus-within:border-museum-gold">
            <div className="px-4 py-3 border-r border-museum-gold/40 flex items-center justify-center text-museum-gold/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent w-full px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="flex border border-museum-gold/40 rounded bg-museum-brown-dark/30 backdrop-blur-sm transition-colors focus-within:border-museum-gold relative">
            <div className="px-4 py-3 border-r border-museum-gold/40 flex items-center justify-center text-museum-gold/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full pl-4 pr-12 py-3 text-sm text-white placeholder:text-white/50 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-museum-gold/60 hover:text-museum-gold transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Lupa Password */}
          <div className="text-right mt-2 mb-6">
            <a href="#" className="text-xs text-white/70 hover:text-white transition-colors">
              Lupa password?
            </a>
          </div>

          {/* Masuk Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E5D38A] hover:bg-museum-gold text-museum-brown-dark font-medium text-sm py-3 rounded transition-all duration-300 shadow-lg shadow-museum-gold/20 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="text-center text-white/50 text-[10px] mt-10">
          &copy; 2026 Museum Le Mayeur
        </p>
      </div>
    </div>
  )
}
