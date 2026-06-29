'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { BankAccount } from '@/types'

interface BankAccountFormProps {
  initialData: BankAccount | null
  onSuccess: (account: BankAccount) => void
  onCancel: () => void
}

export default function BankAccountForm({ initialData, onSuccess, onCancel }: BankAccountFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    account_name: initialData?.account_name || '',
    bank_name: initialData?.bank_name || '',
    account_number: initialData?.account_number || '',
    routing_number: initialData?.routing_number || '',
    swift_bic: initialData?.swift_bic || '',
    account_type: initialData?.account_type || 'international',
    currency: initialData?.currency || 'USD',
    country: initialData?.country || '',
    branch_address: initialData?.branch_address || '',
    instructions: initialData?.instructions || '',
    bank_logo_url: initialData?.bank_logo_url || '',
    status: initialData?.status ?? true,
    display_order: initialData?.display_order || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/admin/payment-methods/bank/${initialData.id}`
        : '/api/admin/payment-methods/bank'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.account)
      } else {
        showToast('error', data.error || 'Failed to save bank account')
      }
    } catch (err) {
      showToast('error', 'Failed to save bank account')
      console.error('Error saving bank account:', err)
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
          <label className={labelClasses}>Account Name *</label>
          <input
            type="text"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            className={inputClasses}
            placeholder="AcaciaGiving Account"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Bank Name *</label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            className={inputClasses}
            placeholder="Citibank"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Account Number *</label>
          <input
            type="text"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            className={inputClasses}
            placeholder="1234567890"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Routing/Sort Code</label>
          <input
            type="text"
            value={formData.routing_number}
            onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
            className={inputClasses}
            placeholder="021000021"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>SWIFT/BIC Code</label>
          <input
            type="text"
            value={formData.swift_bic}
            onChange={(e) => setFormData({ ...formData, swift_bic: e.target.value })}
            className={inputClasses}
            placeholder="CITIUS33"
          />
        </div>
        <div>
          <label className={labelClasses}>Account Type *</label>
          <select
            value={formData.account_type}
            onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'international' | 'local' | 'regional' })}
            className={inputClasses}
            required
            aria-label="Account type"
            title="Account type"
          >
            <option value="international">International</option>
            <option value="local">Local</option>
            <option value="regional">Regional</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Currency *</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className={inputClasses}
            required
            aria-label="Currency"
            title="Currency"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}>Country *</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className={inputClasses}
            placeholder="United States"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Branch Address</label>
        <input
          type="text"
          value={formData.branch_address}
          onChange={(e) => setFormData({ ...formData, branch_address: e.target.value })}
          className={inputClasses}
          placeholder="388 Greenwich St, New York, NY 10013"
        />
      </div>

      <div>
        <label className={labelClasses}>Additional Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className={inputClasses}
          rows={3}
          placeholder="Please include project ID in reference field"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Bank Logo URL</label>
          <input
            type="url"
            value={formData.bank_logo_url}
            onChange={(e) => setFormData({ ...formData, bank_logo_url: e.target.value })}
            className={inputClasses}
            placeholder="https://example.com/logo.png"
          />
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
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bank-status"
          checked={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          className="w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
          title="Active status"
          aria-label="Active status"
        />
        <label htmlFor="bank-status" className="text-sm font-medium text-gray-700">Active</label>
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
