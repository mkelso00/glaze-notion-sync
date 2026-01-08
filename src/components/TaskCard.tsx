'use client';

import { format, differenceInDays, parseISO } from 'date-fns';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import type { Task } from '@/types/task';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  onViewDetails?: (task: Task) => void;
  variant?: 'full' | 'compact';
}

export function TaskCard({ task, onViewDetails, variant = 'full' }: TaskCardProps) {
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : null;

  const getDueDateText = () => {
    if (!daysUntilDue) return null;
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} days`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const dueDateText = getDueDateText();
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2">
          {task.aiTitle || task.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          {task.category}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <ChevronRight className="w-4 h-4" />
            <span>Priority: {task.priority}</span>
          </div>
          {dueDateText && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
              <Calendar className="w-4 h-4" />
              <span>{dueDateText}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(task)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-1">
        {task.aiTitle || task.title}
      </h2>
      <button className="text-zinc-400 text-sm mb-6 hover:text-white transition-colors">
        View details
      </button>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Status</span>
          <StatusBadge status={task.status} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Due date</span>
          <span className="text-white">
            {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'No date set'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Priority</span>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Hours</span>
          <span className="text-white">{task.hours}</span>
        </div>
      </div>

      {task.client && (
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-400 text-sm">Client</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
            <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-white">{task.client}</span>
          </div>
        </div>
      )}
    </div>
  );
}
