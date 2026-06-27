'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, Copy, Landmark, Smartphone, Bitcoin, AlertTriangle } from 'lucide-react'
import { useToast } from './Toast'
import FileUploader from './FileUploader'
import type { BankAccount, MobileMoneyAccount, CryptoWallet } from '@/types'

interface PaymentDetailsProps {
  method: {
    type: 'bank' | 'mobile_money' | 'crypto'
    methodId: string
    details: BankAccount | MobileMoneyAccount | CryptoWallet
  }
  donationReference: string
  totalAmount: number
  currency: string
  onConfirm: () => void
  onBack: () => void
}

export default function PaymentDetails({
  method,
  donationReference,
  totalAmount,
  currency,
  onConfirm,
  onBack
}: PaymentDetailsProps) {
  const { showToast } = useToast()
  const [receiptUrl, setReceiptUrl] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', `${label} copied to clipboard`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptUrl && !transactionHash) {
      showToast('error', 'Please upload payment proof or provide transaction hash')
      return
    }
    if (!confirmed) {
      showToast('error', 'Please confirm you have made the payment')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/donations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_reference: donationReference,
          receipt_url: receiptUrl,
          transaction_hash: transactionHash,
          confirmed: false // Keep as pending until admin verifies
        })
      })

      const data = await response.json()

      if (response.ok) {
        showToast('success', 'Payment confirmation submitted successfully')
        onConfirm()
      } else {
        showToast('error', data.error || 'Failed to submit payment confirmation')
      }
    } catch (err) {
      console.error('Error confirming payment:', err)
      showToast('error', 'Failed to submit payment confirmation')
    } finally {
      setLoading(false)
    }
  }

  const getProjectCode = () => `PROJ-${donationReference.slice(-6)}`

  if (method.type === 'bank') {
    const account = method.details as BankAccount
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Complete Your Bank Transfer</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Donation Reference</p>
            <p className="text-lg font-bold text-gray-900">{donationReference}</p>
            <p className="text-sm text-gray-500">Total Amount: {totalAmount} {currency}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <DetailRow label="Account Name" value={account.account_name} />
              <DetailRow label="Bank Name" value={account.bank_name} />
              <DetailRow label="Account Number" value={account.account_number} />
              {account.routing_number && <DetailRow label="Routing Number" value={account.routing_number} />}
              {account.swift_bic && <DetailRow label="SWIFT/BIC" value={account.swift_bic} />}
              {account.branch_address && <DetailRow label="Branch Address" value={account.branch_address} />}
              {account.country && <DetailRow label="Country" value={account.country} />}
              {account.currency && <DetailRow label="Currency" value={account.currency} />}
            </div>
          </div>

          {account.instructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Important Instructions</h4>
                  <p className="text-sm text-yellow-700 mt-1">{account.instructions}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Reference:</strong> Please use project code <strong>{getProjectCode()}</strong> in your transfer description
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FileUploader
              onUpload={setReceiptUrl}
              value={receiptUrl}
              label="Upload Payment Slip"
              description="Bank transfer receipt, screenshot, or PDF (Max 5MB)"
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="bank-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
                title="Payment confirmation"
                aria-label="Payment confirmation"
              />
              <label htmlFor="bank-confirm" className="text-sm text-gray-700">
                I confirm that I have made the bank transfer for the amount shown above.
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Confirm Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (method.type === 'mobile_money') {
    const account = method.details as MobileMoneyAccount
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Complete Your Mobile Money Payment</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Donation Reference</p>
            <p className="text-lg font-bold text-gray-900">{donationReference}</p>
            <p className="text-sm text-gray-500">Total Amount: {totalAmount} {currency}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Mobile Money Details</h3>
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <DetailRow label="Provider" value={account.provider_name} />
              <DetailRow label="Phone Number" value={account.phone_number} />
              <DetailRow label="Account Name" value={account.account_name} />
              <DetailRow label="Country" value={account.country} />
              <DetailRow label="Currency" value={account.currency} />
              <DetailRow label="Transaction Fee" value={account.fee_structure === 'sender' ? 'Sender pays' : account.fee_structure === 'receiver' ? 'Receiver pays' : 'Shared'} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
              <li>Open your mobile money app or dial USSD code</li>
              <li>Select &quot;Send Money&quot; or &quot;Transfer&quot;</li>
              <li>Enter the phone number: <strong>{account.phone_number}</strong></li>
              <li>Enter amount: <strong>{totalAmount} {account.currency}</strong></li>
              <li>Use reference: <strong>{getProjectCode()}</strong></li>
              <li>Confirm with your PIN</li>
            </ol>
            {account.instructions && (
              <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-3 rounded-lg">{account.instructions}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FileUploader
              onUpload={setReceiptUrl}
              value={receiptUrl}
              label="Upload Payment Confirmation"
              description="Screenshot or receipt of mobile money payment (Max 5MB)"
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="mobile-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
                title="Payment confirmation"
                aria-label="Payment confirmation"
              />
              <label htmlFor="mobile-confirm" className="text-sm text-gray-700">
                I confirm that I have sent the mobile money payment.
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Confirm Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Crypto
  const wallet = method.details as CryptoWallet
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <Bitcoin className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Complete Your Crypto Donation</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Donation Reference</p>
          <p className="text-lg font-bold text-gray-900">{donationReference}</p>
          <p className="text-sm text-gray-500">Fiat Amount: {totalAmount} {currency}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Wallet Details</h3>
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <DetailRow label="Currency" value={`${wallet.currency_name} (${wallet.currency_symbol})`} />
            <DetailRow label="Wallet Address" value={wallet.wallet_address} isCopyable />
            <DetailRow label="Network" value={wallet.network} />
            <DetailRow label="Minimum Amount" value={`${wallet.min_amount} ${wallet.currency_symbol}`} />
          </div>
        </div>

        {wallet.qr_code_url && (
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Scan QR Code</h3>
            <img
              src={wallet.qr_code_url}
              alt={`${wallet.currency_name} wallet QR code`}
              className="mx-auto w-48 h-48 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
            <li>Open your crypto wallet</li>
            <li>Scan the QR code or copy the wallet address</li>
            <li>Enter the donation amount (minimum {wallet.min_amount} {wallet.currency_symbol})</li>
            <li>Send the transaction</li>
            <li>Copy the transaction hash for tracking</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
            <input
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
              placeholder="0x..."
            />
          </div>

          <FileUploader
            onUpload={setReceiptUrl}
            value={receiptUrl}
            label="Upload Transaction Screenshot (Optional)"
            description="Screenshot of transaction confirmation (Max 5MB)"
          />

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="crypto-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
              title="Payment confirmation"
              aria-label="Payment confirmation"
            />
            <label htmlFor="crypto-confirm" className="text-sm text-gray-700">
              I confirm that I have sent the cryptocurrency payment.
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Confirm Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailRow({ label, value, isCopyable = false }: { label: string; value: string; isCopyable?: boolean }) {
  const { showToast } = useToast()
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    showToast('success', `${label} copied to clipboard`)
  }

  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-gray-600 font-medium min-w-[120px]">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className={`text-sm text-gray-900 ${isCopyable ? 'font-mono break-all' : ''}`}>{value}</span>
        {isCopyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gg-primary transition-colors shrink-0"
            title={`Copy ${label}`}
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
