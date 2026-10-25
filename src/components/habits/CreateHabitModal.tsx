import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { HabitCategory, TimeOfDay } from '../../types';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { title: 'Morning Meditation (10m)', category: 'mindfulness' as HabitCategory, timeOfDay: 'morning' as TimeOfDay, cue: 'Center thoughts before work' },
  { title: 'Drink 2 Liters Water', category: 'health' as HabitCategory, timeOfDay: 'anytime' as TimeOfDay, cue: 'Stay energized throughout the day' },
  { title: 'Read 20 Pages', category: 'learning' as HabitCategory, timeOfDay: 'evening' as TimeOfDay, cue: 'Continuous intellectual growth' },
  { title: '30-Minute Workout / Run', category: 'fitness' as HabitCategory, timeOfDay: 'morning' as TimeOfDay, cue: 'Boost physical resilience' },
  { title: 'Deep Work Session (50m)', category: 'productivity' as HabitCategory, timeOfDay: 'morning' as TimeOfDay, cue: 'Zero distraction sprint' },
  { title: 'Daily Gratitude Journal', category: 'mindfulness' as HabitCategory, timeOfDay: 'evening' as TimeOfDay, cue: 'Note 3 positive moments' },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isOpen, onClose }) => {
  const { createHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setTimeOfDay(preset.timeOfDay);
    setDescription(preset.cue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await createHabit({
        title: title.trim(),
        description: description.trim(),
        category,
        frequency: 'daily',
        targetDaysPerWeek: 7,
        timeOfDay,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to create habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121422] border border-neutral-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Habit</h3>
            <p className="text-xs text-neutral-400">Design a recurring routine to build momentum</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1.5 rounded-lg bg-[#181a29] hover:bg-violet-950/60 border border-neutral-800 hover:border-violet-500/30 text-xs text-neutral-300 transition-colors text-left"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Habit Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 15 minutes before bed"
              required
              className="w-full bg-[#181a29] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Cue or Reason (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. After I pour morning coffee, to improve vocabulary"
              className="w-full bg-[#181a29] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full bg-[#181a29] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="health">Health</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="fitness">Fitness</option>
                <option value="creativity">Creativity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full bg-[#181a29] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Create Habit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
