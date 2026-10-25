import React from 'react';
import { LayoutDashboard, CheckSquare, Bot, Phone, BarChart3, User } from 'lucide-react';
import { AppView } from '../../types';

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as AppView, label: 'Today', icon: LayoutDashboard },
    { id: 'habits' as AppView, label: 'Habits', icon: CheckSquare },
    { id: 'coach' as AppView, label: 'Coach', icon: Bot },
    { id: 'voice' as AppView, label: 'Live Call', icon: Phone },
    { id: 'analytics' as AppView, label: 'Stats', icon: BarChart3 },
    { id: 'profile' as AppView, label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-violet-400 font-semibold' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-neutral-500'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
