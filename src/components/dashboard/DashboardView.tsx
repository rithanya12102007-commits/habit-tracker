import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Plus,
  Check,
  Clock,
  ArrowRight,
  Bot,
  Mic,
  Calendar,
  Undo2,
  Lightbulb,
  ScanFace,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits, getLocalDateString } from '../../context/HabitContext';
import { hasSavedFace } from '../../utils/faceLock';
import { AppView, TimeOfDay } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: AppView, initialPrompt?: string) => void;
  onOpenCreateHabit: () => void;
}

const ATOMIC_TIPS = [
  {
    cue: 'The 2-Minute Rule',
    text: 'When you start a new habit, it should take less than two minutes to do. Scale down the friction.',
  },
  {
    cue: 'Habit Stacking',
    text: 'Identify a current habit you already do each day, then stack your new behavior onto it.',
  },
  {
    cue: 'Never Miss Twice',
    text: 'Missing once is an accident. Missing twice is the start of a new, unwanted habit.',
  },
  {
    cue: 'Environment Architecture',
    text: 'Make the cues of good habits obvious in your physical surroundings.',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenCreateHabit }) => {
  const { user, profile } = useAuth();
  const faceUnlockActive = user ? hasSavedFace(user.uid) : false;
  const {
    habits,
    logs,
    toggleCompleteHabit,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionRate,
    currentBestStreak,
  } = useHabits();

  const [activeTimeFilter, setActiveTimeFilter] = useState<'all' | TimeOfDay>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const today = getLocalDateString();

  // 7-day strip calculation
  const pastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateString(d);
    const dayInitial = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(d);
    const dayNum = d.getDate();
    const isToday = dateStr === today;
    const completedOnDay = logs.some((l) => l.date === dateStr && l.completed);
    return {
      dateStr,
      dayInitial,
      dayNum,
      isToday,
      completedOnDay,
    };
  });

  const filteredHabits = habits.filter((h) => {
    if (activeTimeFilter !== 'all' && h.timeOfDay !== activeTimeFilter) return false;
    if (statusFilter === 'pending' && h.completedToday) return false;
    if (statusFilter === 'completed' && !h.completedToday) return false;
    return true;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Deterministic daily tip
  const tipIndex = new Date().getDate() % ATOMIC_TIPS.length;
  const currentTip = ATOMIC_TIPS[tipIndex];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171a2b] via-[#151726] to-[#121422] border border-neutral-800/80 p-5 sm:p-7 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {profile?.displayName?.split(' ')[0] || 'Friend'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg">
              {todayCompletedCount === todayTotalCount && todayTotalCount > 0
                ? "Outstanding! You've checked off every single habit today. Momentum is at peak power! 🔥"
                : `You've completed ${todayCompletedCount} of ${todayTotalCount} habits today. Stay in motion!`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-[#0e101a]/80 border border-neutral-800/80 backdrop-blur-sm text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-lg">
                <Flame className="w-5 h-5 fill-amber-400" />
                <span>{currentBestStreak}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Day Streak</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-[#0e101a]/80 border border-neutral-800/80 backdrop-blur-sm text-center min-w-[95px]">
              <span className="text-lg font-bold text-violet-400">{todayCompletionRate}%</span>
              <div className="text-[10px] text-neutral-400 font-medium">Completed</div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Weekly Rhythm Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-neutral-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span>Today's Daily Target</span>
              <span className="text-white font-medium">
                {todayCompletedCount} / {todayTotalCount} Finished
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#0a0c13] rounded-full overflow-hidden p-0.5 border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${todayCompletionRate}%` }}
              />
            </div>
          </div>

          {/* 7-Day Mini-Heatmap Strip */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto bg-[#0f111c] border border-neutral-800/80 p-2 rounded-2xl">
            {pastSevenDays.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${day.completedOnDay ? 'Completed' : 'Pending'}`}
                className={`w-7 h-9 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                  day.isToday
                    ? day.completedOnDay
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                      : 'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                    : day.completedOnDay
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#181a29] text-neutral-500 border border-neutral-800'
                }`}
              >
                <span className="text-[9px] font-medium leading-none">{day.dayInitial}</span>
                <span className="text-[10px] mt-0.5 leading-none">{day.dayNum}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Habit Wisdom Tip */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-950/20 via-[#131627] to-neutral-900/40 border border-violet-900/30 p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold text-violet-300 block mb-0.5">
            Atomic Principle: {currentTip.cue}
          </span>
          <p className="text-xs text-neutral-400 leading-relaxed">{currentTip.text}</p>
        </div>
      </div>

      {/* AI Coach, Live Voice Call & Face Unlock Security Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ritho AI Coach Card */}
        <div
          onClick={() => onNavigate('coach')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-[#131625] to-[#10121d] border border-violet-900/30 p-5 hover:border-violet-500/50 transition-all duration-300 relative overflow-hidden shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs text-violet-400 flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                Ask AI <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">AI Habit Coach</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Personalized routines, habit stacking & behavioral guidance tailored to your habits.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('coach', 'Create My Routine');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900/80 hover:bg-violet-950/60 border border-neutral-800 hover:border-violet-500/30 text-[11px] text-neutral-300 transition-colors"
            >
              ⚡ Routine Plan
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('coach', 'Analyze My Week');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-900/80 hover:bg-violet-950/60 border border-neutral-800 hover:border-violet-500/30 text-[11px] text-neutral-300 transition-colors"
            >
              📊 Weekly Audit
            </button>
          </div>
        </div>

        {/* Live Voice AI Call Card */}
        <div
          onClick={() => onNavigate('voice')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-[#121626] to-[#0f121d] border border-emerald-900/40 hover:border-emerald-500/50 p-5 transition-all duration-300 relative overflow-hidden shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Call
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Live Voice AI Coach</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Real-time spoken conversation with instant turn-taking powered by Gemini Live API.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('voice');
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Live Voice Call</span>
            </button>
          </div>
        </div>

        {/* Face Unlock Security Card */}
        <div
          onClick={() => onNavigate('profile')}
          className="group cursor-pointer rounded-2xl bg-gradient-to-br from-[#151324] to-[#110f1e] border border-violet-900/30 hover:border-violet-500/50 p-5 transition-all duration-300 relative overflow-hidden shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <ScanFace className="w-5 h-5" />
              </div>
              {faceUnlockActive ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-semibold border border-neutral-700">
                  Not Enrolled
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Face Recognition Lock</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              {faceUnlockActive
                ? 'Your face is enrolled on this device. You can test locking and scanning anytime.'
                : 'Protect your habit session with private, on-device facial descriptors.'}
            </p>
          </div>
          <div className="pt-1">
            {faceUnlockActive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (user) {
                    sessionStorage.removeItem(`ritho_face_unlocked_${user.uid}`);
                    window.location.reload();
                  }
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-[#1d1b30] hover:bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Lock App Now (Test Face)</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('profile');
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Set Up Face Unlock</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Habits Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Today's Habits</span>
              <span className="text-xs font-normal text-neutral-400">({filteredHabits.length})</span>
            </h2>
            <p className="text-xs text-neutral-400">Check off routines or undo any time</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter (Pending / Completed) */}
            <div className="flex items-center p-1 bg-[#121420] border border-neutral-800 rounded-xl text-xs">
              {(['all', 'pending', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-1 rounded-lg capitalize transition-colors text-[11px] ${
                    statusFilter === s
                      ? 'bg-neutral-800 text-white font-medium shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Time of Day Filter */}
            <div className="flex items-center p-1 bg-[#121420] border border-neutral-800 rounded-xl text-xs">
              {(['all', 'morning', 'afternoon', 'evening'] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setActiveTimeFilter(seg)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors text-[11px] ${
                    activeTimeFilter === seg
                      ? 'bg-violet-600 text-white font-medium shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>

            {/* Create Habit button */}
            <button
              onClick={onOpenCreateHabit}
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Habits Checklist Grid */}
        {filteredHabits.length === 0 ? (
          <div className="rounded-2xl bg-[#121422] border border-neutral-800/80 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No habits match this filter</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? "You've finished all filtered habits for today! Great work."
                : 'Adjust your filters or add a new habit routine.'}
            </p>
            <button
              onClick={onOpenCreateHabit}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredHabits.map((habit) => {
              const isDone = habit.completedToday;
              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    isDone
                      ? 'bg-[#101918]/80 border-emerald-500/30'
                      : 'bg-[#121422] border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                    {/* Completion checkbox button */}
                    <button
                      onClick={() => toggleCompleteHabit(habit.id)}
                      title={isDone ? 'Click to undo' : 'Click to complete'}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-[#1a1c2c] border border-neutral-700/80 hover:border-violet-500 text-transparent hover:text-neutral-500'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-neutral-400' : 'text-white'
                          }`}
                        >
                          {habit.title}
                        </span>
                        {isDone && (
                          <button
                            onClick={() => toggleCompleteHabit(habit.id)}
                            title="Undo completion"
                            className="p-0.5 text-neutral-500 hover:text-neutral-300"
                          >
                            <Undo2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {habit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 capitalize font-medium">
                          {habit.category}
                        </span>
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{habit.timeOfDay}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Streak flame badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0">
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        (habit.streak || 0) > 0 ? 'text-amber-400 fill-amber-400' : 'text-neutral-600'
                      }`}
                    />
                    <span className="text-xs font-semibold text-neutral-300">
                      {habit.streak || 0}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
