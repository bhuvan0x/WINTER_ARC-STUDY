import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight, X } from 'lucide-react';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sessionObjective, completeSession, linkedChapterId, linkedTaskId } = useFocus();
  const { academicSubjects, updateReadinessState, toggleTaskComplete } = useApp();

  const [objectiveCompleted, setObjectiveCompleted] = useState<'YES' | 'PARTIALLY' | 'NO'>('YES');
  const [interruptionReason, setInterruptionReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [academicProgressIncrement, setAcademicProgressIncrement] = useState(15);

  if (!isOpen) return null;

  const handleFinish = async () => {
    await completeSession({
      objectiveCompleted,
      reviewNote: reviewNote.trim() || undefined,
      interruptionReason: interruptionReason.trim() || undefined,
    });

    // If linked to CBSE academic chapter, automatically update progress & readiness!
    if (linkedChapterId) {
      for (const subj of academicSubjects) {
        const foundCh = subj.chapters.find((c) => c.id === linkedChapterId);
        if (foundCh) {
          const newPct = Math.min(100, (foundCh.progressPercent || 0) + academicProgressIncrement);
          const nextState =
            newPct >= 100
              ? 'MASTERED'
              : newPct >= 75
              ? 'REVISED'
              : newPct >= 50
              ? 'PRACTICING'
              : 'LEARNING';
          await updateReadinessState(linkedChapterId, nextState, newPct);
          break;
        }
      }
    }

    // If linked to daily planner task, mark complete
    if (linkedTaskId) {
      await toggleTaskComplete(linkedTaskId);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0e101a] border border-slate-800 rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-violet-400 tracking-wider uppercase">
            PROTOCOL COMPLETION // AFTER-ACTION REVIEW
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Objective recap */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">EXECUTED OBJECTIVE</span>
          <div className="text-sm font-bold text-white tracking-wide">
            {sessionObjective}
          </div>
        </div>

        {/* Question: Did you complete the objective? */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-bold block">
            DID YOU COMPLETE THE TARGET DIRECTIVE?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setObjectiveCompleted('YES')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                objectiveCompleted === 'YES'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>YES (100%)</span>
            </button>

            <button
              onClick={() => setObjectiveCompleted('PARTIALLY')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                objectiveCompleted === 'PARTIALLY'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>PARTIAL</span>
            </button>

            <button
              onClick={() => setObjectiveCompleted('NO')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                objectiveCompleted === 'NO'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>NO</span>
            </button>
          </div>
        </div>

        {/* Academic Progress Sync if linked */}
        {linkedChapterId && (
          <div className="p-3 rounded bg-violet-950/40 border border-violet-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-violet-200">
              <span className="font-bold">CBSE CHAPTER PROGRESS ADVANCEMENT</span>
              <span className="text-white font-bold">+{academicProgressIncrement}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={academicProgressIncrement}
              onChange={(e) => setAcademicProgressIncrement(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-[10px] text-slate-400 block">
              Adjust syllabus mastery delta to automatically update chapter progress.
            </span>
          </div>
        )}

        {/* Interruption / friction notes */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 block">
            WHAT INTERRUPTED OR CHALLENGED THE SESSION? (OPTIONAL)
          </label>
          <input
            type="text"
            placeholder="e.g. Tough mathematical derivation, fatigue, phone buzz..."
            value={interruptionReason}
            onChange={(e) => setInterruptionReason(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Reflection Note */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 block">
            BRIEF EXECUTION NOTE / NEXT STEP (OPTIONAL)
          </label>
          <textarea
            rows={2}
            placeholder="Key concepts grasped or follow-up revision targets..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs hover:text-white"
          >
            DISMISS
          </button>
          <button
            onClick={handleFinish}
            className="px-6 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <span>SUBMIT & LOG METRICS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
