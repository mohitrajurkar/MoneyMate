import React, { useState } from 'react';
import {
  GitBranch,
  Tag,
  FileCode,
  Folder,
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  Download,
  Plus,
  QrCode,
  Camera,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  BookOpen,
  Eye,
} from 'lucide-react';
import {
  User,
  Account,
  Transaction,
  Budget,
  Category,
  FinancialHealthScore,
  SavingsGoal,
} from '../../types';
import { GitHubContributionGraph } from '../common/GitHubContributionGraph';

interface GitHubCodeOverviewProps {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  healthScore: FinancialHealthScore;
  onOpenQuickAdd: () => void;
  onOpenUpiImport: () => void;
  onOpenScreenshotModal?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GitHubCodeOverview: React.FC<GitHubCodeOverviewProps> = ({
  user,
  accounts = [],
  transactions = [],
  budgets = [],
  categories = [],
  savingsGoals = [],
  healthScore,
  onOpenQuickAdd,
  onOpenUpiImport,
  onOpenScreenshotModal,
  onNavigateTab,
}) => {
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Financial Computations
  const totalLiquidBalance = (accounts || [])
    .filter((a) => a.accountType !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + a.balance, 0);

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

  const recentTransactions = (transactions || []).slice(0, 7);
  const latestTxn = transactions[0];

  const handleCopyClone = () => {
    navigator.clipboard.writeText('https://github.com/moneymate-app/moneymate.git');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const fileRows = [
    {
      name: '.github/workflows',
      type: 'dir',
      message: 'ci: automated UPI SMS ingestion cron & nightly health check',
      time: '12 hours ago',
      tab: 'actions',
    },
    {
      name: 'accounts-vaults',
      type: 'dir',
      message: `feat(vaults): synced ${accounts.length || 3} bank & credit accounts`,
      time: '1 day ago',
      tab: 'accounts',
    },
    {
      name: 'budgets-guardrails',
      type: 'dir',
      message: `perf(budgets): category caps & velocity guardrails configured`,
      time: '2 days ago',
      tab: 'budgets',
    },
    {
      name: 'digital-gullak',
      type: 'dir',
      message: `feat(goals): active savings goals with micro-deposit automation`,
      time: '3 days ago',
      tab: 'goals',
    },
    {
      name: 'transactions',
      type: 'dir',
      message: `refactor(ledger): real-time UPI and card transaction log`,
      time: '20 mins ago',
      tab: 'transactions',
    },
    {
      name: '.env.finance',
      type: 'file',
      message: 'chore(security): encrypt liquid assets & API key signatures',
      time: '5 days ago',
      tab: 'security',
    },
    {
      name: 'README.md',
      type: 'file',
      message: 'docs: update net worth metrics & contribution activity graph',
      time: 'just now',
      tab: 'dashboard',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Branch Selector & Code Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Branch & Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Branch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="gh-btn text-xs font-semibold"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
              <span>{selectedBranch}</span>
              <span className="text-[#8b949e]">▾</span>
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[11px] font-bold text-[#8b949e] border-b border-[#30363d]">
                  Switch branches/tags
                </div>
                <div className="py-1 space-y-0.5">
                  {['main', 'feature/upi-instant-parser', 'release/v2.4-gullak'].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBranch(b);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left font-mono ${
                        selectedBranch === b
                          ? 'bg-[#1f6feb] text-white font-bold'
                          : 'text-[#c9d1d9] hover:bg-[#21262d]'
                      }`}
                    >
                      <span>{b}</span>
                      {selectedBranch === b && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('transactions')}
            className="gh-btn-invisible text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 font-mono"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>1 branch</span>
          </button>

          <button
            onClick={() => onNavigateTab('actions')}
            className="gh-btn-invisible text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 font-mono"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>3 tags</span>
          </button>
        </div>

        {/* Right: Add Transaction & Code Clone Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenUpiImport}
            className="gh-btn text-xs hover:border-[#a371f7] text-[#a371f7]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Import UPI</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="gh-btn gh-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Transaction</span>
          </button>

          {/* Code Clone Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCodeDropdownOpen(!isCodeDropdownOpen)}
              className="gh-btn text-xs font-semibold bg-[#238636] hover:bg-[#2ea043] text-white border-transparent"
            >
              <span>Code</span>
              <span>▾</span>
            </button>

            {isCodeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-3 z-50 text-xs text-[#c9d1d9] space-y-3">
                <div className="font-bold text-[#f0f6fc] flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#58a6ff]" />
                  <span>Clone or Export Financial Ledger</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#8b949e]">HTTPS Repository URL</span>
                  <div className="flex items-center rounded-md bg-[#0d1117] border border-[#30363d] p-1.5 font-mono text-[11px] justify-between">
                    <span className="truncate">https://github.com/moneymate-app/moneymate.git</span>
                    <button
                      onClick={handleCopyClone}
                      className="ml-2 text-[#8b949e] hover:text-white cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copiedHash && (
                    <span className="text-[10px] text-[#3fb950] font-mono block">✓ Copied to clipboard</span>
                  )}
                </div>

                <div className="border-t border-[#30363d] pt-2 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsCodeDropdownOpen(false);
                      onNavigateTab('transactions');
                    }}
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-[#21262d] text-[#f0f6fc]"
                  >
                    <span>View Commit Ledger (CSV)</span>
                    <Download className="w-3.5 h-3.5 text-[#8b949e]" />
                  </button>
                  <button
                    onClick={() => {
                      setIsCodeDropdownOpen(false);
                      onNavigateTab('security');
                    }}
                    className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-[#21262d] text-[#f0f6fc]"
                  >
                    <span>Export Health Audit JSON</span>
                    <Download className="w-3.5 h-3.5 text-[#8b949e]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Layout: Left (Files + README) / Right (About Repo Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (File Explorer + README.md Preview): 9 cols */}
        <div className="lg:col-span-9 space-y-6">
          {/* File Explorer Box */}
          <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            {/* Latest Commit Banner */}
            <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black font-mono shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="font-bold text-[#f0f6fc] shrink-0">{user.name}</span>
                <span className="text-[#8b949e] truncate">
                  {latestTxn
                    ? `feat(ledger): ${latestTxn.merchant} (${latestTxn.paymentMethod}) - ₹${latestTxn.amount.toLocaleString('en-IN')}`
                    : 'feat(upi): automated parsing of Swiggy UPI debit with GPay ref'}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[#8b949e] font-mono text-[11px]">
                <span className="hover:text-[#58a6ff] cursor-pointer" onClick={() => onNavigateTab('transactions')}>
                  {latestTxn?.id?.substring(0, 7) || '7c9a12e'}
                </span>
                <span>•</span>
                <span>20 mins ago</span>
                <span>•</span>
                <button
                  onClick={() => onNavigateTab('transactions')}
                  className="hover:text-[#58a6ff] font-semibold text-[#f0f6fc] flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  <span>{transactions.length || 142} commits</span>
                </button>
              </div>
            </div>

            {/* File Rows Table */}
            <div className="divide-y divide-[#21262d] text-xs">
              {fileRows.map((row) => (
                <div
                  key={row.name}
                  onClick={() => onNavigateTab(row.tab)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-[#161b22] transition-colors cursor-pointer group"
                >
                  {/* File / Folder Name */}
                  <div className="flex items-center gap-2.5 w-1/3 min-w-[160px] truncate">
                    {row.type === 'dir' ? (
                      <Folder className="w-4 h-4 text-[#58a6ff] fill-[#58a6ff]/20 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#8b949e] shrink-0" />
                    )}
                    <span className="text-[#f0f6fc] group-hover:text-[#58a6ff] group-hover:underline font-mono truncate">
                      {row.name}
                    </span>
                  </div>

                  {/* Commit Message */}
                  <div className="hidden sm:block flex-1 px-4 text-[#8b949e] truncate">
                    {row.message}
                  </div>

                  {/* Commit Time */}
                  <div className="text-right text-[#8b949e] font-mono text-[11px] shrink-0">
                    {row.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* README.md Rendered Box (Main Financial Dashboard Deck) */}
          <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            {/* README Header */}
            <div className="gh-box-header flex items-center justify-between bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#f0f6fc]">
                <BookOpen className="w-4 h-4 text-[#8b949e]" />
                <span>README.md</span>
              </div>
              <div className="flex items-center gap-2 text-[#8b949e] text-[11px] font-mono">
                <span>12.4 KB</span>
                <span>•</span>
                <span className="text-[#3fb950] font-bold">● Active Sync</span>
              </div>
            </div>

            {/* README Markdown Content */}
            <div className="p-6 sm:p-8 space-y-8 text-[#f0f6fc]">
              {/* Heading & Badges */}
              <div className="space-y-3 pb-6 border-b border-[#21262d]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="gh-badge bg-[#238636]/20 text-[#3fb950] border-[#238636]/40 font-mono text-xs">
                    build: passing
                  </span>
                  <span className="gh-badge bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/40 font-mono text-xs">
                    net-worth: ₹{totalLiquidBalance > 0 ? (totalLiquidBalance / 100000).toFixed(2) + 'L' : '1.42L'}
                  </span>
                  <span className="gh-badge bg-[#a371f7]/20 text-[#d2a8ff] border-[#a371f7]/40 font-mono text-xs">
                    health: {healthScore.score || 78}/100 {healthScore.status || 'Good'}
                  </span>
                  <span className="gh-badge bg-[#f0883e]/20 text-[#ffa657] border-[#f0883e]/40 font-mono text-xs">
                    upi-parser: verified
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f0f6fc] flex items-center gap-2">
                  <span>💰 MoneyMate: Automated Finance & UPI Engine</span>
                </h1>
                <p className="text-sm text-[#8b949e] leading-relaxed">
                  Real-time financial intelligence ledger, instant UPI SMS & screenshot parser, Digital Gullak savings vaults, and algorithmic liquidity health benchmark.
                </p>
              </div>

              {/* ⭐ HERO FINANCIAL METRICS (GitHub Primer Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Liquid Balance */}
                <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span>Total Liquid Balance</span>
                    <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-[#f0f6fc] font-mono">
                    ₹{totalLiquidBalance > 0 ? totalLiquidBalance.toLocaleString('en-IN') : '42,500'}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">
                    Across {accounts.length || 3} bank & wallet vaults
                  </span>
                </div>

                {/* Monthly Income */}
                <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span>Monthly Inflow</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#3fb950]" />
                  </div>
                  <div className="text-2xl font-black text-[#3fb950] font-mono">
                    ₹{monthlyIncome > 0 ? monthlyIncome.toLocaleString('en-IN') : '65,000'}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">This month's deposits</span>
                </div>

                {/* Monthly Expenses */}
                <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span>Monthly Outflow</span>
                    <TrendingDown className="w-3.5 h-3.5 text-[#f85149]" />
                  </div>
                  <div className="text-2xl font-black text-[#f85149] font-mono">
                    ₹{monthlyExpenses > 0 ? monthlyExpenses.toLocaleString('en-IN') : '22,500'}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">This month's debits</span>
                </div>

                {/* Net Retained Savings */}
                <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span>Net Retained</span>
                    <Coins className="w-3.5 h-3.5 text-[#58a6ff]" />
                  </div>
                  <div className="text-2xl font-black text-[#58a6ff] font-mono">
                    ₹{monthlySavings > 0 ? monthlySavings.toLocaleString('en-IN') : '42,500'}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-mono block">
                    {monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 65}% savings velocity
                  </span>
                </div>
              </div>

              {/* ⭐ 52-WEEK GITHUB CONTRIBUTION HEATMAP GRAPH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                    <span>📊 Financial Activity & Contribution Graph</span>
                  </h2>
                  <span className="text-xs text-[#8b949e] font-mono">52-week ledger heatmap</span>
                </div>
                <GitHubContributionGraph transactions={transactions} />
              </div>

              {/* ⭐ RECENT COMMIT LEDGER (TRANSACTIONS IN GITHUB COMMIT FORMAT) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                    <span>📑 Recent Commit Ledger (Transactions)</span>
                  </h2>
                  <button
                    onClick={() => onNavigateTab('transactions')}
                    className="text-xs text-[#58a6ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all commits</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="border border-[#30363d] rounded-md divide-y divide-[#21262d] bg-[#161b22] overflow-hidden">
                  {recentTransactions.map((t) => {
                    const isIncome = t.transactionType === 'INCOME';
                    const isTransfer = t.transactionType === 'TRANSFER';
                    const acc = accounts.find((a) => a.id === t.accountId);
                    const cat = categories.find((c) => c.id === t.categoryId);
                    const commitHash = t.id ? t.id.replace(/-/g, '').substring(0, 7) : 'a4b2c19';

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#1f242c] transition-colors"
                      >
                        {/* Commit Message & Author */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-mono font-bold text-[#58a6ff] shrink-0">
                            {t.merchant.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#f0f6fc] hover:text-[#58a6ff] cursor-pointer truncate">
                                {t.merchant}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                                {cat?.name || 'General'}
                              </span>
                              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono text-[#3fb950] bg-[#238636]/10 border border-[#238636]/30">
                                ✓ Verified
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8b949e] font-mono mt-0.5 flex items-center gap-2">
                              <span>{user.name} committed</span>
                              <span>•</span>
                              <span>{t.paymentMethod}</span>
                              <span>•</span>
                              <span>{acc?.name || 'Account'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Commit SHA */}
                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div
                            className={`text-sm font-bold font-mono ${
                              isIncome ? 'text-[#3fb950]' : 'text-[#f0f6fc]'
                            }`}
                          >
                            {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                          </div>

                          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-mono bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
                            {commitHash}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (About Repository Sidebar): 3 cols */}
        <div className="lg:col-span-3 space-y-6 text-xs text-[#c9d1d9]">
          {/* About Section */}
          <div className="space-y-3 pb-5 border-b border-[#21262d]">
            <h3 className="font-bold text-sm text-[#f0f6fc]">About</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Personal finance ledger & automated UPI transaction parser with Digital Gullak savings vaults and liquidity audit.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-[#8b949e]">
                <ExternalLink className="w-3.5 h-3.5 text-[#58a6ff]" />
                <a href="#moneymate-app" className="text-[#58a6ff] hover:underline truncate">
                  moneymate.financial-core.internal
                </a>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['upi-parser', 'gullak-savings', 'budget-guard', 'personal-finance', 'ocr-receipts'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#58a6ff] bg-[#388bfd]/10 border border-[#388bfd]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 font-mono text-[11px] text-[#8b949e]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>MIT License (Ledger Safe)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#a371f7]" />
                <span>Financial Health: {healthScore.score || 78}/100</span>
              </div>
            </div>
          </div>

          {/* Releases Section */}
          <div className="space-y-3 pb-5 border-b border-[#21262d]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#f0f6fc]">Releases</h3>
              <span className="gh-counter font-mono">3</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Tag className="w-3.5 h-3.5 text-[#3fb950]" />
              <span className="font-bold text-[#f0f6fc]">v2.4.0</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30">
                Latest
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e]">
              Automated UPI SMS regex detection, screenshot receipt scanner, and Gullak savings vault.
            </p>
          </div>

          {/* Repository Stats */}
          <div className="space-y-3 pb-5 border-b border-[#21262d]">
            <h3 className="font-bold text-sm text-[#f0f6fc]">Repository Metrics</h3>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Bank & Wallet Vaults</span>
                <span className="font-bold text-[#f0f6fc]">{accounts.length || 3}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Active Budget Limits</span>
                <span className="font-bold text-[#f0f6fc]">{budgets.length || 4}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Gullak Goals Tracked</span>
                <span className="font-bold text-[#f0f6fc]">{savingsGoals.length || 2}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Total Transactions</span>
                <span className="font-bold text-[#f0f6fc]">{transactions.length || 142}</span>
              </div>
            </div>
          </div>

          {/* Languages Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#f0f6fc]">Languages</h3>
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#21262d]">
              <div className="h-full bg-[#3178c6]" style={{ width: '68.4%' }} />
              <div className="h-full bg-[#38bdf8]" style={{ width: '24.1%' }} />
              <div className="h-full bg-[#89e051]" style={{ width: '7.5%' }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[#8b949e]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3178c6]" />
                <span className="text-[#f0f6fc]">TypeScript</span> 68.4%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span className="text-[#f0f6fc]">Tailwind CSS</span> 24.1%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#89e051]" />
                <span className="text-[#f0f6fc]">Shell</span> 7.5%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
