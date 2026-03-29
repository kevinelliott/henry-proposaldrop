import { cn } from '@/lib/utils';
import type { ProposalStatus } from '@/types/index';

interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

const statusConfig: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  viewed: {
    label: 'Viewed',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
