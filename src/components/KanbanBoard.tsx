'use client';

import { differenceInDays, parseISO } from 'date-fns';
import { MoreVertical, ChevronRight, Calendar } from 'lucide-react';
import type { Task } from '@/types/task';

interface KanbanBoardProps {
  tasks: Task[];
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

function KanbanCard({ task }: { task: Task }) {
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : null;

  const getDueDateText = () => {
    if (daysUntilDue === null) return null;
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} days`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const dueDateText = getDueDateText();
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-zinc-900 flex-1 pr-2">
          {task.aiTitle || task.title}
        </h4>
        <button className="text-zinc-400 hover:text-zinc-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-zinc-500 mb-3">{task.category}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <ChevronRight className="w-4 h-4" />
          <span>Priority: {task.priority}</span>
        </div>

        {dueDateText && (
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>
            <Calendar className="w-4 h-4" />
            <span>{dueDateText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-zinc-100 rounded-2xl p-4 min-w-[300px]">
      <div className="bg-zinc-900 text-white px-4 py-2 rounded-lg mb-4 text-center font-medium">
        {title}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const designTasks = tasks.filter(
    (task) => task.category === 'Design' || task.category === 'Navigation'
  );
  const developmentTasks = tasks.filter(
    (task) => task.category === 'Development' || task.category === 'Shopify Functions'
  );
  const otherTasks = tasks.filter(
    (task) => task.category === 'Other'
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn title="Design" tasks={designTasks} />
      <KanbanColumn title="Development" tasks={developmentTasks} />
      {otherTasks.length > 0 && (
        <KanbanColumn title="Other" tasks={otherTasks} />
      )}
    </div>
  );
}
