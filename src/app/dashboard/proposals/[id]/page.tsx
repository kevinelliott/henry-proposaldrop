import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle2,
  Send,
  Calendar,
  User,
  Building2,
  Mail,
  BarChart3,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Proposal, ProposalView } from '@/types/index';

export const metadata: Metadata = {
  title: 'Proposal Details | ProposalDrop',
};

async function getProposal(id: string, userId: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as Proposal;
}

async function getProposalViews(proposalId: string) {
  const { data, error } = await supabase
    .from('proposal_views')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('viewed_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data as ProposalView[];
}

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let session = null;
  try {
    const result = await supabase.auth.getSession();
    session = result.data.session;
  } catch {
    redirect('/login');
  }

  if (!session) redirect('/login');

  const proposal = await getProposal(params.id, session.user.id);
  if (!proposal) notFound();

  const views = await getProposalViews(proposal.id);

  const shareUrl = proposal.token
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://proposaldrop.com'}/p/${proposal.token}`
    : null;

  const totalViews = views.length;
  const uniqueIps = new Set(views.map((v) => v.ip_address)).size;
  const avgDuration =
    views.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / (views.length || 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{proposal.title}</h1>
              <StatusBadge status={proposal.status} />
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              Created {formatRelativeTime(proposal.created_at)}
              {proposal.client_name && ` · ${proposal.client_name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client info */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Client Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {proposal.client_name && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Name</p>
                    <p className="text-sm font-medium text-slate-900">{proposal.client_name}</p>
                  </div>
                </div>
              )}
              {proposal.client_email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${proposal.client_email}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {proposal.client_email}
                    </a>
                  </div>
                </div>
              )}
              {proposal.client_company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Company</p>
                    <p className="text-sm font-medium text-slate-900">{proposal.client_company}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Created</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(proposal.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Scope & Pricing</h2>
            </div>
            {proposal.description && (
              <div className="p-5 border-b border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">{proposal.description}</p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(proposal.line_items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-4 text-sm text-slate-900">{item.description}</td>
                      <td className="p-4 text-sm text-slate-600 text-right">{item.qty}</td>
                      <td className="p-4 text-sm text-slate-600 text-right">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-900 text-right">
                        {formatCurrency(item.qty * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="p-4 text-sm font-bold text-slate-900 text-right">
                      Total
                    </td>
                    <td className="p-4 text-lg font-bold text-blue-600 text-right">
                      {formatCurrency(proposal.total_amount || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {proposal.terms && (
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Terms & Conditions</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {proposal.terms}
              </p>
            </div>
          )}

          {proposal.status === 'accepted' && (
            <div className="card p-6 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-green-900 mb-2">Proposal Accepted</h2>
                  <div className="space-y-1 text-sm text-green-700">
                    {proposal.accepted_signature && (
                      <p>
                        Signed by:{' '}
                        <span className="font-semibold">{proposal.accepted_signature}</span>
                      </p>
                    )}
                    {proposal.accepted_at && <p>Date: {formatDate(proposal.accepted_at)}</p>}
                    {proposal.accepted_ip && <p>IP: {proposal.accepted_ip}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {shareUrl && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-500" />
                Share Link
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-mono text-slate-600 break-all">{shareUrl}</p>
              </div>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center text-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open proposal
              </a>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              View Analytics
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{totalViews}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{uniqueIps}</p>
                <p className="text-xs text-slate-500 mt-0.5">Unique</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {avgDuration > 0 ? `${Math.round(avgDuration)}s` : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Avg. time</p>
              </div>
            </div>

            {views.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recent Views
                </p>
                {views.slice(0, 5).map((view) => (
                  <div key={view.id} className="flex items-center gap-2 text-xs text-slate-600">
                    <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="flex-1 truncate">{view.ip_address || 'Unknown'}</span>
                    <span className="text-slate-400 shrink-0">
                      {formatRelativeTime(view.viewed_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Eye className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No views yet</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-700">Created</p>
                  <p className="text-xs text-slate-400">{formatDate(proposal.created_at)}</p>
                </div>
              </div>
              {proposal.status === 'accepted' && proposal.accepted_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium">Accepted</p>
                    <p className="text-xs text-slate-400">{formatDate(proposal.accepted_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
