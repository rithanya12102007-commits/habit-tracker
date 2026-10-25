import { HabitLog } from '../types';

// ---------- XP settings (change numbers here) ----------
export const XP_PER_COMPLETION = 25;
export const XP_STREAK_BONUS = 15; // extra XP when streak is 3 days or more
export const XP_PER_LEVEL = 200;

export function getXpForCompletion(streak: number): number {
  return XP_PER_COMPLETION + (streak >= 3 ? XP_STREAK_BONUS : 0);
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ---------- Date helpers (all dates are local "YYYY-MM-DD") ----------
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return getLocalDateString(new Date(year, month - 1, day + days));
}

// ---------- Streak calculation ----------
export function getCompletedDates(logs: HabitLog[], habitId: string): Set<string> {
  const dates = new Set<string>();
  for (const log of logs) {
    if (log.habitId === habitId && log.completed) {
      dates.add(log.date);
    }
  }
  return dates;
}

// Current streak = days in a row counting back from today.
// If today is not done yet, start from yesterday (streak is not lost until the day ends).
export function calculateStreak(completedDates: Set<string>, today: string): number {
  let day = completedDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (completedDates.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// Best streak = longest run of consecutive days in the whole history.
export function calculateBestStreak(completedDates: Set<string>): number {
  const sortedDates = Array.from(completedDates).sort();
  let best = 0;
  let run = 0;
  let previous = '';
  for (const date of sortedDates) {
    run = previous && addDays(previous, 1) === date ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return best;
}
