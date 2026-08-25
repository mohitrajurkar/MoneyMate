import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  Flame,
  Wallet,
  ArrowUpDown,
  RotateCcw,
  Download,
  Moon,
  Sun,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
  HandCoins,
  PiggyBank,
  Target,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { User, FinancialHealthScore } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  accountsCount?: number;
  transactionsCount?: number;
  debtsCount?: number;
  budgetsCount?: number;
  goalsCount?: number;
  streakCount?: number;
  healthScore?: FinancialHealthScore | null;
  onDataReset?: () => void;
  onResetDataToZero?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  theme,
  onToggleTheme,
  accountsCount = 0,
  transactionsCount = 0,
  debtsCount = 0,
  budgetsCount = 0,
  goalsCount = 0,
  streakCount = 0,
  healthScore,
  onDataReset,
  onResetDataToZero,
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleResetDataToZero = async () => {
    try {
      await apiService.resetUserData();
      setIsResetConfirmOpen(false);
      setResetSuccessMessage('All records & accounts have been reset to ₹0 clean state!');
      if (onResetDataToZero) onResetDataToZero();
      if (onDataReset) onDataReset();
      setTimeout(() => setResetSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset data');
    }
  };

  const handleExportData = async () => {
    try {
      const [accounts, transactions, categories, budgets, debts, savingsGoals] = await Promise.all([
        apiService.getAccounts().catch(() => []),
        apiService.getTransactions().catch(() => []),
        apiService.getCategories().catch(() => []),
        apiService.getBudgets().catch(() => []),
        apiService.getDebts().catch(() => []),
        apiService.getSavingsGoals().catch(() => []),
      ]);

      const data = {
        user,
        accounts,
        transactions,
        categories,
        budgets,
        debts,
        savingsGoals,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneymate_backup_${user.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'August 2026';

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="user-profile-modal-dialog"
        className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#c9d1d9] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#3fb950]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc]">User Profile & Account</h2>
              <p className="text-[11px] text-[#8b949e]">Personal details, stats & workspace management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {resetSuccessMessage && (
            <div className="p-3 rounded-lg bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* User Hero Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#30363d] flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#238636] to-[#3fb950] border-2 border-emerald-400/50 shadow-md flex items-center justify-center text-xl font-black text-white uppercase shrink-0 ring-4 ring-emerald-500/10">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#f0f6fc] truncate">{user.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#8b949e] flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
              <div className="flex items-center justify-between text-[#8b949e]">
                <span className="text-[10px] font-semibold">Bank Accounts</span>
                <Wallet className="w-3.5 h-3.5 text-[#58a6ff]" />
              </div>
              <div className="text-base font-bold font-mono text-[#f0f6fc]">
                {accountsCount}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
              <div className="flex items-center justify-between text-[#8b949e]">
                <span className="text-[10px] font-semibold">Transactions</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#3fb950]" />
              </div>
              <div className="text-base font-bold font-mono text-[#f0f6fc]">
                {transactionsCount}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
              <div className="flex items-center justify-between text-[#8b949e]">
                <span className="text-[10px] font-semibold">Khata Records</span>
                <HandCoins className="w-3.5 h-3.5 text-[#d29922]" />
              </div>
              <div className="text-base font-bold font-mono text-[#d29922]">
                {debtsCount}
              </div>
            </div>
          </div>

          {/* Account Details Metadata */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider text-[10px] text-[#8b949e]">
              User Details
            </h4>
            <div className="rounded-xl border border-[#30363d] bg-[#0d1117] divide-y divide-[#30363d]">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#8b949e] flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>User Name</span>
                </span>
                <span className="font-semibold text-[#f0f6fc] text-xs">
                  {user.name}
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#8b949e] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </span>
                <span className="font-mono text-[#f0f6fc] text-xs">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#8b949e] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member Since</span>
                </span>
                <span className="text-[#f0f6fc]">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#8b949e] flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Currency</span>
                </span>
                <span className="font-mono font-bold text-[#3fb950]">
                  {user.currency || '₹'} INR (Indian Rupee)
                </span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#8b949e] flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>Display Theme</span>
                </span>
                <button
                  onClick={onToggleTheme}
                  className="gh-btn text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  <span className="text-[10px] text-[#58a6ff]">(Switch)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Controls & Zero Reset */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider text-[10px] text-[#8b949e]">
              Data Actions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleExportData}
                className="gh-btn justify-center py-2 text-xs flex items-center gap-2 hover:border-[#58a6ff] hover:text-[#58a6ff] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="gh-btn justify-center py-2 text-xs flex items-center gap-2 text-[#f85149] border-[#f85149]/30 hover:bg-[#f85149]/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Data to ₹0</span>
              </button>
            </div>
          </div>

          {/* Reset Confirmation Dialog */}
          {isResetConfirmOpen && (
            <div className="p-3.5 rounded-xl bg-[#f85149]/10 border border-[#f85149]/40 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#f85149] font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Reset entire financial workspace to ₹0?</span>
              </div>
              <p className="text-[11px] text-[#c9d1d9]">
                This will clear all transactions, reset your account balances to ₹0, and clear debts to start fresh.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="gh-btn text-xs py-1 px-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetDataToZero}
                  className="px-3 py-1 rounded bg-[#f85149] hover:bg-[#da3633] text-white font-bold text-xs cursor-pointer"
                >
                  Yes, Reset to ₹0
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#30363d] bg-[#0d1117]">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="gh-btn text-xs py-1.5 px-3 text-[#f85149] hover:bg-[#f85149]/10 border-[#f85149]/30 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="gh-btn gh-btn-primary text-xs py-1.5 px-4 cursor-pointer font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
