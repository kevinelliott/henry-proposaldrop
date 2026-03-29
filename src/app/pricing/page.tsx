import Link from "next/link"
import Nav from "@/components/Nav"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out ProposalDrop",
    features: ["3 proposals total", "Public proposal links", "E-signature acceptance", "View tracking", "Line-item pricing"],
    cta: "Start free",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For active freelancers",
    features: ["Unlimited proposals", "Everything in Free", "Follow-up alerts", "Proposal analytics", "Custom branding", "Priority support"],
    cta: "Start Starter",
    href: "/login",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$19",
    period: "per month",
    description: "For growing teams",
    features: ["Everything in Starter", "Team members (up to 5)", "Advanced analytics", "API access", "MCP integration", "Custom domain"],
    cta: "Start Growth",
    href: "/login",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.highlighted
                  ? "bg-indigo-600 text-white shadow-xl"
                  : "border border-gray-200 bg-white shadow-sm"
              }`}
            >
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h2>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className={plan.highlighted ? "text-indigo-200" : "text-indigo-600"}>✓</span>
                    <span className={`text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center font-semibold px-6 py-3 rounded-lg transition-colors ${
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
