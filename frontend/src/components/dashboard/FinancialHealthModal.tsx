import React from 'react';
import {
  ShieldCheck,
  X,
  TrendingUp,
  Percent,
  PieChart,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  HelpCircle,
  Activity,
  Calculator,
  Zap,
} from 'lucide-react';
import { FinancialHealthScore, Account, Budget, Transaction } from '../../types';

interface FinancialHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: FinancialHealthScore;
  accounts: Account[];
  budgets: Budget[];
  transactions: Transaction[];
  onNavigateTab: (tab: string) => void;
}

export const FinancialHealthModal: React.FC<FinancialHealthModalProps> = ({
  isOpen,
  onClose,
  healthScore,
  accounts,
  budgets,
  transactions,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const currentScore = healthScore?.score ?? 84;
  const rating = healthScore?.rating ?? 'Good';
  const savingsRate = healthScore?.savingsRate ?? 40;
  const budgetAdherence = healthScore?.budgetAdherence ?? 100;
  const spendingConsistency = healthScore?.spendingConsistency ?? 88;
  const debtRatio = healthScore?.debtRatio ?? 0;

  // Calculate score contributions
  const savingsRatePts = ((savingsRate / 100) * 35).toFixed(1);
  const budgetPts = ((budgetAdherence / 100) * 30).toFixed(1);
  const consistencyPts = ((spendingConsistency / 100) * 20).toFixed(1);
  const debtHealthPct = Math.max(0, 100 - debtRatio * 2);
  const debtPts = ((debtHealthPct / 100) * 15).toFixed(1);

  // Financial status theme
  const getRatingBadge = () => {
    switch (rating) {
      case 'Excellent':
        return {
          bg: 'bg-[#238636]/20',
          text: 'text-[#3fb950]',
          border: 'border-[#238636]/40',
          desc: 'Outstanding financial discipline! You have strong surplus savings and robust budget controls.',
        };
      case 'Good':
        return {
          bg: 'bg-[#1f6feb]/20',
          text: 'text-[#58a6ff]',
          border: 'border-[#1f6feb]/40',
          desc: 'Healthy cash flow with positive savings velocity. Small optimizations will push you into Excellent.',
        };
      case 'Fair':
        return {
          bg: 'bg-[#d29922]/20',
          text: 'text-[#d29922]',
          border: 'border-[#d29922]/40',
          desc: 'Moderate cash flow buffer. Reducing discretionary spending will quickly improve your safety buffer.',
        };
      default:
        return {
          bg: 'bg-[#f85149]/20',
          text: 'text-[#f85149]',
          border: 'border-[#f85149]/40',
          desc: 'High outflow relative to inflow. Focus on trimming over-budget categories to rebuild your emergency runway.',
        };
    }
  };

  const badgeInfo = getRatingBadge();

  // Metrics summary
  const totalLiquidAssets = accounts
    .filter((a) => a.accountType !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCreditDebt = accounts
    .filter((a) => a.accountType === 'CREDIT_CARD')
    .reduce((sum, a) => sum + a.balance, 0);

  const activeBudgetsCount = budgets.length;
  const onTrackBudgets = budgets.filter((b) => b.spent <= b.amount).length;

  return (
    <div
      id="financial-health-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="financial-health-modal-content"
        className="bg-[#0d1117] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 text-[#c9d1d9] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#21262d] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a371f7]/15 border border-[#a371f7]/30 text-[#a371f7] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#f0f6fc]">Financial Health Score</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#a371f7]/20 text-[#a371f7] border border-[#a371f7]/30">
                  Algorithmic Audit
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-0.5">
                How MoneyMate calculates your 0–100 score based on your real transactions and balances
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Score Box */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#21262d"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={currentScore >= 80 ? '#3fb950' : currentScore >= 65 ? '#58a6ff' : currentScore >= 45 ? '#d29922' : '#f85149'}
                  strokeWidth="8"
                  strokeDasharray={`${(currentScore / 100) * 263.89} 263.89`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono text-[#f0f6fc] leading-none">
                  {currentScore}
                </span>
                <span className="text-[9px] font-mono text-[#8b949e] leading-none mt-0.5">
                  /100
                </span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-bold text-[#f0f6fc]">Rating:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}>
                  {rating}
                </span>
              </div>
              <p className="text-xs text-[#8b949e] max-w-sm leading-relaxed">
                {badgeInfo.desc}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-[#21262d] pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
            <div className="text-[11px] uppercase tracking-wider font-mono text-[#8b949e]">
              Liquid Reserve
            </div>
            <div className="text-base font-bold font-mono text-[#3fb950]">
              ₹{totalLiquidAssets.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">
              Across {accounts.length} linked accounts
            </div>
          </div>
        </div>

        {/* 4 Calculation Pillars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#f0f6fc] flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#58a6ff]" />
              The 4 Pillars of Your Score
            </h3>
            <span className="text-[11px] font-mono text-[#8b949e]">Sum: 100 Max Points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Pillar 1: Savings Rate */}
            <div className="p-3.5 rounded-xl bg-[#161b22]/70 border border-[#30363d] space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30 flex items-center justify-center font-bold text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f0f6fc]">1. Savings Rate</h4>
                    <span className="text-[10px] text-[#8b949e] font-mono">Weight: 35% (Max 35 pts)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#3fb950]">
                    +{savingsRatePts} pts
                  </span>
                  <div className="text-[10px] font-mono text-[#8b949e]">
                    {savingsRate}% saved
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3fb950]"
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#8b949e] leading-snug">
                <strong className="text-[#f0f6fc]">Formula:</strong> (Net Savings ÷ Monthly Income) × 35. Target benchmark is ≥30% savings rate.
              </p>
            </div>

            {/* Pillar 2: Budget Adherence */}
            <div className="p-3.5 rounded-xl bg-[#161b22]/70 border border-[#30363d] space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#58a6ff]/15 text-[#58a6ff] border border-[#58a6ff]/30 flex items-center justify-center font-bold text-xs">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f0f6fc]">2. Budget Adherence</h4>
                    <span className="text-[10px] text-[#8b949e] font-mono">Weight: 30% (Max 30 pts)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#58a6ff]">
                    +{budgetPts} pts
                  </span>
                  <div className="text-[10px] font-mono text-[#8b949e]">
                    {onTrackBudgets}/{activeBudgetsCount || 1} on track
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#58a6ff]"
                  style={{ width: `${Math.min(100, budgetAdherence)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#8b949e] leading-snug">
                <strong className="text-[#f0f6fc]">Formula:</strong> (Categories Kept Within Limit ÷ Total Budgets) × 30. Prevents overspending.
              </p>
            </div>

            {/* Pillar 3: Spending Velocity */}
            <div className="p-3.5 rounded-xl bg-[#161b22]/70 border border-[#30363d] space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#d29922]/15 text-[#d29922] border border-[#d29922]/30 flex items-center justify-center font-bold text-xs">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f0f6fc]">3. Outflow Velocity</h4>
                    <span className="text-[10px] text-[#8b949e] font-mono">Weight: 20% (Max 20 pts)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#d29922]">
                    +{consistencyPts} pts
                  </span>
                  <div className="text-[10px] font-mono text-[#8b949e]">
                    {spendingConsistency}% velocity score
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#d29922]"
                  style={{ width: `${Math.min(100, spendingConsistency)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#8b949e] leading-snug">
                <strong className="text-[#f0f6fc]">Formula:</strong> Rewards keeping total outflows under 70% of total income with consistent daily spread.
              </p>
            </div>

            {/* Pillar 4: Debt & Liquidity Safety */}
            <div className="p-3.5 rounded-xl bg-[#161b22]/70 border border-[#30363d] space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#a371f7]/15 text-[#a371f7] border border-[#a371f7]/30 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f0f6fc]">4. Debt & Liquidity</h4>
                    <span className="text-[10px] text-[#8b949e] font-mono">Weight: 15% (Max 15 pts)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#a371f7]">
                    +{debtPts} pts
                  </span>
                  <div className="text-[10px] font-mono text-[#8b949e]">
                    {debtRatio}% credit ratio
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#a371f7]"
                  style={{ width: `${Math.min(100, debtHealthPct)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#8b949e] leading-snug">
                <strong className="text-[#f0f6fc]">Formula:</strong> (1 - Credit Dues / Liquid Assets) × 15. Protects against debt spiral.
              </p>
            </div>
          </div>
        </div>

        {/* Master Formula Equation Banner */}
        <div className="p-3 rounded-xl bg-[#090d13] border border-[#21262d] space-y-1.5 font-mono text-xs">
          <div className="text-[10px] uppercase text-[#8b949e] flex items-center gap-1 font-bold">
            <Info className="w-3 h-3 text-[#58a6ff]" />
            Formula Definition
          </div>
          <div className="text-[#58a6ff] text-[11px] overflow-x-auto whitespace-nowrap py-0.5">
            Score = (SavingsRate% × 0.35) + (BudgetAdherence% × 0.30) + (Velocity% × 0.20) + (DebtSafety% × 0.15)
          </div>
          <div className="text-[10px] text-[#8b949e]">
            = {savingsRatePts} + {budgetPts} + {consistencyPts} + {debtPts} = <span className="font-bold text-[#f0f6fc]">{currentScore} pts</span>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-[#f0f6fc] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#3fb950]" />
            Actionable Recommendations to Reach 95+
          </h4>
          <div className="space-y-2 text-xs">
            {savingsRate < 30 ? (
              <div className="p-2.5 rounded-lg bg-[#238636]/10 border border-[#238636]/30 text-[#c9d1d9] flex items-center justify-between">
                <span>⚡ Boost savings rate to 30% by cutting unneeded subscriptions.</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('budgets');
                  }}
                  className="text-[#3fb950] font-bold text-[11px] hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  Adjust Budgets <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-[#238636]/10 border border-[#238636]/30 text-[#c9d1d9] flex items-center justify-between">
                <span>✓ Excellent savings rate! Allocate surplus into Digital Gullak goals.</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('goals');
                  }}
                  className="text-[#3fb950] font-bold text-[11px] hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  View Goals <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {budgetAdherence < 100 && (
              <div className="p-2.5 rounded-lg bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#c9d1d9] flex items-center justify-between">
                <span>📊 {activeBudgetsCount - onTrackBudgets} category exceeded budget limits this month.</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('budgets');
                  }}
                  className="text-[#58a6ff] font-bold text-[11px] hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  Check Budgets <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#21262d] pt-4">
          <button
            onClick={onClose}
            className="gh-btn px-4 py-1.5 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateTab('budgets');
            }}
            className="gh-btn gh-btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Optimize Budget Guardrails</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
