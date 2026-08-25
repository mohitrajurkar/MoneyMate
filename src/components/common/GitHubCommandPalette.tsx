import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  ArrowUpDown,
  Target,
  PiggyBank,
  Landmark,
  CreditCard,
  BarChart3,
  ShieldCheck,
  QrCode,
  Plus,
  ArrowRight,
  Settings,
  HandCoins,
  User as UserIcon,
} from 'lucide-react';
import { Transaction, Account } from '../../types';

interface GitHubCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenUpiImport: () => void;
  onOpenProfile?: () => void;
  transactions: Transaction[];
  accounts: Account[];
}

export const GitHubCommandPalette: React.FC<GitHubCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenQuickAdd,
  onOpenUpiImport,
  onOpenProfile,
  transactions = [],
  accounts = [],
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, type: 'Page' },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown, type: 'Page' },
    { id: 'debts', label: 'Khata', icon: HandCoins, type: 'Page' },
    { id: 'goals', label: 'Savings Goals', icon: Target, type: 'Page' },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank, type: 'Page' },
    { id: 'accounts', label: 'Accounts', icon: Landmark, type: 'Page' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, type: 'Page' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, type: 'Page' },
    { id: 'insights', label: 'Financial Health', icon: ShieldCheck, type: 'Page' },
    { id: 'settings', label: 'Settings', icon: Settings, type: 'Page' },
  ];

  const quickActions = [
    {
      id: 'action-add',
      label: 'Add Transaction',
      icon: Plus,
      action: () => {
        onClose();
        onOpenQuickAdd();
      },
    },
    {
      id: 'action-upi',
      label: 'UPI Import',
      icon: QrCode,
      action: () => {
        onClose();
        onOpenUpiImport();
      },
    },
    ...(onOpenProfile
      ? [
          {
            id: 'action-profile',
            label: 'User Profile',
            icon: UserIcon,
            action: () => {
              onClose();
              onOpenProfile();
            },
          },
        ]
      : []),
  ];

  // Filter items
  const filteredNav = quickNavItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedTransactions = (transactions || [])
    .filter(
      (t) =>
        t.merchant.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const allItemsCount =
    filteredActions.length + filteredNav.length + (query ? matchedTransactions.length : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItemsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItemsCount) % Math.max(1, allItemsCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      let indexTracker = 0;

      // Check actions
      for (const act of filteredActions) {
        if (indexTracker === selectedIndex) {
          act.action();
          return;
        }
        indexTracker++;
      }

      // Check Nav
      for (const nav of filteredNav) {
        if (indexTracker === selectedIndex) {
          onNavigateTab(nav.id);
          onClose();
          return;
        }
        indexTracker++;
      }
    }
  };

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        id="command-palette-dialog"
        className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d] bg-[#0d1117]">
          <Search className="w-4 h-4 text-[#8b949e] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or transaction..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none text-xs sm:text-sm text-[#f0f6fc] placeholder:text-[#8b949e] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#8b949e]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#21262d]/50 space-y-2">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-semibold">
                Quick Actions
              </div>
              {filteredActions.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#238636] text-white'
                        : 'text-[#f0f6fc] hover:bg-[#21262d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#3fb950]" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-semibold">
                Pages & Features
              </div>
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                const itemIdx = filteredActions.length + idx;
                const isSelected = selectedIndex === itemIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigateTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#1f6feb] text-white'
                        : 'text-[#f0f6fc] hover:bg-[#21262d]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#58a6ff]" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8b949e]">
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Transactions if query is present */}
          {query.trim().length > 1 && matchedTransactions.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-semibold">
                Matching Transactions
              </div>
              {matchedTransactions.map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => {
                    onNavigateTab('transactions');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-lg text-xs hover:bg-[#21262d] flex items-center justify-between text-[#f0f6fc] cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{txn.merchant || txn.description}</p>
                    <p className="text-[10px] text-[#8b949e]">{txn.transactionDate}</p>
                  </div>
                  <span className="font-mono font-bold text-[#3fb950]">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {allItemsCount === 0 && (
            <div className="p-8 text-center text-xs text-[#8b949e]">
              No commands or transactions matching &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between text-[11px] text-[#8b949e]">
          <span>Navigation: ↑ ↓ arrows</span>
          <span>Select: Enter</span>
        </div>
      </div>
    </div>
  );
};
