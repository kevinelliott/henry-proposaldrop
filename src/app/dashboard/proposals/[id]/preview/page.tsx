import Link from "next/link"
import { DEMO_PROPOSALS } from "@/lib/demo-data"
import { notFound } from "next/navigation"
import { format } from "date-fns"

export default function ProposalPreviewPage({ params }: { params: { id: string } }) {
  const proposal = DEMO_PROPOSALS.find(p => p.id === params.id)
  if (!proposal) notFound()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href={`/dashboard/proposals/${proposal.id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to proposal</Link>
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
          <span>👁️</span> Preview mode — this is how clients see it
        </div>
        <Link href={`/p/${proposal.public_token}`} target="_blank" className="text-sm text-indigo-600 hover:text-indigo-700">Open public link ↗</Link>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-2">{proposal.title}</h1>
            {proposal.cover_tagline && <p className="text-indigo-200 text-xl">{proposal.cover_tagline}</p>}
            <div className="mt-6 pt-6 border-t border-indigo-500 flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm">Prepared for</p>
                <p className="font-semibold text-lg">{proposal.client_name}</p>
              </div>
              {proposal.valid_until && (
                <div className="text-right">
                  <p className="text-indigo-300 text-sm">Valid until</p>
                  <p className="font-semibold">{format(new Date(proposal.valid_until), "MMMM d, yyyy")}</p>
                </div>
              )}
            </div>
          </div>
          <div className="px-8 py-8 space-y-8">
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
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
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
                      <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-gray-900">
                          <p className="font-medium">{item.name}</p>
                          {item.description && <p className="text-gray-400 text-xs">{item.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-500">${item.unit_price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-600 text-white">
                      <td colSpan={3} className="px-4 py-3 font-bold">Total Investment</td>
                      <td className="px-4 py-3 text-right font-bold text-xl">${proposal.total_amount.toLocaleString()} {proposal.currency}</td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}
            {proposal.terms && (
              <section className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Terms</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line">{proposal.terms}</p>
              </section>
            )}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Accept Proposal
              </button>
              <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
