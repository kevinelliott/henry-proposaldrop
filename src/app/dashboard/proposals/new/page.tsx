import ProposalBuilder from '@/components/ProposalBuilder';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Proposal | ProposalDrop',
};

export default function NewProposalPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Proposal</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Build your proposal below and send it when ready.
          </p>
        </div>
      </div>
      <ProposalBuilder />
    </div>
  );
}
