'use client'

import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

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
      // Sync local cart items to the server-side donation cart
      for (const item of items) {
        await fetch('/api/donations/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: item.projectId,
            amount: item.amount,
            currency: 'USD'
          })
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
      <div className="layout-center px-4 py-16 text-center">
        <h1 className="text-title text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href="/" className="btn btn-primary">
          Browse Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="layout-center px-4 py-8">
      <h1 className="text-title text-3xl font-bold mb-8">Your Giving Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-none p-4 flex justify-between items-center">
              <div>
                <h3 className="text-title font-semibold">{item.title}</h3>
                <p className="text-body text-sm text-gray-600">{item.frequency === 'monthly' ? 'Monthly' : 'One-time'}</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-body text-gray-600">$</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateAmount(item.id, Number(e.target.value))}
                    className="border border-gray-300 rounded-none px-3 py-1 w-24 text-body"
                    min="5"
                    aria-label={`Donation amount for ${item.title}`}
                  />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-body text-red-600 hover:text-red-800"
                  aria-label={`Remove ${item.title} from cart`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-none p-6 h-fit sticky top-8">
          <h2 className="text-title text-xl font-bold mb-4">Summary</h2>
          <div className="flex justify-between mb-4">
            <span className="text-body">Total ({items.length} items)</span>
            <span className="text-body font-bold">${getTotalAmount()}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
