'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import type { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { KanbanBoard } from './KanbanBoard';

interface DashboardProps {
  clientName?: string;
}

export function Dashboard({ clientName }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const featuredTask = tasks[0];

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Gradient Background Decoration */}
      <div className="fixed top-0 right-0 w-1/2 h-screen pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-light tracking-[0.3em] text-black">GLAZE</h1>
              {clientName && (
                <span className="text-gray-400 text-sm">{clientName}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <p className="text-sm text-gray-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Task */}
        {featuredTask && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Current Task</h2>
              <button
                onClick={() => handleGenerateAITitle(featuredTask.id)}
                disabled={generatingTitle === featuredTask.id}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                <Sparkles className={`w-4 h-4 ${generatingTitle === featuredTask.id ? 'animate-pulse' : ''}`} />
                Generate AI Title
              </button>
            </div>
            <div className="max-w-lg">
              <TaskCard task={featuredTask} />
            </div>
          </section>
        )}

        {/* Kanban Board */}
        <section>
          <KanbanBoard tasks={tasks} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-2xl font-light tracking-[0.3em] text-black">GLAZE</p>
        </div>
      </footer>
    </div>
  );
}
