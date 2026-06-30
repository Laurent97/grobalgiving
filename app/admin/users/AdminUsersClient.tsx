'use client'

import { useState } from 'react'
import { Search, Users, Shield, Briefcase, User, Calendar, Check, X, Loader2, Pencil, Trash2, Eye, XIcon } from 'lucide-react'
import { useToast } from '@/components/Toast'
import type { UserRole } from '@/lib/permissions'

interface Nonprofit {
  id: string
  name: string
}

interface Profile {
  id: string
  full_name?: string
  role: 'admin' | 'nonprofit_admin' | 'donor'
  nonprofit_id?: string | null
  avatar_url?: string
  created_at: string
  nonprofit: Nonprofit | null
}

interface AdminUsersClientProps {
  profiles: Profile[]
  nonprofits: Nonprofit[]
  missingServiceKey?: boolean
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

export default function AdminUsersClient({ profiles: initialProfiles, nonprofits, missingServiceKey }: AdminUsersClientProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('donor')
  const [saving, setSaving] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', role: 'donor' as UserRole, nonprofit_id: '' })
  const [deleting, setDeleting] = useState(false)
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

  const openEditModal = (profile: Profile) => {
    setSelectedProfile(profile)
    setForm({
      full_name: profile.full_name || '',
      role: profile.role,
      nonprofit_id: profile.nonprofit_id || '',
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedProfile(null)
  }

  const saveUser = async () => {
    if (!selectedProfile) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          role: form.role,
          nonprofit_id: form.nonprofit_id || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }
      const updated = await response.json()
      const nonprofit = nonprofits.find((n) => n.id === updated.profile.nonprofit_id) || null
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id
            ? { ...p, full_name: updated.profile.full_name, role: updated.profile.role, nonprofit_id: updated.profile.nonprofit_id, nonprofit }
            : p
        )
      )
      showToast('success', 'User updated successfully')
      closeEditModal()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const openViewModal = (profile: Profile) => {
    setSelectedProfile(profile)
    setIsViewModalOpen(true)
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedProfile(null)
  }

  const openDeleteModal = (profile: Profile) => {
    setSelectedProfile(profile)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedProfile(null)
  }

  const deleteUser = async () => {
    if (!selectedProfile) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedProfile.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id))
      showToast('success', 'User deleted successfully')
      closeDeleteModal()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
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

      {missingServiceKey && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-900 dark:text-amber-100">
          <p className="font-semibold mb-1">Admin actions are disabled</p>
          <p className="mb-2">
            The <code>SUPABASE_SERVICE_ROLE_KEY</code> environment variable is missing. The user list is shown in read-only mode.
          </p>
          <p>
            Add the key in Vercel → Project → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      )}

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
                          <button
                            onClick={() => openViewModal(profile)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => openEditModal(profile)}
                            disabled={missingServiceKey}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => startEditing(profile)}
                            disabled={editingId === profile.id || missingServiceKey}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition disabled:opacity-50"
                          >
                            Role
                          </button>
                          <button
                            onClick={() => openDeleteModal(profile)}
                            disabled={missingServiceKey}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
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

      {/* ── Edit Modal ── */}
      {isEditModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="nonprofit_admin">Nonprofit Admin</option>
                  <option value="donor">Donor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Nonprofit</label>
                <select
                  value={form.nonprofit_id}
                  onChange={(e) => setForm({ ...form, nonprofit_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {nonprofits.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Only required for Nonprofit Admin role.</p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button onClick={closeEditModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Cancel</button>
              <button
                onClick={saveUser}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {isViewModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
              <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon size={18} /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400"><User size={20} /></div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedProfile.full_name || 'No name'}</p>
                  <p className="text-xs text-gray-500 font-mono">{selectedProfile.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-gray-400">Role</span>
                <span className="col-span-2 font-medium">{roleConfig[selectedProfile.role]?.label || selectedProfile.role}</span>
                <span className="text-gray-400">Nonprofit</span>
                <span className="col-span-2">{selectedProfile.nonprofit?.name || '-'}</span>
                <span className="text-gray-400">Joined</span>
                <span className="col-span-2">{new Date(selectedProfile.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button onClick={closeViewModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {isDeleteModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-sm overflow-hidden p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={18} /></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{selectedProfile.full_name || 'this user'}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Cancel</button>
              <button
                onClick={deleteUser}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
