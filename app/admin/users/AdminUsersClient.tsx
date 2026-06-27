'use client'

import { useState } from 'react'
import { Search, Users, Shield, Briefcase, User, Calendar, Check, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { UserRole } from '@/lib/permissions'

interface Profile {
  id: string
  full_name?: string
  role: 'admin' | 'nonprofit_admin' | 'donor'
  nonprofit_id?: string
  avatar_url?: string
  created_at: string
  nonprofit?: { name: string }
}

interface AdminUsersClientProps {
  profiles: Profile[]
}

const roleConfig = {
  admin: {
    label: 'Admin',
    class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Shield
  },
  nonprofit_admin: {
    label: 'Nonprofit Admin',
    class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Briefcase
  },
  donor: {
    label: 'Donor',
    class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: User
  }
}

export default function AdminUsersClient({ profiles: initialProfiles }: AdminUsersClientProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('donor')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const startEditing = (profile: Profile) => {
    setEditingId(profile.id)
    setEditRole(profile.role)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditRole('donor')
  }

  const saveRole = async (id: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: editRole } : p))
      showToast('success', 'User role updated successfully')
      setEditingId(null)
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter
    return matchesSearch && matchesRole
  })

  const adminCount = profiles.filter(p => p.role === 'admin').length
  const nonprofitCount = profiles.filter(p => p.role === 'nonprofit_admin').length
  const donorCount = profiles.filter(p => p.role === 'donor').length

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color
  }: {
    title: string
    value: string
    icon: typeof Users
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage platform users, roles, and nonprofit associations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={String(profiles.length)}
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Admins"
          value={String(adminCount)}
          icon={Shield}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          title="Nonprofit Admins"
          value={String(nonprofitCount)}
          icon={Briefcase}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'admin', 'nonprofit_admin', 'donor'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  roleFilter === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {role === 'all' ? 'All Users' : roleConfig[role as keyof typeof roleConfig]?.label || role}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-medium">No users found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Nonprofit</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                  <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredProfiles.map((profile) => {
                  const RoleIcon = roleConfig[profile.role]?.icon || User
                  return (
                    <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{profile.full_name || 'No name'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{profile.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === profile.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as UserRole)}
                              className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label="Select role"
                            >
                              <option value="admin">Admin</option>
                              <option value="nonprofit_admin">Nonprofit Admin</option>
                              <option value="donor">Donor</option>
                            </select>
                            <button
                              onClick={() => saveRole(profile.id)}
                              disabled={saving}
                              className="p-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition disabled:opacity-50"
                              aria-label="Save role"
                            >
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={saving}
                              className="p-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition disabled:opacity-50"
                              aria-label="Cancel editing"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig[profile.role]?.class || roleConfig.donor.class}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleConfig[profile.role]?.label || profile.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {profile.nonprofit?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            View
                          </button>
                          <button
                            onClick={() => startEditing(profile)}
                            disabled={editingId === profile.id}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                          >
                            Edit Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
