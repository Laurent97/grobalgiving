'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Clear the cart after successful donation
    if (sessionId) {
      localStorage.removeItem('donation-cart')
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Processing your donation...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Donation!</h1>
        <p className="text-gray-600 mb-8">
          Your generosity will make a real difference. You should receive a confirmation email shortly.
        </p>
        <div className="space-y-4">
          <Link href="/" className="block bg-gg-primary text-white px-6 py-3 rounded-lg hover:bg-gg-primary-700">
            Browse More Projects
          </Link>
          <Link href="/account" className="block border border-gg-primary text-gg-primary px-6 py-3 rounded-lg hover:bg-gray-100">
            View Your Donation History
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><p>Loading...</p></div>}>
      <DonationSuccessContent />
    </Suspense>
  )
}
