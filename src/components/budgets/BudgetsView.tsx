import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  ShieldAlert,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { Budget, Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  onSaveBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'spent'> & { id?: string }) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets = [],
  categories = [],
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [categoryId, setCategoryId] = useState((categories && categories[0]?.id) || '');
  const [amount, setAmount] = useState<number | ''>('');

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  const totalBudgeted = (budgets || []).reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = (budgets || []).reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategoryId((categories && categories[0]?.id) || '');
    setAmount('');
    setModalOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setCategoryId(budget.categoryId);
    setAmount(budget.amount);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || Number(amount) <= 0) return;

    onSaveBudget({
      id: editingBudget?.id,
      categoryId,
      amount: Number(amount),
      month: now.getMonth() + 1,
      year: currentYear,
    });

    setModalOpen(false);
  };

  const getCategory = (catId: string) =>
    (categories || []).find((c) => c.id === catId);

  return (
    <div id="budgets-view-container" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#58a6ff]" />
            <span>Category Budgets</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Spending limits for {currentMonth} {currentYear} • Automatic alerts at 80% & 100% capacity.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="gh-btn gh-btn-primary text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Overview Stat Box */}
      <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono text-[#8b949e] uppercase">Total Monthly Cap</span>
            <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
              ₹{totalSpent.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-normal text-[#8b949e]">
                / ₹{totalBudgeted.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                overallPercentage >= 100
                  ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30'
                  : overallPercentage >= 80
                  ? 'bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/30'
                  : 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
              }`}
            >
              {overallPercentage}% Utilized
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden border border-[#30363d]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage >= 100
                ? 'bg-[#f85149]'
                : overallPercentage >= 80
                ? 'bg-[#d29922]'
                : 'bg-[#3fb950]'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const cat = getCategory(b.categoryId);
          const percent = Math.round((b.spent / b.amount) * 100);
          const isExceeded = b.spent >= b.amount;
          const isWarning = !isExceeded && percent >= 80;

          return (
            <div
              key={b.id}
              className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-3 relative hover:border-[#58a6ff]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] text-[#58a6ff]">
                    <CategoryIcon icon={cat?.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f6fc]">
                      {cat?.name || 'Category'}
                    </h3>
                    <span className="text-[10px] text-[#8b949e] font-mono">
                      {isExceeded ? '⚠️ Exceeded' : isWarning ? '⚡ Near 80%' : '✓ Safe'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete budget for ${cat?.name}?`)) onDeleteBudget(b.id);
                    }}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xl font-bold font-mono text-[#f0f6fc]">
                  ₹{b.spent.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#8b949e]">
                    / ₹{b.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[11px] text-[#8b949e] font-mono mt-0.5 block">
                  {b.amount > b.spent
                    ? `₹${(b.amount - b.spent).toLocaleString('en-IN')} left`
                    : `₹${(b.spent - b.amount).toLocaleString('en-IN')} over cap`}
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden border border-[#30363d]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isExceeded ? 'bg-[#f85149]' : isWarning ? 'bg-[#d29922]' : 'bg-[#3fb950]'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span
                    className={
                      isExceeded ? 'text-[#f85149] font-bold' : isWarning ? 'text-[#d29922] font-bold' : 'text-[#3fb950]'
                    }
                  >
                    {percent}% spent
                  </span>
                  <span className="text-[#8b949e]">Cap: ₹{b.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Set/Edit Budget */}
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
                {editingBudget ? 'Edit Category Budget' : 'Set Category Budget'}
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
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    Monthly Cap Limit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                  <span>{editingBudget ? 'Update Budget' : 'Save Budget'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
