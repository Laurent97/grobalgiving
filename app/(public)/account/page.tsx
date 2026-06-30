import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Heart, DollarSign, ArrowRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: donations }, { data: favorites }, { data: profile }] = await Promise.all([
    supabase.from('donations').select('*, project:projects(title, slug)').eq('donor_id', user.id).order('created_at', { ascending: false }),
    supabase.from('favorites').select('project:projects(*)').eq('user_id', user.id),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
  ])

  const totalGiven = donations?.reduce((s, d) => s + (d.amount || 0), 0) || 0
  const initials = (profile?.full_name || user.email || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6" style={{ background: '#f8f9fa' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: '#3E4B59' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate" style={{ color: '#3E4B59', fontFamily: 'Aleo, Georgia, serif' }}>
              {profile?.full_name || 'My Account'}
            </h1>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#F08B1D' }}>${totalGiven.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Given</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#3E4B59' }}>{donations?.length || 0}</p>
              <p className="text-xs text-gray-400">Donations</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: '#3E4B59' }}>{favorites?.length || 0}</p>
              <p className="text-xs text-gray-400">Saved</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Donation history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                <DollarSign className="w-4 h-4" style={{ color: '#F08B1D' }} />
              </div>
              <h2 className="font-bold text-base" style={{ color: '#3E4B59', fontFamily: 'Aleo, Georgia, serif' }}>Donation History</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{donations?.length || 0}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {donations && donations.length > 0 ? donations.map((donation) => (
                <div key={donation.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug line-clamp-1" style={{ color: '#3E4B59' }}>
                        {donation.project?.title || 'Unknown project'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF3C7', color: '#F08B1D' }}>
                          {donation.frequency === 'monthly' ? '🔁 Monthly' : '⚡ One-time'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(donation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: '#F08B1D' }}>${donation.amount}</p>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-4">No donations yet.</p>
                  <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: '#F08B1D' }}>
                    Browse projects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                <Heart className="w-4 h-4" style={{ color: '#F08B1D' }} />
              </div>
              <h2 className="font-bold text-base" style={{ color: '#3E4B59', fontFamily: 'Aleo, Georgia, serif' }}>Saved Projects</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{favorites?.length || 0}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {favorites && favorites.length > 0 ? (favorites as any[]).map((fav) => (
                <Link
                  key={fav.project.id}
                  href={`/projects/${fav.project.slug}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <Heart className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#F08B1D' }} fill="#F08B1D" />
                  <span className="flex-1 font-medium text-sm line-clamp-1" style={{ color: '#3E4B59' }}>{fav.project.title}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              )) : (
                <div className="px-5 py-10 text-center">
                  <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-4">No saved projects yet.</p>
                  <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: '#F08B1D' }}>
                    Discover projects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
