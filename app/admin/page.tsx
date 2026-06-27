import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireNonprofitAdmin } from '@/lib/supabase/admin'
import { canViewSection } from '@/lib/permissions'
import AdminShell from '@/components/admin/AdminShell'
import MetricCard from '@/components/admin/MetricCard'
import ActivityItem from '@/components/admin/ActivityItem'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  HeartHandshake,
  LayoutGrid,
  TrendingUp,
  Users
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  unstable_noStore()
  const { profile } = await requireNonprofitAdmin()
  const supabase = await createClient()

  const { count: totalDonations } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true })

  const { count: pendingDonations } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: verifiedDonations } = await supabase
    .from('donations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'verified')

  const { count: pendingProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: recentDonations } = await supabase
    .from('donations')
    .select('*, project:projects(title)')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const totalRevenue = recentDonations?.reduce((sum, d) => sum + d.amount, 0) ?? 0

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <AdminShell role={profile.role}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              aria-label="Date range"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            trend={12.5}
            trendLabel="vs last month"
            icon={DollarSign}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            href="/admin/donations"
          />
          <MetricCard
            title="Total Donations"
            value={String(totalDonations || 0)}
            trend={8.3}
            trendLabel="vs last month"
            icon={HeartHandshake}
            iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            href="/admin/donations"
          />
          <MetricCard
            title="Active Projects"
            value={String(activeProjects || 0)}
            trend={5.2}
            trendLabel="vs last month"
            icon={LayoutGrid}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            href="/admin/projects"
          />
          {canViewSection(profile.role, 'users') && (
            <MetricCard
              title="Total Users"
              value={String(totalUsers || 0)}
              trend={3.2}
              trendLabel="vs last month"
              icon={Users}
              iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              href="/admin/users"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Donations</h2>
              <Link href="/admin/donations" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Project</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations?.map((donation) => (
                    <tr key={donation.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <td className="py-3 text-gray-900 dark:text-white truncate max-w-xs">
                        {donation.project?.title || 'Unknown Project'}
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        ${donation.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          donation.status === 'verified'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : donation.status === 'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {formatTime(donation.created_at)}
                      </td>
                    </tr>
                  ))}
                  {(!recentDonations || recentDonations.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No donations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Pending Donations</span>
                </div>
                <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{pendingDonations || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Verified Donations</span>
                </div>
                <span className="text-lg font-bold text-green-700 dark:text-green-400">{verifiedDonations || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Pending Projects</span>
                </div>
                <span className="text-lg font-bold text-red-700 dark:text-red-400">{pendingProjects || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Active Projects</span>
                </div>
                <span className="text-lg font-bold text-purple-700 dark:text-purple-400">{activeProjects || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Feed</h2>
            <div>
              {recentDonations?.slice(0, 5).map((donation) => (
                <ActivityItem
                  key={`donation-${donation.id}`}
                  icon={HeartHandshake}
                  iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  title={`Donation of $${donation.amount.toLocaleString()}`}
                  description={donation.project?.title || 'Unknown project'}
                  time={formatTime(donation.created_at)}
                />
              ))}
              {recentProjects?.map((project) => (
                <ActivityItem
                  key={`project-${project.id}`}
                  icon={LayoutGrid}
                  iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  title={`Project created: ${project.title}`}
                  description={`Status: ${project.status}`}
                  time={formatTime(project.created_at)}
                />
              ))}
              {(!recentDonations?.length && !recentProjects?.length) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {canViewSection(profile.role, 'vetting') && (
              <Link
                href="/admin/vetting"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Review Pending Projects</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pendingProjects || 0} awaiting vetting</p>
                </div>
              </Link>
              )}
              {canViewSection(profile.role, 'donations') && (
              <Link
                href="/admin/donations"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Verify Donations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{pendingDonations || 0} pending proof</p>
                </div>
              </Link>
              )}
              {canViewSection(profile.role, 'payment_methods') && (
              <Link
                href="/admin/payment-methods"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Methods</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage bank, mobile, crypto</p>
                </div>
              </Link>
              )}
              {canViewSection(profile.role, 'users') && (
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{totalUsers || 0} registered users</p>
                </div>
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
