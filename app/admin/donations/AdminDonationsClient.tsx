'use client'

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  ExternalLink,
  FileText,
  Landmark,
  Smartphone,
  Bitcoin,
  Filter,
  Download,
  Eye,
  Mail,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { Donation } from '@/types'
import type { UserRole } from '@/lib/permissions'

interface AdminDonationsClientProps {
  initialDonations: Donation[]
  role?: UserRole | null
  missingServiceKey?: boolean
  rawCount?: number
}

const statusConfig = {
  pending: {
    label: 'Pending',
    class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    dot: 'bg-yellow-500'
  },
  verified: {
    label: 'Verified',
    class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500'
  },
  completed: {
    label: 'Completed',
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500'
  },
  rejected: {
    label: 'Rejected',
    class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500'
  },
  failed: {
    label: 'Failed',
    class: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-500'
  }
}

const methodLabels: Record<string, string> = {
  bank: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  crypto: 'Cryptocurrency',
  card: 'Card'
}

export default function AdminDonationsClient({ initialDonations, role, missingServiceKey, rawCount }: AdminDonationsClientProps) {
  const { showToast } = useToast()
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)

  const handleVerify = async (id: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/donations/${id}/verify`, { method: 'PUT' })
      const data = await response.json()

      if (response.ok) {
        setDonations(prev => prev.map(d => d.id === id ? data.donation : d))
        showToast('success', 'Donation verified successfully')
      } else {
        showToast('error', data.error || 'Failed to verify donation')
      }
    } catch (err) {
      showToast('error', 'Failed to verify donation')
      console.error('Error verifying donation:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      showToast('error', 'Please provide a reason for rejection')
      return
    }

    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/donations/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      })
      const data = await response.json()

      if (response.ok) {
        setDonations(prev => prev.map(d => d.id === id ? data.donation : d))
        setRejectingId(null)
        setRejectReason('')
        showToast('success', 'Donation rejected')
      } else {
        showToast('error', data.error || 'Failed to reject donation')
      }
    } catch (err) {
      showToast('error', 'Failed to reject donation')
      console.error('Error rejecting donation:', err)
    } finally {
      setProcessingId(null)
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    if (type === 'bank') return <Landmark className="w-4 h-4" />
    if (type === 'mobile_money') return <Smartphone className="w-4 h-4" />
    if (type === 'crypto') return <Bitcoin className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const filteredDonations = donations.filter(donation => {
    const matchesFilter = filter === 'all' || donation.status === filter
    const matchesSearch = !searchTerm ||
      donation.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const pendingCount = donations.filter(d => d.status === 'pending').length
  const verifiedCount = donations.filter(d => d.status === 'verified' || d.status === 'completed').length
  const rejectedCount = donations.filter(d => d.status === 'rejected').length

  const StatCard = ({
    title,
    value,
    trend,
    icon: Icon,
    color
  }: {
    title: string
    value: string
    trend?: number
    icon: typeof CheckCircle
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trend >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review, verify, and manage all donations across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {missingServiceKey && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
          <p className="font-semibold mb-1">⚠️ Service role key missing — verify / reject actions are disabled</p>
          <p className="mb-2">
            The <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> environment variable is not set.
            Donations are shown in read-only mode and some data may be incomplete due to RLS restrictions.
          </p>
          <p className="font-medium">
            Fix: Vercel → Your project → Settings → Environment Variables → add <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> → Redeploy.
          </p>
        </div>
      )}

      {!missingServiceKey && rawCount === 0 && donations.length === 0 && (
        <div className="mb-6 rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-1">No donations in the database yet</p>
          <p>Donations will appear here once donors submit payments through the platform.</p>
          <p className="mt-1">If you expected to see donations, make sure the SQL migration has been run in your Supabase project (copy from <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">supabase-migration.sql</code>).</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Donations"
          value={String(donations.length)}
          trend={8.3}
          icon={CheckCircle}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalAmount.toLocaleString()}`}
          trend={12.5}
          icon={CheckCircle}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Pending Verification"
          value={String(pendingCount)}
          trend={-2.1}
          icon={CheckCircle}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <StatCard
          title="Rejected"
          value={String(rejectedCount)}
          icon={XCircle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {statusConfig[status as keyof typeof statusConfig]?.label || status}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by reference, project, or donor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">No donations found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Donation</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Donor</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Method</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{donation.transaction_reference || 'No reference'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{donation.project?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 dark:text-white">{donation.donor?.full_name || 'Anonymous'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${donation.amount.toLocaleString()} {donation.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        {getPaymentMethodIcon(donation.payment_method_type || '')}
                        {methodLabels[donation.payment_method_type || ''] || donation.payment_method_type || 'Card'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusConfig[donation.status as keyof typeof statusConfig]?.class || statusConfig.pending.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[donation.status as keyof typeof statusConfig]?.dot || statusConfig.pending.dot}`}></span>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(donation.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDonation(donation)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                          title="View details"
                          aria-label="View donation details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {donation.receipt_url && (
                          <a
                            href={donation.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                            title="View receipt"
                            aria-label="View receipt"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {donation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(donation.id)}
                              disabled={processingId === donation.id || missingServiceKey}
                              className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 disabled:opacity-50"
                              title="Verify"
                              aria-label="Verify donation"
                            >
                              {processingId === donation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setRejectingId(donation.id)}
                              disabled={missingServiceKey}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 disabled:opacity-50"
                              title="Reject"
                              aria-label="Reject donation"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                          title="Email donor"
                          aria-label="Email donor"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Donation</h3>
              <button
                onClick={() => {
                  setRejectingId(null)
                  setRejectReason('')
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this donation. The donor will be notified via email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingId(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                disabled={processingId === rejectingId}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {processingId === rejectingId && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject Donation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDonation.transaction_reference}</p>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDonation.donor?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${selectedDonation.amount.toLocaleString()} {selectedDonation.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Method</p>
                  <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    {getPaymentMethodIcon(selectedDonation.payment_method_type || '')}
                    {methodLabels[selectedDonation.payment_method_type || ''] || selectedDonation.payment_method_type}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDonation.project?.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDonation.project?.nonprofit?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedDonation.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusConfig[selectedDonation.status as keyof typeof statusConfig]?.class || statusConfig.pending.class}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedDonation.status as keyof typeof statusConfig]?.dot || statusConfig.pending.dot}`}></span>
                    {selectedDonation.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedDonation.dedication_type && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dedication</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedDonation.dedication_type === 'memory' ? 'In memory of' : 'In honor of'} {selectedDonation.dedication_name}
                </p>
              </div>
            )}

            {selectedDonation.admin_notes && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Admin Notes</p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedDonation.admin_notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {selectedDonation.receipt_url && (
                <a
                  href={selectedDonation.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Receipt
                </a>
              )}
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
