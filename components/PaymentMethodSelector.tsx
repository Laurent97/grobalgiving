'use client'

import { useEffect, useState } from 'react'
import { Landmark, Smartphone, Bitcoin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from './Toast'
import type { BankAccount, MobileMoneyAccount, CryptoWallet, PaypalAccount } from '@/types'

interface PaymentMethodSelectorProps {
  onSelect: (method: {
    type: 'bank' | 'mobile_money' | 'crypto' | 'paypal'
    methodId: string
    details: BankAccount | MobileMoneyAccount | CryptoWallet | PaypalAccount
  }) => void
  selectedMethod?: string
}

interface PaymentMethodsData {
  bank_accounts: BankAccount[]
  mobile_money: MobileMoneyAccount[]
  crypto_wallets: CryptoWallet[]
  paypal_accounts: PaypalAccount[]
}

export default function PaymentMethodSelector({ onSelect, selectedMethod }: PaymentMethodSelectorProps) {
  const { showToast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData>({
    bank_accounts: [],
    mobile_money: [],
    crypto_wallets: [],
    paypal_accounts: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'bank' | 'mobile_money' | 'crypto' | 'paypal' | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const response = await fetch('/api/payment-methods')
        const data = await response.json()
        if (response.ok) {
          setPaymentMethods(data)
        } else {
          showToast('error', data.error || 'Failed to load payment methods')
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err)
        showToast('error', 'Failed to load payment methods')
      } finally {
        setLoading(false)
      }
    }
    fetchPaymentMethods()
  }, [showToast])

  useEffect(() => {
    if (selectedType && selectedId) {
      const details = getSelectedMethodDetails()
      if (details) {
        onSelect({
          type: selectedType,
          methodId: selectedId,
          details
        })
      }
    }
  }, [selectedType, selectedId])

  const getSelectedMethodDetails = () => {
    if (!selectedType || !selectedId) return null
    if (selectedType === 'bank') {
      return paymentMethods.bank_accounts.find(a => a.id === selectedId) || null
    } else if (selectedType === 'mobile_money') {
      return paymentMethods.mobile_money.find(a => a.id === selectedId) || null
    } else if (selectedType === 'crypto') {
      return paymentMethods.crypto_wallets.find(a => a.id === selectedId) || null
    } else {
      return paymentMethods.paypal_accounts.find(a => a.id === selectedId) || null
    }
  }

  const handleSelect = (type: 'bank' | 'mobile_money' | 'crypto' | 'paypal', id: string) => {
    setSelectedType(type)
    setSelectedId(id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gg-primary" />
      </div>
    )
  }

  const hasAnyMethods = paymentMethods.bank_accounts.length > 0 ||
    paymentMethods.mobile_money.length > 0 ||
    paymentMethods.crypto_wallets.length > 0 ||
    paymentMethods.paypal_accounts.length > 0

  if (!hasAnyMethods) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-gray-700">No payment methods are available at the moment.</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later or contact support.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bank Transfer Section */}
      {paymentMethods.bank_accounts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Landmark className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-gray-900">Bank Transfer</h3>
                <p className="text-sm text-gray-600">Transfer directly from your bank account</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {paymentMethods.bank_accounts.map((account) => (
              <label
                key={account.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedType === 'bank' && selectedId === account.id
                    ? 'border-gg-primary bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={account.id}
                  checked={selectedType === 'bank' && selectedId === account.id}
                  onChange={() => handleSelect('bank', account.id)}
                  className="mt-1 w-4 h-4 text-gg-primary border-gray-300 focus:ring-gg-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{account.account_name}</span>
                    <span className="text-sm text-gray-500">{account.currency}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {account.bank_name} • Account: {account.account_number}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {account.country} • {account.account_type === 'international' ? 'International' : account.account_type === 'local' ? 'Local' : 'Regional'} account
                  </p>
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <span className="text-lg">⚡</span>
                    {account.account_type === 'international'
                      ? 'Suitable for international donors'
                      : account.account_type === 'local'
                      ? 'For local donors'
                      : 'For regional donors'}
                  </p>
                </div>
                {selectedType === 'bank' && selectedId === account.id && (
                  <CheckCircle2 className="w-5 h-5 text-gg-primary" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Money Section */}
      {paymentMethods.mobile_money.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-bold text-gray-900">Mobile Money</h3>
                <p className="text-sm text-gray-600">Pay via mobile money provider</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {paymentMethods.mobile_money.map((account) => (
              <label
                key={account.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedType === 'mobile_money' && selectedId === account.id
                    ? 'border-gg-primary bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={account.id}
                  checked={selectedType === 'mobile_money' && selectedId === account.id}
                  onChange={() => handleSelect('mobile_money', account.id)}
                  className="mt-1 w-4 h-4 text-gg-primary border-gray-300 focus:ring-gg-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{account.provider_name} ({account.country})</span>
                    <span className="text-sm text-gray-500">{account.currency}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {account.phone_number} • {account.network_type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Account: {account.account_name}
                  </p>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <span className="text-lg">⚡</span>
                    {account.fee_structure === 'sender'
                      ? 'Sender pays transaction fee'
                      : account.fee_structure === 'receiver'
                      ? 'Receiver pays transaction fee'
                      : 'Shared transaction fee'}
                  </p>
                </div>
                {selectedType === 'mobile_money' && selectedId === account.id && (
                  <CheckCircle2 className="w-5 h-5 text-gg-primary" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Cryptocurrency Section */}
      {paymentMethods.crypto_wallets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
            <div className="flex items-center gap-3">
              <Bitcoin className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-bold text-gray-900">Cryptocurrency</h3>
                <p className="text-sm text-gray-600">Donate with crypto</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {paymentMethods.crypto_wallets.map((wallet) => (
              <label
                key={wallet.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedType === 'crypto' && selectedId === wallet.id
                    ? 'border-gg-primary bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={wallet.id}
                  checked={selectedType === 'crypto' && selectedId === wallet.id}
                  onChange={() => handleSelect('crypto', wallet.id)}
                  className="mt-1 w-4 h-4 text-gg-primary border-gray-300 focus:ring-gg-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{wallet.currency_name} ({wallet.currency_symbol})</span>
                    {wallet.qr_code_url && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">QR Available</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-all">
                    {wallet.wallet_address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Network: {wallet.network}
                  </p>
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <span className="text-lg">⚡</span>
                    Min: {wallet.min_amount} {wallet.currency_symbol}
                  </p>
                </div>
                {selectedType === 'crypto' && selectedId === wallet.id && (
                  <CheckCircle2 className="w-5 h-5 text-gg-primary" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* PayPal Section */}
      {paymentMethods.paypal_accounts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-lg leading-none">P</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">PayPal</h3>
                <p className="text-sm text-gray-600">Pay securely via PayPal</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {paymentMethods.paypal_accounts.map((account) => (
              <label
                key={account.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedType === 'paypal' && selectedId === account.id
                    ? 'border-gg-primary bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={account.id}
                  checked={selectedType === 'paypal' && selectedId === account.id}
                  onChange={() => handleSelect('paypal', account.id)}
                  className="mt-1 w-4 h-4 text-gg-primary border-gray-300 focus:ring-gg-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{account.account_name}</span>
                    <span className="text-sm text-gray-500">{account.currency}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{account.email}</p>
                  {account.me_link && (
                    <p className="text-xs text-indigo-600 mt-1 truncate">{account.me_link}</p>
                  )}
                  <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                    <span className="text-lg">🔒</span>
                    Secure PayPal payment
                  </p>
                </div>
                {selectedType === 'paypal' && selectedId === account.id && (
                  <CheckCircle2 className="w-5 h-5 text-gg-primary" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
