import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Coins,
  TrendingUp,
  Flame,
  CheckCircle2,
  ArrowRight,
  Target,
  X,
  Check,
  Car,
  Plane,
  Laptop,
  Smartphone,
  Home,
  Gem,
  GraduationCap,
  Gamepad2,
  Palmtree,
  CircleDollarSign,
  Music,
  Watch,
  Bike,
  ShieldCheck,
} from 'lucide-react';
import { SavingsGoal } from '../../types';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  onSaveGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onUpdateGoalDeposit: (goalId: string, amountChange: number) => void;
  onDeleteGoal: (id: string) => void;
}

const GULLAK_PRESETS = [
  { name: 'New Car', icon: '🚗', targetAmount: 800000, targetDate: '2027-06-30' },
  { name: 'Goa Trip', icon: '✈️', targetAmount: 30000, targetDate: '2026-11-20' },
  { name: 'New Laptop', icon: '💻', targetAmount: 80000, targetDate: '2026-10-31' },
  { name: 'New Phone', icon: '📱', targetAmount: 60000, targetDate: '2026-12-15' },
  { name: 'Emergency Fund', icon: '🏠', targetAmount: 100000, targetDate: '2026-12-31' },
];

const EMOJI_ICONS = ['🏺', '🚗', '✈️', '💻', '📱', '🏠', '💍', '🎓', '🎮', '🌴', '🪙', '🎸', '⌚', '🛵'];

// Helper to render stylish icons for goals
export function renderGoalIcon(icon: string, name: string = '') {
  const n = name.toLowerCase();
  const ic = icon || '';

  if (ic.includes('🚗') || n.includes('car') || n.includes('vehicle') || n.includes('auto')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/15 border border-[#1f6feb]/30 text-[#58a6ff] flex items-center justify-center shadow-sm">
        <Car className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('✈️') || n.includes('trip') || n.includes('travel') || n.includes('tour') || n.includes('goa') || n.includes('flight')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#3fb950]/15 border border-[#3fb950]/30 text-[#3fb950] flex items-center justify-center shadow-sm">
        <Plane className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('💻') || n.includes('laptop') || n.includes('macbook') || n.includes('computer') || n.includes('pc')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#a371f7]/15 border border-[#a371f7]/30 text-[#a371f7] flex items-center justify-center shadow-sm">
        <Laptop className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('📱') || n.includes('phone') || n.includes('iphone') || n.includes('mobile')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#f0883e]/15 border border-[#f0883e]/30 text-[#f0883e] flex items-center justify-center shadow-sm">
        <Smartphone className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('🏠') || n.includes('emergency') || n.includes('house') || n.includes('home') || n.includes('fund')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#d29922]/15 border border-[#d29922]/30 text-[#d29922] flex items-center justify-center shadow-sm">
        <Home className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('💍') || n.includes('ring') || n.includes('wedding') || n.includes('gold')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-sm">
        <Gem className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('🎓') || n.includes('study') || n.includes('college') || n.includes('education')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-sm">
        <GraduationCap className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('🎮') || n.includes('game') || n.includes('ps5') || n.includes('xbox')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-sm">
        <Gamepad2 className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('🌴') || n.includes('vacation') || n.includes('holiday')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
        <Palmtree className="w-5 h-5" />
      </div>
    );
  }
  if (ic.includes('🪙') || ic.includes('🏺') || n.includes('gullak') || n.includes('saving')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#3fb950]/15 border border-[#3fb950]/30 text-[#3fb950] flex items-center justify-center shadow-sm">
        <CircleDollarSign className="w-5 h-5" />
      </div>
    );
  }

  // Fallback to stylized container with custom icon / emoji
  return (
    <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-[#30363d] text-[#f0f6fc] flex items-center justify-center text-lg shadow-sm">
      {icon || <Target className="w-5 h-5 text-[#58a6ff]" />}
    </div>
  );
}

