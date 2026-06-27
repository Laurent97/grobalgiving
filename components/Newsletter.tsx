'use client'

import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="py-20 bg-[#3E4B59]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F08B1D]/20 rounded-2xl mb-6">
          <Mail className="w-8 h-8 text-[#F08B1D]" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
          Join Our Community
        </h2>
        <p className="text-lg text-white/65 mb-10 max-w-xl mx-auto">
          Get inspiring impact stories, new project alerts, and exclusive giving opportunities delivered to your inbox.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-3 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold px-8 py-4 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
            You're in! Thank you for joining.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 backdrop-blur-sm">
              <Mail className="w-5 h-5 text-white/40 shrink-0" />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 py-4 bg-transparent text-white placeholder-white/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-white/35">
          No spam, ever. Unsubscribe any time. By subscribing you agree to our{' '}
          <a href="/privacy" className="underline hover:text-white/60 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </section>
  )
}
