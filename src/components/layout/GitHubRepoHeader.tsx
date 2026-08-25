import React, { useState } from 'react';
import {
  Code2,
  AlertCircle,
  GitPullRequest,
  PlaySquare,
  KanbanSquare,
  BookOpen,
  ShieldCheck,
  BarChart3,
  Settings,
  Star,
  GitFork,
  Eye,
  Heart,
  ChevronDown,
  Pin,
} from 'lucide-react';
import { User, AppNotification } from '../../types';

interface GitHubRepoHeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openIssuesCount?: number;
  openPullsCount?: number;
}

export const GitHubRepoHeader: React.FC<GitHubRepoHeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  openIssuesCount = 3,
  openPullsCount = 2,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(142);
  const [isWatching, setIsWatching] = useState(false);
  const [watchCount, setWatchCount] = useState(12);
  const [forkCount, setForkCount] = useState(28);

  const handleStarToggle = () => {
    if (isStarred) {
      setIsStarred(false);
      setStarCount((c) => c - 1);
    } else {
      setIsStarred(true);
      setStarCount((c) => c + 1);
    }
  };

  const navTabs = [
    { id: 'dashboard', label: 'Code', icon: Code2 },
    { id: 'issues', label: 'Issues', icon: AlertCircle, count: openIssuesCount },
    { id: 'pulls', label: 'Pull requests', icon: GitPullRequest, count: openPullsCount },
    { id: 'actions', label: 'Actions', icon: PlaySquare },
    { id: 'goals', label: 'Projects', icon: KanbanSquare, badge: 'Gullak' },
    { id: 'accounts', label: 'Wiki', icon: BookOpen, badge: 'Vaults' },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'analytics', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-[#161b22] border-b border-[#30363d] pt-4 px-3 sm:px-4 lg:px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Repo Title & Action Header Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          {/* Title and Pin */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#8b949e]">
              <span className="hover:text-[#58a6ff] cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                moneymate-app
              </span>
              <span className="mx-1 text-[#8b949e]">/</span>
              <span
                className="text-[#f0f6fc] font-bold hover:text-[#58a6ff] cursor-pointer text-base sm:text-lg"
                onClick={() => setActiveTab('dashboard')}
              >
                moneymate
              </span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-xs font-mono text-[#8b949e] border border-[#30363d] font-medium">
              Public
            </span>

            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-[#58a6ff] bg-[#388bfd]/10 border border-[#388bfd]/20">
              <Pin className="w-3 h-3" /> Pinned Repo
            </span>
          </div>

          {/* Action Buttons (Watch, Fork, Star, Sponsor) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sponsor Button */}
            <button
              onClick={() => setActiveTab('goals')}
              className="gh-btn text-xs hover:border-[#ec4899] hover:text-[#ec4899]"
              title="Sponsor / Gullak Goal Contribution"
            >
              <Heart className="w-3.5 h-3.5 text-[#ec4899] fill-[#ec4899]/20" />
              <span>Sponsor</span>
            </button>

            {/* Watch Button */}
            <div className="inline-flex rounded-md shadow-xs">
              <button
                onClick={() => {
                  setIsWatching(!isWatching);
                  setWatchCount(isWatching ? watchCount - 1 : watchCount + 1);
                }}
                className="gh-btn rounded-r-none border-r-0 text-xs"
              >
                <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>{isWatching ? 'Unwatch' : 'Watch'}</span>
              </button>
              <span className="gh-btn rounded-l-none font-mono text-xs px-2 text-[#8b949e]">
                {watchCount}
              </span>
            </div>

            {/* Fork Button */}
            <div className="inline-flex rounded-md shadow-xs">
              <button
                onClick={() => setForkCount(forkCount + 1)}
                className="gh-btn rounded-r-none border-r-0 text-xs"
              >
                <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Fork</span>
              </button>
              <span className="gh-btn rounded-l-none font-mono text-xs px-2 text-[#8b949e]">
                {forkCount}
              </span>
            </div>

            {/* Star Button */}
            <div className="inline-flex rounded-md shadow-xs">
              <button
                onClick={handleStarToggle}
                className={`gh-btn rounded-r-none border-r-0 text-xs ${
                  isStarred ? 'bg-[#21262d] text-[#e3b341]' : ''
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-[#e3b341] fill-[#e3b341]' : 'text-[#8b949e]'}`} />
                <span>{isStarred ? 'Starred' : 'Star'}</span>
              </button>
              <span className="gh-btn rounded-l-none font-mono text-xs px-2 text-[#8b949e]">
                {starCount}
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeTab === tab.id ||
              (tab.id === 'dashboard' && (activeTab === 'transactions' || activeTab === 'upi-import'));

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer group ${
                  isActive
                    ? 'border-[#f78166] text-[#f0f6fc]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#8b949e]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#f0f6fc]' : 'text-[#8b949e] group-hover:text-[#f0f6fc]'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#30363d] text-[#f0f6fc]'
                        : 'bg-[#21262d] text-[#8b949e] group-hover:text-[#f0f6fc]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="hidden lg:inline-block px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold bg-[#388bfd]/10 text-[#58a6ff] border border-[#388bfd]/20">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
