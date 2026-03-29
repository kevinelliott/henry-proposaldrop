"use client"
import { useState, useEffect } from "react"
import { Proposal } from "@/lib/types"
import { format } from "date-fns"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-50 text-blue-600",
    viewed: "bg-amber-50 text-amber-600",
    accepted: "bg-green-50 text-green-600",
    declined: "bg-red-50 text-red-600",
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${map[status] || map.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function ProposalPublicView({ proposal: initialProposal }: { proposal: Proposal }) {
  const [proposal] = useState(initialProposal)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)
  const [signatureName, setSignatureName] = useState("")
  const [accepted, setAccepted] = useState(proposal.status === "accepted")
  const [declined, setDeclined] = useState(proposal.status === "declined")
  const [submitting, setSubmitting] = useState(false)

  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date()
  const canAct = !accepted && !declined && !isExpired

  useEffect(() => {
    // Track view
    fetch(`/api/proposals/${proposal.public_token}/view`, { method: "POST" }).catch(() => {})
  }, [proposal.public_token])

  const handleAccept = async () => {
    if (!signatureName.trim()) return
    setSubmitting(true)
    try {
      await fetch(`/api/proposals/${proposal.public_token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signatureName }),
      })
      setAccepted(true)
      setShowAcceptModal(false)
    } catch {
      // In demo mode, just mark as accepted
      setAccepted(true)
      setShowAcceptModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    setSubmitting(true)
    try {
      await fetch(`/api/proposals/${proposal.public_token}/decline`, { method: "POST" })
      setDeclined(true)
      setShowDeclineConfirm(false)
    } catch {
      setDeclined(true)
      setShowDeclineConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Status */}
        <div className="flex justify-end mb-4">
          <StatusBadge status={accepted ? "accepted" : declined ? "declined" : proposal.status} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="bg-indigo-600 px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-2">{proposal.title}</h1>
            {proposal.cover_tagline && <p className="text-indigo-200 text-xl">{proposal.cover_tagline}</p>}
            <div className="mt-6 pt-6 border-t border-indigo-500 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-indigo-300 text-sm">Prepared for</p>
                <p className="font-semibold text-lg">{proposal.client_name}</p>
              </div>
              {proposal.valid_until && (
                <div className="text-right">
                  <p className="text-indigo-300 text-sm">Valid until</p>
                  <p className={`font-semibold ${isExpired ? "text-red-300" : ""}`}>
                    {format(new Date(proposal.valid_until), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            {/* Banners */}
            {accepted && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4">
                <p className="text-green-700 font-semibold">✓ Accepted by {proposal.accepted_by_name || signatureName} on {format(proposal.accepted_at ? new Date(proposal.accepted_at) : new Date(), "MMMM d, yyyy")}</p>
              </div>
            )}
            {declined && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4">
                <p className="text-red-700 font-semibold">✗ This proposal was declined.</p>
              </div>
            )}
            {isExpired && !accepted && !declined && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
                <p className="text-amber-700">⚠️ This proposal expired on {format(new Date(proposal.valid_until!), "MMMM d, yyyy")}. Please contact us for an updated proposal.</p>
              </div>
            )}

            {proposal.intro && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Introduction</h2>
                <p className="text-gray-600 whitespace-pre-line">{proposal.intro}</p>
              </section>
            )}
            {proposal.scope && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Scope of Work</h2>
                <p className="text-gray-600 whitespace-pre-line">{proposal.scope}</p>
              </section>
            )}
            {proposal.deliverables && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Deliverables</h2>
                <p className="text-gray-600 whitespace-pre-line">{proposal.deliverables}</p>
              </section>
            )}
            {proposal.timeline && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Timeline</h2>
                <p className="text-gray-600 whitespace-pre-line">{proposal.timeline}</p>
              </section>
            )}

            {proposal.proposal_items && proposal.proposal_items.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Investment</h2>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-gray-500 font-medium px-4 py-3">Item</th>
                        <th className="text-right text-gray-500 font-medium px-4 py-3">Qty</th>
                        <th className="text-right text-gray-500 font-medium px-4 py-3">Unit</th>
                        <th className="text-right text-gray-500 font-medium px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.proposal_items.map((item, i) => (
                        <tr key={item.id} className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                          <td className="px-4 py-3 text-gray-900">
                            <p className="font-medium">{item.name}</p>
                            {item.description && <p className="text-gray-400 text-xs mt-0.5">{item.description}</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-500">${item.unit_price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-indigo-600 text-white border-t-2 border-indigo-600">
                        <td colSpan={3} className="px-4 py-3 font-bold">Total Investment</td>
                        <td className="px-4 py-3 text-right font-bold text-xl">${proposal.total_amount.toLocaleString()} {proposal.currency}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {proposal.terms && (
              <section className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Terms &amp; Conditions</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line">{proposal.terms}</p>
              </section>
            )}

            {/* Action buttons */}
            {canAct && (
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAcceptModal(true)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-lg"
                >
                  Accept Proposal
                </button>
                <button
                  onClick={() => setShowDeclineConfirm(true)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium px-6 py-3.5 rounded-xl transition-colors"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Powered by <a href="/" className="text-indigo-500 hover:underline">ProposalDrop</a>
        </p>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accept Proposal</h2>
            <p className="text-gray-500 mb-6">Type your full name below as your digital signature to accept this proposal.</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (Digital Signature)</label>
              <input
                type="text"
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                placeholder="Type your full name"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 font-medium"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={!signatureName.trim() || submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? "Signing..." : "Sign & Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirm */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Decline Proposal</h2>
            <p className="text-gray-500 mb-6">Are you sure you want to decline this proposal? The sender will be notified.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={submitting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? "Declining..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
