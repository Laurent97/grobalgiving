"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cartStore'

export default function Navigation() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="bg-gg-primary text-white text-sm py-1">
        <div className="layout-center px-4 flex justify-between">
          <div>Make a difference today — donate or explore projects</div>
          <div className="hidden sm:block">Support global causes</div>
        </div>
      </div>

      <div className="layout-center px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-title text-xl font-bold text-gg-secondary hover:text-gg-primary transition-colors">
            GlobalGiving
          </Link>

          <div className="flex gap-4 items-center">
            <Link href="/" className="text-body text-gray-600 hover:text-gg-secondary transition-colors hidden sm:inline">
              Projects
            </Link>
            <Link href="/cart" className="text-body text-gray-600 hover:text-gg-secondary transition-colors relative hidden sm:inline">
              Cart
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link href="/account" className="text-body text-gray-600 hover:text-gg-secondary transition-colors hidden sm:inline">
              Account
            </Link>

            <button
              onClick={async () => {
                setSigningOut(true)
                try {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/')
                  router.refresh()
                } catch (e) {
                  console.warn('Sign out failed', e)
                } finally {
                  setSigningOut(false)
                }
              }}
              className="text-body text-gray-600 hover:text-gg-secondary transition-colors hidden sm:inline"
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>

            <Link href="/donate" className="bg-gg-primary text-white px-3 py-2 rounded hover:bg-gg-primary-700 transition">
              Donate
            </Link>

            {/* simple mobile menu button */}
            <button onClick={() => setMobileOpen(true)} className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-[80vw] bg-white shadow-lg p-6 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold text-gg-secondary">Menu</div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">Projects</Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium relative">Cart</Link>
              <Link href="/account" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">Account</Link>
              <button
                onClick={async () => {
                  setMobileOpen(false)
                  setSigningOut(true)
                  try {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    router.push('/')
                    router.refresh()
                  } catch (e) {
                    console.warn('Sign out failed', e)
                  } finally {
                    setSigningOut(false)
                  }
                }}
                className="text-gray-700 font-medium w-full text-left"
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>

              <Link href="/donate" onClick={() => setMobileOpen(false)} className="bg-gg-primary text-white px-4 py-2 rounded mt-2">Donate</Link>
            </nav>
          </div>
        </div>
      )}
    </nav>
  )
}
