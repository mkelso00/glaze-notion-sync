'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import type { Task, TimesheetEntry } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TimesheetCard } from './TimesheetCard';
import { KanbanBoard } from './KanbanBoard';

interface DashboardProps {
  clientName?: string;
}

export function Dashboard({ clientName }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = clientName
        ? `/api/tasks?client=${encodeURIComponent(clientName)}`
        : '/api/tasks';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks);
        // Generate timesheet entries from tasks
        const entries: TimesheetEntry[] = data.tasks
          .filter((task: Task) => task.hoursUsed > 0)
          .map((task: Task) => ({
            id: `${task.id}-timesheet`,
            taskId: task.id,
            taskName: task.title,
            hours: Math.floor(task.hoursUsed),
            minutes: Math.round((task.hoursUsed % 1) * 60),
            category: task.category,
            date: task.updatedAt,
          }));
        setTimesheetEntries(entries);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clientName]);

  useEffect(() => {
    fetchTasks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleGenerateAITitle = async (taskId: string) => {
    try {
      setGeneratingTitle(taskId);
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await response.json();

      if (data.success) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, aiTitle: data.aiTitle } : task
          )
        );
      }
    } catch (err) {
      console.error('Failed to generate AI title:', err);
    } finally {
      setGeneratingTitle(null);
    }
  };

  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
  const usedHours = tasks.reduce((sum, task) => sum + task.hoursUsed, 0);
  const featuredTask = tasks[0];

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-emerald-500 text-zinc-900 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {clientName ? `${clientName} Dashboard` : 'Client Dashboard'}
              </h1>
              {lastUpdated && (
                <p className="text-sm text-zinc-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchTasks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Task */}
        {featuredTask && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Current Task</h2>
              <button
                onClick={() => handleGenerateAITitle(featuredTask.id)}
                disabled={generatingTitle === featuredTask.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${generatingTitle === featuredTask.id ? 'animate-pulse' : ''}`} />
                Generate AI Title
              </button>
            </div>
            <div className="max-w-md">
              <TaskCard task={featuredTask} />
            </div>
          </section>
        )}

        {/* Timesheet Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Rolling Hours & Time Tracking</h2>
          <p className="text-zinc-400 mb-6">
            Unused hours roll over each quarter, with full transparency on all time spent.
          </p>
          <div className="max-w-xl">
            <TimesheetCard
              entries={timesheetEntries}
              totalHours={totalHours}
              usedHours={usedHours}
            />
          </div>
        </section>

        {/* Kanban Board */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Task Dashboard</h2>
          <p className="text-zinc-400 mb-6">
            Track tasks easily with a dedicated dashboard.
          </p>
          <KanbanBoard tasks={tasks} />
        </section>

        {/* All Tasks Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-6">All Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskCard task={task} variant="compact" />
                {!task.aiTitle && (
                  <button
                    onClick={() => handleGenerateAITitle(task.id)}
                    disabled={generatingTitle === task.id}
                    className="absolute top-2 right-2 p-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                    title="Generate AI Title"
                  >
                    <Sparkles className={`w-3 h-3 ${generatingTitle === task.id ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Summary Stats */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Total Tasks</p>
            <p className="text-3xl font-bold">{tasks.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Total Hours</p>
            <p className="text-3xl font-bold">{totalHours}h</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Hours Used</p>
            <p className="text-3xl font-bold">{usedHours}h</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Hours Remaining</p>
            <p className="text-3xl font-bold text-emerald-400">{totalHours - usedHours}h</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-zinc-500 text-sm">
          Powered by Notion & AI
        </div>
      </footer>
    </div>
  );
}
