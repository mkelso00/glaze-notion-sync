'use client';

import type { TaskCategory } from '@/types/task';

interface CategoryBadgeProps {
  category: TaskCategory;
}

const categoryColors: Record<TaskCategory, { bg: string; text: string }> = {
  'Design': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Development': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Navigation': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Shopify Functions': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Other': { bg: 'bg-gray-100', text: 'text-gray-600' },
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
