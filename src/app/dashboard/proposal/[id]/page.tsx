'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Proposal {
  id: string; token: string; client_name: string; client_email: string | null
  client_company: string | null; project_title: string; project_description: string | null
  industry: string; status: string; valid_until: string | null; total_amount: number
  notes: string | null; terms: string | null; business_name: string | null
  business_email: string | null; business_phone: string | null; accent_color: string
  view_count: number; last_viewed_at: string | null; first_viewed_at: string | null
  accepted_at: string | null; declined_at: string | null; created_at: string
}

interface LineItem {
  id: string; description: string; quantity: number; unit_price: number; unit: string; sort_order: number
}

interface ViewEvent {
  id: string; ip_address: string | null; user_agent: string | null; viewed_at: string
}

export default function ProposalDetailPage() {
  const { id } = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [items, setItems] = useState<LineItem[]>([])
  const [views, setViews] = useState<ViewEvent[]>([])
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('proposals').select('*').eq('id', id).single()
      if (p) setProposal(p)
      
      const { data: li } = await supabase.from('line_items').select('*').eq('proposal_id', id).order('sort_order')
      setItems(li || [])

      const { data: ve } = await supabase.from('view_events').select('*').eq('proposal_id', id).order('viewed_at', { ascending: false })
      setViews(ve || [])
    }
    load()
  }, [id])

  function copyLink() {
    if (!proposal) return
    const url = `${window.location.origin}/p/${proposal.token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (!proposal) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-700 text-gray-300' },
    sent: { label: 'Sent', color: 'bg-blue-900 text-blue-300' },
    viewed: { label: 'Viewed', color: 'bg-yellow-900 text-yellow-300' },
    accepted: { label: '✅ Accepted', color: 'bg-emerald-900 text-emerald-300' },
    declined: { label: '❌ Declined', color: 'bg-red-900 text-red-300' },
    expired: { label: 'Expired', color: 'bg-gray-800 text-gray-500' },
  }

  const st = statusLabels[proposal.status] || statusLabels.draft

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">PD</div>
            <span className="text-xl font-bold">ProposalDrop</span>
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{proposal.project_title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.color}`}>{st.label}</span>
            </div>
            <p className="text-gray-400">
              For {proposal.client_name}{proposal.client_company ? ` — ${proposal.client_company}` : ''}
            </p>
            <p className="text-sm text-gray-500 mt-1">Created {new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/p/${proposal.token}`} target="_blank"
              className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition-colors">
              Preview →
            </Link>
            <button onClick={copyLink}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {copied ? '✓ Copied!' : '📋 Copy Client Link'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Line Items */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Line Items</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <span className="text-white">{item.description}</span>
                      <span className="text-gray-500 ml-2">× {item.quantity} {item.unit}</span>
                    </div>
                    <span className="text-white font-medium">${(item.quantity * item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-400">${Number(proposal.total_amount).toLocaleString()}</span>
              </div>
            </div>

            {/* Notes & Terms */}
            {(proposal.notes || proposal.terms) && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                {proposal.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Notes</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.notes}</p>
                  </div>
                )}
                {proposal.terms && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: View Activity */}
          <div className="space-y-6">
            {/* Client Link */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Client Link</h3>
              <div className="bg-gray-800 rounded-lg p-3 text-sm text-blue-400 break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/p/${proposal.token}` : `/p/${proposal.token}`}
              </div>
              <button onClick={copyLink} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition-colors">
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* View Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">👁️ View Activity</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-white">{proposal.view_count}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{proposal.last_viewed_at ? timeAgo(proposal.last_viewed_at) : 'Never'}</div>
                  <div className="text-xs text-gray-500">Last Viewed</div>
                </div>
              </div>

              {proposal.view_count >= 3 && proposal.status === 'viewed' && (
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
                  <div className="text-blue-300 text-sm font-medium">🔥 Hot Lead</div>
                  <div className="text-xs text-blue-400 mt-1">{proposal.client_name} has viewed this {proposal.view_count} times. Consider calling!</div>
                </div>
              )}

              {/* View Timeline */}
              {views.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">View Timeline</h4>
                  {views.slice(0, 10).map((v, i) => (
                    <div key={v.id} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-16">{timeAgo(v.viewed_at)}</span>
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                      <span className="text-gray-400">Proposal viewed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Print */}
            <button onClick={() => window.open(`/p/${proposal.token}`, '_blank')}
              className="w-full border border-gray-700 hover:border-gray-500 py-2 rounded-lg text-sm transition-colors">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
