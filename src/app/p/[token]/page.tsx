'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Proposal {
  id: string; token: string; client_name: string; client_email: string | null
  client_company: string | null; project_title: string; project_description: string | null
  status: string; valid_until: string | null; total_amount: number
  notes: string | null; terms: string | null; business_name: string | null
  business_email: string | null; business_phone: string | null; accent_color: string
  view_count: number; created_at: string; accepted_at: string | null; declined_at: string | null
}

interface LineItem {
  id: string; description: string; quantity: number; unit_price: number; unit: string; sort_order: number
}

export default function PublicProposalPage() {
  const { token } = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [items, setItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [responded, setResponded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('proposals').select('*').eq('token', token).single()
      if (p) {
        setProposal(p)
        const { data: li } = await supabase.from('line_items').select('*').eq('proposal_id', p.id).order('sort_order')
        setItems(li || [])

        // Record view (skip for demo to avoid inflating)
        if (token !== 'demo') {
          await supabase.rpc('record_proposal_view', { proposal_token: token as string })
        }
      }
      setLoading(false)
    }
    load()
  }, [token])

  async function handleRespond(accept: boolean) {
    if (!proposal) return
    const status = accept ? 'accepted' : 'declined'
    const updateData: Record<string, string> = { status }
    if (accept) updateData.accepted_at = new Date().toISOString()
    else updateData.declined_at = new Date().toISOString()

    await supabase.from('proposals').update(updateData).eq('id', proposal.id)
    setProposal({ ...proposal, status, ...(accept ? { accepted_at: new Date().toISOString() } : { declined_at: new Date().toISOString() }) })
    setResponded(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading proposal...</div>
  if (!proposal) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📄</div>
        <h1 className="text-xl font-bold mb-2">Proposal Not Found</h1>
        <p className="text-gray-400">This proposal may have been removed or the link is incorrect.</p>
      </div>
    </div>
  )

  const accent = proposal.accent_color || '#2563eb'
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date()
  const daysLeft = proposal.valid_until ? Math.max(0, Math.ceil((new Date(proposal.valid_until).getTime() - Date.now()) / 86400000)) : null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Bar */}
      <div className="border-b border-gray-800 px-6 py-4" style={{ borderBottomColor: accent + '40' }}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: accent }}>
              {(proposal.business_name || 'P')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white">{proposal.business_name || 'Business'}</div>
              {proposal.business_email && <div className="text-xs text-gray-400">{proposal.business_email}</div>}
            </div>
          </div>
          {proposal.business_phone && (
            <a href={`tel:${proposal.business_phone}`} className="text-sm text-gray-400 hover:text-white">
              📞 {proposal.business_phone}
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Status Banners */}
        {proposal.status === 'accepted' && (
          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 mb-6 text-center">
            <div className="text-emerald-400 font-bold text-lg">✅ Proposal Accepted</div>
            <div className="text-emerald-300 text-sm mt-1">
              Accepted on {proposal.accepted_at ? new Date(proposal.accepted_at).toLocaleDateString() : 'recently'}
            </div>
          </div>
        )}
        {proposal.status === 'declined' && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-6 text-center">
            <div className="text-red-400 font-bold text-lg">❌ Proposal Declined</div>
          </div>
        )}

        {/* Title Section */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-1">PROPOSAL</div>
          <h1 className="text-3xl font-bold mb-2">{proposal.project_title}</h1>
          <div className="text-gray-400">
            Prepared for <strong className="text-white">{proposal.client_name}</strong>
            {proposal.client_company && <span> — {proposal.client_company}</span>}
          </div>
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>Sent {new Date(proposal.created_at).toLocaleDateString()}</span>
            {daysLeft !== null && !isExpired && (
              <span className={daysLeft <= 7 ? 'text-yellow-400' : ''}>
                {daysLeft > 0 ? `Valid for ${daysLeft} more days` : 'Expires today'}
              </span>
            )}
            {isExpired && <span className="text-red-400">Expired</span>}
          </div>
        </div>

        {/* Description */}
        {proposal.project_description && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Project Overview</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{proposal.project_description}</p>
          </div>
        )}

        {/* Line Items */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Scope of Work</h3>
          
          {/* Header */}
          <div className="hidden md:flex text-xs text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-800 mb-2">
            <div className="flex-1">Item</div>
            <div className="w-20 text-right">Qty</div>
            <div className="w-20 text-right">Unit</div>
            <div className="w-28 text-right">Price</div>
            <div className="w-28 text-right">Total</div>
          </div>

          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-800/50 last:border-0">
                <div className="flex-1 font-medium text-white">{item.description}</div>
                <div className="flex gap-4 md:gap-0 text-sm text-gray-400 mt-1 md:mt-0">
                  <div className="w-20 text-right">{item.quantity}</div>
                  <div className="w-20 text-right">{item.unit}</div>
                  <div className="w-28 text-right">${Number(item.unit_price).toLocaleString()}</div>
                  <div className="w-28 text-right text-white font-medium">${(item.quantity * item.unit_price).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t-2 mt-4 pt-4 flex justify-between items-center" style={{ borderTopColor: accent }}>
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold" style={{ color: accent }}>
              ${Number(proposal.total_amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        {proposal.notes && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
            <p className="text-gray-300 whitespace-pre-wrap text-sm">{proposal.notes}</p>
          </div>
        )}

        {/* Terms */}
        {proposal.terms && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
            <p className="text-gray-300 whitespace-pre-wrap text-sm">{proposal.terms}</p>
          </div>
        )}

        {/* Accept/Decline Buttons */}
        {!isExpired && !responded && proposal.status !== 'accepted' && proposal.status !== 'declined' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center mb-6">
            <h3 className="text-xl font-bold mb-2">Ready to move forward?</h3>
            <p className="text-gray-400 text-sm mb-6">Accept this proposal to get started, or decline if it&apos;s not the right fit.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => handleRespond(true)}
                className="px-8 py-3 rounded-lg font-medium text-lg transition-colors text-white hover:opacity-90"
                style={{ backgroundColor: accent }}>
                ✅ Accept Proposal
              </button>
              <button onClick={() => handleRespond(false)}
                className="border border-gray-700 hover:border-red-700 text-gray-400 hover:text-red-400 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
                Decline
              </button>
            </div>
          </div>
        )}

        {responded && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center mb-6 slide-up">
            <div className="text-3xl mb-3">{proposal.status === 'accepted' ? '🎉' : '👍'}</div>
            <h3 className="text-xl font-bold mb-2">
              {proposal.status === 'accepted' ? 'Proposal Accepted!' : 'Response Recorded'}
            </h3>
            <p className="text-gray-400 text-sm">
              {proposal.status === 'accepted'
                ? `${proposal.business_name || 'The business'} has been notified and will be in touch shortly.`
                : 'Thank you for letting us know.'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-800 mt-8">
          <div className="text-xs text-gray-600">
            Powered by <Link href="/" className="text-gray-500 hover:text-white">ProposalDrop</Link> — Professional proposals that win more jobs
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .bg-gray-900, .bg-gray-950 { background: white !important; }
          .border-gray-800, .border-gray-700 { border-color: #e5e5e5 !important; }
          .text-white, .text-gray-300, .text-gray-400 { color: #333 !important; }
          button { display: none !important; }
          nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
