'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  unit: string
}

const templates: Record<string, { name: string; items: LineItem[] }> = {
  home_services: {
    name: '🏠 Home Services',
    items: [
      { description: 'Labor', quantity: 1, unit_price: 0, unit: 'job' },
      { description: 'Materials', quantity: 1, unit_price: 0, unit: 'job' },
      { description: 'Permit & Inspection', quantity: 1, unit_price: 0, unit: 'job' },
    ],
  },
  landscaping: {
    name: '🌿 Landscaping',
    items: [
      { description: 'Design Consultation', quantity: 1, unit_price: 0, unit: 'job' },
      { description: 'Plants & Materials', quantity: 1, unit_price: 0, unit: 'lot' },
      { description: 'Installation Labor', quantity: 1, unit_price: 0, unit: 'job' },
      { description: 'Cleanup & Haul-away', quantity: 1, unit_price: 0, unit: 'job' },
    ],
  },
  consulting: {
    name: '💼 Consulting / Agency',
    items: [
      { description: 'Discovery & Strategy', quantity: 1, unit_price: 0, unit: 'project' },
      { description: 'Implementation', quantity: 1, unit_price: 0, unit: 'project' },
      { description: 'Training & Handoff', quantity: 1, unit_price: 0, unit: 'session' },
    ],
  },
  freelance: {
    name: '🎨 Freelance / Creative',
    items: [
      { description: 'Project Fee', quantity: 1, unit_price: 0, unit: 'project' },
      { description: 'Revisions (up to 2)', quantity: 2, unit_price: 0, unit: 'round' },
    ],
  },
  blank: {
    name: '📝 Blank',
    items: [{ description: '', quantity: 1, unit_price: 0, unit: 'each' }],
  },
}

export default function NewProposalPage() {
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [accentColor, setAccentColor] = useState('#2563eb')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('Payment due within 30 days of acceptance. Work guaranteed for 1 year.')
  const [validDays, setValidDays] = useState(30)
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unit_price: 0, unit: 'each' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function selectTemplate(key: string) {
    setIndustry(key)
    setLineItems(templates[key].items.map(i => ({ ...i })))
    setStep(2)
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, unit: 'each' }])
  }

  function removeLineItem(idx: number) {
    setLineItems(lineItems.filter((_, i) => i !== idx))
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems]
    updated[idx] = { ...updated[idx], [field]: value }
    setLineItems(updated)
  }

  const total = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  async function handleSave(asDraft: boolean) {
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setSaving(false); return }

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validDays)

    const { data: proposal, error: pErr } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        client_name: clientName,
        client_email: clientEmail || null,
        client_company: clientCompany || null,
        project_title: projectTitle,
        project_description: projectDesc || null,
        industry,
        status: asDraft ? 'draft' : 'sent',
        valid_until: validUntil.toISOString(),
        total_amount: total,
        notes: notes || null,
        terms: terms || null,
        business_name: businessName || user.user_metadata?.business_name || null,
        business_email: businessEmail || user.email || null,
        business_phone: businessPhone || null,
        accent_color: accentColor,
      })
      .select()
      .single()

    if (pErr || !proposal) {
      setError(pErr?.message || 'Failed to create proposal')
      setSaving(false)
      return
    }

    // Insert line items
    const items = lineItems.filter(i => i.description).map((i, idx) => ({
      proposal_id: proposal.id,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      unit: i.unit,
      sort_order: idx,
    }))

    if (items.length > 0) {
      await supabase.from('line_items').insert(items)
    }

    router.push(`/dashboard/proposal/${proposal.id}`)
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">PD</div>
            <span className="text-xl font-bold">ProposalDrop</span>
          </Link>
          <div className="text-sm text-gray-400">
            Step {step} of 3
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Template */}
        {step === 1 && (
          <div className="slide-up">
            <h1 className="text-2xl font-bold mb-2">Choose a Template</h1>
            <p className="text-gray-400 mb-8">Pick an industry template or start blank</p>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(templates).map(([key, tmpl]) => (
                <button key={key} onClick={() => selectTemplate(key)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-blue-600 transition-colors">
                  <div className="text-2xl mb-2">{tmpl.name.split(' ')[0]}</div>
                  <div className="font-bold">{tmpl.name.split(' ').slice(1).join(' ')}</div>
                  <div className="text-sm text-gray-400 mt-1">{tmpl.items.length} line items</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="slide-up">
            <h1 className="text-2xl font-bold mb-6">Proposal Details</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Info */}
              <div>
                <h3 className="font-bold text-gray-300 mb-4 uppercase text-xs tracking-wider">Client Info</h3>
                <div className="space-y-3">
                  <input placeholder="Client Name *" value={clientName} onChange={e => setClientName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                  <input placeholder="Client Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                  <input placeholder="Company Name" value={clientCompany} onChange={e => setClientCompany(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Your Info */}
              <div>
                <h3 className="font-bold text-gray-300 mb-4 uppercase text-xs tracking-wider">Your Business</h3>
                <div className="space-y-3">
                  <input placeholder="Business Name *" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                  <input placeholder="Business Email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                  <input placeholder="Business Phone" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-400">Brand Color:</label>
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent" />
                  </div>
                </div>
              </div>
            </div>

            {/* Project */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-300 mb-4 uppercase text-xs tracking-wider">Project</h3>
              <div className="space-y-3">
                <input placeholder="Project Title * (e.g. Kitchen Renovation)" value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" />
                <textarea placeholder="Project Description (optional)" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white">← Back</button>
              <button onClick={() => setStep(3)} disabled={!clientName || !projectTitle}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                Next: Line Items →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Line Items + Terms */}
        {step === 3 && (
          <div className="slide-up">
            <h1 className="text-2xl font-bold mb-6">Line Items & Terms</h1>

            {/* Line Items */}
            <div className="space-y-3 mb-4">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <input placeholder="Description" value={item.description}
                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  <input type="number" placeholder="Qty" value={item.quantity || ''}
                    onChange={e => updateLineItem(idx, 'quantity', Number(e.target.value))}
                    className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  <select value={item.unit} onChange={e => updateLineItem(idx, 'unit', e.target.value)}
                    className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    {['each', 'job', 'hour', 'day', 'sq ft', 'unit', 'lot', 'project', 'session', 'month', 'round'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Price" value={item.unit_price || ''}
                    onChange={e => updateLineItem(idx, 'unit_price', Number(e.target.value))}
                    className="w-28 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  <div className="w-24 text-right text-sm py-2 text-gray-400">
                    ${(item.quantity * item.unit_price).toLocaleString()}
                  </div>
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(idx)} className="text-red-500 hover:text-red-400 px-2 py-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addLineItem} className="text-blue-400 hover:text-blue-300 text-sm mb-6">+ Add Line Item</button>

            {/* Total */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-emerald-400">${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes for Client</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  placeholder="Timeline, special instructions, etc."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Terms & Conditions</label>
                <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none resize-none text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <label className="text-sm text-gray-400">Valid for</label>
              <input type="number" value={validDays} onChange={e => setValidDays(Number(e.target.value))}
                className="w-20 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              <span className="text-sm text-gray-400">days</span>
            </div>

            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 text-sm mb-4">{error}</div>}

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white">← Back</button>
              <div className="flex gap-3">
                <button onClick={() => handleSave(true)} disabled={saving}
                  className="border border-gray-700 hover:border-gray-500 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create & Get Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
