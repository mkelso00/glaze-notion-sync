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
  // Fixed three columns with their corresponding status mappings
  const investigatingTasks = tasks.filter(
    (task) => task.status === 'Investigating' || task.status === 'Not Started' || task.status === 'In Progress'
  );
  const pendingReviewTasks = tasks.filter(
    (task) => task.status === 'Pending Review' || task.status === 'Mark to Brief' || task.status === 'On Hold'
  );
  const completeTasks = tasks.filter(
    (task) => task.status === 'Completed'
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn title="Investigating" tasks={investigatingTasks} />
      <KanbanColumn title="Pending Review" tasks={pendingReviewTasks} />
      <KanbanColumn title="Complete" tasks={completeTasks} />
    </div>
  );
}
