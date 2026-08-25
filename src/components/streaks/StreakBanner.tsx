import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Trophy,
  CheckCircle2,
  Calendar,
  Shuffle,
  Share2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Transaction } from '../../types';
import {
  streakService,
  DailyStreakInfo,
  FinancialPunchline,
} from '../../services/streakService';

interface StreakBannerProps {
  transactions: Transaction[];
  onOpenQuickAdd: () => void;
  onOpenStreakModal: () => void;
  onStreakUpdated?: () => void;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  transactions = [],
  onOpenQuickAdd,
  onOpenStreakModal,
  onStreakUpdated,
}) => {
  const [streakData, setStreakData] = useState<DailyStreakInfo>(() =>
    streakService.calculateStreak(transactions)
  );
  const [currentPunchline, setCurrentPunchline] = useState<FinancialPunchline>(
    streakData.punchline
  );
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  // Recalculate if transactions change
  React.useEffect(() => {
    const updated = streakService.calculateStreak(transactions);
    setStreakData(updated);
    setCurrentPunchline(updated.punchline);
  }, [transactions]);

  const handleShuffleQuote = () => {
    setIsRotating(true);
    const nextQuote = streakService.shufflePunchline();
    setTimeout(() => {
      setCurrentPunchline(nextQuote);
      setIsRotating(false);
    }, 150);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${currentPunchline.quote}" — ${currentPunchline.author} (via MoneyMate)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDailyCheckIn = () => {
    const result = streakService.recordDailyCheckIn();
    const updated = streakService.calculateStreak(transactions);
    setStreakData(updated);
    setJustCheckedIn(true);
    if (onStreakUpdated) onStreakUpdated();
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const isHot = streakData.currentStreak >= 3;
  const isLegendary = streakData.currentStreak >= 14;

  return (
    <div
      id="streak-motivation-banner"
      className="relative overflow-hidden rounded-xl border border-[#30363d] bg-gradient-to-r from-[#161b22] via-[#0d1117] to-[#161b22] p-4 sm:p-5 shadow-lg transition-all"
    >
      {/* Decorative subtle ambient fire background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-[#f0883e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-[#238636]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Streak Counter & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Animated Flame Icon Container */}
          <button
            onClick={onOpenStreakModal}
            title="View Streaks & Trophies"
            className={`relative group shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border transition-all transform hover:scale-105 cursor-pointer ${
              isLegendary
                ? 'bg-gradient-to-br from-[#a371f7]/20 to-[#f0883e]/30 border-[#f0883e] text-[#f0883e] shadow-[0_0_15px_rgba(240,136,62,0.3)]'
                : isHot
                ? 'bg-gradient-to-br from-[#f0883e]/20 to-[#d29922]/20 border-[#f0883e]/60 text-[#f0883e] shadow-[0_0_12px_rgba(240,136,62,0.2)]'
                : 'bg-[#21262d] border-[#30363d] text-[#58a6ff]'
            }`}
          >
            <Flame
              className={`w-6 h-6 sm:w-7 sm:h-7 animate-pulse ${
                isHot ? 'text-[#f0883e] stroke-[2.5]' : 'text-[#58a6ff]'
              }`}
            />
            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#238636] text-white border border-[#39d353]">
              {streakData.currentStreak}d
            </span>
          </button>

          {/* Text Summary */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
                <span>{streakData.currentStreak}-Day Financial Streak</span>
                {isLegendary ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/40 font-mono font-bold">
                    🔥 ON FIRE!
                  </span>
                ) : isHot ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/40 font-mono font-bold">
                    ⚡ Hot Habit
                  </span>
                ) : null}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#d29922]" />
                <span>Best: <strong className="text-[#f0f6fc] font-mono">{streakData.longestStreak} days</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>{streakData.totalDaysLogged} total logged days</span>
              </span>
              <span>•</span>
              <button
                onClick={onOpenStreakModal}
                className="text-[#58a6ff] hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <span>Trophies & Badges</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right: Funny & Motivating Line Quote Box */}
        <div className="flex-1 max-w-xl bg-[#0d1117]/90 border border-[#30363d] rounded-lg p-3 sm:px-4 sm:py-3 shadow-inner relative group">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{currentPunchline.emoji}</span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#f0883e]">
                {currentPunchline.category === 'funny'
                  ? 'Daily Money Punchline'
                  : currentPunchline.category === 'motivational'
                  ? 'Daily Motivation'
                  : 'Financial Wisdom'}
              </span>
            </div>

            {/* Quick Action Tools: Shuffle & Copy */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleShuffleQuote}
                title="Get another funny quote"
                className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Shuffle
                  className={`w-3.5 h-3.5 ${isRotating ? 'rotate-180 transition-transform duration-300' : ''}`}
                />
                <span className="hidden sm:inline text-[10px] font-mono">Shuffle</span>
              </button>

              <button
                onClick={handleCopyQuote}
                title="Copy quote"
                className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* The Punchline Text */}
          <div className="space-y-1">
            <p className="text-xs sm:text-[13px] font-semibold text-[#f0f6fc] leading-relaxed">
              &quot;{currentPunchline.quote}&quot;
            </p>
            <p className="text-[11px] text-[#8b949e] italic flex items-center justify-between">
              <span>{currentPunchline.subtext}</span>
              <span className="font-mono not-italic text-[#58a6ff] text-[10px] shrink-0 ml-2">
                — {currentPunchline.author}
              </span>
            </p>
          </div>
        </div>

        {/* Right CTA Button: Check In / Log */}
        <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
          {streakData.isLoggedToday ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#238636]/15 border border-[#238636]/30 text-xs font-semibold text-[#3fb950]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Logged Today</span>
            </div>
          ) : (
            <button
              onClick={handleDailyCheckIn}
              className="gh-btn gh-btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-md hover:shadow-green-500/20 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Check-in Today</span>
            </button>
          )}

          <button
            onClick={onOpenStreakModal}
            className="gh-btn text-xs py-1.5 px-2.5 text-[#8b949e] hover:text-[#f0f6fc]"
          >
            <Trophy className="w-3.5 h-3.5 text-[#d29922]" />
            <span>Milestones</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: 7-Day Mini Track & Milestone Progress */}
      <div className="mt-3.5 pt-3 border-t border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* 7-Day Day Dot Tracker */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-[#8b949e] font-semibold">
            Last 7 Days:
          </span>
          <div className="flex items-center gap-1.5">
            {streakData.weeklyActivity.map((day) => (
              <div
                key={day.date}
                title={`${day.dayName} (${day.date}): ${
                  day.isLogged ? `${day.txnCount} logged activities` : 'No logs recorded'
                }`}
                className={`flex flex-col items-center justify-center w-7 h-7 rounded-md border text-[10px] font-mono transition-all cursor-pointer ${
                  day.isLogged
                    ? 'bg-[#238636]/20 border-[#238636] text-[#3fb950] font-bold'
                    : day.isToday
                    ? 'bg-[#f0883e]/10 border-[#f0883e] text-[#f0883e] animate-pulse'
                    : 'bg-[#161b22] border-[#30363d] text-[#6e7681]'
                }`}
              >
                <span>{day.dayName.charAt(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#8b949e]">
            <span>Next Goal:</span>
            <span className="font-bold text-[#f0f6fc] flex items-center gap-1">
              <span>{streakData.nextMilestone.badge}</span>
              <span>{streakData.nextMilestone.title}</span>
            </span>
            <span className="font-mono text-[#d29922]">
              ({streakData.nextMilestone.daysRemaining} days left)
            </span>
          </div>

          <div className="w-24 h-2 bg-[#21262d] rounded-full overflow-hidden border border-[#30363d]">
            <div
              className="h-full bg-gradient-to-r from-[#238636] to-[#39d353] rounded-full transition-all duration-500"
              style={{ width: `${streakData.nextMilestone.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
