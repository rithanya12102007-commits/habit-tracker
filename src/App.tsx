import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LoginPage } from './components/auth/LoginPage';
import { CreateAccountPage } from './components/auth/CreateAccountPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { EmailVerificationBanner } from './components/auth/EmailVerificationBanner';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { HabitsView } from './components/habits/HabitsView';
import { CreateHabitModal } from './components/habits/CreateHabitModal';
import { AICoachView } from './components/coach/AICoachView';
import { LiveVoiceView } from './components/voice/LiveVoiceView';
import { FaceLockScreen } from './components/auth/FaceLockScreen';
import { hasSavedFace, isFaceUnlocked, setFaceUnlocked } from './utils/faceLock';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ProfileView } from './components/profile/ProfileView';
import { AppView } from './types';
import { Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { currentTheme } = useTheme();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [initialCoachPrompt, setInitialCoachPrompt] = useState<string | undefined>(undefined);
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [faceUnlockedUid, setFaceUnlockedUid] = useState<string | null>(null);

  // Check URL params for reset password flow
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const oobCode = params.get('oobCode');
      if (mode === 'resetPassword' || oobCode) {
        setCurrentView('reset-password');
      }
    }
  }, []);

  const handleNavigate = (view: AppView, prompt?: string) => {
    if (view === 'coach' && prompt) {
      setInitialCoachPrompt(prompt);
    } else {
      setInitialCoachPrompt(undefined);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 border border-violet-400/20 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-violet-600/20 blur-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold tracking-wide">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span>Restoring Ritho AI Session...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Public Routes
  if (!user) {
    if (currentView === 'signup') {
      return <CreateAccountPage onNavigate={(v) => handleNavigate(v)} />;
    }
    if (currentView === 'forgot-password') {
      return <ForgotPasswordPage onNavigate={(v) => handleNavigate(v)} />;
    }
    if (currentView === 'reset-password') {
      return <ResetPasswordPage onNavigate={(v) => handleNavigate(v)} />;
    }
    return <LoginPage onNavigate={(v) => handleNavigate(v)} />;
  }

  // Face Unlock: if the user turned it on for this device, show the lock screen first
  if (hasSavedFace(user.uid) && !isFaceUnlocked(user.uid) && faceUnlockedUid !== user.uid) {
    return (
      <FaceLockScreen
        uid={user.uid}
        onUnlock={() => setFaceUnlockedUid(user.uid)}
        onUsePassword={() => {
          setFaceUnlocked(user.uid);
          setFaceUnlockedUid(user.uid);
        }}
      />
    );
  }

  // Authenticated Protected Views
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
          />
        );
      case 'habits':
        return <HabitsView onOpenCreateModal={() => setIsCreateHabitOpen(true)} />;
      case 'coach':
        return <AICoachView initialPrompt={initialCoachPrompt} />;
      case 'voice':
        return <LiveVoiceView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'profile':
      case 'settings':
        return (
          <ProfileView
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onNavigateLogin={() => handleNavigate('login')}
          />
        );
      default:
        return (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenCreateHabit={() => setIsCreateHabitOpen(true)}
          />
        );
    }
  };

  return (
    <HabitProvider>
      <div
        data-theme={currentTheme}
        className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col transition-colors duration-300"
      >
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Demo Mode Top Banner */}
        <DemoModeBanner />

        {/* Top Navigation */}
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />

        {/* Main Content Layout with Sidebar */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar currentView={currentView} onNavigate={handleNavigate} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {renderActiveView()}
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav currentView={currentView} onNavigate={handleNavigate} />

        {/* Global Modals */}
        <CreateHabitModal
          isOpen={isCreateHabitOpen}
          onClose={() => setIsCreateHabitOpen(false)}
        />

        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </HabitProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
