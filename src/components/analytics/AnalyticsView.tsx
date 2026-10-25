import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  PieChart,
  Download,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { useHabits, getLocalDateString } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { downloadCsvFile, generateCsvContent } from '../../utils/exportCsv';

export const AnalyticsView: React.FC = () => {
  const { habits, logs, todayCompletedCount, todayTotalCount, todayCompletionRate, currentBestStreak } = useHabits();
  const { profile } = useAuth();
  const [exported, setExported] = useState(false);

  const handleExportCsv = () => {
    const csvData = generateCsvContent(habits, logs, profile);
    downloadCsvFile(csvData, 'ritho_ai_analytics_report');
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  // Calculate past 7 days completion history
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
    const dayLogs = logs.filter((l) => l.date === dateStr && l.completed);
    const totalPossible = habits.length;
    const rate = totalPossible > 0 ? Math.min(100, Math.round((dayLogs.length / totalPossible) * 100)) : 0;
    return {
      date: dateStr,
      dayName,
      completed: dayLogs.length,
      rate,
    };
  });

  // Calculate category stats
  const categoryCount: Record<string, number> = {};
  habits.forEach((h) => {
    categoryCount[h.category] = (categoryCount[h.category] || 0) + 1;
  });

  const totalLogsCompleted = logs.filter((l) => l.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Consistency Analytics</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Historical breakdown of your habits, completion velocity, and routines
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md self-start sm:self-auto ${
            exported
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-[#181a29] hover:bg-violet-600 border border-neutral-700/80 hover:border-violet-500 text-neutral-200 hover:text-white shadow-black/30'
          }`}
        >
          {exported ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>CSV Report Downloaded!</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV Report</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#121422] border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block mb-1">
            Total Completions
          </span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-bold text-white">{totalLogsCompleted}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Logged checkmarks</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block mb-1">
            Top Active Streak
          </span>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xl font-bold text-white">{currentBestStreak} Days</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">Consecutive progress</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block mb-1">
            Today's Rate
          </span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span className="text-xl font-bold text-white">{todayCompletionRate}%</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            {todayCompletedCount} of {todayTotalCount} habits
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121422] border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold block mb-1">
            Experience Level
          </span>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-xl font-bold text-white">Lvl {profile?.level || 1}</span>
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">{profile?.xp || 0} Total XP</span>
        </div>
      </div>

      {/* 7-Day Completion Velocity Chart */}
      <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>Last 7 Days Consistency</span>
            </h2>
            <p className="text-xs text-neutral-400">Daily habit completion rate</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end h-44">
          {days.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-semibold">
                {d.rate}%
              </span>
              <div className="w-full bg-[#181a29] rounded-xl h-28 relative overflow-hidden flex items-end p-1 border border-neutral-800/60">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-lg transition-all duration-500"
                  style={{ height: `${Math.max(8, d.rate)}%` }}
                />
              </div>
              <span className="text-[11px] text-neutral-300 font-medium mt-2">{d.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-violet-400" />
          <span>Routines by Category</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(categoryCount).map(([cat, count]) => (
            <div key={cat} className="p-3.5 rounded-xl bg-[#181a29] border border-neutral-800/80">
              <span className="text-xs font-semibold text-white capitalize block mb-0.5">
                {cat}
              </span>
              <span className="text-sm font-bold text-violet-400">
                {count} {count === 1 ? 'Habit' : 'Habits'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
