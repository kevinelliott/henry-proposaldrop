import Nav from "@/components/Nav"

const features = [
  { icon: "📄", title: "Proposal Builder", desc: "Multi-step form with cover page, sections, line items, and preview. Build proposals in minutes.", size: "large" },
  { icon: "👁️", title: "View Tracking", desc: "Know when and how many times clients open your proposal.", size: "small" },
  { icon: "✍️", title: "E-Signatures", desc: "Type-to-sign acceptance with IP and timestamp recording.", size: "small" },
  { icon: "📊", title: "Pipeline Dashboard", desc: "Kanban-style pipeline: Draft → Sent → Viewed → Accepted → Declined. See your win rate and total deal value.", size: "large" },
  { icon: "🔔", title: "Follow-up Alerts", desc: "Badge alerts for proposals viewed but not acted on in 24h.", size: "small" },
  { icon: "💰", title: "Pricing Tables", desc: "Line-item pricing with quantity, unit price, and auto totals.", size: "small" },
  { icon: "🔗", title: "Public Shareable Links", desc: "Clients never need an account. Just open the link and sign.", size: "small" },
  { icon: "📱", title: "Mobile Responsive", desc: "Proposals look great on any device.", size: "small" },
  { icon: "🔌", title: "API & MCP", desc: "Public API and Model Context Protocol server for automation.", size: "large" },
]

export default function FeaturesPage() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to close deals</h1>
          <p className="text-xl text-gray-500">Built specifically for freelancers and consultants.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`border border-gray-200 bg-white shadow-sm rounded-xl p-6 ${f.size === "large" ? "md:col-span-2" : ""}`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
