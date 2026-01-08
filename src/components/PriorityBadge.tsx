'use client';

import type { TaskPriority } from '@/types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
  'High': { bg: 'bg-red-500/20', text: 'text-red-400' },
  'Medium': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  'Low': { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = priorityColors[priority] || priorityColors['Medium'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${colors.bg} ${colors.text}`}
    >
      {priority}
    </span>
  );
}
