'use client';

import type { TaskStatus } from '@/types/task';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  'Investigating': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
  'On Hold': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  'Mark to Brief': { bg: 'bg-pink-500/20', text: 'text-pink-400', dot: 'bg-pink-500' },
  'In Progress': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-500' },
  'Completed': { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
  'Not Started': { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-500' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status] || statusColors['Not Started'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}
