'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { CryptoWallet } from '@/types'

interface CryptoWalletFormProps {
  initialData: CryptoWallet | null
  onSuccess: (wallet: CryptoWallet) => void
  onCancel: () => void
}

export default function CryptoWalletForm({ initialData, onSuccess, onCancel }: CryptoWalletFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    currency_name: initialData?.currency_name || '',
    currency_symbol: initialData?.currency_symbol || '',
    wallet_address: initialData?.wallet_address || '',
    network: initialData?.network || '',
    qr_code_url: initialData?.qr_code_url || '',
    min_amount: initialData?.min_amount || 0,
    exchange_rate_source: initialData?.exchange_rate_source || 'manual',
    status: initialData?.status ?? true,
    display_order: initialData?.display_order || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/admin/payment-methods/crypto/${initialData.id}`
        : '/api/admin/payment-methods/crypto'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.wallet)
      } else {
        showToast('error', data.error || 'Failed to save crypto wallet')
      }
    } catch (err) {
      showToast('error', 'Failed to save crypto wallet')
      console.error('Error saving crypto wallet:', err)
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Currency Name *</label>
          <input
            type="text"
            value={formData.currency_name}
            onChange={(e) => setFormData({ ...formData, currency_name: e.target.value })}
            className={inputClasses}
            placeholder="Bitcoin"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Currency Symbol *</label>
          <input
            type="text"
            value={formData.currency_symbol}
            onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value.toUpperCase() })}
            className={inputClasses}
            placeholder="BTC"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Wallet Address *</label>
        <input
          type="text"
          value={formData.wallet_address}
          onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
          className={inputClasses}
          placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Network *</label>
          <input
            type="text"
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
            className={inputClasses}
            placeholder="Bitcoin Network"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Minimum Amount *</label>
          <input
            type="number"
            step="0.00000001"
            value={formData.min_amount}
            onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })}
            className={inputClasses}
            placeholder="0.001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>QR Code URL</label>
          <input
            type="url"
            value={formData.qr_code_url}
            onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
            className={inputClasses}
            placeholder="https://example.com/qr.png"
          />
        </div>
        <div>
          <label className={labelClasses}>Exchange Rate Source</label>
          <select
            value={formData.exchange_rate_source}
            onChange={(e) => setFormData({ ...formData, exchange_rate_source: e.target.value })}
            className={inputClasses}
            aria-label="Exchange rate source"
            title="Exchange rate source"
          >
            <option value="manual">Manual</option>
            <option value="coingecko">CoinGecko API</option>
            <option value="coinmarketcap">CoinMarketCap</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Display Order</label>
        <input
          type="number"
          value={formData.display_order}
          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          className={inputClasses}
          placeholder="0"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="crypto-status"
          checked={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          className="w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
          title="Active status"
          aria-label="Active status"
        />
        <label htmlFor="crypto-status" className="text-sm font-medium text-gray-700">Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gg-primary hover:bg-gg-primary-hover text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  )
}
