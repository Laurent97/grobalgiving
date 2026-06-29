'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

function pwStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))            score++
  if (/[0-9]/.test(pw))            score++
  if (/[^A-Za-z0-9]/.test(pw))     score++
  const map = [
    { label: '',         color: '#e5e7eb' },
    { label: 'Weak',     color: '#ef4444' },
    { label: 'Fair',     color: '#F9A825' },
    { label: 'Good',     color: '#2E7D32' },
    { label: 'Strong',   color: '#1B2E1B' },
  ]
  return { score, ...map[score] }
}

function SignupPageContent() {
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const andthen      = searchParams.get('andthen') || ''

  const strength = pwStrength(password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (data.user) {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName, role: 'donor' })
        }
      }
      setSuccess(true)
      setTimeout(() => {
        const loginUrl = andthen ? `/login?andthen=${encodeURIComponent(andthen)}` : '/login'
        router.push(loginUrl)
      }, 2000)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
  const ringStyle = { '--tw-ring-color': '#2E7D32' } as React.CSSProperties

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F0E8' }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(160deg, #1B2E1B 0%, #2E7D32 60%, #388E3C 100%)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F9A825' }}>
            <Heart className="w-5 h-5 fill-white text-white" />
          </span>
          <span className="font-bold text-xl" style={{ fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
        </Link>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#F9A825' }}>
            Rooted in Giving
          </p>
          <h2 className="text-4xl font-bold leading-snug mb-6" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Start your giving<br />journey today.
          </h2>
          <p className="text-white/65 text-base leading-relaxed max-w-xs">
            Join thousands of donors making a real difference across Africa. Track your impact and fund what matters most.
          </p>
        </div>

        <ul className="space-y-3">
          {[
            'Free to join — no platform fees',
            'Full visibility into every project',
            'Real-time impact updates',
            'Secure, verified donation process',
          ].map(item => (
            <li key={item} className="flex items-center gap-3 text-sm text-white/80">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F9A825' }}>
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2E7D32' }}>
              <Heart className="w-4 h-4 fill-white text-white" />
            </span>
            <span className="font-bold text-lg text-[#1B2E1B]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
          </Link>

          <h1 className="text-3xl font-bold text-[#1B2E1B] mb-1" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Free forever. No credit card required.
          </p>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Account created! Redirecting you to sign in…</span>
            </div>
          )}

          {/* Error */}
          {error && !success && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-[#1B2E1B] mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className={inputCls}
                style={ringStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1B2E1B] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputCls}
                style={ringStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#1B2E1B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`${inputCls} pr-11`}
                  style={ringStyle}
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs" style={{ color: strength.color }}>{strength.label} password</p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-[#1B2E1B] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showCf ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className={`${inputCls} pr-11 ${confirm && confirm !== password ? 'border-red-300 ring-red-300' : ''}`}
                  style={ringStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowCf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showCf ? 'Hide password' : 'Show password'}
                >
                  {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Terms notice */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ background: '#2E7D32' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : 'Create free account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href={andthen ? `/login?andthen=${encodeURIComponent(andthen)}` : '/login'}
              className="font-semibold hover:underline"
              style={{ color: '#2E7D32' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}
