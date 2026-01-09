'use client';

interface HoursRemainingCircleProps {
  totalHours: number;
  usedHours: number;
}

export function HoursRemainingCircle({ totalHours, usedHours }: HoursRemainingCircleProps) {
  const remainingHours = Math.max(0, totalHours - usedHours);
  const percentage = totalHours > 0 ? ((totalHours - usedHours) / totalHours) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
      {/* Progress circle */}
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* End dot */}
        <circle
          cx={50 + 45 * Math.cos((2 * Math.PI * percentage) / 100 - Math.PI / 2)}
          cy={50 + 45 * Math.sin((2 * Math.PI * percentage) / 100 - Math.PI / 2)}
          r="4"
          fill="white"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{remainingHours}h</span>
        <span className="text-xs text-white/70">remaining</span>
      </div>
    </div>
  );
}
