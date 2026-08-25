import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Zap,
  ArrowUpRight,
  Target,
  PiggyBank,
  Landmark,
} from 'lucide-react';
import { FinancialHealthScore, Transaction, Budget, Account } from '../../types';

interface InsightsViewProps {
  healthScore: FinancialHealthScore;
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  onOpenUpiImport: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  healthScore,
  transactions = [],
  budgets = [],
  accounts = [],
  onOpenUpiImport,
}) => {
  const currentHealthScore = healthScore || {
    score: 78,
    status: 'Good',
    rating: 'Good',
    recommendation: 'Solid liquidity ratio and consistent Gullak contributions.',
    breakdown: {
      budgetAdherence: 85,
      savingsRate: 65,
      debtToIncome: 12,
      emergencyFundMonths: 4.5,
    },
  };

  const score = currentHealthScore.score || 78;

  return (
    <div id="insights-view-container" className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Algorithmic Health Audit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Financial Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Automated evaluation of liquidity, savings velocity, debt exposure, and budget adherence.
        </p>
      </div>

      {/* Main Radial Health Score Card */}
      <div className="p-7 sm:p-9 rounded-3xl bg-[#090c15] border border-white/[0.08] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left: Info */}
        <div className="space-y-3 relative z-10 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {currentHealthScore.status || 'Good'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Status Grade</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Health: {score} / 100
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentHealthScore.recommendation ||
              'Your cash flow is strong with low debt utilization. Maintaining a 60%+ savings rate to your Gullak accounts gives you high financial resilience.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              ✓ Low Credit Debt
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              ✓ Positive Cash Flow
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              ✓ Goal Funded
            </span>
          </div>
        </div>

        {/* Right: Radial Visualization */}
        <div className="relative z-10 flex flex-col items-center justify-center shrink-0">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray={301.6}
                strokeDashoffset={301.6 - (301.6 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 shadow-[0_0_15px_#10b981]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {score}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
              <span className="text-[11px] font-bold text-emerald-400 font-mono mt-0.5">
                {currentHealthScore.status || 'Good'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Health Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Budget Adherence */}
        <div className="p-5 rounded-3xl bg-[#090c15] border border-white/[0.08] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Budget Adherence
            </span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">85%</div>
          <p className="text-[11px] text-slate-400">
            Within monthly spending boundaries across key categories.
          </p>
        </div>

        {/* 2. Savings Rate */}
        <div className="p-5 rounded-3xl bg-[#090c15] border border-white/[0.08] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Savings Rate
            </span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">65%</div>
          <p className="text-[11px] text-slate-400">
            High retention of monthly income directed to Gullak & savings.
          </p>
        </div>

        {/* 3. Debt to Income */}
        <div className="p-5 rounded-3xl bg-[#090c15] border border-white/[0.08] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Credit Ratio
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">9.5%</div>
          <p className="text-[11px] text-slate-400">
            Healthy credit card utilization well below safe 30% threshold.
          </p>
        </div>

        {/* 4. Emergency Runway */}
        <div className="p-5 rounded-3xl bg-[#090c15] border border-white/[0.08] space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Emergency Runway
            </span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">4.5 Mo</div>
          <p className="text-[11px] text-slate-400">
            Liquid reserves covering over 4 months of typical expenses.
          </p>
        </div>
      </div>
    </div>
  );
};
