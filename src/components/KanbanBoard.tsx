'use client';

import { differenceInDays, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
      <h4 className="font-medium text-gray-900 mb-2">
        {task.aiTitle || task.title}
      </h4>

      {dueDateText && (
        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
          <Calendar className="w-4 h-4" />
          <span>{dueDateText}</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 min-w-[300px] flex-1">
      <div className="bg-black text-white px-4 py-2 rounded-lg mb-4 text-center font-medium">
        {title} ({tasks.length})
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-400 text-center text-sm py-4">No tasks</p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const investigatingTasks = tasks.filter(
    (task) => task.status === 'Investigating'
  );
  const pendingReviewTasks = tasks.filter(
    (task) => task.status === 'Pending Review'
  );
  const completedTasks = tasks.filter(
    (task) => task.status === 'Completed'
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn title="Investigating" tasks={investigatingTasks} />
      <KanbanColumn title="Pending Review" tasks={pendingReviewTasks} />
      <KanbanColumn title="Complete" tasks={completedTasks} />
    </div>
  );
}
