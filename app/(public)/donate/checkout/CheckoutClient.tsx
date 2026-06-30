'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, Pencil, ShoppingCart } from 'lucide-react'
import { useToast } from '@/components/Toast'
import DonationStepper from '@/components/DonationStepper'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import PaymentDetails from '@/components/PaymentDetails'
import DonorRecognitionStep, { type DonorPreferences } from '@/components/DonorRecognitionStep'
import type { DonationCartItem, UserProfile } from '@/types'

interface CheckoutClientProps {
  initialCartItems: DonationCartItem[]
  user: UserProfile | null
}

type CheckoutStep = 'cart' | 'payment' | 'recognition' | 'details' | 'success'

export default function CheckoutClient({ initialCartItems, user }: CheckoutClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [cartItems, setCartItems] = useState<DonationCartItem[]>(initialCartItems)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart')
  const [selectedMethod, setSelectedMethod] = useState<{
    type: 'bank' | 'mobile_money' | 'crypto'
    methodId: string
    details: any
  } | null>(null)
  const [donationReference, setDonationReference] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [donorPreferences, setDonorPreferences] = useState<DonorPreferences | null>(null)

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + Number(item.amount), 0)
    setTotalAmount(total)
    if (cartItems.length > 0) {
      setCurrency(cartItems[0].currency)
    }
  }, [cartItems])

  const getStepNumber = (step: CheckoutStep): number => {
    switch (step) {
      case 'cart': return 1
      case 'payment': return 2
      case 'recognition': return 3
      case 'details': return 4
      case 'success': return 5
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/donations/cart/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== id))
        showToast('success', 'Item removed from cart')
      } else {
        showToast('error', 'Failed to remove item')
      }
    } catch (err) {
      showToast('error', 'Failed to remove item')
      console.error('Error removing item:', err)
    }
  }

  const handleUpdateAmount = async (id: string) => {
    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Please enter a valid amount')
      return
    }

    try {
      const response = await fetch(`/api/donations/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      if (response.ok) {
        const { item } = await response.json()
        setCartItems(prev => prev.map(cartItem => cartItem.id === id ? item : cartItem))
        setEditingItem(null)
        setEditAmount('')
        showToast('success', 'Amount updated')
      } else {
        showToast('error', 'Failed to update amount')
      }
    } catch (err) {
      showToast('error', 'Failed to update amount')
      console.error('Error updating amount:', err)
    }
  }

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      showToast('error', 'Your cart is empty')
      return
    }
    setCurrentStep('payment')
  }

  const handlePaymentMethodSelect = (method: {
    type: 'bank' | 'mobile_money' | 'crypto'
    methodId: string
    details: any
  }) => {
    setSelectedMethod(method)
  }

  const handleContinueToRecognition = () => {
    if (!selectedMethod) {
      showToast('error', 'Please select a payment method')
      return
    }
    setCurrentStep('recognition')
  }

  const handleRecognitionComplete = async (preferences: DonorPreferences) => {
    setDonorPreferences(preferences)
    setLoading(true)
    try {
      const response = await fetch('/api/donations/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_item_ids: cartItems.map(item => item.id),
          payment_method_type: selectedMethod?.type,
          payment_method_id: selectedMethod?.methodId,
          donor_preferences: preferences
        })
      })

      const data = await response.json()

      if (response.ok) {
        setDonationReference(data.donation_reference)
        setCurrentStep('details')
      } else {
        showToast('error', data.error || 'Failed to initiate donation')
      }
    } catch (err) {
      showToast('error', 'Failed to initiate donation')
      console.error('Error initiating donation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentConfirmed = () => {
    setCurrentStep('success')
  }

  const handleBackToPayment = () => {
    setCurrentStep('payment')
  }

  const handleBackToRecognition = () => {
    setCurrentStep('recognition')
  }

  if (cartItems.length === 0 && currentStep === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <DonationStepper currentStep={getStepNumber(currentStep)} />
          <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some projects to your cart to make a donation.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gg-primary hover:bg-gg-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <DonationStepper currentStep={getStepNumber(currentStep)} />

        {currentStep === 'cart' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Review Your Donation</h1>
                <p className="text-gray-600">Review your cart before proceeding to payment</p>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.project?.main_image_url ? (
                          <img
                            src={item.project.main_image_url}
                            alt={item.project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gg-primary/20 flex items-center justify-center text-gg-primary font-bold">
                            {item.project?.title?.charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.project?.title}</h3>
                        <p className="text-sm text-gray-600">{item.project?.nonprofit?.name || item.project?.nonprofits?.name}</p>
                        
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                              placeholder="Amount"
                            />
                            <button
                              onClick={() => handleUpdateAmount(item.id)}
                              className="text-sm bg-gg-primary text-white px-3 py-1 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(null)
                                setEditAmount('')
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-gg-primary">
                              {item.amount} {item.currency}
                            </span>
                            <button
                              onClick={() => {
                                setEditingItem(item.id)
                                setEditAmount(item.amount.toString())
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit amount"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {item.dedication_type && (
                          <p className="text-xs text-gray-500 mt-1">
                            Dedication: {item.dedication_type === 'memory' ? 'In memory of' : 'In honor of'} {item.dedication_name}
                          </p>
                        )}
                        {item.comment && (
                          <p className="text-xs text-gray-500 mt-1">Comment: {item.comment}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total Donation</span>
                  <span className="text-2xl font-bold text-gg-primary">
                    {totalAmount.toFixed(2)} {currency}
                  </span>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Select Payment Method</h1>
                  <p className="text-gray-600">Choose how you would like to donate</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gg-primary">
                    {totalAmount.toFixed(2)} {currency}
                  </p>
                </div>
              </div>

              <PaymentMethodSelector
                onSelect={handlePaymentMethodSelect}
                selectedMethod={selectedMethod?.methodId}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setCurrentStep('cart')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={handleContinueToRecognition}
                  disabled={!selectedMethod || loading}
                  className="flex-1 bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'recognition' && (
          <DonorRecognitionStep
            totalAmount={totalAmount}
            currency={currency}
            onContinue={handleRecognitionComplete}
            onBack={handleBackToPayment}
          />
        )}

        {currentStep === 'details' && selectedMethod && (
          <PaymentDetails
            method={selectedMethod}
            donationReference={donationReference}
            totalAmount={totalAmount}
            currency={currency}
            onConfirm={handlePaymentConfirmed}
            onBack={handleBackToRecognition}
          />
        )}

        {currentStep === 'success' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❤️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Donation!</h1>
              <p className="text-gray-600 mb-8">Your generosity is changing lives.</p>

              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Donation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donation ID</span>
                    <span className="font-medium text-gray-900">{donationReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium text-gray-900">{totalAmount.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">
                      {selectedMethod?.type === 'bank' ? 'Bank Transfer' : selectedMethod?.type === 'mobile_money' ? 'Mobile Money' : 'Cryptocurrency'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-yellow-600">Pending Verification</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Your payment is being verified (usually within 2-3 business days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>A confirmation email will be sent to you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>You&apos;ll receive updates on the project&apos;s impact</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/donation-success')}
                  className="px-6 py-3 bg-gg-primary hover:bg-gg-primary-hover text-white rounded-lg font-semibold transition-colors"
                >
                  View Donation Receipt
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-semibold transition-colors"
                >
                  Browse More Projects
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
