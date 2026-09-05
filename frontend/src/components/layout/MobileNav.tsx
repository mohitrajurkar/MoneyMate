import React from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  HandCoins,
  Landmark,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#161b22]/95 backdrop-blur-md border-t border-[#30363d] px-2 py-1.5 shadow-2xl transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Overview */}
        <button
          id="mobile-nav-overview"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-[#58a6ff] font-bold'
              : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        {/* Transactions */}
        <button
          id="mobile-nav-transactions"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'text-[#58a6ff] font-bold'
              : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          <ArrowUpDown className="w-5 h-5" />
          <span className="text-[10px]">Transactions</span>
        </button>

        {/* + Action Button */}
        <button
          id="mobile-nav-quick-add"
          onClick={onOpenQuickAdd}
          className="w-10 h-10 -mt-3 rounded-full bg-[#238636] hover:bg-[#2ea043] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer border-2 border-[#161b22]"
          aria-label="Add transaction"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Khata (Lent & Borrowed) */}
        <button
          id="mobile-nav-debts"
          onClick={() => setActiveTab('debts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors cursor-pointer ${
            activeTab === 'debts'
              ? 'text-[#58a6ff] font-bold'
              : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          <HandCoins className="w-5 h-5 text-[#3fb950]" />
          <span className="text-[10px]">Khata</span>
        </button>

        {/* Accounts */}
        <button
          id="mobile-nav-accounts"
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors cursor-pointer ${
            activeTab === 'accounts'
              ? 'text-[#58a6ff] font-bold'
              : 'text-[#8b949e] hover:text-[#f0f6fc]'
          }`}
        >
          <Landmark className="w-5 h-5" />
          <span className="text-[10px]">Accounts</span>
        </button>
      </div>
    </nav>
  );
};
