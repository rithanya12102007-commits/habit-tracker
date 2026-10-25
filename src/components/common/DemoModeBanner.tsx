import React, { useState } from 'react';
import { Sparkles, Users, RefreshCw, LogOut, Check, ChevronDown, Flame, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { DEMO_PERSONAS, DemoPersona } from '../../data/demoAccounts';
import { useTheme } from '../../context/ThemeContext';

export const DemoModeBanner: React.FC = () => {
  const { user, profile, isDemoUser, activeDemoId, loginAsDemo, logout } = useAuth();
  const { resetDemoData, currentBestStreak } = useHabits();
  const { themes } = useTheme();

  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isDemoUser || !user) {
    return null;
  }

  const currentPersona = DEMO_PERSONAS.find((p) => p.id === activeDemoId || user.uid === `demo_${p.id}`) || DEMO_PERSONAS[0];
  const activeThemeObj = themes.find((t) => t.id === profile?.theme);

  const handleSwitchPersona = async (persona: DemoPersona) => {
    setIsSwitchMenuOpen(false);
    await loginAsDemo(persona.id);
  };

  const handleResetData = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="relative z-30 bg-gradient-to-r from-violet-950/80 via-[#181a2e]/95 to-indigo-950/80 border-b border-violet-500/30 px-3 sm:px-6 py-2 text-xs text-neutral-200 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Persona Info */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 font-semibold text-[11px]">
            <Compass className="w-3.5 h-3.5 text-violet-300 animate-spin-slow" />
            <span>Demo Mode</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-5 h-5 rounded-full object-cover border border-violet-400/40"
            />
            <span className="font-semibold text-white tracking-wide">{currentPersona.name}</span>
            <span className="hidden sm:inline text-neutral-400">({currentPersona.headline})</span>
          </div>

          {/* Theme & Streak pills */}
          <div className="hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800/80 text-[10px] text-neutral-300 border border-neutral-700/60">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeThemeObj?.colors.accent || '#8b5cf6' }}
              />
              {activeThemeObj?.name || currentPersona.theme}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/30 font-medium">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              {currentBestStreak}d Streak
            </span>
          </div>
        </div>

        {/* Right: Quick Demo Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Switch Persona Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700/80 text-[11px] font-medium text-neutral-200 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span>Switch Demo Persona</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isSwitchMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-[#121422] border border-neutral-700 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-2.5 py-1.5 border-b border-neutral-800 mb-1">
                  <p className="text-[11px] font-semibold text-white">Select Demo Persona</p>
                  <p className="text-[10px] text-neutral-400">Explore different habit systems & themes</p>
                </div>
                <div className="space-y-1">
                  {DEMO_PERSONAS.map((persona) => {
                    const isSelected = persona.id === currentPersona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => handleSwitchPersona(persona)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-violet-600/20 border border-violet-500/40 text-white'
                            : 'hover:bg-neutral-800/70 text-neutral-300'
                        }`}
                      >
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white truncate">{persona.name}</span>
                            <span className="text-[10px] text-violet-400 font-medium">Lvl {persona.level}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate">{persona.headline}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={handleResetData}
            title="Reset demo habits and streaks to initial state"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700/80 text-[11px] font-medium text-neutral-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${resetSuccess ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{resetSuccess ? 'Reset!' : 'Reset Habits'}</span>
          </button>

          {/* Exit Demo Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-[11px] font-medium text-red-300 transition-colors"
            title="Exit demo mode and go to login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
