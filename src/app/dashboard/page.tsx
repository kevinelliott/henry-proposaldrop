'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Proposal {
  id: string
  token: string
  client_name: string
  client_company: string | null
  project_title: string
  status: string
  total_amount: number
  view_count: number
  last_viewed_at: string | null
  first_viewed_at: string | null
  created_at: string
  valid_until: string | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  sent: 'bg-blue-900 text-blue-300',
  viewed: 'bg-yellow-900 text-yellow-300',
  accepted: 'bg-emerald-900 text-emerald-300',
  declined: 'bg-red-900 text-red-300',
  expired: 'bg-gray-800 text-gray-500',
}

export default function DashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { business_name?: string } } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setProposals(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalProposals = proposals.length
  const totalValue = proposals.reduce((s, p) => s + Number(p.total_amount), 0)
  const acceptedValue = proposals.filter(p => p.status === 'accepted').reduce((s, p) => s + Number(p.total_amount), 0)
  const closeRate = totalProposals > 0 ? Math.round((proposals.filter(p => p.status === 'accepted').length / totalProposals) * 100) : 0
  const totalViews = proposals.reduce((s, p) => s + p.view_count, 0)

  function timeAgo(date: string | null) {
    if (!date) return 'Never'
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">PD</div>
            <span className="text-xl font-bold">ProposalDrop</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-400">{user?.user_metadata?.business_name || user?.email}</span>
            <button onClick={handleSignOut} className="text-gray-500 hover:text-white text-sm">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Proposals', value: totalProposals, icon: '📄' },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: '💰' },
            { label: 'Won Value', value: `$${acceptedValue.toLocaleString()}`, icon: '✅' },
            { label: 'Close Rate', value: `${closeRate}%`, icon: '📊' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <span>{s.icon}</span> {s.label}
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Proposals</h2>
          <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Proposal
          </Link>
        </div>

        {/* Hot Leads Alert */}
        {proposals.filter(p => p.view_count >= 3 && p.status === 'viewed').length > 0 && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-300 font-medium mb-2">
              🔥 Hot Leads — These clients are actively reviewing your proposals
            </div>
            {proposals.filter(p => p.view_count >= 3 && p.status === 'viewed').map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-white">{p.client_name} — {p.project_title}</span>
                <span className="text-blue-300">{p.view_count} views • Last: {timeAgo(p.last_viewed_at)}</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-bold mb-2">No proposals yet</h3>
            <p className="text-gray-400 mb-6">Create your first professional proposal in under 60 seconds</p>
            <Link href="/dashboard/new" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Create First Proposal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(p => (
              <Link key={p.id} href={`/dashboard/proposal/${p.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-white">{p.project_title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {p.client_name}{p.client_company ? ` — ${p.client_company}` : ''} • ${Number(p.total_amount).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      {p.view_count > 0 && (
                        <span className={`flex items-center gap-1 ${p.view_count >= 3 ? 'text-blue-400' : 'text-gray-400'}`}>
                          👁️ {p.view_count} {p.view_count >= 3 && '🔥'}
                        </span>
                      )}
                      <span className="text-gray-500">{timeAgo(p.created_at)}</span>
                    </div>
                    {p.last_viewed_at && (
                      <div className="text-xs text-gray-500">Last viewed {timeAgo(p.last_viewed_at)}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View Activity Feed */}
        {totalViews > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">📊 Activity Summary</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{totalViews}</div>
                  <div className="text-sm text-gray-400">Total Views</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">{proposals.filter(p => p.view_count > 0).length}</div>
                  <div className="text-sm text-gray-400">Proposals Viewed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{proposals.filter(p => p.status === 'accepted').length}</div>
                  <div className="text-sm text-gray-400">Accepted</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
