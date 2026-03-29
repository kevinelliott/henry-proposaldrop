import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Eye,
} from 'lucide-react';
import type { DashboardStats, Proposal } from '@/types/index';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ProposalDrop',
};

async function getDashboardData(userId: string): Promise<{
  stats: DashboardStats;
  proposals: Proposal[];
}> {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const allProposals = (proposals as Proposal[]) || [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const pipelineValue = allProposals
      .filter((p) => p.status === 'sent' || p.status === 'viewed')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);

    const acceptedThisMonth = allProposals.filter(
      (p) =>
        p.status === 'accepted' &&
        p.accepted_at &&
        new Date(p.accepted_at) >= startOfMonth
    ).length;

    const sentOrBetter = allProposals.filter((p) =>
      ['sent', 'viewed', 'accepted', 'declined'].includes(p.status)
    ).length;

    const accepted = allProposals.filter((p) => p.status === 'accepted').length;
    const conversionRate = sentOrBetter > 0 ? (accepted / sentOrBetter) * 100 : 0;

    return {
      stats: {
        total_proposals: allProposals.length,
        pipeline_value: pipelineValue,
        accepted_this_month: acceptedThisMonth,
        conversion_rate: Math.round(conversionRate * 10) / 10,
      },
      proposals: allProposals,
    };
  } catch {
    return {
      stats: { total_proposals: 0, pipeline_value: 0, accepted_this_month: 0, conversion_rate: 0 },
      proposals: [],
    };
  }
}

export default async function DashboardPage() {
  let userId = '';
  let userName = 'there';

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      userId = session.user.id;
      userName =
        session.user.user_metadata?.name ||
        session.user.email?.split('@')[0] ||
        'there';
    }
  } catch {
    // Placeholder mode
  }

  const { stats, proposals } = await getDashboardData(userId);

  const statCards = [
    {
      label: 'Total Proposals',
      value: stats.total_proposals,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Pipeline Value',
      value: stats.pipeline_value,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
      format: (v: number) => formatCurrency(v),
    },
    {
      label: 'Accepted This Month',
      value: stats.accepted_this_month,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Conversion Rate',
      value: stats.conversion_rate,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back, {userName}</p>
        </div>
        <Link href="/dashboard/proposals/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Proposal
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.format(card.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Proposals list */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Proposals</h2>
          <Link
            href="/dashboard/proposals"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No proposals yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              Create your first proposal and start closing deals.
            </p>
            <Link href="/dashboard/proposals/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create your first proposal
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {proposals.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/dashboard/proposals/${proposal.id}`}
                className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {proposal.title}
                    </h3>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {proposal.client_name || proposal.client_email || 'No client assigned'}
                    {proposal.client_company && ` · ${proposal.client_company}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(proposal.total_amount || 0)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRelativeTime(proposal.created_at)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Link
          href="/dashboard/proposals/new"
          className="card p-5 hover:shadow-md transition-all group border-dashed border-slate-300 hover:border-blue-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">New Proposal</p>
              <p className="text-xs text-slate-500">Build and send</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/proposals?status=viewed"
          className="card p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Viewed Proposals</p>
              <p className="text-xs text-slate-500">Needs follow-up</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/proposals?status=accepted"
          className="card p-5 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Accepted</p>
              <p className="text-xs text-slate-500">Closed deals</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
