'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  HeartHandshake,
  Home,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  MonitorPlay,
  Settings,
  Shield,
  Users
} from 'lucide-react'
import { canViewSection, type UserRole } from '@/lib/permissions'
import type { LucideIcon } from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  role?: UserRole | null
}

interface NavSubItem {
  name: string
  href: string
  show: boolean
}

interface NavItem {
  name: string
  href?: string
  icon: LucideIcon
  show: boolean
  items?: NavSubItem[]
}

const navigation = (role: UserRole | null | undefined): NavItem[] => [
  { name: 'Dashboard', href: '/admin', icon: Home, show: canViewSection(role, 'dashboard') },
  {
    name: 'Projects',
    icon: LayoutGrid,
    show: canViewSection(role, 'projects'),
    items: [
      { name: 'All Projects', href: '/admin/projects', show: canViewSection(role, 'projects') },
      { name: 'Vetting', href: '/admin/vetting', show: canViewSection(role, 'vetting') },
    ]
  },
  {
    name: 'Donations',
    icon: HeartHandshake,
    show: canViewSection(role, 'donations'),
    items: [
      { name: 'All Donations', href: '/admin/donations', show: canViewSection(role, 'donations') },
    ]
  },
  {
    name: 'Payment Methods',
    icon: CreditCard,
    show: canViewSection(role, 'payment_methods'),
    items: [
      { name: 'Bank Accounts', href: '/admin/payment-methods', show: canViewSection(role, 'payment_methods') },
      { name: 'Mobile Money', href: '/admin/payment-methods', show: canViewSection(role, 'payment_methods') },
      { name: 'Crypto Wallets', href: '/admin/payment-methods', show: canViewSection(role, 'payment_methods') },
    ]
  },
  { name: 'Users', href: '/admin/users', icon: Users, show: canViewSection(role, 'users') },
  {
    name: 'Content',
    icon: MonitorPlay,
    show: role === 'admin',
    items: [
      { name: 'Hero Slideshow', href: '/admin/slideshow', show: role === 'admin' },
    ]
  },
  { name: 'Reports', href: '/admin', icon: BarChart3, show: canViewSection(role, 'reports') },
  { name: 'Support', href: '/admin', icon: LifeBuoy, show: canViewSection(role, 'support') },
  { name: 'Settings', href: '/admin', icon: Settings, show: canViewSection(role, 'settings') },
]

export default function AdminSidebar({ isOpen, onClose, role }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(['Projects', 'Donations', 'Payment Methods', 'Content'])

  const toggleGroup = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const filteredNavigation = navigation(role).filter(item => item.show)

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 gap-2.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F08B1D' }}>
            <Shield className="w-4 h-4 text-white" />
          </span>
          <span className="text-lg font-bold" style={{ color: '#3E4B59', fontFamily: 'Aleo, Georgia, serif' }}>AcaciaGiving</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const visibleItems = item.items?.filter(sub => sub.show)
            if (visibleItems && visibleItems.length > 0) {
              const open = expanded.includes(item.name)
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    {open ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {open && (
                    <div className="ml-8 mt-1 space-y-1">
                      {visibleItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={onClose}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(sub.href)
                              ? 'bg-orange-50 dark:bg-orange-900/20'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          style={isActive(sub.href) ? { color: '#F08B1D' } : {}}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            if (!item.href) return null

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              style={isActive(item.href) ? { color: '#F08B1D' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
