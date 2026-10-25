import { Habit, HabitLog, UserProfile, ThemeId } from '../types';

export interface DemoPersona {
  id: 'alex' | 'maya' | 'sam';
  name: string;
  email: string;
  password: string;
  headline: string;
  tagline: string;
  theme: ThemeId;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  dailyGoalTime: string;
  profile: UserProfile;
  habits: Habit[];
  getLogs: () => HabitLog[];
}

// Format local date YYYY-MM-DD
function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to generate realistic historical logs for past N days
function generateDemoLogs(
  userId: string,
  habits: Habit[],
  streakDays: number,
  todayCompletedCount: number = 2
): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = new Date();

  // Past 28 days
  for (let offset = 27; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    const dateStr = formatLocalDate(d);
    const isToday = offset === 0;

    habits.forEach((habit, habitIndex) => {
      let completed = false;

      if (isToday) {
        // Complete the first `todayCompletedCount` habits today
        completed = habitIndex < todayCompletedCount;
      } else if (offset <= streakDays) {
        // Within streak window: almost always completed, with occasional 92% adherence
        completed = (habitIndex + offset) % 11 !== 0;
      } else {
        // Older days: realistic 75-80% completion rate
        completed = (habitIndex + offset) % 4 !== 0;
      }

      if (completed) {
        logs.push({
          id: `log_${habit.id}_${dateStr}`,
          userId,
          habitId: habit.id,
          date: dateStr,
          completed: true,
          notes: isToday ? 'Completed via Ritho AI daily focus block' : undefined,
          timestamp: new Date(d.setHours(8 + habitIndex * 2, 15, 0, 0)).toISOString(),
        });
      }
    });
  }

  return logs;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    email: 'alex.habits@ritho.ai',
    password: 'AtomicHabits2026!',
    headline: 'Athletic Vitality & Longevity',
    tagline: 'Zone 2 cardio, box breathing, 3L hydration, and 8-hour sleep tracking',
    theme: 'ocean-mist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    level: 8,
    xp: 1840,
    streak: 24,
    dailyGoalTime: '06:00',
    profile: {
      userId: 'demo_alex',
      email: 'alex.habits@ritho.ai',
      displayName: 'Alex Rivera',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      level: 8,
      xp: 1840,
      dailyGoalTime: '06:00',
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'ocean-mist',
      onboarded: true,
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    habits: [
      {
        id: 'hab_alex_1',
        userId: 'demo_alex',
        title: 'Morning 5km Zone 2 Run',
        description: 'Maintain aerobic base heart rate (135-145 bpm) in morning sunlight',
        category: 'fitness',
        frequency: 'daily',
        targetDaysPerWeek: 6,
        timeOfDay: 'morning',
        streak: 24,
        bestStreak: 28,
        completedToday: true,
        color: '#06b6d4',
        icon: 'zap',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_alex_2',
        userId: 'demo_alex',
        title: '3L Electrolyte Hydration',
        description: 'Drink mineral water & Himalayan salt before noon',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'anytime',
        streak: 31,
        bestStreak: 31,
        completedToday: true,
        color: '#3b82f6',
        icon: 'droplet',
        createdAt: new Date(Date.now() - 32 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_alex_3',
        userId: 'demo_alex',
        title: 'Cold Shower & Box Breathing',
        description: '3 minutes cold exposure followed by 4x4 box breathing',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'morning',
        streak: 19,
        bestStreak: 20,
        completedToday: false,
        color: '#14b8a6',
        icon: 'wind',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_alex_4',
        userId: 'demo_alex',
        title: 'High-Protein Nutrition (160g+)',
        description: 'Whole foods, whey isolate, and creatine monohydrate',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'afternoon',
        streak: 15,
        bestStreak: 18,
        completedToday: false,
        color: '#f59e0b',
        icon: 'utensils',
        createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_alex_5',
        userId: 'demo_alex',
        title: 'Post-Workout Mobility & Foam Roll',
        description: 'Hip flexors, hamstrings, and thoracic spine release',
        category: 'fitness',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'afternoon',
        streak: 17,
        bestStreak: 17,
        completedToday: false,
        color: '#8b5cf6',
        icon: 'activity',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_alex_6',
        userId: 'demo_alex',
        title: 'Restorative Sleep: 8h Sleep Sanctuary',
        description: 'Magnesium L-threonate, pitch black room, 19°C temperature',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'evening',
        streak: 22,
        bestStreak: 25,
        completedToday: false,
        color: '#6366f1',
        icon: 'moon',
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    getLogs: () => generateDemoLogs('demo_alex', DEMO_PERSONAS[0].habits, 24, 2),
  },
  {
    id: 'maya',
    name: 'Maya Chen',
    email: 'maya.mindful@ritho.ai',
    password: 'AtomicHabits2026!',
    headline: 'Mindfulness & Gentle Presence',
    tagline: 'Vipassana meditation, herbal tea journaling, forest walking, and digital sunset',
    theme: 'lavender-calm',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    level: 6,
    xp: 1280,
    streak: 18,
    dailyGoalTime: '07:00',
    profile: {
      userId: 'demo_maya',
      email: 'maya.mindful@ritho.ai',
      displayName: 'Maya Chen',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      level: 6,
      xp: 1280,
      dailyGoalTime: '07:00',
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'lavender-calm',
      onboarded: true,
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    habits: [
      {
        id: 'hab_maya_1',
        userId: 'demo_maya',
        title: 'Vipassana Meditation (20 mins)',
        description: 'Witnessing breath and bodily sensations without judgment',
        category: 'mindfulness',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'morning',
        streak: 18,
        bestStreak: 21,
        completedToday: true,
        color: '#a855f7',
        icon: 'smile',
        createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_maya_2',
        userId: 'demo_maya',
        title: 'Green Tea & Gratitude Journal',
        description: 'Brew sencha tea and write 3 micro-gratitudes',
        category: 'mindfulness',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'morning',
        streak: 16,
        bestStreak: 19,
        completedToday: true,
        color: '#10b981',
        icon: 'book-open',
        createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_maya_3',
        userId: 'demo_maya',
        title: 'Mindful 45-min Nature Walk',
        description: 'Listen to birdsong and leave phone in pocket',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'afternoon',
        streak: 14,
        bestStreak: 14,
        completedToday: false,
        color: '#14b8a6',
        icon: 'sun',
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_maya_4',
        userId: 'demo_maya',
        title: 'Stoic & Eastern Philosophy (25 mins)',
        description: 'Read physical book: Meditations or Zen Mind, Beginner Mind',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'evening',
        streak: 22,
        bestStreak: 30,
        completedToday: false,
        color: '#ec4899',
        icon: 'book',
        createdAt: new Date(Date.now() - 26 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_maya_5',
        userId: 'demo_maya',
        title: 'Digital Sunset: Screens Off by 9:30 PM',
        description: 'Amber reading lamps only, phone charging in living room',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay: 'evening',
        streak: 11,
        bestStreak: 15,
        completedToday: false,
        color: '#6366f1',
        icon: 'moon',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    getLogs: () => generateDemoLogs('demo_maya', DEMO_PERSONAS[1].habits, 18, 2),
  },
  {
    id: 'sam',
    name: 'Sam Taylor',
    email: 'sam.creative@ritho.ai',
    password: 'AtomicHabits2026!',
    headline: 'Creative Flow & Deep Work',
    tagline: '90-minute hyperfocus, UI sketching, inbox zero, and evening reflections',
    theme: 'warm-minimal',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    level: 5,
    xp: 980,
    streak: 12,
    dailyGoalTime: '08:30',
    profile: {
      userId: 'demo_sam',
      email: 'sam.creative@ritho.ai',
      displayName: 'Sam Taylor',
      photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      level: 5,
      xp: 980,
      dailyGoalTime: '08:30',
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'warm-minimal',
      onboarded: true,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    habits: [
      {
        id: 'hab_sam_1',
        userId: 'demo_sam',
        title: 'Morning 90-min Deep Focus Block',
        description: 'Single-tasking on primary creative project without notifications',
        category: 'productivity',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'morning',
        streak: 15,
        bestStreak: 18,
        completedToday: true,
        color: '#f59e0b',
        icon: 'zap',
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_sam_2',
        userId: 'demo_sam',
        title: 'Visual Design & Wireframe Sketching',
        description: 'Paper & ink sketching of UI interactions and spatial systems',
        category: 'creativity',
        frequency: 'daily',
        targetDaysPerWeek: 6,
        timeOfDay: 'morning',
        streak: 12,
        bestStreak: 14,
        completedToday: true,
        color: '#ec4899',
        icon: 'feather',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_sam_3',
        userId: 'demo_sam',
        title: 'Pomodoro Interval Walks',
        description: '5-minute standing walk every 25 minutes of code/design',
        category: 'productivity',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'afternoon',
        streak: 13,
        bestStreak: 15,
        completedToday: false,
        color: '#06b6d4',
        icon: 'clock',
        createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_sam_4',
        userId: 'demo_sam',
        title: 'Inbox Zero & Tomorrow Blueprint',
        description: 'Process all Slack & email messages; write top 3 priorities',
        category: 'productivity',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'evening',
        streak: 9,
        bestStreak: 12,
        completedToday: false,
        color: '#10b981',
        icon: 'check-circle',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'hab_sam_5',
        userId: 'demo_sam',
        title: 'Design Audio-Essay & Podcast Walk',
        description: 'Listen to design engineering or architecture podcast outside',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 5,
        timeOfDay: 'evening',
        streak: 14,
        bestStreak: 16,
        completedToday: false,
        color: '#8b5cf6',
        icon: 'headphones',
        createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    getLogs: () => generateDemoLogs('demo_sam', DEMO_PERSONAS[2].habits, 12, 2),
  },
];

export function getDemoPersona(idOrEmail: string): DemoPersona | undefined {
  const normalized = idOrEmail.toLowerCase().trim();
  return DEMO_PERSONAS.find(
    (p) =>
      p.id === normalized ||
      p.email.toLowerCase() === normalized ||
      `demo_${p.id}` === normalized
  );
}
