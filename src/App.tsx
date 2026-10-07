import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { FocusProvider } from './context/FocusContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { DashboardView } from './components/views/DashboardView';
import { PlannerView } from './components/views/PlannerView';
import { FocusLabView } from './components/views/FocusLabView';
import { CalendarView } from './components/views/CalendarView';
import { GoalsView } from './components/views/GoalsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReviewView } from './components/views/ReviewView';
import { SettingsView } from './components/views/SettingsView';
import { AcademicCommandCenter } from './components/views/AcademicCommandCenter';
import { FirstRunModal } from './components/modals/FirstRunModal';
import { TaskModal } from './components/modals/TaskModal';
import { ScoreBreakdownModal } from './components/modals/ScoreBreakdownModal';
import { MorningBriefingModal } from './components/modals/MorningBriefingModal';
import { NightReportModal } from './components/modals/NightReportModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { FeatureCompendiumModal } from './components/modals/FeatureCompendiumModal';
import { Task } from './types';

const MainLayout: React.FC = () => {
  const {
    settings,
    isLoading,
    activeView,
    setActiveView,
    whiteRoomMode,
  } = useApp();

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStartTime, setDefaultTaskStartTime] = useState('08:00');
  const [defaultTaskEndTime, setDefaultTaskEndTime] = useState('09:00');

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMorningBriefOpen, setIsMorningBriefOpen] = useState(false);
  const [isNightReportOpen, setIsNightReportOpen] = useState(false);
  const [isScoreBreakdownOpen, setIsScoreBreakdownOpen] = useState(false);
  const [isFeatureCompendiumOpen, setIsFeatureCompendiumOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          handleOpenNewTask();
          break;
        case 'c':
          e.preventDefault();
          setActiveView('academics');
          break;
        case 'f':
          e.preventDefault();
          setActiveView('focus');
          break;
        case 'd':
          e.preventDefault();
          setActiveView('dashboard');
          break;
        case 'p':
          e.preventDefault();
          setActiveView('planner');
          break;
        case 'k':
          e.preventDefault();
          setActiveView('calendar');
          break;
        case 'a':
          e.preventDefault();
          setActiveView('analytics');
          break;
        case 'r':
          e.preventDefault();
          setActiveView('review');
          break;
        case 'escape':
          e.preventDefault();
          setIsTaskModalOpen(false);
          setIsShortcutsOpen(false);
          setIsMorningBriefOpen(false);
          setIsNightReportOpen(false);
          setIsScoreBreakdownOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  const handleOpenNewTask = (task?: Task, start?: string, end?: string) => {
    setEditingTask(task || null);
    if (start) setDefaultTaskStartTime(start);
    if (end) setDefaultTaskEndTime(end);
    setIsTaskModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center font-mono text-slate-400">
        <div className="space-y-2 text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs tracking-widest uppercase">INITIALIZING WINTER ARC SYSTEM...</div>
        </div>
      </div>
    );
  }

  // First Run Wizard
  const showFirstRun = !settings.hasCompletedInit;

  return (
    <div className={`min-h-screen flex flex-col transition-colors selection:bg-violet-900 selection:text-white ${
      whiteRoomMode
        ? 'bg-black text-neutral-100'
        : 'bg-[#07080d] text-slate-100'
    }`}>
      {/* Top Header */}
      <Header
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenMorningBrief={() => setIsMorningBriefOpen(true)}
        onOpenNightReport={() => setIsNightReportOpen(true)}
        onOpenScoreBreakdown={() => setIsScoreBreakdownOpen(true)}
        onOpenFeatureCompendium={() => setIsFeatureCompendiumOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar onNewTask={() => handleOpenNewTask()} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 overflow-x-hidden">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenTaskModal={(task) => handleOpenNewTask(task)}
              onOpenAAR={() => setActiveView('review')}
              onOpenMorningBrief={() => setIsMorningBriefOpen(true)}
              onOpenNightReport={() => setIsNightReportOpen(true)}
              onOpenScoreBreakdown={() => setIsScoreBreakdownOpen(true)}
            />
          )}

          {activeView === 'academics' && <AcademicCommandCenter />}

          {activeView === 'planner' && (
            <PlannerView onOpenTaskModal={(task, s, e) => handleOpenNewTask(task, s, e)} />
          )}

          {activeView === 'focus' && <FocusLabView />}

          {activeView === 'calendar' && <CalendarView />}

          {activeView === 'goals' && <GoalsView />}

          {activeView === 'analytics' && <AnalyticsView />}

          {activeView === 'review' && <ReviewView />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onNewTask={() => handleOpenNewTask()} />

      {/* Modals & Overlays */}
      {showFirstRun && <FirstRunModal />}

      <TaskModal
        task={editingTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultStartTime={defaultTaskStartTime}
        defaultEndTime={defaultTaskEndTime}
      />

      <ScoreBreakdownModal
        isOpen={isScoreBreakdownOpen}
        onClose={() => setIsScoreBreakdownOpen(false)}
      />

      <MorningBriefingModal
        isOpen={isMorningBriefOpen}
        onClose={() => setIsMorningBriefOpen(false)}
      />

      <NightReportModal
        isOpen={isNightReportOpen}
        onClose={() => setIsNightReportOpen(false)}
        onOpenAAR={() => setActiveView('review')}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <FeatureCompendiumModal
        isOpen={isFeatureCompendiumOpen}
        onClose={() => setIsFeatureCompendiumOpen(false)}
      />
    </div>
  );
};

const FocusProviderWrapper: React.FC = () => {
  const { recordFocusSession } = useApp();
  return (
    <FocusProvider
      onSessionCompleteNotification={(session) => {
        recordFocusSession({
          date: session.date,
          taskId: session.taskId,
          taskTitle: session.objective,
          durationMinutes: session.actualFocusMinutes,
          type:
            session.actualFocusMinutes >= 90
              ? 'POMODORO_90'
              : session.actualFocusMinutes <= 30
              ? 'POMODORO_25'
              : 'POMODORO_50',
          completedAt: new Date().toISOString(),
          notes: session.reviewNote,
        });
      }}
    >
      <MainLayout />
    </FocusProvider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <FocusProviderWrapper />
    </AppProvider>
  );
}
