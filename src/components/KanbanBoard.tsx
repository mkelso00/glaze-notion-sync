'use client';

import type { Task } from '@/types/task';

interface KanbanBoardProps {
  tasks: Task[];
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

function KanbanCard({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
      <h4 className="font-medium text-gray-900">
        {task.aiTitle || task.title}
      </h4>
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
  // Match the actual Notion database status values
  const investigatingTasks = tasks.filter(
    (task) => task.status === 'Investigating'
  );
  const markToBriefTasks = tasks.filter(
    (task) => task.status === 'Mark to Brief'
  );
  const onHoldTasks = tasks.filter(
    (task) => task.status === 'On Hold'
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn title="Investigating" tasks={investigatingTasks} />
      <KanbanColumn title="Mark to Brief" tasks={markToBriefTasks} />
      <KanbanColumn title="On Hold" tasks={onHoldTasks} />
    </div>
  );
}
