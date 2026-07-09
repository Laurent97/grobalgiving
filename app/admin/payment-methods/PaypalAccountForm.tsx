'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { PaypalAccount } from '@/types'

interface PaypalAccountFormProps {
  initialData: PaypalAccount | null
  onSuccess: (account: PaypalAccount) => void
  onCancel: () => void
}

export default function PaypalAccountForm({ initialData, onSuccess, onCancel }: PaypalAccountFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    account_name: initialData?.account_name || '',
    currency: initialData?.currency || 'USD',
    me_link: initialData?.me_link || '',
    client_id: initialData?.client_id || '',
    instructions: initialData?.instructions || '',
    status: initialData?.status ?? true,
    display_order: initialData?.display_order || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = initialData
        ? `/api/admin/payment-methods/paypal/${initialData.id}`
        : '/api/admin/payment-methods/paypal'
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
        showToast('error', data.error || 'Failed to save PayPal account')
      }
    } catch (err) {
      showToast('error', 'Failed to save PayPal account')
      console.error('Error saving PayPal account:', err)
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
          <label className={labelClasses}>PayPal Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClasses}
            placeholder="donations@yourorg.com"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Account Name *</label>
          <input
            type="text"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            className={inputClasses}
            placeholder="AcaciaGiving Foundation"
            required
          />
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
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
            <option value="CHF">CHF — Swiss Franc</option>
            <option value="JPY">JPY — Japanese Yen</option>
            <option value="SEK">SEK — Swedish Krona</option>
            <option value="NOK">NOK — Norwegian Krone</option>
            <option value="DKK">DKK — Danish Krone</option>
            <option value="NZD">NZD — New Zealand Dollar</option>
            <option value="SGD">SGD — Singapore Dollar</option>
            <option value="HKD">HKD — Hong Kong Dollar</option>
            <option value="MXN">MXN — Mexican Peso</option>
            <option value="BRL">BRL — Brazilian Real</option>
            <option value="PLN">PLN — Polish Złoty</option>
            <option value="CZK">CZK — Czech Koruna</option>
            <option value="HUF">HUF — Hungarian Forint</option>
            <option value="ILS">ILS — Israeli Shekel</option>
            <option value="PHP">PHP — Philippine Peso</option>
            <option value="MYR">MYR — Malaysian Ringgit</option>
            <option value="THB">THB — Thai Baht</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}>PayPal.me Link</label>
          <input
            type="url"
            value={formData.me_link}
            onChange={(e) => setFormData({ ...formData, me_link: e.target.value })}
            className={inputClasses}
            placeholder="https://www.paypal.me/yourorg"
          />
          <p className="text-xs text-gray-400 mt-1">Optional — displayed as a direct donate button</p>
        </div>
      </div>

      <div>
        <label className={labelClasses}>PayPal Client ID <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={formData.client_id}
          onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
          className={inputClasses}
          placeholder="AXxxx... (for PayPal Buttons SDK integration)"
        />
        <p className="text-xs text-gray-400 mt-1">Only needed if using the PayPal JS SDK embedded checkout</p>
      </div>

      <div>
        <label className={labelClasses}>Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className={inputClasses}
          rows={3}
          placeholder="Send your donation to donations@yourorg.com and include the project name in the note."
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="paypal-status"
          checked={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          className="w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
          title="Active status"
          aria-label="Active status"
        />
        <label htmlFor="paypal-status" className="text-sm font-medium text-gray-700">Active</label>
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
