'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

function LoginPageContent() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router       = useRouter()
  const searchParams = useSearchParams()
  const andthen      = searchParams.get('andthen') || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (user) {
          const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single()
          if (!existing) {
            await supabase.from('profiles').insert({ id: user.id, role: 'donor' })
          }
        }
      } catch (e) {
        console.warn('Could not ensure profile on login', e)
      }
      router.push(andthen)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f9fa' }}>

      {/* ── Left panel: branding ── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(160deg, #2a3440 0%, #3E4B59 55%, #4a5a6a 100%)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F08B1D' }}>
            <Heart className="w-5 h-5 fill-white text-white" />
          </span>
          <span className="font-bold text-xl" style={{ fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#F08B1D' }}>
            Rooted in Giving
          </p>
          <h2 className="text-4xl font-bold leading-snug mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Every act of giving<br />creates a ripple<br />of change.
          </h2>
          <p className="text-white/65 text-base leading-relaxed max-w-xs">
            Sign in to track your impact, manage donations, and stay connected with the communities you support.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { value: '4', label: 'Countries' },
            { value: '200+', label: 'Projects' },
            { value: '50K+', label: 'Lives touched' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-[#F08B1D]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>{s.value}</p>
              <p className="text-xs text-white/55 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F08B1D' }}>
              <Heart className="w-4 h-4 fill-white text-white" />
            </span>
            <span className="font-bold text-lg text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
          </Link>

          <h1 className="text-3xl font-bold text-[#3E4B59] mb-1" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your account to continue your giving journey.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#3E4B59] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#F08B1D' } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-[#3E4B59]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#F08B1D' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': '#F08B1D' } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
              style={{ background: loading ? '#D97B1A' : '#F08B1D' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href={andthen && andthen !== '/' ? `/signup?andthen=${encodeURIComponent(andthen)}` : '/signup'}
              className="font-semibold hover:underline"
              style={{ color: '#F08B1D' }}
            >
              Create one — it&apos;s free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#F08B1D' }} />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
