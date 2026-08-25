import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Calendar,
  Layers,
} from 'lucide-react';
import { Transaction, Category, Account } from '../../types';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions = [],
  categories = [],
  accounts = [],
}) => {
  const [timeRange, setTimeRange] = useState<'MONTH' | 'ALL'>('MONTH');

  // Filter expenses
  const expenses = (transactions || []).filter((t) => t.transactionType === 'EXPENSE');
  const incomes = (transactions || []).filter((t) => t.transactionType === 'INCOME');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Category Breakdown
  const categorySpending: Record<string, number> = {};
  expenses.forEach((t) => {
    categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categorySpending)
    .map(([catId, amount]) => {
      const cat = (categories || []).find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        color: cat?.color || '#8B5CF6',
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Daily Spending distribution (last 7 recorded days)
  const dailySpending: Record<string, number> = {};
  expenses.forEach((t) => {
    dailySpending[t.transactionDate] = (dailySpending[t.transactionDate] || 0) + t.amount;
  });

  const sortedDaily = Object.entries(dailySpending)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7);

  const maxDaily = Math.max(...sortedDaily.map(([, amt]) => amt), 1000);

  return (
    <div id="analytics-view-container" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Financial Analytics & Cash Flow
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Deep dive into spending velocity, category distributions, and income vs expense ratios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange('MONTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timeRange === 'MONTH'
                ? 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timeRange === 'ALL'
                ? 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl nexora-card nexora-card-hover space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inflow</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Salary, transfers & rewards</p>
        </div>

        <div className="p-5 rounded-2xl nexora-card nexora-card-hover space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outflow</span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            -₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Across {expenses.length} transactions</p>
        </div>

        <div className="p-5 rounded-2xl nexora-card nexora-card-hover space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
          <div
            className={`text-2xl font-black font-mono ${
              netSavings >= 0 ? 'text-indigo-300' : 'text-rose-400'
            }`}
          >
            {netSavings >= 0 ? '+' : ''}₹{netSavings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">
            Retained liquidity
          </p>
        </div>
      </div>

      {/* Grid: Category Breakdown + Spending Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl nexora-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Category Spending Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ₹{totalExpense.toLocaleString('en-IN')} total
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedCategories.map((c) => (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-medium text-slate-200">{c.name}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-white text-[11px] min-w-[32px] text-right">
                      {c.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#080a10] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Trend Chart */}
        <div className="p-6 rounded-2xl nexora-card space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Daily Spending Velocity</span>
              </h3>
              <span className="text-xs text-slate-400">Last 7 Active Days</span>
            </div>

            {/* Custom Bar Graph */}
            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-white/[0.08]">
              {sortedDaily.map(([date, amt]) => {
                const heightPercent = Math.max(8, Math.round((amt / maxDaily) * 100));
                const formattedDay = new Date(date).toLocaleDateString('default', {
                  weekday: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-[#0f1422] text-white text-[10px] rounded-lg border border-white/[0.12] whitespace-nowrap z-20 pointer-events-none font-mono shadow-lg">
                      ₹{amt.toLocaleString('en-IN')}
                    </div>

                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg group-hover:from-emerald-400 group-hover:to-teal-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400 truncate w-full text-center font-mono">
                      {formattedDay}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Average Daily: <strong className="text-white font-mono">₹{Math.round(totalExpense / 30).toLocaleString('en-IN')}</strong>/day</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tracked Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
