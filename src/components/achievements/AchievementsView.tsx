import React from 'react';
import { Trophy, Star, Flame, Zap, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';

export const AchievementsView: React.FC = () => {
  const { profile } = useAuth();
  const { currentBestStreak, logs } = useHabits();

  const totalLogs = logs.filter((l) => l.completed).length;
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpCurrent = xp % 200;
  const progressPct = Math.min(100, Math.round((xpCurrent / 200) * 100));

  const badges = [
    {
      id: 'first_step',
      title: 'First Step',
      desc: 'Complete your first habit on Ritho AI',
      icon: '🌱',
      unlocked: totalLogs >= 1,
    },
    {
      id: 'spark_streak',
      title: '3-Day Spark',
      desc: 'Maintain a 3-day consecutive habit streak',
      icon: '🔥',
      unlocked: currentBestStreak >= 3,
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      desc: 'Achieve a full 7-day streak',
      icon: '⚡',
      unlocked: currentBestStreak >= 7,
    },
    {
      id: 'level_five',
      title: 'Rising Architect',
      desc: 'Reach Level 2 in your habit journey',
      icon: '⭐',
      unlocked: level >= 2,
    },
    {
      id: 'centurion',
      title: 'Centurion',
      desc: 'Accumulate 100 total habit completions',
      icon: '🏆',
      unlocked: totalLogs >= 100,
    },
    {
      id: 'grandmaster',
      title: 'Habit Grandmaster',
      desc: 'Earn 1000 Experience Points (XP)',
      icon: '👑',
      unlocked: xp >= 1000,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Achievements & Badges</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Gamified milestones rewarding your daily perseverance
        </p>
      </div>

      {/* Level Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171a2b] to-[#121422] border border-violet-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-600/30 border border-violet-400/20">
              {level}
            </div>
            <div>
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
                Current Standing
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Level {level} Habit Specialist
              </h2>
              <p className="text-xs text-neutral-400">{xp} Lifetime Experience Points</p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs text-neutral-400">Next Level:</span>
            <span className="text-sm font-bold text-violet-300 ml-1.5">
              {200 - xpCurrent} XP remaining
            </span>
          </div>
        </div>

        <div>
          <div className="h-2.5 w-full bg-[#0b0c13] rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500 mt-1.5">
            <span>Level {level}</span>
            <span>{progressPct}% to Level {level + 1}</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              b.unlocked
                ? 'bg-[#131627] border-violet-500/40 shadow-lg shadow-violet-600/10'
                : 'bg-[#10121d] border-neutral-800/80 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-3xl">{b.icon}</span>
                {b.unlocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-800/50 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mb-1">{b.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
