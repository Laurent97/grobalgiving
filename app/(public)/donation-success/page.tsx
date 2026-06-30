'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Heart, ArrowRight, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      localStorage.removeItem('donation-cart')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#F08B1D', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#f8f9fa' }}>
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: '#F08B1D' }}>
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#3E4B59', fontFamily: 'Aleo, Georgia, serif' }}>
          Thank You for Your Generosity!
        </h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Your donation is making a real difference in people's lives.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          A confirmation email has been sent to you.
        </p>

        {/* Impact badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-sm font-semibold px-5 py-2.5 rounded-full mb-8" style={{ color: '#F08B1D' }}>
          <Heart className="w-4 h-4" fill="#F08B1D" />
          You're making a difference
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: '#F08B1D' }}
          >
            Browse More Projects
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#3E4B59', color: '#3E4B59' }}
          >
            <User className="w-4 h-4" />
            View Donation History
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fa' }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#F08B1D', borderTopColor: 'transparent' }} />
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  )
}
