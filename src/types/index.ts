export type HabitCategory =
  | 'health'
  | 'productivity'
  | 'learning'
  | 'mindfulness'
  | 'fitness'
  | 'creativity';

export type HabitFrequency = 'daily' | 'weekly';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek?: number;
  timeOfDay: TimeOfDay;
  streak: number;
  bestStreak: number;
  completedToday: boolean;
  archived?: boolean;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  timestamp: string;
}

export type ThemeId = 'sage-garden' | 'lavender-calm' | 'warm-minimal' | 'ocean-mist';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  dailyGoalTime: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: ThemeId | string;
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'text' | 'voice';
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredXp?: number;
  requiredStreak?: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type AppView =
  | 'dashboard'
  | 'habits'
  | 'coach'
  | 'voice'
  | 'analytics'
  | 'achievements'
  | 'profile'
  | 'settings'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password';
