import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from './services/api';
import {
  User,
  Account,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  Subscription,
  AppNotification,
  Debt,
  FinancialHealthScore,
} from './types';
import { AuroraAuth } from './components/auth/AuroraAuth';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GitHubCommandPalette as CommandPalette } from './components/common/GitHubCommandPalette';
import { Dashboard } from './components/dashboard/Dashboard';
import { UpiImportView } from './components/upi/UpiImportView';
import { TransactionListView } from './components/transactions/TransactionListView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { AccountsView } from './components/accounts/AccountsView';
import { AddAccountModal } from './components/accounts/AddAccountModal';
import { BudgetsView } from './components/budgets/BudgetsView';
import { SavingsGoalsView } from './components/savings/SavingsGoalsView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { InsightsView } from './components/insights/InsightsView';
import { DebtsView } from './components/debts/DebtsView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { SettingsView } from './components/settings/SettingsView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { StreakModal } from './components/streaks/StreakModal';
import { streakService, DailyStreakInfo } from './services/streakService';

export default function App() {
  const [user, setUser] = useState<User | null>(() => apiService.getActiveUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Application Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore>({
    score: 85,
    rating: 'Good',
    savingsRate: 35,
    budgetAdherence: 90,
    spendingConsistency: 80,
    debtRatio: 10,
    insights: ['Keep tracking your expenses to build financial freedom!'],
  });
  const [streakInfo, setStreakInfo] = useState<DailyStreakInfo | null>(null);

  // Modals & Palette
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [initialTxnDate, setInitialTxnDate] = useState<string | undefined>(undefined);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Global Keyboard Shortcuts (⌘K, Ctrl+K, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load User Data from Spring Boot Backend
  const refreshAppData = useCallback(async () => {
    const token = apiService.getToken();
    if (!token) return;

    try {
      const [
        accs,
        txns,
        cats,
        buds,
        goals,
        subs,
        notifs,
        debtList,
        health,
        streak,
      ] = await Promise.all([
        apiService.getAccounts().catch(() => []),
        apiService.getTransactions().catch(() => []),
        apiService.getCategories().catch(() => []),
        apiService.getBudgets().catch(() => []),
        apiService.getSavingsGoals().catch(() => []),
        apiService.getSubscriptions().catch(() => []),
        apiService.getNotifications().catch(() => []),
        apiService.getDebts().catch(() => []),
        apiService.getFinancialHealth().catch(() => null),
        apiService.getStreakInfo().catch(() => null),
      ]);

      setAccounts(accs);
      setTransactions(txns);
      setCategories(cats);
      setBudgets(buds);
      setSavingsGoals(goals);
      setSubscriptions(subs);
      setNotifications(notifs);
      setDebts(debtList);
      if (health) setHealthScore(health);
      if (streak) setStreakInfo(streak);
    } catch (err) {
      console.error('Failed to load application data from backend:', err);
    }
  }, []);

  useEffect(() => {
    if (user && apiService.getToken()) {
      refreshAppData();
    }
  }, [user, refreshAppData]);

  // Validate active session
  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      apiService
        .getMe()
        .then((currentUser) => {
          setUser(currentUser);
        })
        .catch(() => {
          apiService.logout();
          setUser(null);
        });
    } else {
      setUser(null);
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('moneymate:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('moneymate:auth-expired', handleAuthExpired);
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    refreshAppData();
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  // Transaction Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (!user) return;
    try {
      if (id) {
        await apiService.updateTransaction(id, data);
      } else {
        await apiService.addTransaction(data);
      }
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteTransaction(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete transaction');
    }
  };

  // Account Handlers
  const handleSaveAccount = async (
    data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (!user) return;
    try {
      await apiService.saveAccount(data);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteAccount(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  const handleSetDefaultAccount = async (accountId: string) => {
    if (!user) return;
    try {
      await apiService.setDefaultAccount(accountId);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to set default account');
    }
  };

  // Budget Handlers
  const handleSaveBudget = async (
    data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'spent'> & { id?: string }
  ) => {
    if (!user) return;
    try {
      await apiService.saveBudget(data);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteBudget(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  // Savings Goal Handlers
  const handleSaveGoal = async (
    data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (!user) return;
    try {
      await apiService.saveSavingsGoal(data);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save savings goal');
    }
  };

  const handleUpdateGoalDeposit = async (goalId: string, amountChange: number) => {
    if (!user) return;
    try {
      await apiService.updateGoalDeposit(goalId, amountChange);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to update deposit');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteSavingsGoal(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  // Subscriptions Handlers
  const handleSaveSubscription = async (
    data: Omit<Subscription, 'id' | 'userId'> & { id?: string }
  ) => {
    if (!user) return;
    try {
      await apiService.saveSubscription(data);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteSubscription(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subscription');
    }
  };

  // Debt Handlers
  const handleSaveDebt = async (
    data: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (!user) return;
    try {
      await apiService.saveDebt(data);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to save debt record');
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (!user) return;
    try {
      await apiService.deleteDebt(id);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete debt');
    }
  };

  const handleRecordDebtRepayment = async (debtId: string, amount: number, accountId?: string) => {
    if (!user) return;
    try {
      await apiService.recordDebtRepayment(debtId, amount, accountId);
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to record repayment');
    }
  };

  // Notification Handlers
  const handleMarkNotifRead = async (id: string) => {
    if (!user) return;
    try {
      await apiService.markNotificationRead(id);
      await refreshAppData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClearAllNotifs = async () => {
    if (!user) return;
    try {
      await apiService.clearAllNotifications();
      await refreshAppData();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Reset Data to ₹0 handler
  const handleResetDataToZero = async () => {
    if (!user) return;
    try {
      await apiService.resetUserData();
      await refreshAppData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset data');
    }
  };

  // If not logged in, render Authentication screen
  if (!user) {
    return (
      <AuroraAuth
        onAuthSuccess={handleLoginSuccess}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const streakCount = streakInfo ? streakInfo.currentStreak : streakService.calculateStreak(transactions).currentStreak;

  return (
    <div
      id="moneymate-app-root"
      className={`min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans antialiased selection:bg-[#1f6feb] selection:text-white transition-colors relative flex ${
        theme === 'light' ? 'theme-light !bg-[#f8fafc] !text-[#0f172a]' : 'theme-dark'
      }`}
    >
      {/* 1. Sleek Navigation Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => {
          setEditingTxn(null);
          setIsTxnModalOpen(true);
        }}
        onOpenUpiImport={() => setActiveTab('upi-import')}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        streakCount={streakCount}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        notifications={notifications}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpiImport={() => setActiveTab('upi-import')}
          onOpenStreakModal={() => setIsStreakModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          streakCount={streakCount}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          notifications={notifications}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          {/* Main Dashboard */}
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              accounts={accounts}
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              savingsGoals={savingsGoals}
              debts={debts}
              healthScore={healthScore}
              onOpenQuickAdd={(defaultDate?: string) => {
                setEditingTxn(null);
                setInitialTxnDate(defaultDate || undefined);
                setIsTxnModalOpen(true);
              }}
              onEditTransaction={(txn) => {
                setEditingTxn(txn);
                setInitialTxnDate(undefined);
                setIsTxnModalOpen(true);
              }}
              onOpenUpiImport={() => setActiveTab('upi-import')}
              onOpenStreakModal={() => setIsStreakModalOpen(true)}
              onNavigateTab={setActiveTab}
              onStreakUpdated={() => refreshAppData()}
            />
          )}

          {/* Transactions / Ledger */}
          {activeTab === 'transactions' && (
            <TransactionListView
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              onAddTransaction={() => {
                setEditingTxn(null);
                setIsTxnModalOpen(true);
              }}
              onEditTransaction={(txn) => {
                setEditingTxn(txn);
                setIsTxnModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenUpiImport={() => setActiveTab('upi-import')}
            />
          )}

          {/* Debts & Borrowings (Lent & Borrowed) */}
          {activeTab === 'debts' && (
            <DebtsView
              debts={debts}
              accounts={accounts}
              onSaveDebt={handleSaveDebt}
              onDeleteDebt={handleDeleteDebt}
              onRecordRepayment={handleRecordDebtRepayment}
              onRefresh={refreshAppData}
            />
          )}

          {/* Direct UPI Ingestion */}
          {activeTab === 'upi-import' && (
            <UpiImportView
              accounts={accounts}
              categories={categories}
              existingTransactions={transactions}
              onSaveTransaction={(data) => {
                handleSaveTransaction(data);
                setActiveTab('transactions');
              }}
              onClose={() => setActiveTab('dashboard')}
            />
          )}

          {/* Accounts & Bank Vaults */}
          {activeTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
              onSetDefaultAccount={handleSetDefaultAccount}
              onOpenTransferModal={() => {
                setEditingTxn(null);
                setIsTxnModalOpen(true);
              }}
            />
          )}

          {/* Budgets Guardrails */}
          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              categories={categories}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {/* Digital Gullak Savings Goals */}
          {activeTab === 'goals' && (
            <SavingsGoalsView
              goals={savingsGoals}
              onSaveGoal={handleSaveGoal}
              onUpdateGoalDeposit={handleUpdateGoalDeposit}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {/* Subscriptions */}
          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              categories={categories}
              onSaveSubscription={handleSaveSubscription}
              onDeleteSubscription={handleDeleteSubscription}
            />
          )}

          {/* Insights & Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              categories={categories}
              accounts={accounts}
            />
          )}

          {/* Financial Health & Security */}
          {activeTab === 'insights' && (
            <InsightsView
              healthScore={healthScore}
              accounts={accounts}
              budgets={budgets}
              transactions={transactions}
            />
          )}

          {/* Settings */}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => {
          setEditingTxn(null);
          setIsTxnModalOpen(true);
        }}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onOpenQuickAdd={() => {
          setEditingTxn(null);
          setIsTxnModalOpen(true);
        }}
        onOpenUpiImport={() => setActiveTab('upi-import')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        transactions={transactions}
        accounts={accounts}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxnModalOpen}
        onClose={() => {
          setIsTxnModalOpen(false);
          setInitialTxnDate(undefined);
        }}
        accounts={accounts}
        categories={categories}
        initialData={editingTxn}
        initialDate={initialTxnDate}
        onSave={(data, id) => {
          handleSaveTransaction(data, id);
          setInitialTxnDate(undefined);
        }}
        onOpenAddAccount={() => setIsAddAccountModalOpen(true)}
      />

      {/* Add / Setup Bank Account Modal */}
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onSaveAccount={handleSaveAccount}
        existingAccounts={accounts}
        isOnboarding={accounts.length === 0}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onClearAll={handleClearAllNotifs}
      />

      {/* Streak & Motivation Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        transactions={transactions}
        onOpenQuickAdd={() => {
          setEditingTxn(null);
          setIsTxnModalOpen(true);
        }}
        onCheckInSuccess={() => refreshAppData()}
      />

      {/* User Profile & Account Details Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onResetDataToZero={handleResetDataToZero}
        accountsCount={accounts.length}
        transactionsCount={transactions.length}
        debtsCount={debts.length}
        budgetsCount={budgets.length}
        goalsCount={savingsGoals.length}
        onLogout={handleLogout}
      />
    </div>
  );
}
