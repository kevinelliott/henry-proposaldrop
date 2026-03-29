import Nav from "@/components/Nav"

export const dynamic = "force-dynamic"

export default function DocsPage() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-xl text-gray-500 mb-12">Everything you need to get started with ProposalDrop.</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>ProposalDrop helps you create, send, and track professional proposals. Here&apos;s how to get up and running in minutes.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Sign up for a free account</li>
                <li>Click &quot;New Proposal&quot; from the dashboard</li>
                <li>Fill in client details and proposal sections</li>
                <li>Add line items with pricing</li>
                <li>Preview and send the link to your client</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">GET</span>
                  <code className="text-sm text-gray-700">/api/v1/proposals</code>
                </div>
                <p className="text-gray-500 text-sm">List all proposals for the authenticated user.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">POST</span>
                  <code className="text-sm text-gray-700">/api/v1/proposals</code>
                </div>
                <p className="text-gray-500 text-sm">Create a new proposal.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">POST</span>
                  <code className="text-sm text-gray-700">/api/proposals/[token]/view</code>
                </div>
                <p className="text-gray-500 text-sm">Record a proposal view. Called automatically when a client opens the proposal link.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">MCP Integration</h2>
            <p className="text-gray-600 mb-4">ProposalDrop exposes a Model Context Protocol (MCP) server at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">/api/mcp</code> for AI integrations.</p>
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Available tools:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>list_proposals</code> — List all proposals</li>
                <li>• <code>create_proposal</code> — Create a new proposal</li>
                <li>• <code>get_proposal</code> — Get proposal details</li>
                <li>• <code>update_proposal_status</code> — Update proposal status</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
