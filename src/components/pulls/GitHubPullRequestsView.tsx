import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  GitMerge,
  ArrowRight,
  Plus,
  Search,
  Check,
  AlertCircle,
  TrendingUp,
  Landmark,
  Coins,
} from 'lucide-react';
import { Account, Transaction } from '../../types';

interface FinancialPR {
  id: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  fromAccountName: string;
  toAccountName: string;
  amount: number;
  author: string;
  status: 'OPEN' | 'MERGED';
  createdAt: string;
  diffSummary: string;
}

interface GitHubPullRequestsViewProps {
  accounts: Account[];
  onSaveTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onOpenQuickAdd: () => void;
}

export const GitHubPullRequestsView: React.FC<GitHubPullRequestsViewProps> = ({
  accounts = [],
  onSaveTransaction,
  onOpenQuickAdd,
}) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'MERGED'>('OPEN');
  const [selectedPR, setSelectedPR] = useState<FinancialPR | null>(null);
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);

  // Transfer PRs state
  const [pullRequests, setPullRequests] = useState<FinancialPR[]>([
    {
      id: 204,
      title: 'Transfer ₹5,000 from HDFC Bank to Digital Gullak (Car Goal)',
      sourceBranch: 'vault/hdfc-liquid-salary',
      targetBranch: 'gullak/new-car-fund',
      fromAccountName: 'HDFC Bank',
      toAccountName: 'Digital Gullak',
      amount: 5000,
      author: 'moneymate-dev',
      status: 'OPEN',
      createdAt: '3 hours ago',
      diffSummary: '+₹5,000 to Gullak Goal / -₹5,000 HDFC liquid',
    },
    {
      id: 203,
      title: 'Rebalance ₹10,000 from ICICI Savings to Emergency Reserve',
      sourceBranch: 'vault/icici-savings',
      targetBranch: 'vault/emergency-cash-reserve',
      fromAccountName: 'ICICI Bank',
      toAccountName: 'Emergency Reserve',
      amount: 10000,
      author: 'moneymate-dev',
      status: 'OPEN',
      createdAt: '1 day ago',
      diffSummary: '+₹10,000 Emergency Vault / -₹10,000 ICICI Bank',
    },
    {
      id: 202,
      title: 'Settled Credit Card bill ₹14,200 from Axis Bank',
      sourceBranch: 'vault/axis-salary-account',
      targetBranch: 'vault/hdfc-credit-card',
      fromAccountName: 'Axis Bank',
      toAccountName: 'HDFC Credit Card',
      amount: 14200,
      author: 'moneymate-dev',
      status: 'MERGED',
      createdAt: '4 days ago',
      diffSummary: '0 debt liability / -₹14,200 Axis Bank',
    },
  ]);

  // Form for new PR
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '');
  const [toAccount, setToAccount] = useState(accounts[1]?.id || '');
  const [prAmount, setPrAmount] = useState('5000');
  const [prTitle, setPrTitle] = useState('');

  const openCount = pullRequests.filter((p) => p.status === 'OPEN').length;
  const mergedCount = pullRequests.filter((p) => p.status === 'MERGED').length;

  const handleMergePR = (pr: FinancialPR) => {
    // Execute real financial transfer
    const fromAcc = accounts.find((a) => a.name.toLowerCase().includes(pr.fromAccountName.toLowerCase())) || accounts[0];
    const toAcc = accounts.find((a) => a.name.toLowerCase().includes(pr.toAccountName.toLowerCase())) || accounts[1];

    if (fromAcc && toAcc) {
      onSaveTransaction({
        accountId: fromAcc.id,
        toAccountId: toAcc.id,
        categoryId: 'general',
        amount: pr.amount,
        transactionType: 'TRANSFER',
        merchant: `Transfer: ${pr.fromAccountName} → ${pr.toAccountName}`,
        description: `Merged PR #${pr.id}: ${pr.title}`,
        paymentMethod: 'NetBanking / Inter-Vault',
        transactionDate: new Date().toISOString().split('T')[0],
        transactionTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        source: 'MANUAL',
      });
    }

    setPullRequests((prev) =>
      prev.map((item) =>
        item.id === pr.id ? { ...item, status: 'MERGED' } : item
      )
    );
    setSelectedPR(null);
  };

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    const fromAcc = accounts.find((a) => a.id === fromAccount) || accounts[0];
    const toAcc = accounts.find((a) => a.id === toAccount) || accounts[1];
    const amt = parseFloat(prAmount) || 1000;

    const newPR: FinancialPR = {
      id: Math.max(...pullRequests.map((p) => p.id), 200) + 1,
      title: prTitle.trim() || `Transfer ₹${amt.toLocaleString('en-IN')} from ${fromAcc?.name} to ${toAcc?.name}`,
      sourceBranch: `vault/${fromAcc?.name.toLowerCase().replace(/\s+/g, '-')}`,
      targetBranch: `vault/${toAcc?.name.toLowerCase().replace(/\s+/g, '-')}`,
      fromAccountName: fromAcc?.name || 'Bank Account',
      toAccountName: toAcc?.name || 'Target Vault',
      amount: amt,
      author: 'moneymate-dev',
      status: 'OPEN',
      createdAt: 'just now',
      diffSummary: `+₹${amt.toLocaleString('en-IN')} to ${toAcc?.name} / -₹${amt.toLocaleString('en-IN')} ${fromAcc?.name}`,
    };

    setPullRequests([newPR, ...pullRequests]);
    setIsNewPRModalOpen(false);
    setPrTitle('');
  };

  const filteredPRs = pullRequests.filter((p) => p.status === activeTab);

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#8b949e] font-mono">
          Review inter-vault fund allocations, budget rebalances, and Gullak merge requests.
        </div>

        <button
          onClick={() => setIsNewPRModalOpen(true)}
          className="gh-btn gh-btn-primary text-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New pull request</span>
        </button>
      </div>

      {/* Main PR Box */}
      <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
        {/* Box Header */}
        <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === 'OPEN' ? 'text-[#f0f6fc] font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <GitPullRequest className="w-4 h-4 text-[#3fb950]" />
              <span>{openCount} Open</span>
            </button>

            <button
              onClick={() => setActiveTab('MERGED')}
              className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === 'MERGED' ? 'text-[#f0f6fc] font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <GitMerge className="w-4 h-4 text-[#a371f7]" />
              <span>{mergedCount} Merged</span>
            </button>
          </div>

          <div className="text-[11px] text-[#8b949e] font-mono">
            <span>Branch: main</span>
          </div>
        </div>

        {/* PR List */}
        <div className="divide-y divide-[#21262d]">
          {filteredPRs.map((pr) => (
            <div
              key={pr.id}
              className="p-4 hover:bg-[#161b22] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {pr.status === 'OPEN' ? (
                    <GitPullRequest className="w-4 h-4 text-[#3fb950]" />
                  ) : (
                    <GitMerge className="w-4 h-4 text-[#a371f7]" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      onClick={() => setSelectedPR(pr)}
                      className="text-sm font-bold text-[#f0f6fc] hover:text-[#58a6ff] cursor-pointer"
                    >
                      {pr.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30">
                      ₹{pr.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#8b949e]">
                    <span>#{pr.id} opened {pr.createdAt} by {pr.author}</span>
                    <span>•</span>
                    <span className="text-[#58a6ff] font-semibold">{pr.sourceBranch}</span>
                    <ArrowRight className="w-3 h-3 text-[#8b949e]" />
                    <span className="text-[#3fb950] font-semibold">{pr.targetBranch}</span>
                  </div>

                  <div className="text-[11px] text-[#8b949e] font-mono">
                    Diff: <span className="text-[#3fb950]">{pr.diffSummary}</span>
                  </div>
                </div>
              </div>

              {/* Right: Merge Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {pr.status === 'OPEN' ? (
                  <button
                    onClick={() => handleMergePR(pr)}
                    className="gh-btn gh-btn-primary text-xs"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge pull request</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#a371f7]/15 text-[#d2a8ff] border border-[#a371f7]/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Merged</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New PR Modal */}
      {isNewPRModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsNewPRModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#f0f6fc]">
                <GitPullRequest className="w-4 h-4 text-[#3fb950]" />
                <span>Create Pull Request (Inter-Vault Fund Transfer)</span>
              </div>
              <button
                onClick={() => setIsNewPRModalOpen(false)}
                className="text-[#8b949e] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#f0f6fc] font-semibold">From Source Vault (base)</label>
                  <select
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₹{a.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#f0f6fc] font-semibold">To Destination Vault (compare)</label>
                  <select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (₹{a.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#f0f6fc] font-semibold">Transfer Amount (₹)</label>
                <input
                  type="number"
                  value={prAmount}
                  onChange={(e) => setPrAmount(e.target.value)}
                  placeholder="5000"
                  required
                  min="1"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#f0f6fc] font-semibold">Pull Request Title / Note</label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="e.g. Deposit ₹5,000 to Gullak Car Goal"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsNewPRModalOpen(false)}
                  className="gh-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                >
                  Create pull request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
