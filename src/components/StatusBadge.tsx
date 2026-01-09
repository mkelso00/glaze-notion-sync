'use client';

import type { TaskStatus } from '@/types/task';

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  'Investigating': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Pending Review': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  'On Hold': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Mark to Brief': { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
  'In Progress': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Completed': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'Not Started': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
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
