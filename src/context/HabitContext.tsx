import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { Habit, HabitCategory, HabitLog, TimeOfDay } from '../types';
import { useAuth } from './AuthContext';
import { sound } from '../utils/sound';
import { getDemoPersona } from '../data/demoAccounts';
import {
  getLocalDateString,
  getCompletedDates,
  calculateStreak,
  calculateBestStreak,
  getXpForCompletion,
  getLevelFromXp,
} from '../utils/habitStats';

// Other files import this from here, so keep exporting it
export { getLocalDateString };

interface HabitContextType {
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  createHabit: (data: Omit<Habit, 'id' | 'userId' | 'streak' | 'bestStreak' | 'completedToday' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompleteHabit: (id: string, dateStr?: string) => Promise<void>;
  undoCompleteHabit: (id: string, dateStr?: string) => Promise<void>;
  resetDemoData: () => void;
  todayCompletedCount: number;
  todayTotalCount: number;
  todayCompletionRate: number;
  currentBestStreak: number;
  recentLogsSummary: string;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const STARTER_HABITS: Array<Omit<Habit, 'id' | 'userId' | 'streak' | 'bestStreak' | 'completedToday' | 'createdAt' | 'updatedAt'>> = [
  {
    title: 'Hydrate: Drink 500ml Water',
    description: 'Kickstart metabolic rate and mental clarity',
    category: 'health',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    timeOfDay: 'morning',
    color: '#06b6d4',
    icon: 'droplet',
  },
  {
    title: 'Deep Focus Block (45 mins)',
    description: 'Work uninterrupted on top priority project',
    category: 'productivity',
    frequency: 'daily',
    targetDaysPerWeek: 5,
    timeOfDay: 'morning',
    color: '#8b5cf6',
    icon: 'zap',
  },
  {
    title: 'Evening Reading / Journaling (15 mins)',
    description: 'Read non-fiction or reflect before sleep',
    category: 'mindfulness',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    timeOfDay: 'evening',
    color: '#10b981',
    icon: 'book-open',
  },
];

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, updateProfileSettings } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = getLocalDateString();

