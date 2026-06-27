'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const andthen = searchParams.get('andthen') || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Ensure a profile row exists for the user (create on first login only)
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (user) {
          const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single()
          if (!existing) {
            await supabase.from('profiles').insert({ id: user.id, role: 'donor' })
          }
        }
      } catch (e) {
        console.warn('Could not ensure profile on login', e)
      }

      router.push(andthen)
      router.refresh()
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Login to Your Account</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gg-primary text-white py-2 rounded-lg hover:bg-gg-primary-700 disabled:opacity-50 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a href={andthen ? `/signup?andthen=${encodeURIComponent(andthen)}` : '/signup'} className="text-gg-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-md px-4 py-16"><p>Loading...</p></div>}>
      <LoginPageContent />
    </Suspense>
  )
}
