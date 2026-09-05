import React, { useState } from 'react';
import {
  Flame,
  X,
  Sparkles,
  Quote,
  Shuffle,
  ShieldCheck,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Transaction } from '../../types';
import {
  streakService,
  WarrenBuffettQuote,
} from '../../services/streakService';
import { apiService } from '../../services/api';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
  onCheckInSuccess?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  transactions = [],
  onOpenQuickAdd,
  onCheckInSuccess,
}) => {
  const [quote, setQuote] = useState<WarrenBuffettQuote>(() => streakService.getRandomQuote());
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const streakData = streakService.calculateStreak(transactions);

  const handleShuffleQuote = async () => {
    try {
      const nextQ = await apiService.shuffleQuote();
      setQuote(nextQ);
    } catch {
      const nextQ = streakService.shuffleQuote();
      setQuote(nextQ);
    }
  };

  const handleNoTransactionToday = async () => {
    try {
      const res = await apiService.recordDailyCheckIn();
      streakService.triggerConfetti();
      setStatusMessage(res.message);
      if (onCheckInSuccess) onCheckInSuccess();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      const res = streakService.recordNoTransactionCheckIn();
      setStatusMessage(res.message);
      if (onCheckInSuccess) onCheckInSuccess();
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleRecoverStreak = async () => {
    try {
      const res = await apiService.recoverStreak();
      streakService.triggerConfetti();
      setStatusMessage(res.message);
      if (onCheckInSuccess) onCheckInSuccess();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      const res = streakService.recoverStreak();
      setStatusMessage(res.message);
      if (onCheckInSuccess) onCheckInSuccess();
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  return (
    <div
      id="streak-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="streak-modal-dialog"
        className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#c9d1d9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f0883e]/20 border border-[#f0883e]/40 flex items-center justify-center text-[#f0883e]">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">Financial Tracking Streak</h2>
              <p className="text-[11px] text-[#8b949e]">Daily mindfulness & wealth discipline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {statusMessage && (
            <div className="p-3 rounded-lg bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Clean Streak Count Display */}
          <div className="py-2 space-y-2">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#f0883e]/10 border border-[#f0883e]/30 shadow-inner">
              <Flame className="w-10 h-10 text-[#f0883e] mr-2" />
              <span className="text-4xl font-black font-mono text-[#f0883e] tracking-tight">
                {streakData.currentStreak}
              </span>
              <span className="text-lg font-bold text-[#f0f6fc] ml-2">
                {streakData.currentStreak === 1 ? 'Day' : 'Days'} Streak
              </span>
            </div>

            <p className="text-xs text-[#8b949e]">
              {streakData.isLoggedToday
                ? '🔥 You have tracked your finances for today! Streak is secured.'
                : 'Streak grows when you add a transaction or confirm zero spend today.'}
            </p>
          </div>

          {/* 24-Hour Grace Period Notice if streak was missed yesterday */}
          {streakData.isGracePeriodActive && (
            <div className="p-3.5 rounded-xl bg-[#d29922]/15 border border-[#d29922]/40 text-left space-y-2">
              <div className="flex items-center gap-2 text-[#d29922] font-bold text-xs">
                <Clock className="w-4 h-4 shrink-0" />
                <span>24-Hour Grace Period Active!</span>
              </div>
              <p className="text-[11px] text-[#c9d1d9]">
                You missed yesterday's log, but you have{' '}
                <strong className="text-[#f0f6fc]">{streakData.graceHoursRemaining}h remaining</strong> to
                review and restore your streak!
              </p>
              <button
                onClick={handleRecoverStreak}
                className="w-full py-2 px-3 rounded-lg bg-[#d29922] hover:bg-[#bb8019] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Restore Streak (24h Grace)</span>
              </button>
            </div>
          )}

          {/* Action Buttons for maintaining streak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenQuickAdd();
              }}
              className="gh-btn gh-btn-primary py-2.5 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>

            <button
              onClick={handleNoTransactionToday}
              disabled={streakData.isLoggedToday}
              className={`gh-btn py-2.5 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer ${
                streakData.isLoggedToday
                  ? 'opacity-60 cursor-not-allowed border-[#30363d]'
                  : 'hover:border-[#3fb950] hover:text-[#3fb950]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
              <span>{streakData.isLoggedToday ? 'Secured for Today ✓' : 'No Spend Today'}</span>
            </button>
          </div>

          {/* Warren Buffett Quote Box */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] text-left space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d29922] flex items-center gap-1.5">
                <Quote className="w-3 h-3 text-[#d29922]" />
                <span>Warren Buffett on Financial Discipline</span>
              </span>
              <button
                onClick={handleShuffleQuote}
                className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] transition-colors cursor-pointer"
                title="Next Quote"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            <blockquote className="text-xs font-serif italic text-[#f0f6fc] leading-relaxed">
              "{quote.quote}"
            </blockquote>

            <div className="flex items-center justify-between pt-1 text-[11px] text-[#8b949e]">
              <span className="font-semibold text-[#8b949e]">— {quote.author}</span>
              <span className="text-[10px] text-[#58a6ff]">{quote.context}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="gh-btn text-xs py-1.5 px-4 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