  // Listen to habits and logs in real-time
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    // Demo Mode: Local storage persistence with instant seed
    if (user.uid.startsWith('demo_')) {
      setLoading(true);
      const persona = getDemoPersona(user.uid);
      const habitsKey = `ritho_demo_habits_${user.uid}`;
      const logsKey = `ritho_demo_logs_${user.uid}`;

      let loadedHabits: Habit[] = [];
      let loadedLogs: HabitLog[] = [];

      try {
        const savedHabits = localStorage.getItem(habitsKey);
        if (savedHabits) {
          loadedHabits = JSON.parse(savedHabits);
        } else if (persona) {
          loadedHabits = persona.habits;
          localStorage.setItem(habitsKey, JSON.stringify(loadedHabits));
        }

        const savedLogs = localStorage.getItem(logsKey);
        if (savedLogs) {
          loadedLogs = JSON.parse(savedLogs);
        } else if (persona) {
          loadedLogs = persona.getLogs();
          localStorage.setItem(logsKey, JSON.stringify(loadedLogs));
        }
      } catch (e) {
        console.warn('Error loading demo habits/logs:', e);
        if (persona) {
          loadedHabits = persona.habits;
          loadedLogs = persona.getLogs();
        }
      }

      setHabits(loadedHabits.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLogs(loadedLogs);
      setLoading(false);
      return;
    }

    setLoading(true);
    const habitsCol = collection(db, 'users', user.uid, 'habits');
    const logsCol = collection(db, 'users', user.uid, 'logs');

    let seeded = false;

    const unsubHabits = onSnapshot(
      habitsCol,
      async (snapshot) => {
        const loadedHabits: Habit[] = [];
        snapshot.forEach((docSnap) => {
          loadedHabits.push(docSnap.data() as Habit);
        });

        // Seed starters if first time user has zero habits
        if (loadedHabits.length === 0 && !seeded) {
          seeded = true;
          for (const starter of STARTER_HABITS) {
            const id = 'hab_' + Math.random().toString(36).substring(2, 9);
            const now = new Date().toISOString();
            const habitDoc: Habit = {
              ...starter,
              id,
              userId: user.uid,
              streak: 0,
              bestStreak: 0,
              completedToday: false,
              archived: false,
              createdAt: now,
              updatedAt: now,
            };
            try {
              await setDoc(doc(db, 'users', user.uid, 'habits', id), habitDoc);
            } catch (e) {
              console.error('Seeding error:', e);
            }
          }
          return;
        }

        setHabits(loadedHabits.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`);
        setLoading(false);
      }
    );

    const unsubLogs = onSnapshot(
      logsCol,
      (snapshot) => {
        const loadedLogs: HabitLog[] = [];
        snapshot.forEach((docSnap) => {
          loadedLogs.push(docSnap.data() as HabitLog);
        });
        setLogs(loadedLogs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`);
      }
    );

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  // Derived state
  const todayHabitIdsCompleted = useMemo(() => {
    return new Set(
      logs
        .filter((l) => l.date === today && l.completed)
        .map((l) => l.habitId)
    );
  }, [logs, today]);

  // completedToday, streak and bestStreak are calculated from the logs (the logs are the single source of truth)
  const syncedHabits = useMemo(() => {
    return habits.map((h) => {
      const completedDates = getCompletedDates(logs, h.id);
      return {
        ...h,
        completedToday: todayHabitIdsCompleted.has(h.id),
        streak: calculateStreak(completedDates, today),
        // never lower a best streak that was already earned
        bestStreak: Math.max(h.bestStreak || 0, calculateBestStreak(completedDates)),
      };
    });
  }, [habits, logs, today, todayHabitIdsCompleted]);

  const activeHabits = useMemo(() => {
    return syncedHabits.filter((h) => !h.archived);
  }, [syncedHabits]);

  const todayCompletedCount = activeHabits.filter((h) => h.completedToday).length;
  const todayTotalCount = activeHabits.length;
  const todayCompletionRate =
    todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  const currentBestStreak = useMemo(() => {
    return activeHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  }, [activeHabits]);

  const recentLogsSummary = useMemo(() => {
    return activeHabits
      .map((h) => `${h.title}: ${h.completedToday ? 'Completed today' : 'Pending'} (Streak: ${h.streak}d)`)
      .join(', ');
  }, [activeHabits]);

  const createHabit = async (
    data: Omit<Habit, 'id' | 'userId' | 'streak' | 'bestStreak' | 'completedToday' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    const id = 'hab_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...data,
      id,
      userId: user.uid,
      streak: 0,
      bestStreak: 0,
      completedToday: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    if (user.uid.startsWith('demo_')) {
      const updated = [newHabit, ...habits];
      setHabits(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ritho_demo_habits_${user.uid}`, JSON.stringify(updated));
      }
      sound.playClick();
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid, 'habits', id), newHabit);
      sound.playClick();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/habits/${id}`);
    }
  };

  const updateHabit = async (id: string, data: Partial<Habit>) => {
    if (!user) return;
    if (user.uid.startsWith('demo_')) {
      const updated = habits.map((h) =>
        h.id === id ? { ...h, ...data, updatedAt: new Date().toISOString() } : h
      );
      setHabits(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ritho_demo_habits_${user.uid}`, JSON.stringify(updated));
      }
      sound.playClick();
      return;
    }

    try {
      const habitRef = doc(db, 'users', user.uid, 'habits', id);
      const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(habitRef, updatePayload);
      sound.playClick();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/habits/${id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    if (user.uid.startsWith('demo_')) {
      const updated = habits.filter((h) => h.id !== id);
      setHabits(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ritho_demo_habits_${user.uid}`, JSON.stringify(updated));
      }
      sound.playClick();
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
      sound.playClick();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/habits/${id}`);
    }
  };

  const toggleCompleteHabit = async (id: string, dateStr: string = today) => {
    if (!user) return;
    const habit = syncedHabits.find((h) => h.id === id);
    if (!habit) return;

    const isDemo = user.uid.startsWith('demo_');
    const logDocId = `${id}_${dateStr}`;
    const isCurrentlyDone = logs.some((l) => l.habitId === id && l.date === dateStr && l.completed);

    const newLog: HabitLog = {
      id: logDocId,
      userId: user.uid,
      habitId: id,
      date: dateStr,
      completed: true,
      timestamp: new Date().toISOString(),
    };

    // The list of logs as it will look after this click
    const logsAfter = isCurrentlyDone
      ? logs.filter((l) => !(l.habitId === id && l.date === dateStr))
      : [...logs, newLog];

    const streakAfter = calculateStreak(getCompletedDates(logsAfter, id), today);
    const bestStreakAfter = Math.max(habit.bestStreak || 0, streakAfter);

    // XP: ticking gives XP, unticking takes the same XP back (so no XP farming)
    const logsWithThisDay = isCurrentlyDone ? logs : logsAfter;
    const streakWithThisDay = calculateStreak(getCompletedDates(logsWithThisDay, id), today);
    const xpChange = (isCurrentlyDone ? -1 : 1) * getXpForCompletion(streakWithThisDay);

    // Save the log
    try {
      if (isDemo) {
        setLogs(logsAfter);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ritho_demo_logs_${user.uid}`, JSON.stringify(logsAfter));
        }
      } else {
        const logRef = doc(db, 'users', user.uid, 'logs', logDocId);
        const habitRef = doc(db, 'users', user.uid, 'habits', id);
        const updatedAt = new Date().toISOString();

        if (isCurrentlyDone) {
          await deleteDoc(logRef);
          await updateDoc(habitRef, { streak: streakAfter, updatedAt });
        } else {
          await setDoc(logRef, newLog);
          await updateDoc(habitRef, { streak: streakAfter, bestStreak: bestStreakAfter, updatedAt });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/logs/${logDocId}`);
    }

    // Sound and confetti
    if (isCurrentlyDone) {
      sound.playClick();
    } else {
      sound.playCheck();
      const remainingToComplete = activeHabits.filter((h) => h.id !== id && !h.completedToday).length;
      if (remainingToComplete === 0) {
        sound.playFanfare();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
          });
        } catch {
          // Confetti is optional visual flair
        }
      }
    }

    // Update XP and level
    if (profile) {
      const totalXp = Math.max(0, (profile.xp || 0) + xpChange);
      await updateProfileSettings({ xp: totalXp, level: getLevelFromXp(totalXp) });
    }
  };

  const undoCompleteHabit = async (id: string, dateStr: string = today) => {
    return toggleCompleteHabit(id, dateStr);
  };

  const resetDemoData = () => {
    if (!user || !user.uid.startsWith('demo_')) return;
    const persona = getDemoPersona(user.uid);
    if (!persona) return;
    const habitsKey = `ritho_demo_habits_${user.uid}`;
    const logsKey = `ritho_demo_logs_${user.uid}`;
    const profileKey = `ritho_demo_profile_${user.uid}`;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(habitsKey);
      localStorage.removeItem(logsKey);
      localStorage.removeItem(profileKey);

      const freshHabits = persona.habits;
      const freshLogs = persona.getLogs();
      localStorage.setItem(habitsKey, JSON.stringify(freshHabits));
      localStorage.setItem(logsKey, JSON.stringify(freshLogs));

      setHabits(freshHabits);
      setLogs(freshLogs);
    }
    updateProfileSettings(persona.profile);
    sound.playClick();
  };

  return (
    <HabitContext.Provider
      value={{
        habits: activeHabits,
        logs,
        loading,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleCompleteHabit,
        undoCompleteHabit,
        resetDemoData,
        todayCompletedCount,
        todayTotalCount,
        todayCompletionRate,
        currentBestStreak,
        recentLogsSummary,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
