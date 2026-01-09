'use client';

import type { TaskPriority } from '@/types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
  'High': { bg: 'bg-red-100', text: 'text-red-700' },
  'Medium': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Low': { bg: 'bg-gray-100', text: 'text-gray-600' },
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
