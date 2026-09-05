import React from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  Target,
  PiggyBank,
  Landmark,
  BarChart3,
  QrCode,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  Plus,
  Repeat,
  ShieldCheck,
  Flame,
  Trophy,
  HandCoins,
  User as UserIcon,
} from 'lucide-react';
import { User, AppNotification } from '../../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenUpiImport: () => void;
  onOpenStreakModal?: () => void;
  onOpenProfile?: () => void;
  streakCount?: number;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenUpiImport,
  onOpenStreakModal,
  onOpenProfile,
  streakCount = 0,
  onLogout,
  theme,
  onToggleTheme,
  notifications,
  onOpenNotifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const primaryNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
    { id: 'debts', label: 'Khata', icon: HandCoins, badge: 'Udhar' },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'accounts', label: 'Bank Accounts', icon: Landmark },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  ];

  const secondaryNavItems = [
    { id: 'upi-import', label: 'UPI Import', icon: QrCode, badge: 'Instant' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Financial Health', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#0d1117] border-r border-[#30363d] p-4 z-30 justify-between select-none"
    >
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-center px-1 pt-1.5 pb-2 border-b border-[#21262d]/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center justify-center group cursor-pointer bg-transparent border-none p-0 w-full"
            title="MoneyMate Dashboard"
          >
            <img
              src="/moneymate-logo.png"
              alt="MoneyMate"
              className="h-14 w-full max-w-[230px] object-contain drop-shadow-[0_4px_16px_rgba(37,99,235,0.35)] group-hover:scale-[1.03] transition-transform"
            />
          </button>
        </div>

        {/* Quick Add CTA in Sidebar */}
        <div className="px-1">
          <button
            id="sidebar-quick-add-btn"
            onClick={onOpenQuickAdd}
            className="gh-btn gh-btn-primary w-full justify-center text-xs py-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Primary Navigation Items */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-semibold">
            Finance
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] font-semibold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#58a6ff]' : 'text-[#8b949e]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary / Tools Items */}
        <div className="space-y-1 pt-2 border-t border-[#21262d]">
          <div className="px-2.5 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-[#8b949e] font-semibold">
            Tools & Insights
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] font-semibold'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#58a6ff]' : 'text-[#8b949e]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Streak Section */}
      <div className="space-y-3">
        {/* Streak Mini Widget */}
        {onOpenStreakModal && (
          <button
            onClick={onOpenStreakModal}
            className="w-full text-left p-2.5 rounded-lg bg-gradient-to-r from-[#f0883e]/10 to-[#161b22] border border-[#f0883e]/30 hover:border-[#f0883e] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#f0883e]">
                <Flame className="w-3.5 h-3.5 animate-pulse text-[#f0883e]" />
                <span>{streakCount} Day Streak</span>
              </span>
              <span className="text-[10px] font-mono text-[#8b949e] group-hover:text-[#58a6ff]">
                Trophies →
              </span>
            </div>
            <p className="text-[10px] text-[#8b949e] line-clamp-1">
              Daily habit tracker & motivation
            </p>
          </button>
        )}

        {/* Profile & Utilities */}
        <div className="pt-2 border-t border-[#21262d] space-y-2">
          {/* Fast Action Row */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onOpenNotifications}
              className="gh-btn p-1.5 text-[#8b949e] hover:text-[#f0f6fc] relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#58a6ff]" />
              )}
            </button>

            <button
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

            <button
              onClick={() => setActiveTab('settings')}
              className="gh-btn p-1.5 text-[#8b949e] hover:text-[#f0f6fc]"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="gh-btn p-1.5 text-[#f85149] hover:bg-[#f85149]/10 border-[#f85149]/30"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* User Card - Clickable for Profile */}
          <button
            onClick={onOpenProfile}
            id="sidebar-user-profile-card"
            className="w-full p-2.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 flex items-center justify-between text-left cursor-pointer transition-all hover:bg-[#21262d]/60 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#238636] to-[#2ea043] border border-emerald-400/40 shadow-sm flex items-center justify-center text-xs font-black text-white uppercase shrink-0 ring-2 ring-emerald-500/20">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-[#8b949e] font-mono truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <UserIcon className="w-3.5 h-3.5 text-[#8b949e] group-hover:text-[#58a6ff] shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
};

