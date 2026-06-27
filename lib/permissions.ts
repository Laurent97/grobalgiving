export type UserRole = 'admin' | 'nonprofit_admin' | 'donor'

export interface PermissionCheck {
  view: boolean
  manage: boolean
  delete: boolean
}

export function canViewSection(role: UserRole | undefined | null, section: 'dashboard' | 'projects' | 'vetting' | 'donations' | 'payment_methods' | 'users' | 'reports' | 'support' | 'settings'): boolean {
  if (!role) return false
  if (role === 'admin') return true
  if (role === 'nonprofit_admin') {
    return ['dashboard', 'projects', 'donations'].includes(section)
  }
  return false
}

export function canManageAllProjects(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canVetProjects(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canManagePaymentMethods(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canManageUsers(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canAccessReports(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canAccessSettings(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canAccessSupport(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

export function canViewProject(role: UserRole | undefined | null, projectNonprofitId?: string | null, userNonprofitId?: string | null): boolean {
  if (!role) return false
  if (role === 'admin') return true
  if (role === 'nonprofit_admin') {
    return !projectNonprofitId || !userNonprofitId || projectNonprofitId === userNonprofitId
  }
  return false
}

export function canEditProject(role: UserRole | undefined | null, projectNonprofitId?: string | null, userNonprofitId?: string | null): boolean {
  return canViewProject(role, projectNonprofitId, userNonprofitId)
}
