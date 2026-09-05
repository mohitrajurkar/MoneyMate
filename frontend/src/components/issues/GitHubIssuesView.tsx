import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Search,
  Tag,
  MessageSquare,
  Plus,
  Filter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Transaction, Budget, Subscription } from '../../types';

interface FinancialIssue {
  id: number;
  title: string;
  description: string;
  author: string;
  labels: { name: string; color: string; bg: string }[];
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  commentsCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface GitHubIssuesViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  onOpenQuickAdd: () => void;
  onOpenUpiImport: () => void;
}

export const GitHubIssuesView: React.FC<GitHubIssuesViewProps> = ({
  transactions = [],
  budgets = [],
  subscriptions = [],
  onOpenQuickAdd,
  onOpenUpiImport,
}) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);

  // Initial Financial Issues
  const [issues, setIssues] = useState<FinancialIssue[]>([
    {
      id: 104,
      title: 'Netflix 4K subscription renewed (₹649) — verify recurring necessity',
      description: 'Monthly streaming debit from HDFC Credit Card. Check if active utilization is worth renewing.',
      author: 'moneymate-dev',
      labels: [
        { name: 'subscription-due', color: '#f0883e', bg: 'rgba(240, 136, 62, 0.15)' },
        { name: 'credit-card', color: '#a371f7', bg: 'rgba(163, 113, 247, 0.15)' },
      ],
      status: 'OPEN',
      createdAt: '2 hours ago',
      commentsCount: 3,
      priority: 'MEDIUM',
    },
    {
      id: 103,
      title: 'Food & Dining velocity reached 85% of monthly limit (₹12,400 / ₹15,000)',
      description: 'High dining outflow in Week 2. Recommending shifting to home cooked meals to prevent budget breach.',
      author: 'moneymate-bot',
      labels: [
        { name: 'budget-warning', color: '#f85149', bg: 'rgba(248, 81, 73, 0.15)' },
        { name: 'priority: high', color: '#f85149', bg: 'rgba(248, 81, 73, 0.15)' },
      ],
      status: 'OPEN',
      createdAt: '1 day ago',
      commentsCount: 5,
      priority: 'HIGH',
    },
    {
      id: 102,
      title: 'PhonePe UPI transfer ₹1,200 to Ramesh Kumar pending invoice verification',
      description: 'Transaction recorded via UPI SMS. Missing receipt image and tax deduction tag.',
      author: 'moneymate-dev',
      labels: [
        { name: 'upi-pending', color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.15)' },
        { name: 'needs-receipt', color: '#d29922', bg: 'rgba(210, 153, 34, 0.15)' },
      ],
      status: 'OPEN',
      createdAt: '2 days ago',
      commentsCount: 1,
      priority: 'LOW',
    },
    {
      id: 101,
      title: 'Rebalance Liquid Emergency Reserve after car insurance payment (₹8,500)',
      description: 'Liquid balance dipped below 4-month emergency threshold. Transfer ₹10,000 from investment.',
      author: 'moneymate-dev',
      labels: [
        { name: 'rebalance', color: '#3fb950', bg: 'rgba(63, 185, 80, 0.15)' },
      ],
      status: 'OPEN',
      createdAt: '3 days ago',
      commentsCount: 4,
      priority: 'HIGH',
    },
    {
      id: 100,
      title: 'Audit duplicated UPI debit from Swiggy order (₹450)',
      description: 'Resolved: Bank reversed the failed duplicate authorization within 24 hours.',
      author: 'moneymate-dev',
      labels: [
        { name: 'resolved', color: '#3fb950', bg: 'rgba(63, 185, 80, 0.15)' },
        { name: 'upi-refund', color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.15)' },
      ],
      status: 'CLOSED',
      createdAt: '5 days ago',
      commentsCount: 2,
      priority: 'LOW',
    },
  ]);

  // Form state for new issue
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const closedCount = issues.filter((i) => i.status === 'CLOSED').length;

  const filteredIssues = issues.filter((i) => {
    if (i.status !== activeTab) return false;
    if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase()) && !i.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLabel && !i.labels.some((l) => l.name === selectedLabel)) {
      return false;
    }
    return true;
  });

  const handleToggleStatus = (id: number) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'OPEN' ? 'CLOSED' : 'OPEN' }
          : item
      )
    );
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIssue: FinancialIssue = {
      id: Math.max(...issues.map((i) => i.id), 100) + 1,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Logged via GitHub Financial Issues Tracker.',
      author: 'moneymate-dev',
      labels: [
        { name: 'financial-task', color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.15)' },
        { name: `priority: ${newPriority.toLowerCase()}`, color: newPriority === 'HIGH' ? '#f85149' : '#3fb950', bg: 'rgba(248, 81, 73, 0.15)' },
      ],
      status: 'OPEN',
      createdAt: 'just now',
      commentsCount: 0,
      priority: newPriority,
    };

    setIssues([newIssue, ...issues]);
    setNewTitle('');
    setNewDesc('');
    setIsNewIssueModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar & Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter issues (e.g. is:open subscription, budget)..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] font-mono"
            />
          </div>

          {selectedLabel && (
            <button
              onClick={() => setSelectedLabel(null)}
              className="gh-btn text-xs text-[#f85149]"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Action Button: New Issue */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewIssueModalOpen(true)}
            className="gh-btn gh-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New issue</span>
          </button>
        </div>
      </div>

      {/* Main Issues Box */}
      <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
        {/* Box Header with Open/Closed Tabs */}
        <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('OPEN')}
              className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === 'OPEN' ? 'text-[#f0f6fc] font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-[#3fb950]" />
              <span>{openCount} Open</span>
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                activeTab === 'CLOSED' ? 'text-[#f0f6fc] font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#a371f7]" />
              <span>{closedCount} Closed</span>
            </button>
          </div>

          {/* Quick Filter Labels */}
          <div className="flex items-center gap-2 flex-wrap text-[#8b949e] text-[11px] font-mono">
            <span>Author</span>
            <span>•</span>
            <span>Label</span>
            <span>•</span>
            <span>Projects</span>
            <span>•</span>
            <span>Sort</span>
          </div>
        </div>

        {/* Issues List */}
        <div className="divide-y divide-[#21262d]">
          {filteredIssues.length === 0 ? (
            <div className="p-12 text-center text-[#8b949e] space-y-2">
              <AlertCircle className="w-8 h-8 text-[#8b949e] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#f0f6fc]">No {activeTab.toLowerCase()} financial issues</p>
              <p className="text-xs">Your budgets, transactions, and recurring subscriptions are all in order.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 sm:px-4 sm:py-3.5 hover:bg-[#161b22] transition-colors flex items-start justify-between gap-3 group"
              >
                {/* Left: Status Icon & Details */}
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(issue.id)}
                    className="mt-0.5 text-[#3fb950] hover:opacity-80 cursor-pointer shrink-0"
                    title={issue.status === 'OPEN' ? 'Mark as completed' : 'Reopen issue'}
                  >
                    {issue.status === 'OPEN' ? (
                      <AlertCircle className="w-4 h-4 text-[#3fb950]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#a371f7]" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#f0f6fc] hover:text-[#58a6ff] cursor-pointer">
                        {issue.title}
                      </span>

                      {/* Labels */}
                      {issue.labels.map((l) => (
                        <button
                          key={l.name}
                          onClick={() => setSelectedLabel(l.name)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold cursor-pointer transition-opacity hover:opacity-80"
                          style={{
                            color: l.color,
                            backgroundColor: l.bg,
                            border: `1px solid ${l.color}40`,
                          }}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-[#8b949e] line-clamp-1">
                      {issue.description}
                    </p>

                    <div className="text-[11px] text-[#8b949e] font-mono flex items-center gap-2">
                      <span>#{issue.id} opened {issue.createdAt} by {issue.author}</span>
                      <span>•</span>
                      <span className="text-[#3fb950] font-bold">Priority: {issue.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Comments Count & Actions */}
                <div className="flex items-center gap-3 shrink-0 text-[#8b949e] text-xs font-mono">
                  {issue.commentsCount > 0 && (
                    <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{issue.commentsCount}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleStatus(issue.id)}
                    className="gh-btn text-[11px] py-0.5 px-2 hidden sm:inline-flex"
                  >
                    {issue.status === 'OPEN' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Issue Modal */}
      {isNewIssueModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsNewIssueModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#f0f6fc]">
                <AlertCircle className="w-4 h-4 text-[#3fb950]" />
                <span>Create New Financial Issue / Dispute</span>
              </div>
              <button
                onClick={() => setIsNewIssueModalOpen(false)}
                className="text-[#8b949e] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#f0f6fc] font-semibold">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Swiggy bill refund verification, Dining budget review"
                  required
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#f0f6fc] font-semibold">Description / Notes</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Add details, transaction references, or required follow-ups..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#f0f6fc] font-semibold">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="HIGH">High Priority (Immediate Action)</option>
                  <option value="MEDIUM">Medium Priority (Standard Review)</option>
                  <option value="LOW">Low Priority (Optional Optimization)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsNewIssueModalOpen(false)}
                  className="gh-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                >
                  Submit new issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
