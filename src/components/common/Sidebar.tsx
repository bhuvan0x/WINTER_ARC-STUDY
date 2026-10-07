import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  Clock,
  Crosshair,
  CalendarDays,
  Target,
  BarChart3,
  FileCheck2,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onNewTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewTask }) => {
  const { activeView, setActiveView, whiteRoomMode } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'HOME', jp: 'ダッシュボード', shortcut: 'D', icon: LayoutDashboard },
    { id: 'planner', label: 'PLAN', jp: '日課計画', shortcut: 'P', icon: Clock },
    { id: 'academics', label: 'ACADEMICS', jp: '学術司令・CBSE', shortcut: 'C', icon: GraduationCap },
    { id: 'focus', label: 'FOCUS LAB', jp: '集中研究室・Pomodoro', shortcut: 'F', icon: Crosshair },
    { id: 'analytics', label: 'ANALYTICS', jp: '分析記録', shortcut: 'A', icon: BarChart3 },
    { id: 'calendar', label: 'CALENDAR', jp: '作戦日程', shortcut: 'K', icon: CalendarDays },
    { id: 'goals', label: 'GOALS', jp: '目標管理', shortcut: 'G', icon: Target },
    { id: 'review', label: 'AAR REVIEW', jp: '事後検証', shortcut: 'R', icon: FileCheck2 },
    { id: 'settings', label: 'SETTINGS', jp: '環境設定', shortcut: 'S', icon: Settings },
  ];

  return (
    <aside className={`w-64 shrink-0 hidden lg:flex flex-col border-r min-h-[calc(100vh-53px)] p-4 transition-colors ${
      whiteRoomMode
        ? 'bg-black border-neutral-800 text-neutral-300'
        : 'bg-[#090b12]/95 border-slate-800/80 text-slate-300'
    }`}>
      {/* Quick Execution Button */}
      <div className="mb-6">
        <button
          onClick={onNewTask}
          className={`w-full py-2.5 px-3 rounded font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 border transition-all ${
            whiteRoomMode
              ? 'bg-neutral-100 text-black border-neutral-300 hover:bg-neutral-200'
              : 'bg-violet-600/90 hover:bg-violet-600 text-white border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
          }`}
        >
          <span>+ NEW TASK</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-normal">N</span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-mono text-xs transition-all text-left group ${
                isActive
                  ? whiteRoomMode
                    ? 'bg-neutral-900 border border-neutral-700 text-white font-semibold'
                    : 'bg-violet-950/40 border border-violet-500/40 text-violet-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive
                    ? whiteRoomMode ? 'text-white' : 'text-violet-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <div>
                  <div className="tracking-wider">{item.label}</div>
                  <div className="text-[9px] text-slate-500 leading-none">{item.jp}</div>
                </div>
              </div>
              <span className={`text-[10px] px-1 py-0.5 rounded border ${
                isActive
                  ? whiteRoomMode
                    ? 'border-neutral-700 text-neutral-400 bg-neutral-950'
                    : 'border-violet-900 text-violet-400 bg-violet-950/50'
                  : 'border-slate-800 text-slate-600 group-hover:text-slate-400'
              }`}>
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Tactical quote footer */}
      <div className={`mt-auto pt-4 border-t text-[11px] font-mono leading-relaxed ${
        whiteRoomMode ? 'border-neutral-800 text-neutral-500' : 'border-slate-800/80 text-slate-500'
      }`}>
        <p className="italic">"Execute the plan. No negotiation."</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Ayanokoji Strategic Directive</p>
      </div>
    </aside>
  );
};
