"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cartStore'
import { ShoppingCart, X, Menu, Heart } from 'lucide-react'

export default function Navigation() {
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const signOut = async () => {
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
  }

  const navLinks = [
    { href: '/', label: 'Projects' },
    { href: '/about', label: 'About' },
    { href: '/impact', label: 'Impact' },
  ]

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        {/* Top bar */}
        <div className="bg-[#3E4B59] text-white text-xs py-1.5 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 fill-[#F08B1D] text-[#F08B1D]" />
              Make a difference today — explore projects and donate
            </span>
            <span className="text-white/50">Trusted by 50,000+ donors worldwide</span>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 bg-[#F08B1D] rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 fill-white text-white" />
              </span>
              <span className="text-lg font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>
                GlobalGiving
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-[#F08B1D] bg-orange-50'
                      : 'text-gray-600 hover:text-[#3E4B59] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-gray-600 hover:text-[#3E4B59] hover:bg-gray-50 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#F08B1D] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Auth links */}
              {mounted && user ? (
                <>
                  <Link href="/account" className="hidden md:block text-sm text-gray-600 hover:text-[#3E4B59] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Account
                  </Link>
                  <button
                    onClick={signOut}
                    disabled={signingOut}
                    className="hidden md:block text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {signingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              ) : (
                <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-[#3E4B59] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Sign in
                </Link>
              )}

              {/* Donate CTA */}
              <Link
                href="/"
                className="bg-[#F08B1D] hover:bg-[#D97B1A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hidden sm:flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Donate
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[80vw] max-w-xs bg-white shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="font-bold text-[#3E4B59]" style={{ fontFamily: 'Aleo, Georgia, serif' }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="flex-1 p-5 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
                Cart
                {mounted && getTotalItems() > 0 && (
                  <span className="bg-[#F08B1D] text-white text-xs rounded-full px-2 py-0.5 font-bold">{getTotalItems()}</span>
                )}
              </Link>

              <div className="border-t border-gray-100 my-2" />

              {mounted && user ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">Account</Link>
                  <button onClick={() => { setMobileOpen(false); signOut() }} className="text-left text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {signingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">Sign in</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">Create account</Link>
                </>
              )}
            </nav>

            {/* Drawer footer */}
            <div className="p-5 border-t border-gray-100">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#F08B1D] hover:bg-[#D97B1A] text-white font-semibold px-6 py-3 rounded-xl transition-colors w-full"
              >
                <Heart className="w-4 h-4 fill-white" />
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
