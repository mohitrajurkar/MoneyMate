import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  GitPullRequest,
  AlertCircle,
  QrCode,
  CreditCard,
  Target,
  Camera,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { User, AppNotification } from '../../types';

interface GitHubNavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onOpenUpiImport: () => void;
  onOpenScreenshotModal?: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenCommandPalette: () => void;
}

export const GitHubNavbar: React.FC<GitHubNavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenUpiImport,
  onOpenScreenshotModal,
  onLogout,
  theme,
  onToggleTheme,
  notifications = [],
  onOpenNotifications,
  onOpenCommandPalette,
}) => {
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#161b22] border-b border-[#30363d] text-[#f0f6fc] text-sm">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: GitHub Octocat & Global Nav */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Authentic GitHub Octocat Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-[#f0f6fc] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
            title="GitHub Home"
          >
            <svg
              height="32"
              aria-hidden="true"
              viewBox="0 0 16 16"
              version="1.1"
              width="32"
              fill="currentColor"
              className="octicon octicon-mark-github"
            >
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
          </button>

          {/* Org / Repo Title on Mobile/Desktop */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold truncate">
            <span
              onClick={() => setActiveTab('dashboard')}
              className="text-[#8b949e] hover:text-[#58a6ff] cursor-pointer"
            >
              moneymate-app
            </span>
            <span className="text-[#8b949e]">/</span>
            <span
              onClick={() => setActiveTab('dashboard')}
              className="text-[#f0f6fc] hover:text-[#58a6ff] font-bold cursor-pointer truncate"
            >
              moneymate
            </span>
            <span className="hidden sm:inline-block px-2 py-0.2 rounded-full text-[11px] font-mono text-[#8b949e] border border-[#30363d]">
              Public
            </span>
          </div>
        </div>

        {/* Center: Search / Command Palette Input */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] text-xs text-[#8b949e] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Type <kbd className="font-mono text-[#f0f6fc]">/</kbd> to search transactions, issues, tabs...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: GitHub Action Icons & Profile */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Copilot Finance Button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] cursor-pointer"
            title="Copilot Finance"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a371f7]" />
            <span className="hidden lg:inline">Copilot</span>
          </button>

          {/* Create '+' Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setCreateDropdownOpen(!createDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#f0f6fc] text-xs font-medium cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-[#8b949e]" />
            </button>

            {createDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenQuickAdd();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span>New Transaction</span>
                </button>
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    onOpenUpiImport();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#a371f7]" />
                  <span>Import UPI SMS / Text</span>
                </button>
                {onOpenScreenshotModal && (
                  <button
                    onClick={() => {
                      setCreateDropdownOpen(false);
                      onOpenScreenshotModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span>Scan Bill Screenshot</span>
                  </button>
                )}
                <div className="my-1 border-t border-[#30363d]" />
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setActiveTab('pulls');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <GitPullRequest className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span>New Pull Request (Transfer)</span>
                </button>
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setActiveTab('issues');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#d29922]" />
                  <span>New Issue (Dispute / Bill)</span>
                </button>
                <button
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setActiveTab('goals');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[#f0f6fc] hover:bg-[#1f6feb] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Coins className="w-3.5 h-3.5 text-[#f0883e]" />
                  <span>New Gullak Savings Goal</span>
                </button>
              </div>
            )}
          </div>

          {/* Issues Shortcut */}
          <button
            onClick={() => setActiveTab('issues')}
            className="hidden sm:flex p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            title="Issues"
          >
            <AlertCircle className="w-4 h-4" />
          </button>

          {/* Pull Requests Shortcut */}
          <button
            onClick={() => setActiveTab('pulls')}
            className="hidden sm:flex p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            title="Pull Requests"
          >
            <GitPullRequest className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#58a6ff]" />
            )}
          </button>

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setCreateDropdownOpen(false);
              }}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-[#58a6ff] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950 uppercase font-mono">
                {user.name.charAt(0)}
              </div>
              <ChevronDown className="w-2.5 h-2.5 text-[#8b949e]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md bg-[#161b22] border border-[#30363d] shadow-2xl p-1 z-50 text-xs text-[#c9d1d9]">
                <div className="px-3 py-2 border-b border-[#30363d]">
                  <p className="text-[11px] text-[#8b949e]">Signed in as</p>
                  <p className="font-bold text-[#f0f6fc] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#8b949e] font-mono truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onToggleTheme();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-sm hover:bg-[#1f6feb] hover:text-white cursor-pointer"
                  >
                    <span>Theme: {theme === 'dark' ? 'GitHub Dark' : 'GitHub Light'}</span>
                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-[#1f6feb] hover:text-white cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Security & Health</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-[#1f6feb] hover:text-white cursor-pointer"
                  >
                    <span>Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#30363d]">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-sm text-[#f85149] hover:bg-[#da3633] hover:text-white font-medium cursor-pointer"
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
