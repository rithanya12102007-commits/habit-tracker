import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Bell,
  Volume2,
  Clock,
  Download,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  Palette,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { useTheme } from '../../context/ThemeContext';
import { sound } from '../../utils/sound';
import { downloadCsvFile, generateCsvContent } from '../../utils/exportCsv';
import { ThemeId } from '../../types';
import { FaceUnlockSettings } from './FaceUnlockSettings';

interface ProfileViewProps {
  onOpenChangePassword: () => void;
  onNavigateLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenChangePassword,
  onNavigateLogin,
}) => {
  const { user, profile, updateProfileSettings, logout, isGoogleUser, isDemoUser, loginAsDemo } = useAuth();
  const { habits, logs, resetDemoData } = useHabits();
  const { currentTheme, setTheme, themes } = useTheme();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [dailyGoalTime, setDailyGoalTime] = useState(profile?.dailyGoalTime || '08:00');
  const [soundEnabled, setSoundEnabled] = useState(profile?.soundEnabled ?? true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notificationsEnabled ?? true
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfileSettings({
        displayName: displayName.trim(),
        dailyGoalTime,
        soundEnabled,
        notificationsEnabled,
      });
      sound.enabled = soundEnabled;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (themeId: ThemeId) => {
    setTheme(themeId);
    sound.playClick();
  };

  const [csvExported, setCsvExported] = useState(false);

  const handleExportCsv = () => {
    const csvContent = generateCsvContent(habits, logs, profile);
    downloadCsvFile(csvContent, 'ritho_ai_habits_backup');
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        email: user?.email,
        displayName: profile?.displayName,
        level: profile?.level,
        xp: profile?.xp,
        createdAt: profile?.createdAt,
      },
      habits,
      logs,
      exportedAt: new Date().toISOString(),
      appName: 'Ritho AI',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ritho_ai_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSignOut = async () => {
    setConfirmSignOut(false);
    await logout();
    onNavigateLogin();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Preferences</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Personalize your habit settings, peaceful theme aesthetic, and cloud backups
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Preferences updated and synced successfully!</span>
        </div>
      )}

      {/* Visual Theme & Atmosphere Selector */}
      <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <span>Peaceful Visual Themes</span>
          </h2>
          <span className="text-[11px] text-neutral-400">4 Tranquil Palettes</span>
        </div>
        <p className="text-xs text-neutral-400">
          Select a calming, distraction-free color palette tailored for evening reflection, morning clarity, or mindful routine building.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {themes.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-violet-500/60 bg-[#191d30] shadow-lg shadow-violet-600/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-[#161826] hover:bg-[#1a1d2e]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{theme.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5">{theme.subtitle}</p>
                  </div>

                  {/* Color Swatch Previews */}
                  <div className="flex items-center -space-x-1.5 shrink-0 pt-0.5">
                    <span
                      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: theme.colors.card }}
                      title="Card Background"
                    />
                    <span
                      className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: theme.colors.bg }}
                      title="App Canvas"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed mt-2">
                  {theme.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#181a29] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Routine and Notification Preferences */}
        <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" />
            <span>Habit Tracking Preferences</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#181a29] border border-neutral-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-neutral-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">Sound Effects</span>
                  <span className="text-[11px] text-neutral-400">
                    Play celebratory chimes when completing daily habits
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-800 border-neutral-700 text-violet-600 focus:ring-violet-500/30"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#181a29] border border-neutral-800">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-neutral-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Daily Habit Review Hour
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Preferred review time for daily routines
                  </span>
                </div>
              </div>
              <input
                type="time"
                value={dailyGoalTime}
                onChange={(e) => setDailyGoalTime(e.target.value)}
                className="bg-[#121422] border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/25 transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <FaceUnlockSettings />

      {/* Account Security & Actions */}
      <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span>Security & Account Operations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDemoUser) return;
              onOpenChangePassword();
            }}
            disabled={isDemoUser}
            className="p-3.5 rounded-xl bg-[#181a29] hover:bg-[#1f2233] border border-neutral-800 text-left transition-colors flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div>
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-violet-400" /> Change Password
              </span>
              <span className="text-[10px] text-neutral-400">
                {isDemoUser ? 'Not needed in Demo Mode' : isGoogleUser ? 'Managed via Google' : 'Update your password'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
              csvExported
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-[#181a29] hover:bg-[#1f2233] border-neutral-800'
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                {csvExported ? 'CSV Downloaded!' : 'Export Data (CSV)'}
              </span>
              <span className="text-[10px] text-neutral-400">
                Excel & Sheets completion history
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="p-3.5 rounded-xl bg-[#181a29] hover:bg-[#1f2233] border border-neutral-800 text-left transition-colors flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-violet-400" /> Export Data (JSON)
              </span>
              <span className="text-[10px] text-neutral-400">Raw JSON backup archive</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="p-3.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-left transition-colors flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-red-300 block flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
              </span>
              <span className="text-[10px] text-red-400/80">End this session securely</span>
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Sign Out Modal */}
      {confirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121422] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Sign Out?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your habits and streak history are safely saved to Firestore.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSignOut(false)}
                className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/25"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
