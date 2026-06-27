import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get cart items for the user
  let cartItems = []
  if (user) {
    const { data } = await supabase
      .from('donation_cart')
      .select(`
        *,
        project:projects(*, nonprofit:nonprofits(*))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    cartItems = data || []
  }

  const userProfile = user ? {
    id: user.id,
    full_name: user.user_metadata?.full_name || null,
    role: (user.user_metadata?.role || 'donor') as 'donor' | 'nonprofit_admin' | 'admin',
    nonprofit_id: user.user_metadata?.nonprofit_id || null,
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at || new Date().toISOString()
  } : null

  return <CheckoutClient initialCartItems={cartItems} user={userProfile} />
}
