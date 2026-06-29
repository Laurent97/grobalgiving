'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, AlertCircle, CheckCircle2, Heart, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

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
            Every donor<br />matters here.
          </h2>
          <p className="text-white/65 text-base leading-relaxed max-w-xs">
            We&apos;ll send a secure link to reset your password so you can get back to making an impact.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <p className="text-sm text-white/70 leading-relaxed">
            &ldquo;The simplest act of giving is the most powerful force for change.&rdquo;
          </p>
          <p className="text-xs text-white/40 mt-3">— AcaciaGiving</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#2E7D32' }}>
              <Heart className="w-4 h-4 fill-white text-white" />
            </span>
            <span className="font-bold text-lg text-[#1B2E1B]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
          </Link>

          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#2E7D32' }}>
                <Mail className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-[#1B2E1B] mb-1" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                Forgot your password?
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Enter your account email and we&apos;ll send you a secure reset link.
              </p>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                    style={{ '--tw-ring-color': '#2E7D32' } as React.CSSProperties}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{ background: '#2E7D32' }}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#dcfce7' }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: '#2E7D32' }} />
              </div>
              <h1 className="text-2xl font-bold text-[#1B2E1B] mb-3" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                Check your inbox
              </h1>
              <p className="text-gray-500 text-sm mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="font-semibold text-[#1B2E1B] text-sm mb-8 break-all">{email}</p>
              <p className="text-xs text-gray-400 mb-8">
                Didn&apos;t receive it? Check your spam folder, or{' '}
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="underline hover:text-gray-600 transition"
                  style={{ color: '#2E7D32' }}
                >
                  try a different email
                </button>.
              </p>
            </div>
          )}

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium mt-4 hover:underline transition"
            style={{ color: '#795548' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
