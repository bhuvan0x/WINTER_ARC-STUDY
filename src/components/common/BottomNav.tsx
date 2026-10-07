import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  Clock,
  Crosshair,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';

interface BottomNavProps {
  onNewTask: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onNewTask }) => {
  const { activeView, setActiveView, whiteRoomMode } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'HOME', icon: LayoutDashboard },
    { id: 'planner', label: 'PLAN', icon: Clock },
    { id: 'academics', label: 'ACADEMICS', icon: GraduationCap },
    { id: 'focus', label: 'FOCUS LAB', icon: Crosshair },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg pb-safe transition-colors ${
      whiteRoomMode
        ? 'bg-black/95 border-neutral-800 text-neutral-300'
        : 'bg-[#080910]/95 border-slate-800/80 text-slate-300'
    }`}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded text-[10px] font-mono transition-colors ${
                isActive
                  ? whiteRoomMode
                    ? 'text-white font-bold'
                    : 'text-violet-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Mobile quick add task FAB in bar */}
        <button
          onClick={onNewTask}
          className={`p-2 rounded-full border shadow-md ${
            whiteRoomMode
              ? 'bg-white text-black border-neutral-300'
              : 'bg-violet-600 text-white border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
          }`}
          title="New Task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
