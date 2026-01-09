'use client';

import type { TimesheetEntry, TaskCategory } from '@/types/task';
import { CategoryBadge } from './CategoryBadge';
import { HoursRemainingCircle } from './HoursRemainingCircle';

interface TimesheetCardProps {
  entries: TimesheetEntry[];
  totalHours: number;
  usedHours: number;
}

export function TimesheetCard({ entries, totalHours, usedHours }: TimesheetCardProps) {
  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes > 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="relative">
      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Monthly Timesheet</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-900 font-medium">{entry.taskName}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-sm">
                  {formatTime(entry.hours, entry.minutes)}
                </span>
                <CategoryBadge category={entry.category} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hours remaining circle - positioned to the right */}
      <div className="absolute -right-12 top-1/2 -translate-y-1/2">
        <HoursRemainingCircle totalHours={totalHours} usedHours={usedHours} />
      </div>
    </div>
  );
}
