'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [estimateCount, setEstimateCount] = useState(20)
  const [avgValue, setAvgValue] = useState(5000)
  const [closeRate, setCloseRate] = useState(25)

  const currentRevenue = estimateCount * 12 * avgValue * (closeRate / 100)
  const improvedRevenue = estimateCount * 12 * avgValue * (Math.min(closeRate + 18, 100) / 100)
  const lostRevenue = improvedRevenue - currentRevenue

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
            <Link href="/p/demo" className="text-gray-400 hover:text-white text-sm">Live Demo</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white text-sm">Pricing</Link>
            <Link href="/login" className="text-gray-400 hover:text-white text-sm">Log In</Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-blue-600/10 border border-blue-600/30 rounded-full px-4 py-1 text-blue-400 text-sm mb-6">
            Professional proposals close 3x more deals
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Stop Losing Jobs to<br />
            <span className="text-blue-500">Ugly Estimates</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create professional, branded proposals in 60 seconds. Know the instant your client opens it. 
            Close more deals. <strong className="text-white">$9/mo — not $35.</strong>
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors pulse-glow">
              Create Your First Proposal →
            </Link>
            <Link href="/p/demo" className="border border-gray-700 hover:border-gray-500 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
              See Live Demo
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="flex justify-center gap-8 text-gray-500 text-sm">
            <div>📄 <strong className="text-white">2,400+</strong> proposals sent</div>
            <div>👁️ <strong className="text-white">89%</strong> viewed within 24hrs</div>
            <div>✅ <strong className="text-white">43%</strong> avg acceptance rate</div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">You Did the Work. Then Sent... <span className="text-red-400">This?</span></h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-8">
              <div className="text-red-400 font-bold mb-4 text-lg">❌ What You&apos;re Sending Now</div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-400 space-y-1">
                <p>Hey Sarah,</p>
                <p>Here&apos;s the estimate for your kitchen:</p>
                <p>Cabinets: $5,400</p>
                <p>Counters: $3,825</p>
                <p>Plumbing: $2,200</p>
                <p>Total: $18,750</p>
                <p>Let me know.</p>
                <p>- Mike</p>
              </div>
              <p className="text-red-300 text-sm mt-4">Looks like a text message. No branding. No terms. No professionalism.</p>
            </div>
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-8">
              <div className="text-emerald-400 font-bold mb-4 text-lg">✅ What ProposalDrop Sends</div>
              <div className="bg-gray-900 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-xs font-bold">TC</div>
                  <span className="font-semibold text-white">Thompson Contracting</span>
                </div>
                <div className="text-lg font-bold text-white">Complete Kitchen Renovation</div>
                <div className="text-gray-400">Prepared for Sarah Johnson — Modern Home Designs</div>
                <div className="border-t border-gray-700 my-3"></div>
                <div className="flex justify-between text-gray-300">
                  <span>Custom Shaker Cabinets (12)</span>
                  <span className="text-white font-medium">$5,400</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Quartz Countertops (45 sq ft)</span>
                  <span className="text-white font-medium">$3,825</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>+ 7 more line items...</span>
                  <span></span>
                </div>
                <div className="border-t border-gray-700 my-3"></div>
                <div className="flex justify-between font-bold text-emerald-400 text-lg">
                  <span>Total</span>
                  <span>$18,750</span>
                </div>
              </div>
              <p className="text-emerald-300 text-sm mt-4">Branded. Professional. With terms, line items, and online accept/decline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="px-6 py-16 border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Much Revenue Are You Leaving on the Table?</h2>
          <p className="text-gray-400 text-center mb-10">Professional proposals close 18% more deals on average (PandaDoc data)</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Proposals sent per month</label>
              <input type="number" value={estimateCount} onChange={e => setEstimateCount(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Average job value ($)</label>
              <input type="number" value={avgValue} onChange={e => setAvgValue(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current close rate (%)</label>
              <input type="number" value={closeRate} onChange={e => setCloseRate(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 border border-blue-700/50 rounded-xl p-8 text-center">
            <div className="text-sm text-gray-400 mb-2">You&apos;re leaving an estimated</div>
            <div className="text-5xl font-bold text-emerald-400 mb-2">${lostRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400">per year on the table by not using professional proposals</div>
            <div className="mt-4 flex justify-center gap-8 text-sm">
              <div>
                <div className="text-gray-500">Current Annual Revenue</div>
                <div className="text-xl font-bold text-gray-300">${currentRevenue.toLocaleString()}</div>
              </div>
              <div className="text-3xl text-gray-600">→</div>
              <div>
                <div className="text-gray-500">With ProposalDrop</div>
                <div className="text-xl font-bold text-emerald-400">${improvedRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Close More Deals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: '60-Second Proposals', desc: 'Pick a template, fill in details, send. Professional branded proposals without the designer.' },
              { icon: '👁️', title: 'Real-Time View Tracking', desc: 'Know the instant your client opens your proposal. See how many times they viewed it. Call when they\'re hot.' },
              { icon: '✅', title: 'Online Accept/Decline', desc: 'Clients accept or decline right from the proposal page. No more "let me think about it" black holes.' },
              { icon: '📊', title: 'Close Rate Analytics', desc: 'Track your win rate across proposals. See which templates and price points close best.' },
              { icon: '🎨', title: 'Your Brand, Your Colors', desc: 'Custom colors, your business name, phone, email. Every proposal looks like it came from a $50K agency.' },
              { icon: '📱', title: 'Mobile-First Client View', desc: 'Clients view on their phone. Beautiful, responsive, professional. Makes your business look elite.' },
            ].map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* View Tracking Hero */}
      <section className="px-6 py-16 border-t border-gray-800 bg-blue-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">🔔 &quot;Sarah viewed your proposal 4 times today&quot;</h2>
          <p className="text-xl text-gray-400 mb-8">
            That&apos;s not curiosity — that&apos;s buying intent. ProposalDrop tells you exactly when to follow up.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md mx-auto">
            <div className="space-y-3">
              {[
                { time: '9:15 AM', text: 'Sarah opened your proposal', views: 1 },
                { time: '2:22 PM', text: 'Sarah viewed again', views: 2 },
                { time: '3:05 PM', text: 'Sarah viewed for 4m 32s', views: 3 },
                { time: '7:30 PM', text: '🔥 Sarah viewed 4th time — CALL NOW', views: 4 },
              ].map((e, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${i === 3 ? 'bg-blue-900/30 border border-blue-700/50 rounded-lg p-3' : 'p-2'}`}>
                  <span className="text-gray-500 w-16 flex-shrink-0">{e.time}</span>
                  <span className={i === 3 ? 'text-blue-300 font-medium' : 'text-gray-300'}>{e.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Honest Pricing</h2>
          <p className="text-gray-400 text-center mb-12">One closed deal pays for a year of ProposalDrop</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: '/forever', features: ['3 proposals/month', 'View tracking', 'Online accept/decline', 'ProposalDrop branding'], cta: 'Start Free', highlight: false },
              { name: 'Pro', price: '$9', period: '/month', features: ['Unlimited proposals', 'View tracking + analytics', 'Online accept/decline', 'Your branding (no watermark)', 'Custom accent colors', 'Priority support'], cta: 'Start Free Trial', highlight: true },
              { name: 'Team', price: '$29', period: '/month', features: ['Everything in Pro', 'Up to 5 team members', 'Team analytics dashboard', 'Template library', 'Client CRM view', 'API access'], cta: 'Start Free Trial', highlight: false },
            ].map((p, i) => (
              <div key={i} className={`rounded-xl p-8 ${p.highlight ? 'bg-blue-600/10 border-2 border-blue-600 relative' : 'bg-gray-900 border border-gray-800'}`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>}
                <div className="text-lg font-bold mb-2">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-gray-400">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-3 rounded-lg font-medium transition-colors ${p.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">
            vs. PandaDoc <span className="line-through">$35/mo</span> • Proposify <span className="line-through">$49/mo</span> • HoneyBook <span className="line-through">$19/mo</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-gray-800 bg-gradient-to-b from-gray-950 to-blue-950/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Your Next Proposal Could Be the One That Closes</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of service businesses winning more jobs with professional proposals</p>
          <Link href="/signup" className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-medium text-lg transition-colors">
            Create Your First Proposal Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <div>© 2026 ProposalDrop. Built for businesses that close.</div>
          <div className="flex gap-6">
            <Link href="/p/demo" className="hover:text-white">Demo</Link>
            <Link href="#pricing" className="hover:text-white">Pricing</Link>
            <Link href="/login" className="hover:text-white">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
