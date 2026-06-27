import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: donations } = await supabase
    .from('donations')
    .select('*, project:projects(title, slug)')
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false })

  const { data: favorites } = await supabase
    .from('favorites')
    .select('project:projects(*)')
    .eq('user_id', user.id)

  return (
    <div className="layout-center px-4 py-8">
      <h1 className="text-title text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-title text-xl font-semibold mb-4">Donation History</h2>
          <div className="space-y-3">
            {donations && donations.length > 0 ? (
              donations.map((donation) => (
                <div key={donation.id} className="border border-gray-200 rounded-none p-4">
                  <p className="text-title font-semibold">{donation.project?.title}</p>
                  <p className="text-body text-sm text-gray-600">${donation.amount} - {donation.frequency}</p>
                  <p className="text-body text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-body text-gray-600">No donations yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-title text-xl font-semibold mb-4">Favorite Projects</h2>
          <div className="space-y-3">
            {favorites && favorites.length > 0 ? (
              favorites.map((fav: any) => (
                <div key={fav.project.id} className="border border-gray-200 rounded-none p-4">
                  <Link href={`/projects/${fav.project.slug}`} className="text-title font-semibold text-gg-primary hover:underline">
                    {fav.project.title}
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-body text-gray-600">No favorite projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
