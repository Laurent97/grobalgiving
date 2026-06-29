'use client'

import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Trash2, RefreshCw, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const C = { primary: '#F08B1D', dark: '#3E4B59', bg: '#f8f9fa' }

export default function CartPage() {
  const { items, removeItem, updateAmount, getTotalAmount } = useCartStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?andthen=' + encodeURIComponent('/cart'))
      return
    }
    setLoading(true)
    try {
      for (const item of items) {
        await fetch('/api/donations/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: item.projectId, amount: item.amount, currency: 'USD' })
        })
      }
      router.push('/donate/checkout')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('There was an error processing your checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center" style={{ background: C.bg }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#FEF3C7' }}>
          <ShoppingCart className="w-9 h-9" style={{ color: C.primary }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.dark, fontFamily: 'Aleo, Georgia, serif' }}>Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-xs">You haven't added any projects yet. Find a cause you care about and start giving.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" style={{ background: C.primary }}>
          Browse Projects
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ background: C.bg }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.primary }}>
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: C.dark, fontFamily: 'Aleo, Georgia, serif' }}>Your Giving Cart</h1>
            <p className="text-sm text-gray-500">{items.length} {items.length === 1 ? 'project' : 'projects'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                {/* Title + frequency row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2" style={{ color: C.dark }}>{item.title}</h3>
                    <span className="inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#FEF3C7', color: C.primary }}>
                      {item.frequency === 'monthly' ? '🔁 Monthly' : '⚡ One-time'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount editor */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 shrink-0">Amount:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-1 max-w-[160px]">
                    <span className="px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-500 border-r border-gray-200">$</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateAmount(item.id, Number(e.target.value))}
                      className="flex-1 px-3 py-2 text-sm font-semibold focus:outline-none w-full"
                      style={{ color: C.dark }}
                      min="1"
                      aria-label={`Donation amount for ${item.title}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-8">
              <h2 className="text-lg font-bold mb-5" style={{ color: C.dark, fontFamily: 'Aleo, Georgia, serif' }}>Order Summary</h2>

              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate max-w-[65%]">{item.title}</span>
                    <span className="font-semibold" style={{ color: C.dark }}>${item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: C.dark }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: C.primary }}>${getTotalAmount()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{items.length} {items.length === 1 ? 'project' : 'projects'}</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: C.primary }}
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <Link href="/" className="block text-center mt-3 text-sm hover:underline" style={{ color: C.primary }}>
                ← Add more projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
