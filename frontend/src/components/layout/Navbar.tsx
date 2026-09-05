import React, { useState } from 'react';
import {
  Wallet,
  QrCode,
  Bell,
  LogOut,
  Moon,
  Sun,
  Search,
  ShieldCheck,
  Flame,
  User as UserIcon,
  HandCoins,
} from 'lucide-react';
import { User, AppNotification } from '../../types';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpiImport: () => void;
  onOpenStreakModal?: () => void;
  onOpenProfile?: () => void;
  streakCount?: number;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenUpiImport,
  onOpenStreakModal,
  onOpenProfile,
  streakCount = 0,
  onLogout,
  theme,
  onToggleTheme,
  notifications,
  onOpenNotifications,
  onOpenCommandPalette,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Overview', subtitle: 'Finance summary and cash flow' },
    transactions: { title: 'Transactions', subtitle: 'Income, expenses, and transfers' },
    debts: { title: 'Khata', subtitle: 'Lent and borrowed money' },
    goals: { title: 'Savings Goals', subtitle: 'Savings targets and progress' },
    budgets: { title: 'Budgets', subtitle: 'Monthly spending limits' },
    accounts: { title: 'Bank Accounts', subtitle: 'Bank accounts and cards' },
    'upi-import': { title: 'UPI Import', subtitle: 'Direct payment import' },
    analytics: { title: 'Analytics', subtitle: 'Spending trends and breakdown' },
    insights: { title: 'Financial Health', subtitle: 'Score and financial insights' },
    subscriptions: { title: 'Subscriptions', subtitle: 'Recurring bills' },
    settings: { title: 'Settings', subtitle: 'Preferences and backup' },
  };

  const currentMeta = tabTitles[activeTab] || { title: 'MoneyMate', subtitle: 'Personal Finance' };

  return (
    <header
      id="main-top-header"
      className="sticky top-0 z-30 w-full bg-[#161b22] border-b border-[#30363d] px-4 sm:px-6 py-2.5 transition-colors text-[#f0f6fc]"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Brand or Desktop Page Context */}
        <div className="flex items-center gap-3">
          {/* Mobile Only Brand */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center cursor-pointer bg-transparent border-none p-0"
              title="MoneyMate Dashboard"
            >
              <img
                src="/moneymate-logo.png"
                alt="MoneyMate"
                className="h-10 w-auto max-w-[160px] object-contain drop-shadow-[0_2px_10px_rgba(37,99,235,0.3)]"
              />
            </button>
          </div>

          {/* Desktop Page Title / Breadcrumb */}
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2">
              <span>{currentMeta.title}</span>
            </h1>
            <p className="text-[11px] text-[#8b949e] font-normal">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        {onOpenCommandPalette && (
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between bg-[#0d1117] hover:bg-[#0d1117]/80 border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#8b949e] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Search or type a command...</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#8b949e]">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Right: Key Action Triggers */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Streak Flame Badge */}
          {onOpenStreakModal && (
            <button
              id="header-streak-btn"
              onClick={onOpenStreakModal}
              className="gh-btn text-xs hover:border-[#f0883e] hover:text-[#f0883e] flex items-center gap-1.5 bg-[#f0883e]/10 border-[#f0883e]/30 text-[#f0883e] font-mono font-bold"
              title={`${streakCount}-day streak! Tap to view trophies & daily wisdom`}
            >
              <Flame className="w-3.5 h-3.5 text-[#f0883e] animate-pulse" />
              <span>{streakCount}d</span>
            </button>
          )}

          {/* Direct UPI Share / Import Trigger */}
          <button
            id="header-upi-share-btn"
            onClick={onOpenUpiImport}
            className="gh-btn text-xs hover:border-[#a371f7] hover:text-[#a371f7]"
            title="Import from UPI App"
          >
            <QrCode className="w-3.5 h-3.5 text-[#a371f7]" />
            <span className="hidden sm:inline">UPI Import</span>
          </button>

          {/* Theme Toggle in Header */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleTheme}
            className="gh-btn p-1.5 text-[#8b949e] hover:text-[#f0f6fc]"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#d29922]" />
            ) : (
              <Moon className="w-4 h-4 text-[#58a6ff]" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            id="header-notif-btn"
            onClick={onOpenNotifications}
            className="gh-btn p-1.5 relative text-[#8b949e] hover:text-[#f0f6fc]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#58a6ff]" />
            )}
          </button>

          {/* User Profile & Dropdown */}
          <div className="relative">
            <button
              id="header-user-avatar-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#238636] to-[#2ea043] border border-emerald-400/40 shadow-sm flex items-center justify-center text-xs font-black text-white uppercase cursor-pointer hover:scale-105 transition-transform ring-2 ring-emerald-500/20"
              title="User profile & settings"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>

            {userDropdownOpen && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl p-1.5 z-50 text-[#c9d1d9]"
              >
                <div className="px-3 py-2.5 border-b border-[#30363d] bg-[#0d1117]/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#238636] to-[#2ea043] flex items-center justify-center text-xs font-bold text-white uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#f0f6fc] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#8b949e] font-mono truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  {onOpenProfile && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-[#21262d] text-[#f0f6fc] font-semibold cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#58a6ff]" />
                      <span>View Profile & Details</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('debts');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs hover:bg-[#21262d] text-[#c9d1d9] cursor-pointer"
                  >
                    <HandCoins className="w-3.5 h-3.5 text-[#d29922]" />
                    <span>Debts & Borrowings</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('insights');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs hover:bg-[#21262d] text-[#c9d1d9] cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                    <span>Financial Health</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleTheme();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs hover:bg-[#21262d] text-[#c9d1d9] cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#d29922]" /> : <Moon className="w-3.5 h-3.5 text-[#58a6ff]" />}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#30363d]">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#f85149] hover:bg-[#f85149]/10 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
