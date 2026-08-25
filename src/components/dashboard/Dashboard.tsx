import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  QrCode,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Sparkles,
  AlertTriangle,
  CreditCard,
  Building2,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Repeat,
  Target,
  PieChart,
  BarChart3,
  HandCoins,
} from 'lucide-react';
import {
  User,
  Account,
  Transaction,
  Budget,
  Category,
  FinancialHealthScore,
  SavingsGoal,
  DebtRecord,
} from '../../types';
import { GitHubContributionGraph } from '../common/GitHubContributionGraph';
import { formatDDMMYYYY } from '../../utils/dateUtils';
import { UpiOneTapBanner } from './UpiOneTapBanner';
import { FinancialHealthModal } from './FinancialHealthModal';

interface DashboardProps {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  savingsGoals?: SavingsGoal[];
  debts?: DebtRecord[];
  healthScore: FinancialHealthScore;
  onOpenQuickAdd: (defaultDate?: string) => void;
  onEditTransaction?: (txn: Transaction) => void;
  onOpenUpiImport: () => void;
  onOpenStreakModal?: () => void;
  onNavigateTab: (tab: string) => void;
  onStreakUpdated?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  accounts = [],
  transactions = [],
  budgets = [],
  categories = [],
  savingsGoals = [],
  debts = [],
  healthScore,
  onOpenQuickAdd,
  onEditTransaction,
  onOpenUpiImport,
  onOpenStreakModal,
  onNavigateTab,
  onStreakUpdated,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '6M'>('30D');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  // 1. Total Balance calculation
  const totalLiquidBalance = (accounts || [])
    .filter((a) => a.accountType !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + a.balance, 0);

