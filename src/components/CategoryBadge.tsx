'use client';

import type { TaskCategory } from '@/types/task';

interface CategoryBadgeProps {
  category: TaskCategory;
}

const categoryColors: Record<TaskCategory, { bg: string; text: string }> = {
  'Design': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  'Development': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  'Navigation': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'Shopify Functions': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  'Other': { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = categoryColors[category] || categoryColors['Other'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
}