function calculateMonthlyNeeded(targetAmount: number, currentAmount: number, targetDateStr: string) {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (remaining === 0) return { monthsLeft: 0, monthlyAmount: 0, dateLabel: 'Goal Completed!' };

  const now = new Date();
  const target = new Date(targetDateStr);
  
  if (isNaN(target.getTime()) || target <= now) {
    return { monthsLeft: 1, monthlyAmount: remaining, dateLabel: 'This month' };
  }

  const monthsLeft = Math.max(
    1,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  );

  const monthlyAmount = Math.ceil(remaining / monthsLeft);
  const monthName = target.toLocaleString('default', { month: 'short', year: 'numeric' });

  return { monthsLeft, monthlyAmount, dateLabel: monthName };
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals = [],
  onSaveGoal,
  onUpdateGoalDeposit,
  onDeleteGoal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [activeCoinAnimGoalId, setActiveCoinAnimGoalId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏺');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('2026-12-31');

  const totalTarget = (goals || []).reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = (goals || []).reduce((sum, g) => sum + g.currentAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const handleOpenAdd = (preset?: typeof GULLAK_PRESETS[0]) => {
    setEditingGoal(null);
    if (preset) {
      setName(preset.name);
      setSelectedEmoji(preset.icon);
      setTargetAmount(preset.targetAmount);
      setCurrentAmount(0);
      setTargetDate(preset.targetDate);
    } else {
      setName('');
      setSelectedEmoji('🏺');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('2026-12-31');
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    const firstChar = Array.from(goal.name)[0];
    if (EMOJI_ICONS.includes(firstChar)) {
      setSelectedEmoji(firstChar);
    } else {
      setSelectedEmoji(goal.icon || '🏺');
    }
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setTargetDate(goal.targetDate || '2026-12-31');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;

    let finalName = name.trim();
    if (!finalName.startsWith(selectedEmoji) && !EMOJI_ICONS.some((em) => finalName.startsWith(em))) {
      finalName = `${selectedEmoji} ${finalName}`;
    }

    onSaveGoal({
      id: editingGoal?.id,
      name: finalName,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: targetDate || '2026-12-31',
      icon: selectedEmoji,
    });

    setModalOpen(false);
  };

  const handleQuickDeposit = (goal: SavingsGoal, amount: number) => {
    onUpdateGoalDeposit(goal.id, amount);
    setActiveCoinAnimGoalId(goal.id);
    setTimeout(() => setActiveCoinAnimGoalId(null), 1000);

    try {
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.65 },
        colors: ['#238636', '#3fb950', '#58a6ff'],
      });
    } catch {
      // ignore
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount || Number(depositAmount) <= 0) return;

    onUpdateGoalDeposit(depositModalGoal.id, Number(depositAmount));
    setActiveCoinAnimGoalId(depositModalGoal.id);
    setTimeout(() => setActiveCoinAnimGoalId(null), 1000);

    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#238636', '#3fb950', '#58a6ff'],
      });
    } catch {
      // ignore
    }

    setDepositModalGoal(null);
    setDepositAmount('');
  };

  return (
    <div id="gullak-view-container" className="space-y-6 pb-16">
      {/* Header & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#58a6ff]" />
            <span>Digital Gullak • Goal-Based Savings</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Set targets, automate micro-deposits, and track milestones toward your dream purchases.
          </p>
        </div>

        <button
          id="gullak-create-goal-btn"
          onClick={() => handleOpenAdd()}
          className="gh-btn gh-btn-primary text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase text-[#8b949e]">
            Total Saved
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#3fb950]">
            ₹{totalSaved.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8b949e]">Across {goals.length} active goals</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase text-[#8b949e]">
            Total Target
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#f0f6fc]">
            ₹{totalTarget.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8b949e] font-mono">₹{totalRemaining.toLocaleString('en-IN')} remaining</p>
        </div>

        <div className="flex flex-col justify-center space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8b949e]">Overall Progress</span>
            <span className="font-mono font-bold text-[#3fb950]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden border border-[#30363d]">
            <div
              className="h-full bg-[#238636] rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preset Quick Start Row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        <span className="text-xs text-[#8b949e] font-mono shrink-0">Presets:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {GULLAK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleOpenAdd(preset)}
              className="px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] hover:text-[#f0f6fc] text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isCompleted = g.currentAmount >= g.targetAmount;
          const { monthlyAmount, dateLabel } = calculateMonthlyNeeded(g.targetAmount, g.currentAmount, g.targetDate);

          return (
            <div
              key={g.id}
              className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-3 relative hover:border-[#58a6ff]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {renderGoalIcon(g.icon, g.name)}
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f6fc]">{g.name}</h3>
                    <p className="text-[10px] text-[#8b949e] font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#58a6ff]" />
                      <span>Target: {dateLabel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete goal ${g.name}?`)) onDeleteGoal(g.id);
                    }}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xl font-bold font-mono text-[#f0f6fc]">
                  ₹{g.currentAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#8b949e]">
                    / ₹{g.targetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-[#8b949e] font-mono mt-0.5">
                  {isCompleted ? (
                    <span className="text-[#3fb950] font-semibold">🎉 Milestone achieved!</span>
                  ) : (
                    <span>Save ~₹{monthlyAmount.toLocaleString('en-IN')}/mo to meet target</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden border border-[#30363d]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-[#3fb950]' : 'bg-[#1f6feb]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isCompleted ? 'text-[#3fb950] font-bold' : 'text-[#58a6ff]'}>
                    {progress}% achieved
                  </span>
                  <span className="text-[#8b949e]">
                    ₹{(g.targetAmount - g.currentAmount > 0 ? g.targetAmount - g.currentAmount : 0).toLocaleString('en-IN')} left
                  </span>
                </div>
              </div>

              {/* Deposit Action buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => handleQuickDeposit(g, 1000)}
                  className="gh-btn text-[11px] px-2 py-1 flex-1 font-mono"
                >
                  +₹1,000
                </button>
                <button
                  onClick={() => handleQuickDeposit(g, 5000)}
                  className="gh-btn text-[11px] px-2 py-1 flex-1 font-mono"
                >
                  +₹5,000
                </button>
                <button
                  onClick={() => {
                    setDepositModalGoal(g);
                    setDepositAmount('');
                  }}
                  className="gh-btn gh-btn-primary text-[11px] px-2.5 py-1 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>Deposit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full sm:max-w-md max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl text-[#c9d1d9] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22] rounded-t-2xl sm:rounded-t-xl shrink-0">
              <h2 className="text-sm font-bold text-[#f0f6fc]">
                {editingGoal ? 'Edit Savings Goal' : 'Create Gullak Goal'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    Goal Name & Icon
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedEmoji}
                      onChange={(e) => setSelectedEmoji(e.target.value)}
                      className="bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-base text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                    >
                      {EMOJI_ICONS.map((em) => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Goa Trip, New MacBook"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="80000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                      Already Saved (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#30363d] bg-[#161b22] rounded-b-2xl sm:rounded-b-xl shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="gh-btn text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{editingGoal ? 'Update Goal' : 'Save Goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositModalGoal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDepositModalGoal(null);
          }}
        >
          <div className="w-full sm:max-w-sm max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl text-[#c9d1d9] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22] rounded-t-2xl sm:rounded-t-xl shrink-0">
              <h2 className="text-sm font-bold text-[#f0f6fc] truncate">
                Deposit to {depositModalGoal.name}
              </h2>
              <button
                onClick={() => setDepositModalGoal(null)}
                className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    autoFocus
                    required
                    placeholder="5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-lg font-mono text-[#3fb950] text-center font-bold focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className="gh-btn text-xs py-1.5 font-mono text-center"
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#30363d] bg-[#161b22] rounded-b-2xl sm:rounded-b-xl shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="gh-btn text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                  className="gh-btn gh-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirm Deposit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
