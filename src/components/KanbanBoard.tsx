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
  gradient: string;
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
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex-1 pr-2">
          {task.aiTitle || task.title}
        </h4>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-3">{task.category}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
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

function KanbanColumn({ title, tasks, gradient }: KanbanColumnProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 min-w-[300px]">
      <div className={`${gradient} text-white px-4 py-2 rounded-lg mb-4 text-center font-medium`}>
        {title}
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
      <KanbanColumn
        title="Design"
        tasks={designTasks}
        gradient="bg-gradient-to-r from-pink-500 to-purple-500"
      />
      <KanbanColumn
        title="Development"
        tasks={developmentTasks}
        gradient="bg-gradient-to-r from-purple-500 to-blue-500"
      />
      {otherTasks.length > 0 && (
        <KanbanColumn
          title="Other"
          tasks={otherTasks}
          gradient="bg-black"
        />
      )}
    </div>
  );
}
