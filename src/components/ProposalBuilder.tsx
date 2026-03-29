'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateTotal, formatCurrency, generateToken } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  GripVertical,
} from 'lucide-react';
import type { LineItem, ProposalFormData } from '@/types/index';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyLineItem(): LineItem {
  return { id: generateId(), description: '', qty: 1, rate: 0, amount: 0 };
}

const defaultForm: ProposalFormData = {
  title: '',
  client_name: '',
  client_email: '',
  client_company: '',
  description: '',
  line_items: [emptyLineItem()],
  terms: 'Payment is due within 30 days of invoice. A 50% deposit is required before work begins. All work remains property of the client upon full payment.',
  notes: '',
};

export default function ProposalBuilder() {
  const router = useRouter();
  const [form, setForm] = useState<ProposalFormData>(defaultForm);
  const [loading, setLoading] = useState<'draft' | 'send' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const total = calculateTotal(form.line_items);

  const updateField = <K extends keyof ProposalFormData>(
    key: K,
    value: ProposalFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addLineItem = () => {
    updateField('line_items', [...form.line_items, emptyLineItem()]);
  };

  const removeLineItem = (id: string) => {
    updateField('line_items', form.line_items.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, rawValue: string | number) => {
    updateField(
      'line_items',
      form.line_items.map((item) => {
        if (item.id !== id) return item;
        const value =
          field === 'qty' || field === 'rate'
            ? parseFloat(String(rawValue)) || 0
            : rawValue;
        const updated = { ...item, [field]: value };
        updated.amount = updated.qty * updated.rate;
        return updated;
      })
    );
  };

  const validate = () => {
    if (!form.title.trim()) return 'Proposal title is required.';
    if (form.line_items.length === 0) return 'Add at least one line item.';
    const invalid = form.line_items.find((item) => !item.description.trim());
    if (invalid) return 'All line items must have a description.';
    return null;
  };

  const handleSave = useCallback(
    async (asSend: boolean) => {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(asSend ? 'send' : 'draft');
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        const token = asSend ? generateToken() : generateToken(); // always generate a token
        const lineItemsWithAmounts = form.line_items.map((item) => ({
          ...item,
          amount: item.qty * item.rate,
        }));

        const { data, error: insertError } = await supabase
          .from('proposals')
          .insert({
            user_id: session.user.id,
            token,
            title: form.title.trim(),
            client_name: form.client_name.trim() || null,
            client_email: form.client_email.trim() || null,
            client_company: form.client_company.trim() || null,
            description: form.description.trim() || null,
            line_items: lineItemsWithAmounts,
            terms: form.terms.trim() || null,
            notes: form.notes.trim() || null,
            status: asSend ? 'sent' : 'draft',
            total_amount: total,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (asSend && data) {
          const url = `${window.location.origin}/p/${token}`;
          setShareUrl(url);
        } else if (data) {
          router.push(`/dashboard/proposals/${data.id}`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to save proposal. Please try again.'
        );
      } finally {
        setLoading(null);
      }
    },
    [form, total, router]
  );

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareUrl) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Proposal sent!</h2>
          <p className="text-slate-500 mb-8">
            Share this link with your client. They can review and sign without creating an account.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <p className="flex-1 text-sm font-mono text-slate-700 truncate text-left">
              {shareUrl}
            </p>
            <button
              onClick={copyLink}
              className="btn-secondary shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink className="w-4 h-4" />
              Preview proposal
            </a>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Proposal details */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Proposal Details</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Proposal Title *</label>
            <input
              type="text"
              className="input text-lg font-medium"
              placeholder="e.g. Website Redesign Project"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Project Description</label>
            <textarea
              className="input resize-none h-24"
              placeholder="Brief overview of the project scope and objectives..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Client Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name</label>
            <input
              type="text"
              className="input"
              placeholder="Jane Smith"
              value={form.client_name}
              onChange={(e) => updateField('client_name', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Client Email</label>
            <input
              type="email"
              className="input"
              placeholder="jane@company.com"
              value={form.client_email}
              onChange={(e) => updateField('client_email', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Client Company</label>
            <input
              type="text"
              className="input"
              placeholder="Acme Inc."
              value={form.client_company}
              onChange={(e) => updateField('client_company', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Services & Pricing</h2>
          <button onClick={addLineItem} className="btn-secondary text-sm">
            <Plus className="w-4 h-4" />
            Add item
          </button>
        </div>

        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="col-span-1" />
          <div className="col-span-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Description
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Qty
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rate
          </div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
            Amount
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {form.line_items.map((item, idx) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block cursor-grab" />

              {/* Mobile layout */}
              <div className="flex-1 sm:hidden space-y-2">
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input text-sm"
                      value={item.qty}
                      onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input text-sm"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.qty * item.rate)}
                  </span>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    disabled={form.line_items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 flex-1 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    className="input text-sm"
                    placeholder={`Service ${idx + 1}`}
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input text-sm"
                    value={item.qty}
                    onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input text-sm pl-7"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.qty * item.rate)}
                  </span>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    disabled={form.line_items.length === 1}
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={addLineItem} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-medium">
              <Plus className="w-4 h-4" />
              Add line item
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Total</p>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Terms & Conditions</h2>
          <textarea
            className="input resize-none h-36 text-sm"
            placeholder="Payment terms, ownership, deadlines..."
            value={form.terms}
            onChange={(e) => updateField('terms', e.target.value)}
          />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Notes</h2>
          <textarea
            className="input resize-none h-36 text-sm"
            placeholder="Additional notes for the client..."
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-ghost text-slate-500"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={loading !== null}
            className="btn-secondary"
          >
            {loading === 'draft' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading !== null}
            className="btn-primary"
          >
            {loading === 'send' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
