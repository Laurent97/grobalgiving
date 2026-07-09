import { unstable_noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'
import AdminShell from '@/components/admin/AdminShell'
import AdminPaymentMethodsClient from './AdminPaymentMethodsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentMethodsPage() {
  unstable_noStore()
  const { profile } = await requireAdmin()
  const supabase = await createClient()

  const [bankAccounts, mobileMoney, cryptoWallets, paypalAccounts] = await Promise.all([
    supabase.from('bank_accounts').select('*').order('display_order', { ascending: true }),
    supabase.from('mobile_money_accounts').select('*').order('display_order', { ascending: true }),
    supabase.from('crypto_wallets').select('*').order('display_order', { ascending: true }),
    supabase.from('paypal_accounts').select('*').order('display_order', { ascending: true })
  ])

  return (
    <AdminShell role={profile.role}>
      <AdminPaymentMethodsClient
        bankAccounts={bankAccounts.data || []}
        mobileMoney={mobileMoney.data || []}
        cryptoWallets={cryptoWallets.data || []}
        paypalAccounts={paypalAccounts.data || []}
      />
    </AdminShell>
  )
}
