'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { MobileMoneyAccount } from '@/types'

interface MobileMoneyFormProps {
  initialData: MobileMoneyAccount | null
  onSuccess: (account: MobileMoneyAccount) => void
  onCancel: () => void
}

export default function MobileMoneyForm({ initialData, onSuccess, onCancel }: MobileMoneyFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    provider_name: initialData?.provider_name || '',
    country: initialData?.country || '',
    phone_number: initialData?.phone_number || '',
    account_name: initialData?.account_name || '',
    network_type: initialData?.network_type || 'Safaricom',
    currency: initialData?.currency || 'KES',
    fee_structure: initialData?.fee_structure || 'sender',
    instructions: initialData?.instructions || '',
    status: initialData?.status ?? true,
    display_order: initialData?.display_order || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/admin/payment-methods/mobile-money/${initialData.id}`
        : '/api/admin/payment-methods/mobile-money'
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
        showToast('error', data.error || 'Failed to save mobile money account')
      }
    } catch (err) {
      showToast('error', 'Failed to save mobile money account')
      console.error('Error saving mobile money account:', err)
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
          <label className={labelClasses}>Provider Name *</label>
          <input
            type="text"
            value={formData.provider_name}
            onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
            className={inputClasses}
            placeholder="M-Pesa"
            required
          />
        </div>
        <div>
          <label className={labelClasses}>Country *</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className={inputClasses}
            placeholder="Kenya"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Phone Number *</label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className={inputClasses}
            placeholder="+254 712 345 678"
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
            placeholder="AcaciaGiving"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Network Type *</label>
          <select
            value={formData.network_type}
            onChange={(e) => setFormData({ ...formData, network_type: e.target.value })}
            className={inputClasses}
            required
            aria-label="Network type"
            title="Network type"
          >
            <optgroup label="East Africa">
              <option value="Safaricom M-Pesa">Safaricom M-Pesa (Kenya)</option>
              <option value="Airtel Kenya">Airtel Money (Kenya)</option>
              <option value="MTN MoMo Uganda">MTN MoMo (Uganda)</option>
              <option value="Airtel Uganda">Airtel Money (Uganda)</option>
              <option value="MTN MoMo Rwanda">MTN MoMo (Rwanda)</option>
              <option value="Airtel Rwanda">Airtel Money (Rwanda)</option>
              <option value="M-Pesa Tanzania">M-Pesa (Tanzania)</option>
              <option value="Airtel Tanzania">Airtel Money (Tanzania)</option>
              <option value="Tigo Tanzania">Tigo Pesa (Tanzania)</option>
              <option value="Halotel Tanzania">Halopesa (Tanzania)</option>
              <option value="Telebirr Ethiopia">Telebirr (Ethiopia)</option>
              <option value="CBE Birr">CBE Birr (Ethiopia)</option>
            </optgroup>
            <optgroup label="West Africa">
              <option value="MTN MoMo Ghana">MTN MoMo (Ghana)</option>
              <option value="Vodafone Cash Ghana">Vodafone Cash (Ghana)</option>
              <option value="AirtelTigo Ghana">AirtelTigo Money (Ghana)</option>
              <option value="MTN MoMo Nigeria">MTN MoMo (Nigeria)</option>
              <option value="Airtel Nigeria">Airtel Money (Nigeria)</option>
              <option value="Opay Nigeria">OPay (Nigeria)</option>
              <option value="Wave Senegal">Wave (Senegal/Côte d'Ivoire)</option>
              <option value="Orange Money Senegal">Orange Money (Senegal)</option>
              <option value="MTN MoMo Cameroon">MTN MoMo (Cameroon)</option>
              <option value="Orange Money Cameroon">Orange Money (Cameroon)</option>
            </optgroup>
            <optgroup label="Southern Africa">
              <option value="Vodacom M-Pesa SA">Vodacom M-Pesa (South Africa)</option>
              <option value="MTN MoMo SA">MTN MoMo (South Africa)</option>
              <option value="EcoCash Zimbabwe">EcoCash (Zimbabwe)</option>
              <option value="Mpamba Malawi">Mpamba (Malawi)</option>
              <option value="Airtel Money Zambia">Airtel Money (Zambia)</option>
              <option value="MTN MoMo Zambia">MTN MoMo (Zambia)</option>
            </optgroup>
            <optgroup label="Other / Global">
              <option value="Orange Money">Orange Money</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="MTN MoMo">MTN MoMo</option>
              <option value="Other">Other</option>
            </optgroup>
          </select>
        </div>
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
            <optgroup label="East Africa">
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
              <option value="RWF">RWF — Rwandan Franc</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
              <option value="ETB">ETB — Ethiopian Birr</option>
              <option value="BIF">BIF — Burundian Franc</option>
              <option value="DJF">DJF — Djiboutian Franc</option>
              <option value="ERN">ERN — Eritrean Nakfa</option>
              <option value="SOS">SOS — Somali Shilling</option>
              <option value="SSP">SSP — South Sudanese Pound</option>
            </optgroup>
            <optgroup label="West Africa">
              <option value="GHS">GHS — Ghanaian Cedi</option>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="XOF">XOF — West African CFA Franc</option>
              <option value="SLL">SLL — Sierra Leonean Leone</option>
              <option value="GMD">GMD — Gambian Dalasi</option>
              <option value="LRD">LRD — Liberian Dollar</option>
              <option value="GNF">GNF — Guinean Franc</option>
            </optgroup>
            <optgroup label="Central Africa">
              <option value="XAF">XAF — Central African CFA Franc</option>
              <option value="CDF">CDF — Congolese Franc</option>
              <option value="AOA">AOA — Angolan Kwanza</option>
            </optgroup>
            <optgroup label="Southern Africa">
              <option value="ZAR">ZAR — South African Rand</option>
              <option value="ZWL">ZWL — Zimbabwean Dollar</option>
              <option value="MWK">MWK — Malawian Kwacha</option>
              <option value="ZMW">ZMW — Zambian Kwacha</option>
              <option value="MZN">MZN — Mozambican Metical</option>
              <option value="BWP">BWP — Botswana Pula</option>
              <option value="NAD">NAD — Namibian Dollar</option>
              <option value="LSL">LSL — Lesotho Loti</option>
              <option value="SZL">SZL — Swazi Lilangeni</option>
              <option value="MGA">MGA — Malagasy Ariary</option>
            </optgroup>
            <optgroup label="North Africa">
              <option value="EGP">EGP — Egyptian Pound</option>
              <option value="DZD">DZD — Algerian Dinar</option>
              <option value="MAD">MAD — Moroccan Dirham</option>
              <option value="TND">TND — Tunisian Dinar</option>
              <option value="LYD">LYD — Libyan Dinar</option>
              <option value="SDG">SDG — Sudanese Pound</option>
            </optgroup>
            <optgroup label="Global">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="CHF">CHF — Swiss Franc</option>
              <option value="JPY">JPY — Japanese Yen</option>
              <option value="CNY">CNY — Chinese Yuan</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="SAR">SAR — Saudi Riyal</option>
              <option value="AED">AED — UAE Dirham</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Transaction Fee Structure *</label>
        <select
          value={formData.fee_structure}
          onChange={(e) => setFormData({ ...formData, fee_structure: e.target.value as 'sender' | 'receiver' | 'shared' })}
          className={inputClasses}
          required
          aria-label="Transaction fee structure"
          title="Transaction fee structure"
        >
          <option value="sender">Sender pays</option>
          <option value="receiver">Receiver pays</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Instructions</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className={inputClasses}
          rows={3}
          placeholder="Include project code as reference"
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
          id="mobile-status"
          checked={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
          className="w-4 h-4 text-gg-primary border-gray-300 rounded focus:ring-gg-primary"
          title="Active status"
          aria-label="Active status"
        />
        <label htmlFor="mobile-status" className="text-sm font-medium text-gray-700">Active</label>
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
