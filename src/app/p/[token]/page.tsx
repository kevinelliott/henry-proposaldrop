import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { formatCurrency, formatDate, getClientIp } from '@/lib/utils';
import { CheckCircle2, FileText, Building2, User, Mail, Calendar } from 'lucide-react';
import AcceptanceModal from '@/components/AcceptanceModal';
import type { Metadata } from 'next';
import type { Proposal, Profile } from '@/types/index';

interface Props {
  params: { token: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('title, client_name, total_amount')
      .eq('token', params.token)
      .single();

    if (!proposal) return { title: 'Proposal Not Found' };

    return {
      title: `${proposal.title} — Proposal`,
      description: `Review your proposal. Total: ${formatCurrency(proposal.total_amount || 0)}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: 'Proposal' };
  }
}

async function recordView(proposalId: string, ip: string, userAgent: string) {
  try {
    await supabaseAdmin.from('proposal_views').insert({
      proposal_id: proposalId,
      ip_address: ip,
      user_agent: userAgent,
    });

    await supabaseAdmin
      .from('proposals')
      .update({ status: 'viewed', updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .eq('status', 'sent');
  } catch {
    // Non-fatal
  }
}

export default async function PublicProposalPage({ params }: Props) {
  let proposal: Proposal | null = null;
  let profile: Profile | null = null;

  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('token', params.token)
      .single();

    if (error || !data) notFound();
    proposal = data as Proposal;
  } catch {
    notFound();
  }

  if (!proposal) notFound();

  try {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('company_name, email')
      .eq('id', proposal.user_id)
      .single();
    profile = data as Profile | null;
  } catch {
    // Non-fatal
  }

  // Record view
  const headersList = headers();
  const ip = getClientIp(
    new Request('http://localhost', { headers: Object.fromEntries(headersList) })
  );
  const userAgent = headersList.get('user-agent') || 'unknown';

  if (proposal.status === 'sent' || proposal.status === 'viewed') {
    recordView(proposal.id, ip, userAgent).catch(() => {});
  }

  const isAccepted = proposal.status === 'accepted';
  const isDeclined = proposal.status === 'declined';

  const companyName = profile?.company_name || 'Your Service Provider';
  const companyInitials = companyName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const refNumber = `PRO-${proposal.id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">ProposalDrop</span>
          </div>
          <div>
            {isAccepted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accepted
              </span>
            ) : isDeclined ? (
              <span className="inline-flex items-center px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700">
                Declined
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                Awaiting Review
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Main proposal card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          {/* Dark header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8 sm:px-10 sm:py-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">{companyInitials}</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg sm:text-xl leading-tight">
                    {companyName}
                  </h2>
                  {profile?.email && (
                    <p className="text-slate-400 text-sm mt-0.5">{profile.email}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Proposal
                </p>
                <p className="text-white font-mono text-sm font-semibold">{refNumber}</p>
                <p className="text-slate-400 text-xs mt-1">{formatDate(proposal.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Title & client */}
          <div className="border-b border-slate-100 px-8 py-8 sm:px-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              {proposal.title}
            </h1>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Prepared for
                </p>
                <div className="space-y-2.5">
                  {proposal.client_name && (
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-800 font-medium">{proposal.client_name}</span>
                    </div>
                  )}
                  {proposal.client_company && (
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-700">{proposal.client_company}</span>
                    </div>
                  )}
                  {proposal.client_email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${proposal.client_email}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {proposal.client_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Details
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-500">Issued: </span>
                      <span className="text-slate-700 text-sm">{formatDate(proposal.created_at)}</span>
                    </div>
                  </div>
                  {isAccepted && proposal.accepted_at && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <div>
                        <span className="text-xs text-slate-500">Accepted: </span>
                        <span className="text-slate-700 text-sm">{formatDate(proposal.accepted_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {proposal.description && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-slate-600 leading-relaxed">{proposal.description}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="px-8 py-8 sm:px-10">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Services & Deliverables
            </h3>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">
                      Qty
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Rate
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(proposal.line_items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 text-slate-800 text-sm font-medium">
                        {item.description}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-sm text-center">{item.qty}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm text-right">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-5 py-4 text-slate-900 text-sm font-semibold text-right">
                        {formatCurrency(item.qty * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile line items */}
            <div className="sm:hidden space-y-3">
              {(proposal.line_items || []).map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="font-medium text-slate-900 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {item.qty} × {formatCurrency(item.rate)}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.qty * item.rate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-8 py-6 text-white shadow-lg shadow-blue-200 min-w-[220px]">
                <p className="text-blue-200 text-sm font-medium mb-1">Total Amount</p>
                <p className="text-4xl font-extrabold tracking-tight">
                  {formatCurrency(proposal.total_amount || 0)}
                </p>
                <p className="text-blue-200 text-xs mt-2">USD · All prices inclusive</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          {proposal.terms && (
            <div className="px-8 py-8 sm:px-10 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Terms & Conditions
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {proposal.terms}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {proposal.notes && (
            <div className="px-8 py-6 sm:px-10 border-t border-slate-100 bg-amber-50/30">
              <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Notes from {companyName}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{proposal.notes}</p>
            </div>
          )}

          {/* Acceptance section */}
          <div className="px-8 py-8 sm:px-10 border-t-2 border-slate-100">
            {isAccepted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Proposal Accepted</h3>
                <p className="text-slate-500 text-sm mb-4">
                  This proposal was accepted by{' '}
                  <span className="font-semibold text-slate-700">{proposal.accepted_signature}</span>
                  {proposal.accepted_at && ` on ${formatDate(proposal.accepted_at)}`}.
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-left">
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wider">
                      Digital Signature
                    </p>
                    <p className="text-lg font-bold text-green-800 font-serif mt-0.5">
                      {proposal.accepted_signature}
                    </p>
                  </div>
                </div>
              </div>
            ) : isDeclined ? (
              <div className="text-center py-4">
                <h3 className="font-bold text-slate-900 mb-1">Proposal Declined</h3>
                <p className="text-slate-500 text-sm">This proposal has been declined.</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to move forward?</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      By clicking <strong>&quot;Accept Proposal&quot;</strong> below, you are entering into a
                      legally binding agreement with <strong>{companyName}</strong> for the services
                      described above, totaling{' '}
                      <strong className="text-blue-700">
                        {formatCurrency(proposal.total_amount || 0)}
                      </strong>
                      . Your full name serves as your digital signature.
                    </p>
                  </div>
                </div>
                <AcceptanceModal
                  proposalId={proposal.id}
                  proposalToken={params.token}
                  totalAmount={proposal.total_amount || 0}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-2.5 h-2.5 text-white" />
            </div>
            <span>
              Powered by{' '}
              <a href="/" className="font-medium text-slate-500 hover:text-slate-700 transition-colors">
                ProposalDrop
              </a>
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Professional proposals for freelancers &amp; agencies
          </p>
        </div>
      </div>
    </div>
  );
}
