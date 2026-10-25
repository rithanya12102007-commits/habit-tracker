import { Habit, HabitLog, UserProfile } from '../types';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export interface CsvExportOptions {
  includeStatsSummary?: boolean;
  includeHabitsCatalog?: boolean;
  includeCompletionLogs?: boolean;
}

export function generateCsvContent(
  habits: Habit[],
  logs: HabitLog[],
  profile?: UserProfile | null,
  options: CsvExportOptions = {
    includeStatsSummary: true,
    includeHabitsCatalog: true,
    includeCompletionLogs: true,
  }
): string {
  const lines: string[] = [];

  // Section 1: Overall Summary & User Statistics
  if (options.includeStatsSummary) {
    const totalCompletions = logs.filter((l) => l.completed).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streak || 0), 0);
    const completedToday = habits.filter((h) => h.completedToday).length;
    const todayRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

    lines.push('=== RITHO AI - HABIT TRACKING & STATISTICS REPORT ===');
    lines.push(`Generated At,${escapeCsvCell(new Date().toLocaleString())}`);
    lines.push(`User Display Name,${escapeCsvCell(profile?.displayName || 'User')}`);
    lines.push(`User Email,${escapeCsvCell(profile?.email || 'N/A')}`);
    lines.push(`Level,${escapeCsvCell(profile?.level || 1)}`);
    lines.push(`Total Experience (XP),${escapeCsvCell(profile?.xp || 0)}`);
    lines.push(`Total Active Habits,${escapeCsvCell(habits.length)}`);
    lines.push(`Lifetime Habit Completions,${escapeCsvCell(totalCompletions)}`);
    lines.push(`Highest Consecutive Streak (Days),${escapeCsvCell(bestStreak)}`);
    lines.push(`Today Completion Rate,${escapeCsvCell(`${todayRate}% (${completedToday}/${habits.length})`)}`);
    lines.push('');
  }

  // Section 2: Active Habits & Streaks
  if (options.includeHabitsCatalog) {
    lines.push('=== ACTIVE HABITS & CURRENT STREAKS ===');
    const habitHeaders = [
      'Habit ID',
      'Habit Title',
      'Category',
      'Frequency',
      'Time of Day',
      'Target Days / Week',
      'Current Streak (Days)',
      'Best Streak (Days)',
      'Completed Today',
      'Description / Cue',
      'Created Date',
    ];
    lines.push(habitHeaders.map(escapeCsvCell).join(','));

    for (const h of habits) {
      const row = [
        h.id,
        h.title,
        h.category,
        h.frequency,
        h.timeOfDay,
        h.targetDaysPerWeek ?? 7,
        h.streak || 0,
        h.bestStreak || h.streak || 0,
        h.completedToday ? 'Yes' : 'No',
        h.description || '',
        h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '',
      ];
      lines.push(row.map(escapeCsvCell).join(','));
    }
    lines.push('');
  }

  // Section 3: Detailed Habit Completion Logs History
  if (options.includeCompletionLogs) {
    lines.push('=== HABIT COMPLETION HISTORY LOGS ===');
    const logHeaders = [
      'Log ID',
      'Completion Date (YYYY-MM-DD)',
      'Habit ID',
      'Habit Title',
      'Category',
      'Status',
      'Recorded Timestamp',
      'Notes',
    ];
    lines.push(logHeaders.map(escapeCsvCell).join(','));

    // Map habit IDs to titles for easy lookup
    const habitMap = new Map<string, Habit>();
    habits.forEach((h) => habitMap.set(h.id, h));

    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    for (const log of sortedLogs) {
      const habit = habitMap.get(log.habitId);
      const row = [
        log.id,
        log.date,
        log.habitId,
        habit ? habit.title : 'Deleted / Archived Habit',
        habit ? habit.category : 'N/A',
        log.completed ? 'Completed' : 'Skipped / Incomplete',
        log.timestamp ? new Date(log.timestamp).toLocaleString() : '',
        log.notes || '',
      ];
      lines.push(row.map(escapeCsvCell).join(','));
    }
  }

  return lines.join('\r\n');
}

export function downloadCsvFile(content: string, filenamePrefix: string = 'ritho_ai_habits_report'): void {
  // \uFEFF is UTF-8 Byte Order Mark for Excel compatibility
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
