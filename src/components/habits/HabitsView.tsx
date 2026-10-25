import React, { useState } from 'react';
import {
  Plus,
  Search,
  Check,
  Flame,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  Trophy,
  Filter,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { Habit, HabitCategory, TimeOfDay } from '../../types';

interface HabitsViewProps {
  onOpenCreateModal: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({ onOpenCreateModal }) => {
  const { habits, toggleCompleteHabit, updateHabit, deleteHabit } = useHabits();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<HabitCategory>('health');
  const [editTimeOfDay, setEditTimeOfDay] = useState<TimeOfDay>('morning');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Habits' },
    { id: 'health', label: 'Health' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'learning', label: 'Learning' },
    { id: 'mindfulness', label: 'Mindfulness' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'creativity', label: 'Creativity' },
  ];

  const filteredHabits = habits.filter((h) => {
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
    setEditDesc(habit.description || '');
    setEditCategory(habit.category);
    setEditTimeOfDay(habit.timeOfDay);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editTitle.trim()) return;

    await updateHabit(editingHabit.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      timeOfDay: editTimeOfDay,
    });
    setEditingHabit(null);
  };

  const confirmDelete = async () => {
    if (deletingHabitId) {
      await deleteHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Habits</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage, customize, and track your daily & weekly routines
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111320] border border-neutral-800/80 p-3 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits by name..."
            className="w-full bg-[#181a29] border border-neutral-700/70 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Categories scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-[#181a29] text-neutral-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#111320] border border-neutral-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No matching habits found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try clearing your search or add a new custom habit to start tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => {
            const isDone = habit.completedToday;
            return (
              <div
                key={habit.id}
                className="rounded-2xl bg-[#121422] border border-neutral-800/80 hover:border-neutral-700 p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#191b2c] text-violet-300 text-[11px] font-semibold capitalize border border-violet-500/15">
                      {habit.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(habit)}
                        title="Edit habit"
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingHabitId(habit.id)}
                        title="Delete habit"
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                      {habit.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-800/60 mt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      {habit.streak || 0}d current streak
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
                      <Trophy className="w-3 h-3 text-violet-400" />
                      Best: {habit.bestStreak || habit.streak || 0}d
                    </span>
                  </div>

                  {/* Toggle Complete Button */}
                  <button
                    onClick={() => toggleCompleteHabit(habit.id)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#191b2c] hover:bg-violet-600 hover:text-white text-neutral-200 border border-neutral-700/80'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isDone ? 'stroke-[2.5]' : ''}`} />
                    <span>{isDone ? 'Completed Today (Undo)' : 'Mark Completed Today'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121422] border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Habit</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#181a29] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description (cue or reason)</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#181a29] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as HabitCategory)}
                    className="w-full bg-[#181a29] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
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
                    value={editTimeOfDay}
                    onChange={(e) => setEditTimeOfDay(e.target.value as TimeOfDay)}
                    className="w-full bg-[#181a29] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
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
                  onClick={() => setEditingHabit(null)}
                  className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-600/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingHabitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121422] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Delete this habit?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                This will permanently remove this habit and its tracking history. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingHabitId(null)}
                className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/25"
              >
                Delete Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
