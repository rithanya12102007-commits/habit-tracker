import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  User as UserIcon,
  LogOut,
  KeyRound,
  Settings,
  ChevronDown,
  Shield,
  Volume2,
  VolumeX,
  Palette,
  Check,
  ScanFace,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../utils/sound';
import { hasSavedFace } from '../../utils/faceLock';
import { AppView, ThemeId } from '../../types';
import { RithoLogo } from '../common/RithoLogo';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenChangePassword }) => {
  const { user, profile, logout, isGoogleUser, isDemoUser } = useAuth();
  const { currentBestStreak, todayCompletedCount, todayTotalCount } = useHabits();
  const { currentTheme, setTheme, themes } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundMuted(!sound.enabled);
  };

  const handleLogout = async () => {
    setConfirmLogoutOpen(false);
    setDropdownOpen(false);
    await logout();
    onNavigate('login');
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    setThemeDropdownOpen(false);
    sound.playClick();
  };

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const xpPercent = Math.min(100, Math.round(((xp % 200) / 200) * 100));

  const activeThemeConfig = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e17]/85 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer group"
          title="Ritho AI Dashboard"
        >
          <RithoLogo size="md" />
        </div>

        {/* Center Quick Stats (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Flame streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{currentBestStreak} Day Streak</span>
          </div>

          {/* Today's completion */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            <span>
              {todayCompletedCount}/{todayTotalCount} Today
            </span>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Peaceful Theme Switcher Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              title={`Active Theme: ${activeThemeConfig?.name}. Click to switch peaceful themes.`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1e30] border border-neutral-800 text-xs text-neutral-300 transition-colors"
            >
              <Palette className="w-4 h-4 text-neutral-400" />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeThemeConfig?.colors.accent || '#52b788' }}
              />
              <span className="hidden sm:inline font-medium text-[11px] text-neutral-200">
                {activeThemeConfig?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Themes Dropdown */}
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141724] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                  <p className="text-xs font-semibold text-white">Select Peaceful Theme</p>
                  <p className="text-[10px] text-neutral-400">Soothing color palettes designed for focus</p>
                </div>

                <div className="space-y-1">
                  {themes.map((theme) => {
                    const isSelected = theme.id === currentTheme;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-[#1e2337] border border-neutral-700/80'
                            : 'hover:bg-neutral-800/50 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Color dots */}
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/30"
                              style={{ backgroundColor: theme.colors.accent }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/30"
                              style={{ backgroundColor: theme.colors.card }}
                            />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-medium text-white truncate">{theme.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{theme.subtitle}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* User Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#141724] hover:bg-[#1a1e30] border border-neutral-800/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'R'
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-white truncate max-w-[120px]">
                  {profile?.displayName || 'Habit Achiever'}
                </p>
                <p className="text-[10px] text-violet-400 font-medium">Lvl {level} Explorer</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141724] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                {/* User overview */}
                <div className="p-3 border-b border-neutral-800/80 mb-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {profile?.displayName || 'User'}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                  <div className="mt-2.5 pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Level {level}</span>
                      <span className="text-violet-400 font-medium">{xp} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800/70 text-[10px] text-neutral-300">
                    <Shield className="w-3 h-3 text-violet-400" />
                    {isDemoUser ? 'Live Demo Account' : isGoogleUser ? 'Google Verified' : 'Email Account'}
                  </div>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Profile & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenChangePassword();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <KeyRound className="w-4 h-4 text-neutral-400" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (user && hasSavedFace(user.uid)) {
                      sessionStorage.removeItem(`ritho_face_unlocked_${user.uid}`);
                      window.location.reload();
                    } else {
                      onNavigate('profile');
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ScanFace className="w-4 h-4 text-violet-400" />
                    <span>{user && hasSavedFace(user.uid) ? 'Lock App (Face Scan)' : 'Set Up Face Unlock'}</span>
                  </div>
                  {user && hasSavedFace(user.uid) && (
                    <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20">
                      Active
                    </span>
                  )}
                </button>

                <div className="border-t border-neutral-800/80 my-1" />

                <button
                  onClick={() => setConfirmLogoutOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141724] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Sign Out of Ritho AI?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your habits, streaks, and progress remain safely stored in the cloud. You can sign back in anytime.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-red-600/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
