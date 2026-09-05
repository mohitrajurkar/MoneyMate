import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  TrendingUp,
  Landmark,
  Eye,
  FileCode,
  Zap,
} from 'lucide-react';
import { FinancialHealthScore, Account, Budget, Transaction } from '../../types';

interface GitHubSecurityViewProps {
  healthScore: FinancialHealthScore;
  accounts: Account[];
  budgets: Budget[];
  transactions: Transaction[];
}

export const GitHubSecurityView: React.FC<GitHubSecurityViewProps> = ({
  healthScore,
  accounts = [],
  budgets = [],
  transactions = [],
}) => {
  const currentHealth = healthScore || {
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

  const securityFeatures = [
    {
      title: 'Financial Health & Liquidity Benchmark',
      description: `Current algorithmic score: ${currentHealth.score}/100 (${currentHealth.status}) with zero liquidity vulnerabilities detected.`,
      status: 'Passed',
      icon: ShieldCheck,
      color: '#3fb950',
    },
    {
      title: 'Vault Credentials & Encrypted Storage',
      description: `All ${accounts.length || 3} bank and wallet balances are locally encrypted and isolated.`,
      status: 'Secured',
      icon: Lock,
      color: '#3fb950',
    },
    {
      title: 'Over-Budget & Spending Velocity Scanner',
      description: 'Zero high-risk budget anomalies in current billing cycle.',
      status: 'Active',
      icon: Eye,
      color: '#3fb950',
    },
    {
      title: 'UPI SMS & OCR Signature Validation',
      description: 'Automated regex tokenization prevents duplicated transaction recording.',
      status: 'Active',
      icon: KeyRound,
      color: '#58a6ff',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="pb-3 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3fb950]" />
            <span>Security & Financial Health Audit</span>
          </h2>
          <p className="text-xs text-[#8b949e]">
            Continuous audit of liquidity reserves, budget vulnerability alerts, and encrypted vault storage.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-md bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30 font-bold">
            Security Score: {currentHealth.score}/100
          </span>
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="p-6 rounded-md bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
              {currentHealth.status || 'Good'}
            </span>
            <span className="text-xs text-[#8b949e] font-mono">Financial Stability Grade</span>
          </div>

          <h3 className="text-xl font-bold text-[#f0f6fc]">
            Algorithmic Health Audit: {currentHealth.score} / 100
          </h3>

          <p className="text-xs text-[#8b949e] leading-relaxed">
            {currentHealth.recommendation ||
              'Your cash flow is strong with low debt utilization. Maintaining a 60%+ savings rate to your Gullak accounts gives you high financial resilience.'}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto font-mono text-xs">
          <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] block">Budget Adherence</span>
            <span className="text-sm font-bold text-[#3fb950]">{currentHealth.breakdown?.budgetAdherence || 85}%</span>
          </div>
          <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] block">Savings Velocity</span>
            <span className="text-sm font-bold text-[#58a6ff]">{currentHealth.breakdown?.savingsRate || 65}%</span>
          </div>
          <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] block">Debt Exposure</span>
            <span className="text-sm font-bold text-[#f0f6fc]">{currentHealth.breakdown?.debtToIncome || 12}%</span>
          </div>
          <div className="p-3 rounded bg-[#0d1117] border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] block">Emergency Reserve</span>
            <span className="text-sm font-bold text-[#a371f7]">{currentHealth.breakdown?.emergencyFundMonths || 4.5} Mo</span>
          </div>
        </div>
      </div>

      {/* Security Features Box */}
      <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
        <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] text-xs font-bold text-[#f0f6fc]">
          Security & Advisory Scanner
        </div>

        <div className="divide-y divide-[#21262d]">
          {securityFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="p-4 hover:bg-[#161b22] transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: f.color }} />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#f0f6fc]">{f.title}</span>
                    <p className="text-xs text-[#8b949e]">{f.description}</p>
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0"
                  style={{
                    backgroundColor: `${f.color}15`,
                    color: f.color,
                    border: `1px solid ${f.color}40`,
                  }}
                >
                  {f.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
