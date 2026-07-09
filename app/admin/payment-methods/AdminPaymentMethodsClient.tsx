'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Landmark,
  Smartphone,
  Bitcoin,
  Search,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Power,
  MoreHorizontal
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { BankAccount, MobileMoneyAccount, CryptoWallet, PaypalAccount } from '@/types'
import BankAccountForm from './BankAccountForm'
import MobileMoneyForm from './MobileMoneyForm'
import CryptoWalletForm from './CryptoWalletForm'
import PaypalAccountForm from './PaypalAccountForm'

type PaymentMethodType = 'bank' | 'mobile_money' | 'crypto' | 'paypal'

interface AdminPaymentMethodsClientProps {
  bankAccounts: BankAccount[]
  mobileMoney: MobileMoneyAccount[]
  cryptoWallets: CryptoWallet[]
  paypalAccounts: PaypalAccount[]
}

export default function AdminPaymentMethodsClient({
  bankAccounts: initialBankAccounts,
  mobileMoney: initialMobileMoney,
  cryptoWallets: initialCryptoWallets,
  paypalAccounts: initialPaypalAccounts
}: AdminPaymentMethodsClientProps) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<PaymentMethodType>('bank')
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts)
  const [mobileMoney, setMobileMoney] = useState(initialMobileMoney)
  const [cryptoWallets, setCryptoWallets] = useState(initialCryptoWallets)
  const [paypalAccounts, setPaypalAccounts] = useState(initialPaypalAccounts)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BankAccount | MobileMoneyAccount | CryptoWallet | PaypalAccount | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  const tabs = [
    { id: 'bank' as PaymentMethodType, label: 'Bank Accounts', icon: Landmark, count: bankAccounts.length, active: bankAccounts.filter(a => a.status).length },
    { id: 'mobile_money' as PaymentMethodType, label: 'Mobile Money', icon: Smartphone, count: mobileMoney.length, active: mobileMoney.filter(a => a.status).length },
    { id: 'crypto' as PaymentMethodType, label: 'Crypto Wallets', icon: Bitcoin, count: cryptoWallets.length, active: cryptoWallets.filter(a => a.status).length },
    { id: 'paypal' as PaymentMethodType, label: 'PayPal', icon: ArrowUpRight, count: paypalAccounts.length, active: paypalAccounts.filter(a => a.status).length }
  ]

  const handleSuccess = (type: PaymentMethodType, item: BankAccount | MobileMoneyAccount | CryptoWallet | PaypalAccount) => {
    if (editingItem) {
      if (type === 'bank') {
        setBankAccounts(prev => prev.map(a => a.id === item.id ? item as BankAccount : a))
      } else if (type === 'mobile_money') {
        setMobileMoney(prev => prev.map(a => a.id === item.id ? item as MobileMoneyAccount : a))
      } else if (type === 'crypto') {
        setCryptoWallets(prev => prev.map(a => a.id === item.id ? item as CryptoWallet : a))
      } else {
        setPaypalAccounts(prev => prev.map(a => a.id === item.id ? item as PaypalAccount : a))
      }
      showToast('success', 'Payment method updated successfully')
    } else {
      if (type === 'bank') {
        setBankAccounts(prev => [...prev, item as BankAccount])
      } else if (type === 'mobile_money') {
        setMobileMoney(prev => [...prev, item as MobileMoneyAccount])
      } else if (type === 'crypto') {
        setCryptoWallets(prev => [...prev, item as CryptoWallet])
      } else {
        setPaypalAccounts(prev => [...prev, item as PaypalAccount])
      }
      showToast('success', 'Payment method added successfully')
    }
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const handleDelete = async (id: string, type: PaymentMethodType) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return

    setIsDeleting(id)
    try {
      let endpoint = ''
      if (type === 'bank') endpoint = '/api/admin/payment-methods/bank'
      else if (type === 'mobile_money') endpoint = '/api/admin/payment-methods/mobile-money'
      else if (type === 'crypto') endpoint = '/api/admin/payment-methods/crypto'
      else endpoint = '/api/admin/payment-methods/paypal'

      const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        if (type === 'bank') {
          setBankAccounts(prev => prev.filter(a => a.id !== id))
        } else if (type === 'mobile_money') {
          setMobileMoney(prev => prev.filter(a => a.id !== id))
        } else if (type === 'crypto') {
          setCryptoWallets(prev => prev.filter(a => a.id !== id))
        } else {
          setPaypalAccounts(prev => prev.filter(a => a.id !== id))
        }
        showToast('success', 'Payment method deleted successfully')
      } else {
        const error = await response.json()
        showToast('error', error.error || 'Failed to delete payment method')
      }
    } catch (err) {
      showToast('error', 'Failed to delete payment method')
      console.error('Error deleting payment method:', err)
    } finally {
      setIsDeleting(null)
      setDropdownOpen(null)
    }
  }

  const handleToggleStatus = async (id: string, type: PaymentMethodType, currentStatus: boolean) => {
    try {
      let endpoint = ''
      if (type === 'bank') endpoint = '/api/admin/payment-methods/bank'
      else if (type === 'mobile_money') endpoint = '/api/admin/payment-methods/mobile-money'
      else if (type === 'crypto') endpoint = '/api/admin/payment-methods/crypto'
      else endpoint = '/api/admin/payment-methods/paypal'

      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !currentStatus })
      })

      if (response.ok) {
        if (type === 'bank') {
          setBankAccounts(prev => prev.map(a => a.id === id ? { ...a, status: !currentStatus } : a))
        } else if (type === 'mobile_money') {
          setMobileMoney(prev => prev.map(a => a.id === id ? { ...a, status: !currentStatus } : a))
        } else if (type === 'crypto') {
          setCryptoWallets(prev => prev.map(a => a.id === id ? { ...a, status: !currentStatus } : a))
        } else {
          setPaypalAccounts(prev => prev.map(a => a.id === id ? { ...a, status: !currentStatus } : a))
        }
        showToast('success', `Payment method ${!currentStatus ? 'activated' : 'deactivated'}`)
      } else {
        const error = await response.json()
        showToast('error', error.error || 'Failed to update status')
      }
    } catch (err) {
      showToast('error', 'Failed to update status')
      console.error('Error toggling status:', err)
    }
  }

  const getCurrentList = () => {
    switch (activeTab) {
      case 'bank': return bankAccounts
      case 'mobile_money': return mobileMoney
      case 'crypto': return cryptoWallets
      case 'paypal': return paypalAccounts
    }
  }

  const filteredItems = getCurrentList().filter(item => {
    const searchString = searchTerm.toLowerCase()
    if (activeTab === 'bank') {
      const bank = item as BankAccount
      return bank.account_name.toLowerCase().includes(searchString) ||
        bank.bank_name.toLowerCase().includes(searchString) ||
        bank.country.toLowerCase().includes(searchString)
    } else if (activeTab === 'mobile_money') {
      const mobile = item as MobileMoneyAccount
      return mobile.provider_name.toLowerCase().includes(searchString) ||
        mobile.country.toLowerCase().includes(searchString) ||
        mobile.phone_number.toLowerCase().includes(searchString)
    } else if (activeTab === 'crypto') {
      const crypto = item as CryptoWallet
      return crypto.currency_name.toLowerCase().includes(searchString) ||
        crypto.currency_symbol.toLowerCase().includes(searchString) ||
        crypto.network.toLowerCase().includes(searchString)
    } else {
      const paypal = item as PaypalAccount
      return paypal.email.toLowerCase().includes(searchString) ||
        paypal.account_name.toLowerCase().includes(searchString) ||
        paypal.currency.toLowerCase().includes(searchString)
    }
  })

  const StatCard = ({
    title,
    value,
    active,
    total,
    icon: Icon,
    color
  }: {
    title: string
    value: string
    active: number
    total: number
    icon: typeof Landmark
    color: string
  }) => (
    <button
      onClick={() => setActiveTab(title.toLowerCase().includes('bank') ? 'bank' : title.toLowerCase().includes('mobile') ? 'mobile_money' : 'crypto')}
      className={`text-left w-full p-5 rounded-xl border transition-all ${
        (title.toLowerCase().includes('bank') && activeTab === 'bank') ||
        (title.toLowerCase().includes('mobile') && activeTab === 'mobile_money') ||
        (title.toLowerCase().includes('crypto') && activeTab === 'crypto')
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {active} active • {total - active} inactive
          </p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Methods</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage bank accounts, mobile money providers, and crypto wallets.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setIsFormOpen(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {tabs.find(t => t.id === activeTab)?.label}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Bank Accounts"
          value={String(bankAccounts.length)}
          active={bankAccounts.filter(a => a.status).length}
          total={bankAccounts.length}
          icon={Landmark}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Mobile Money"
          value={String(mobileMoney.length)}
          active={mobileMoney.filter(a => a.status).length}
          total={mobileMoney.length}
          icon={Smartphone}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Crypto Wallets"
          value={String(cryptoWallets.length)}
          active={cryptoWallets.filter(a => a.status).length}
          total={cryptoWallets.length}
          icon={Bitcoin}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          title="PayPal"
          value={String(paypalAccounts.length)}
          active={paypalAccounts.filter(a => a.status).length}
          total={paypalAccounts.length}
          icon={ArrowUpRight}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new payment method to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {activeTab === 'bank' && (
                    <>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Account Name</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Bank</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Account Number</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Country</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </>
                  )}
                  {activeTab === 'mobile_money' && (
                    <>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Provider</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Phone Number</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Country</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Network</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </>
                  )}
                  {activeTab === 'crypto' && (
                    <>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Currency</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Wallet Address</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Network</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Min Amount</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </>
                  )}
                  {activeTab === 'paypal' && (
                    <>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Account Name</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Currency</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">PayPal.me</th>
                      <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </>
                  )}
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {activeTab === 'bank' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{(item as BankAccount).account_name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as BankAccount).bank_name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{(item as BankAccount).account_number}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as BankAccount).country}</td>
                      </>
                    )}
                    {activeTab === 'mobile_money' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{(item as MobileMoneyAccount).provider_name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as MobileMoneyAccount).phone_number}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as MobileMoneyAccount).country}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as MobileMoneyAccount).network_type}</td>
                      </>
                    )}
                    {activeTab === 'crypto' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {(item as CryptoWallet).currency_name} ({(item as CryptoWallet).currency_symbol})
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs truncate max-w-[200px]">
                          {(item as CryptoWallet).wallet_address}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as CryptoWallet).network}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {(item as CryptoWallet).min_amount} {(item as CryptoWallet).currency_symbol}
                        </td>
                      </>
                    )}
                    {activeTab === 'paypal' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{(item as PaypalAccount).account_name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as PaypalAccount).email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(item as PaypalAccount).currency}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {(item as PaypalAccount).me_link ? (
                            <a href={(item as PaypalAccount).me_link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">
                              paypal.me link
                            </a>
                          ) : '—'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(item.id, activeTab, item.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.status ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        title={item.status ? 'Deactivate' : 'Activate'}
                        aria-label={item.status ? 'Deactivate' : 'Activate'}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.status ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 relative">
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setIsFormOpen(true)
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {dropdownOpen === item.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg z-10">
                              <button
                                onClick={() => handleToggleStatus(item.id, activeTab, item.status)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-lg"
                              >
                                <Power className="w-4 h-4" />
                                {item.status ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, activeTab)}
                                disabled={isDeleting === item.id}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 last:rounded-b-lg"
                              >
                                {isDeleting === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit' : 'Add'} {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingItem(null)
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'bank' && (
                <BankAccountForm
                  initialData={editingItem as BankAccount | null}
                  onSuccess={(item: BankAccount) => handleSuccess('bank', item)}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingItem(null)
                  }}
                />
              )}
              {activeTab === 'mobile_money' && (
                <MobileMoneyForm
                  initialData={editingItem as MobileMoneyAccount | null}
                  onSuccess={(item: MobileMoneyAccount) => handleSuccess('mobile_money', item)}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingItem(null)
                  }}
                />
              )}
              {activeTab === 'crypto' && (
                <CryptoWalletForm
                  initialData={editingItem as CryptoWallet | null}
                  onSuccess={(item: CryptoWallet) => handleSuccess('crypto', item)}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingItem(null)
                  }}
                />
              )}
              {activeTab === 'paypal' && (
                <PaypalAccountForm
                  initialData={editingItem as PaypalAccount | null}
                  onSuccess={(item: PaypalAccount) => handleSuccess('paypal', item)}
                  onCancel={() => {
                    setIsFormOpen(false)
                    setEditingItem(null)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
