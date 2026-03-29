import Link from "next/link"
import Nav from "@/components/Nav"

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>✨</span> Now with real-time view notifications
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Proposals that close<br />
          <span className="text-indigo-600">more deals</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Create beautiful, branded proposals in minutes. Track when clients open them, get e-signatures, and win more business.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors">
            Start for free
          </Link>
          <Link href="/p/demo-token-1" className="border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors">
            See a sample proposal
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required. Free plan includes 3 proposals.</p>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6 md:col-span-2">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Dashboard</h3>
            <p className="text-gray-500">Track every proposal from Draft to Accepted. See your total deal value and win rate at a glance.</p>
          </div>
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6">
            <div className="text-3xl mb-3">👁️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Notifications</h3>
            <p className="text-gray-500">Know the moment your client opens your proposal.</p>
          </div>
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">E-Signatures</h3>
            <p className="text-gray-500">Clients sign with a typed name. No DocuSign account needed.</p>
          </div>
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6 md:col-span-2">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Line-Item Pricing</h3>
            <p className="text-gray-500">Build professional pricing tables with quantities, unit prices, and auto-calculated totals. Show clients exactly what they're paying for.</p>
          </div>
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6">
            <div className="text-3xl mb-3">⏰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up Alerts</h3>
            <p className="text-gray-500">Never let a viewed proposal go cold.</p>
          </div>
          <div className="border border-gray-200 bg-white shadow-sm rounded-xl p-6">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shareable Links</h3>
            <p className="text-gray-500">Send a beautiful public link — no login needed for clients.</p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why freelancers choose ProposalDrop</h2>
          <p className="text-gray-500 mb-12">Same features, fraction of the price.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Competitors</p>
              <p className="text-4xl font-bold text-gray-300">$49</p>
              <p className="text-sm text-gray-400 mt-1">per month</p>
            </div>
            <div className="bg-indigo-600 border border-indigo-600 rounded-xl p-6 shadow-sm text-white transform scale-105">
              <p className="text-sm text-indigo-200 mb-1">ProposalDrop</p>
              <p className="text-4xl font-bold">$9</p>
              <p className="text-sm text-indigo-200 mt-1">per month</p>
              <div className="mt-3 bg-indigo-500 rounded-full text-xs px-3 py-1">Best value</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Free plan</p>
              <p className="text-4xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-400 mt-1">3 proposals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Alex Chen", role: "Freelance Designer", quote: "I closed a $15k project the same day I sent the proposal. The client loved how professional it looked." },
            { name: "Maria Santos", role: "Marketing Consultant", quote: "The view notifications changed everything. I follow up at exactly the right moment now." },
            { name: "James Miller", role: "Web Developer", quote: "Finally ditched Word docs for proposals. My win rate went from 40% to 65% in 2 months." },
          ].map((t) => (
            <div key={t.name} className="border border-gray-200 bg-white shadow-sm rounded-xl p-6">
              <p className="text-gray-600 mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to close more deals?</h2>
        <p className="text-indigo-200 mb-8 text-lg">Join thousands of freelancers winning more business with ProposalDrop.</p>
        <Link href="/dashboard" className="bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-lg text-lg hover:bg-indigo-50 transition-colors inline-block">
          Start for free — no card needed
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 ProposalDrop. All rights reserved.</p>
      </footer>
    </div>
  )
}