  // 2. Monthly Income, Expenses, Savings
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxns = (transactions || []).filter((t) => {
    const d = new Date(t.transactionDate);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const activeTxns = currentMonthTxns.length > 0 ? currentMonthTxns : transactions || [];

  const monthlyIncome = activeTxns
    .filter((t) => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = activeTxns
    .filter((t) => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

  // 3. Khata (Lent & Borrowed) calculations
  const activeDebts = (debts || []).filter((d) => d.status !== 'SETTLED');
  const totalLentPending = activeDebts
    .filter((d) => d.type === 'LENT')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalBorrowedPending = activeDebts
    .filter((d) => d.type === 'BORROWED')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const netKhataPosition = totalLentPending - totalBorrowedPending;

  // Category Spending Distribution
  const categorySpendingMap: Record<string, number> = {};
  activeTxns
    .filter((t) => t.transactionType === 'EXPENSE')
    .forEach((t) => {
      categorySpendingMap[t.categoryId] = (categorySpendingMap[t.categoryId] || 0) + t.amount;
    });

  const CATEGORY_PALETTE = ['#3fb950', '#58a6ff', '#d29922', '#a371f7', '#f0883e', '#f85149', '#06b6d4'];

  const categoryBreakdown = Object.entries(categorySpendingMap)
    .map(([catId, amount], idx) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        icon: cat?.icon || '🏷️',
        color: cat?.color || CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
        amount,
        percent: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const recentTransactions = (transactions || []).slice(0, 6);

  // Timeframe chart calculation
  const getChartData = () => {
    if (chartTimeframe === '7D') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayTxns = transactions.filter((t) => t.transactionDate === dateStr);
        const income = dayTxns
          .filter((t) => t.transactionType === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTxns
          .filter((t) => t.transactionType === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);

        days.push({
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dateFormatted: formatDDMMYYYY(dateStr),
          fullDate: dateStr,
          income,
          expense,
          net: income - expense,
        });
      }
      return days;
    } else if (chartTimeframe === '30D') {
      // 4 week intervals
      const weeks = [];
      for (let w = 3; w >= 0; w--) {
        const endDay = new Date();
        endDay.setDate(endDay.getDate() - w * 7);
        const startDay = new Date(endDay);
        startDay.setDate(startDay.getDate() - 6);

        const startStr = startDay.toISOString().split('T')[0];
        const endStr = endDay.toISOString().split('T')[0];

        const periodTxns = transactions.filter((t) => {
          return t.transactionDate >= startStr && t.transactionDate <= endStr;
        });

        const income = periodTxns
          .filter((t) => t.transactionType === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = periodTxns
          .filter((t) => t.transactionType === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);

        weeks.push({
          label: `W${4 - w}`,
          dateFormatted: `${formatDDMMYYYY(startStr).slice(0, 5)} - ${formatDDMMYYYY(endStr).slice(0, 5)}`,
          fullDate: `${startStr} to ${endStr}`,
          income,
          expense,
          net: income - expense,
        });
      }
      return weeks;
    } else {
      // 6 Months
      const months = [];
      for (let m = 5; m >= 0; m--) {
        const d = new Date();
        d.setMonth(d.getMonth() - m);
        const y = d.getFullYear();
        const mon = d.getMonth();

        const monthTxns = transactions.filter((t) => {
          const td = new Date(t.transactionDate);
          return td.getFullYear() === y && td.getMonth() === mon;
        });

        const income = monthTxns
          .filter((t) => t.transactionType === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTxns
          .filter((t) => t.transactionType === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);

        months.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          dateFormatted: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          fullDate: `${y}-${String(mon + 1).padStart(2, '0')}`,
          income,
          expense,
          net: income - expense,
        });
      }
      return months;
    }
  };

  const chartData = getChartData();
  const maxChartValue = Math.max(
    ...chartData.flatMap((d) => [d.income, d.expense]),
    1000
  );

  return (
    <div id="dashboard-container" className="space-y-6 pb-12">
      {/* Top Banner / Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Balance */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">Total Liquid Balance</span>
            <Wallet className="w-4 h-4 text-[#58a6ff]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
            ₹{totalLiquidBalance > 0 ? totalLiquidBalance.toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-[11px] text-[#8b949e] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            <span>Across {accounts.length} liquid accounts</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">Monthly Inflow</span>
            <TrendingUp className="w-4 h-4 text-[#3fb950]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#3fb950]">
            ₹{monthlyIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {activeTxns.filter((t) => t.transactionType === 'INCOME').length} credits this month
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">Monthly Outflow</span>
            <TrendingDown className="w-4 h-4 text-[#f85149]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f85149]">
            ₹{monthlyExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {activeTxns.filter((t) => t.transactionType === 'EXPENSE').length} debits this month
          </div>
        </div>

        {/* Net Savings & Health (Clickable for calculation breakdown) */}
        <div
          id="dashboard-financial-health-card"
          onClick={() => setIsHealthModalOpen(true)}
          className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-md space-y-2 cursor-pointer hover:border-[#a371f7]/60 hover:bg-[#161b22]/70 transition-all group relative"
          title="Click to view algorithmic score breakdown & calculation basis"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] group-hover:text-[#f0f6fc] transition-colors flex items-center gap-1.5">
              Financial Health
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#a371f7]/15 text-[#a371f7] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Audit
              </span>
            </span>
            <ShieldCheck className="w-4 h-4 text-[#a371f7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-[#f0f6fc]">
              {healthScore?.score ?? 84}/100
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30">
              {healthScore?.rating ?? 'Good'}
            </span>
          </div>
          <div className="text-[11px] text-[#8b949e] flex items-center justify-between">
            <span>₹{monthlySavings.toLocaleString('en-IN')} net saved</span>
            <span className="text-[10px] text-[#a371f7] font-medium group-hover:underline flex items-center gap-0.5">
              Why this score? &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* ⚡ ONE-TAP UPI PAYMENT TRACKING BANNER */}
      <UpiOneTapBanner onOpenUpiImport={onOpenUpiImport} />

      {/* Cash Flow & Trends Chart */}
      <div id="dashboard-cashflow-chart-card" className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117] p-5 space-y-4">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#21262d] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3fb950]" />
              <h2 className="text-sm font-bold text-[#f0f6fc]">Cash Flow & Trends</h2>
            </div>
            <p className="text-[11px] text-[#8b949e]">
              Income vs Expenses for {chartTimeframe === '7D' ? 'last 7 days' : chartTimeframe === '30D' ? 'last 4 weeks' : 'last 6 months'}
            </p>
          </div>

          {/* Timeframe Switcher & Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#238636]" />
                <span className="text-[#8b949e]">Inflow (+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#f85149]" />
                <span className="text-[#8b949e]">Outflow (-)</span>
              </div>
            </div>

            <div className="flex items-center rounded-md bg-[#161b22] border border-[#30363d] p-0.5">
              {(['7D', '30D', '6M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors cursor-pointer ${
                    chartTimeframe === tf
                      ? 'bg-[#1f6feb] text-white shadow-sm'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart Grid */}
        <div className="h-44 sm:h-52 w-full pt-4 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {chartData.map((col, idx) => {
            const incomeHeight = maxChartValue > 0 ? (col.income / maxChartValue) * 100 : 0;
            const expenseHeight = maxChartValue > 0 ? (col.expense / maxChartValue) * 100 : 0;
            const hasActivity = col.income > 0 || col.expense > 0;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Floating Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md px-2.5 py-1.5 text-[10px] font-mono shadow-xl whitespace-nowrap">
                  <div className="font-bold text-[#58a6ff] border-b border-[#21262d] pb-0.5 mb-1">
                    {col.dateFormatted}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[#3fb950]">
                    <span>In:</span>
                    <span>+₹{col.income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[#f85149]">
                    <span>Out:</span>
                    <span>-₹{col.expense.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-0.5 border-t border-[#21262d] text-[#8b949e]">
                    <span>Net:</span>
                    <span className={col.net >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}>
                      {col.net >= 0 ? '+' : ''}₹{col.net.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Bars Container */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32 sm:h-36">
                  {/* Inflow Bar */}
                  <div
                    className="w-2.5 sm:w-5 bg-[#238636] hover:bg-[#2ea043] rounded-t-sm transition-all duration-300 relative group/bar"
                    style={{ height: `${Math.max(incomeHeight, col.income > 0 ? 6 : 2)}%` }}
                    title={`Inflow: ₹${col.income}`}
                  />

                  {/* Outflow Bar */}
                  <div
                    className="w-2.5 sm:w-5 bg-[#da3633] hover:bg-[#f85149] rounded-t-sm transition-all duration-300 relative group/bar"
                    style={{ height: `${Math.max(expenseHeight, col.expense > 0 ? 6 : 2)}%` }}
                    title={`Outflow: ₹${col.expense}`}
                  />
                </div>

                {/* X-Axis Label */}
                <span className="text-[10px] font-mono text-[#8b949e] group-hover:text-[#f0f6fc] mt-2 truncate max-w-full text-center">
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 52-Week GitHub Style Activity Heatmap */}
      <GitHubContributionGraph
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        onAddTransactionForDate={onOpenQuickAdd}
        onEditTransaction={onEditTransaction}
      />

      {/* Two Column Section: Recent Activity & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
          <div className="gh-box-header flex items-center justify-between bg-[#161b22] px-4 py-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f0f6fc]">Recent Transactions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                {transactions.length} total
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all transactions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#21262d]">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8b949e]">
                No transactions recorded yet. Click &quot;Add Transaction&quot; or import via UPI.
              </div>
            ) : (
              recentTransactions.map((txn) => {
                const isExpense = txn.transactionType === 'EXPENSE';
                const isIncome = txn.transactionType === 'INCOME';
                const cat = categories.find((c) => c.id === txn.categoryId);
                const acc = accounts.find((a) => a.id === txn.accountId);

                return (
                  <div
                    key={txn.id}
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-[#161b22] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isIncome
                            ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                            : isExpense
                            ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30'
                            : 'bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : '⇄'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#f0f6fc] truncate">{txn.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                          <span>{cat?.name || 'General'}</span>
                          <span>•</span>
                          <span>{acc?.name || 'Bank Account'}</span>
                          <span>•</span>
                          <span className="font-mono">{formatDDMMYYYY(txn.transactionDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-bold ${
                          isIncome
                            ? 'text-[#3fb950]'
                            : isExpense
                            ? 'text-[#f85149]'
                            : 'text-[#58a6ff]'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}₹{txn.amount.toLocaleString('en-IN')}
                      </div>
                      {txn.paymentMethod && (
                        <span className="text-[10px] font-mono text-[#8b949e] uppercase">
                          {txn.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Category Breakdown & Quick Jump */}
        <div className="space-y-4">
          {/* Category Breakdown Card - Graph View */}
          <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            <div className="gh-box-header bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="text-xs font-bold text-[#f0f6fc]">Spending by Category</span>
              </div>
              <span className="text-[10px] font-mono text-[#8b949e]">
                {categoryBreakdown.length} active
              </span>
            </div>

            <div className="p-4 space-y-4">
              {categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#30363d] mx-auto flex items-center justify-center text-[#8b949e]">
                    <PieChart className="w-6 h-6 stroke-1" />
                  </div>
                  <p className="text-xs text-[#8b949e]">No expense data recorded for this month</p>
                </div>
              ) : (
                <>
                  {/* Interactive SVG Donut Graph */}
                  <div className="flex flex-col items-center justify-center pt-1 pb-2">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background Ring Track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#161b22"
                          strokeWidth="10"
                        />
                        {/* Donut Slices */}
                        {(() => {
                          const totalBreakdownExpense = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0);
                          const radius = 38;
                          const circumference = 2 * Math.PI * radius;
                          let runningOffset = 0;

                          return categoryBreakdown.map((cat) => {
                            const ratio = totalBreakdownExpense > 0 ? cat.amount / totalBreakdownExpense : 0;
                            const dashLength = ratio * circumference;
                            const currentDashOffset = -runningOffset;
                            runningOffset += dashLength;
                            const isHovered = hoveredCategory === cat.id;

                            return (
                              <circle
                                key={cat.id}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="transparent"
                                stroke={cat.color}
                                strokeWidth={isHovered ? 13 : 10}
                                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                strokeDashoffset={currentDashOffset}
                                className="transition-all duration-200 cursor-pointer"
                                style={{
                                  opacity: hoveredCategory && !isHovered ? 0.35 : 1,
                                  filter: isHovered ? `drop-shadow(0 0 6px ${cat.color}80)` : 'none',
                                }}
                                onMouseEnter={() => setHoveredCategory(cat.id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* Center Info Readout */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none select-none">
                        {hoveredCategory ? (
                          (() => {
                            const activeCat = categoryBreakdown.find((c) => c.id === hoveredCategory);
                            return activeCat ? (
                              <div className="animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                                <span className="text-base">{activeCat.icon}</span>
                                <div className="text-[11px] font-bold text-[#f0f6fc] font-mono leading-none">
                                  ₹{activeCat.amount.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[9px] font-mono text-[#8b949e] leading-none">
                                  {activeCat.percent}%
                                </div>
                              </div>
                            ) : null;
                          })()
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-mono tracking-wider text-[#8b949e]">
                              Total Out
                            </span>
                            <div className="text-xs font-bold font-mono text-[#f0f6fc] leading-none">
                              ₹{monthlyExpenses.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[9px] font-mono text-[#3fb950] leading-none">
                              100%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown Bars & Legend */}
                  <div className="space-y-2.5 pt-1 border-t border-[#21262d]">
                    {categoryBreakdown.map((cat) => {
                      const isHovered = hoveredCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setHoveredCategory(cat.id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            isHovered ? 'bg-[#161b22]' : 'hover:bg-[#161b22]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-xs">{cat.icon}</span>
                              <span
                                className={`truncate text-xs ${
                                  isHovered ? 'font-bold text-[#f0f6fc]' : 'text-[#c9d1d9]'
                                }`}
                              >
                                {cat.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                              <span className="font-semibold text-[#f0f6fc]">
                                ₹{cat.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-[#8b949e]">
                                ({cat.percent}%)
                              </span>
                            </div>
                          </div>

                          {/* Progress Line */}
                          <div className="w-full h-1 bg-[#21262d] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, cat.percent)}%`,
                                backgroundColor: cat.color,
                                opacity: hoveredCategory && !isHovered ? 0.35 : 1,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="gh-box border border-[#30363d] rounded-md p-4 bg-[#0d1117] space-y-3">
            <span className="text-xs font-bold text-[#f0f6fc] block">Quick Navigation</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('goals')}
                className="gh-btn justify-start text-[11px]"
              >
                <Target className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Digital Gullak</span>
              </button>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="gh-btn justify-start text-[11px]"
              >
                <Layers className="w-3.5 h-3.5 text-[#d29922]" />
                <span>Budgets</span>
              </button>
              <button
                onClick={() => onNavigateTab('accounts')}
                className="gh-btn justify-start text-[11px]"
              >
                <Building2 className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>Bank Vaults</span>
              </button>
              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="gh-btn justify-start text-[11px]"
              >
                <Repeat className="w-3.5 h-3.5 text-[#a371f7]" />
                <span>Subscriptions</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Calculation & Audit Breakdown Modal */}
      <FinancialHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthScore={healthScore}
        accounts={accounts}
        budgets={budgets}
        transactions={transactions}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
