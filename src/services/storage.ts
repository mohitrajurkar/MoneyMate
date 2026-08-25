import {
  User,
  Account,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Subscription,
  AppNotification,
  FinancialHealthScore,
  TransactionType,
  DebtRecord,
  DebtType,
  DebtStatus,
  DebtPayment,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'moneymate_users',
  ACTIVE_USER: 'moneymate_active_user',
  ACCOUNTS: 'moneymate_accounts',
  CATEGORIES: 'moneymate_categories',
  TRANSACTIONS: 'moneymate_transactions',
  BUDGETS: 'moneymate_budgets',
  SAVINGS_GOALS: 'moneymate_savings_goals',
  SUBSCRIPTIONS: 'moneymate_subscriptions',
  NOTIFICATIONS: 'moneymate_notifications',
  DEBTS: 'moneymate_debts',
  THEME: 'moneymate_theme',
};

// Seed default categories
export const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'INCOME' as const, icon: 'Wallet', color: '#10B981' },
  { name: 'Investments', type: 'BOTH' as const, icon: 'TrendingUp', color: '#6366F1' },
  { name: 'Refund / Cashback', type: 'INCOME' as const, icon: 'Gift', color: '#EC4899' },
  { name: 'Food & Dining', type: 'EXPENSE' as const, icon: 'Utensils', color: '#F59E0B' },
  { name: 'Shopping', type: 'EXPENSE' as const, icon: 'ShoppingBag', color: '#8B5CF6' },
  { name: 'Transportation', type: 'EXPENSE' as const, icon: 'Car', color: '#3B82F6' },
  { name: 'Groceries', type: 'EXPENSE' as const, icon: 'ShoppingCart', color: '#10B981' },
  { name: 'Bills & Utilities', type: 'EXPENSE' as const, icon: 'Zap', color: '#EF4444' },
  { name: 'Entertainment', type: 'EXPENSE' as const, icon: 'Film', color: '#F43F5E' },
  { name: 'Housing & Rent', type: 'EXPENSE' as const, icon: 'Home', color: '#06B6D4' },
  { name: 'Healthcare', type: 'EXPENSE' as const, icon: 'HeartPulse', color: '#14B8A6' },
  { name: 'Education', type: 'EXPENSE' as const, icon: 'BookOpen', color: '#F97316' },
  { name: 'General & Misc', type: 'EXPENSE' as const, icon: 'Tag', color: '#6B7280' },
];

class StorageService {
  // Simple helper
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            Authentication & Users                          */
  /* -------------------------------------------------------------------------- */

  public getActiveUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.ACTIVE_USER, null);
  }

  public setActiveUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.ACTIVE_USER, user);
  }

  public getAllUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public registerUser(name: string, email: string, passwordHash?: string): User {
    const users = this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: passwordHash || 'user_hash',
      role: 'USER',
      currency: '₹',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setActiveUser(newUser);

    // Initialize user's seed workspace
    this.seedUserWorkspace(newUser.id, newUser.name);

    return newUser;
  }

  public loginUser(email: string, _password?: string): User {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No user found with this email address. Please create an account.');
    }
    this.setActiveUser(user);
    return user;
  }

  public logoutUser(): void {
    this.setActiveUser(null);
  }

  /**
   * Initializes workspace categories and budgets for a new user with clean zero state
   */
  public seedUserWorkspace(userId: string, userName: string): void {
    // 1. Categories
    const categories: Category[] = DEFAULT_CATEGORIES.map((c, i) => ({
      id: `cat_${userId}_${i}`,
      userId,
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color,
      isDefault: true,
    }));
    const allCategories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    this.setItem(
      STORAGE_KEYS.CATEGORIES,
      allCategories.filter((c) => c.userId !== userId).concat(categories)
    );

    // 2. Accounts - Clean start with 0 accounts so user adds their actual bank account upon login
    const allAccounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    this.setItem(
      STORAGE_KEYS.ACCOUNTS,
      allAccounts.filter((a) => a.userId !== userId)
    );

    // 3. Transactions - Clean zero start (no fake dummy transactions)
    const allTxns = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    this.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      allTxns.filter((t) => t.userId !== userId)
    );

    // 4. Budgets - Clean start with 0 spent
    const getCatId = (name: string) => categories.find((c) => c.name === name)?.id || categories[0]?.id || `cat_${userId}_0`;
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const budgets: Budget[] = [
      {
        id: `bud_${userId}_1`,
        userId,
        categoryId: getCatId('Food & Dining'),
        amount: 5000,
        spent: 0,
        month: curMonth,
        year: curYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: `bud_${userId}_2`,
        userId,
        categoryId: getCatId('Shopping'),
        amount: 5000,
        spent: 0,
        month: curMonth,
        year: curYear,
        createdAt: new Date().toISOString(),
      },
      {
        id: `bud_${userId}_3`,
        userId,
        categoryId: getCatId('Bills & Utilities'),
        amount: 3000,
        spent: 0,
        month: curMonth,
        year: curYear,
        createdAt: new Date().toISOString(),
      },
    ];
    const allBudgets = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    this.setItem(
      STORAGE_KEYS.BUDGETS,
      allBudgets.filter((b) => b.userId !== userId).concat(budgets)
    );

    // 5. Savings Goals - Clean zero start
    const allGoals = this.getItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
    this.setItem(
      STORAGE_KEYS.SAVINGS_GOALS,
      allGoals.filter((g) => g.userId !== userId)
    );

    // 6. Subscriptions - Clean zero start
    const allSubs = this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    this.setItem(
      STORAGE_KEYS.SUBSCRIPTIONS,
      allSubs.filter((s) => s.userId !== userId)
    );

    // 7. Debts - Clean zero start
    const allDebts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    this.setItem(
      STORAGE_KEYS.DEBTS,
      allDebts.filter((d) => d.userId !== userId)
    );

    // 8. Notifications
    const notifications: AppNotification[] = [
      {
        id: `notif_${userId}_welcome`,
        userId,
        title: 'Welcome to MoneyMate! 🎉',
        message: 'Your clean personal finance workspace is ready. Add your bank account to start tracking expenses.',
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const allNotifs = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    this.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      allNotifs.filter((n) => n.userId !== userId).concat(notifications)
    );
  }

  /**
   * Retrieves current active user or returns null
   */
  public ensureActiveUser(): User | null {
    return this.getActiveUser();
  }

  /* -------------------------------------------------------------------------- */
  /*                            Transactions & Accounts                         */
  /* -------------------------------------------------------------------------- */

  public getAccounts(userId: string): Account[] {
    const all = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    let userAccs = all.filter((a) => a.userId === userId);

    // Auto-clean any legacy dummy accounts if real custom accounts exist
    const hasCustomAccs = userAccs.some((a) => !a.id.match(/^acc_[^_]+_[123]$/));
    if (hasCustomAccs) {
      userAccs = userAccs.filter((a) => !a.id.match(/^acc_[^_]+_[123]$/));
      const cleanedAll = all.filter((a) => a.userId !== userId).concat(userAccs);
      this.setItem(STORAGE_KEYS.ACCOUNTS, cleanedAll);
    }

    return userAccs;
  }

  public getCategories(userId: string): Category[] {
    const all = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    return all.filter((c) => c.userId === userId);
  }

  public getTransactions(userId: string): Transaction[] {
    const all = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return all
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.transactionDate + ' ' + b.transactionTime).getTime() - new Date(a.transactionDate + ' ' + a.transactionTime).getTime());
  }

  public getBudgets(userId: string): Budget[] {
    const all = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    return all.filter((b) => b.userId === userId);
  }

  public getSavingsGoals(userId: string): SavingsGoal[] {
    const all = this.getItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
    return all.filter((g) => g.userId === userId);
  }

  public getSubscriptions(userId: string): Subscription[] {
    const all = this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    return all.filter((s) => s.userId === userId);
  }

  public getNotifications(userId: string): AppNotification[] {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.userId === userId);
  }

  /**
   * Atomic Balance Calculation Engine (@Transactional Equivalent)
   *
   * Bank/Cash/UPI/Investment:
   *   Income  -> balance += amount
   *   Expense -> balance -= amount
   *
   * Credit Card:
   *   Expense -> outstanding balance += amount
   *   Income  -> outstanding balance -= amount (credit card bill payment)
   */
  private applyAccountBalance(account: Account, amount: number, type: TransactionType, isReversal = false): Account {
    const direction = isReversal ? -1 : 1;
    let newBalance = account.balance;

    if (account.accountType === 'CREDIT_CARD') {
      if (type === 'EXPENSE' || type === 'TRANSFER') {
        newBalance += amount * direction; // debt increases
      } else if (type === 'INCOME') {
        newBalance -= amount * direction; // debt decreases
      }
    } else {
      if (type === 'INCOME') {
        newBalance += amount * direction;
      } else if (type === 'EXPENSE' || type === 'TRANSFER') {
        newBalance -= amount * direction;
      }
    }

    return {
      ...account,
      balance: Math.round(newBalance * 100) / 100,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Create Transaction with atomic account balance update and budget tracking
   */
  public addTransaction(
    userId: string,
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Transaction {
    const accounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    const accountIndex = accounts.findIndex((a) => a.id === data.accountId && a.userId === userId);

    if (accountIndex === -1) {
      throw new Error('Associated financial account not found.');
    }

    // 1. Create transaction entity
    const newTxn: Transaction = {
      ...data,
      id: `txn_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Update primary account balance atomically
    accounts[accountIndex] = this.applyAccountBalance(
      accounts[accountIndex],
      data.amount,
      data.transactionType,
      false
    );

    // If transfer between accounts:
    if (data.transactionType === 'TRANSFER' && data.toAccountId) {
      const destIndex = accounts.findIndex((a) => a.id === data.toAccountId && a.userId === userId);
      if (destIndex !== -1) {
        // primary account decreased, dest account increased
        accounts[destIndex] = this.applyAccountBalance(
          accounts[destIndex],
          data.amount,
          'INCOME',
          false
        );
      }
    }

    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);

    // 3. Save transaction
    const allTxns = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    allTxns.unshift(newTxn);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, allTxns);

    // 4. Update Budget spent if applicable
    this.recalculateBudgets(userId);

    return newTxn;
  }

  /**
   * Edit Transaction with atomic balance reversal and re-application
   */
  public updateTransaction(
    userId: string,
    id: string,
    updatedData: Partial<Transaction>
  ): Transaction {
    const allTxns = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const txnIndex = allTxns.findIndex((t) => t.id === id && t.userId === userId);
    if (txnIndex === -1) throw new Error('Transaction not found.');

    const oldTxn = allTxns[txnIndex];
    const accounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);

    // 1. Reverse old transaction impact
    const oldAccIndex = accounts.findIndex((a) => a.id === oldTxn.accountId && a.userId === userId);
    if (oldAccIndex !== -1) {
      accounts[oldAccIndex] = this.applyAccountBalance(
        accounts[oldAccIndex],
        oldTxn.amount,
        oldTxn.transactionType,
        true // reversal
      );
    }
    if (oldTxn.transactionType === 'TRANSFER' && oldTxn.toAccountId) {
      const oldDestIndex = accounts.findIndex((a) => a.id === oldTxn.toAccountId && a.userId === userId);
      if (oldDestIndex !== -1) {
        accounts[oldDestIndex] = this.applyAccountBalance(
          accounts[oldDestIndex],
          oldTxn.amount,
          'INCOME',
          true // reversal of dest deposit
        );
      }
    }

    // 2. Merge new values
    const newTxn: Transaction = {
      ...oldTxn,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    allTxns[txnIndex] = newTxn;

    // 3. Apply new transaction impact
    const newAccIndex = accounts.findIndex((a) => a.id === newTxn.accountId && a.userId === userId);
    if (newAccIndex !== -1) {
      accounts[newAccIndex] = this.applyAccountBalance(
        accounts[newAccIndex],
        newTxn.amount,
        newTxn.transactionType,
        false
      );
    }
    if (newTxn.transactionType === 'TRANSFER' && newTxn.toAccountId) {
      const newDestIndex = accounts.findIndex((a) => a.id === newTxn.toAccountId && a.userId === userId);
      if (newDestIndex !== -1) {
        accounts[newDestIndex] = this.applyAccountBalance(
          accounts[newDestIndex],
          newTxn.amount,
          'INCOME',
          false
        );
      }
    }

    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, allTxns);
    this.recalculateBudgets(userId);

    return newTxn;
  }

  /**
   * Delete Transaction with atomic balance reversal
   */
  public deleteTransaction(userId: string, id: string): void {
    const allTxns = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const txn = allTxns.find((t) => t.id === id && t.userId === userId);
    if (!txn) return;

    // Reverse balance
    const accounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    const accIndex = accounts.findIndex((a) => a.id === txn.accountId && a.userId === userId);
    if (accIndex !== -1) {
      accounts[accIndex] = this.applyAccountBalance(
        accounts[accIndex],
        txn.amount,
        txn.transactionType,
        true // reversal
      );
    }
    if (txn.transactionType === 'TRANSFER' && txn.toAccountId) {
      const destIndex = accounts.findIndex((a) => a.id === txn.toAccountId && a.userId === userId);
      if (destIndex !== -1) {
        accounts[destIndex] = this.applyAccountBalance(
          accounts[destIndex],
          txn.amount,
          'INCOME',
          true // reversal of dest deposit
        );
      }
    }
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);

    const filtered = allTxns.filter((t) => !(t.id === id && t.userId === userId));
    this.setItem(STORAGE_KEYS.TRANSACTIONS, filtered);
    this.recalculateBudgets(userId);
  }

  /**
   * Recalculates spent amounts for all monthly budgets based on transactions
   */
  public recalculateBudgets(userId: string): void {
    const budgets = this.getBudgets(userId);
    const txns = this.getTransactions(userId);
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const updated = budgets.map((b) => {
      if (b.month === curMonth && b.year === curYear) {
        const spent = txns
          .filter((t) => {
            if (t.categoryId !== b.categoryId || t.transactionType !== 'EXPENSE') return false;
            const d = new Date(t.transactionDate);
            return d.getMonth() + 1 === curMonth && d.getFullYear() === curYear;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        return { ...b, spent };
      }
      return b;
    });

    const allBudgets = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    this.setItem(
      STORAGE_KEYS.BUDGETS,
      allBudgets.filter((b) => b.userId !== userId).concat(updated)
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                            Accounts Management                             */
  /* -------------------------------------------------------------------------- */

  public saveAccount(userId: string, account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }): Account {
    const all = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    const userAccounts = all.filter((a) => a.userId === userId);
    
    // If it's user's first account or marked default, ensure default status
    const shouldBeDefault = account.isDefault !== undefined 
      ? account.isDefault 
      : userAccounts.length === 0;

    if (shouldBeDefault) {
      all.forEach((a) => {
        if (a.userId === userId) {
          a.isDefault = false;
        }
      });
    }

    if (account.id) {
      const idx = all.findIndex((a) => a.id === account.id && a.userId === userId);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          ...account,
          isDefault: shouldBeDefault,
          updatedAt: new Date().toISOString(),
        };
        this.setItem(STORAGE_KEYS.ACCOUNTS, all);
        return all[idx];
      }
    }

    const newAcc: Account = {
      ...account,
      id: `acc_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      isDefault: shouldBeDefault,
      maskedAccountNumber: account.maskedAccountNumber || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newAcc);
    this.setItem(STORAGE_KEYS.ACCOUNTS, all);
    return newAcc;
  }

  public setDefaultAccount(userId: string, accountId: string): Account[] {
    const all = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    all.forEach((a) => {
      if (a.userId === userId) {
        a.isDefault = a.id === accountId;
        a.updatedAt = new Date().toISOString();
      }
    });
    this.setItem(STORAGE_KEYS.ACCOUNTS, all);
    return all.filter((a) => a.userId === userId);
  }

  public deleteAccount(userId: string, accountId: string): void {
    const all = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
    const remaining = all.filter((a) => !(a.id === accountId && a.userId === userId));
    
    // If deleted account was default, set next available account as default
    const userRemaining = remaining.filter((a) => a.userId === userId);
    if (userRemaining.length > 0 && !userRemaining.some((a) => a.isDefault)) {
      userRemaining[0].isDefault = true;
    }
    
    this.setItem(STORAGE_KEYS.ACCOUNTS, remaining);
  }

  /* -------------------------------------------------------------------------- */
  /*                            Budgets & Goals & Subs                          */
  /* -------------------------------------------------------------------------- */

  public saveBudget(userId: string, budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'spent'> & { id?: string }): Budget {
    const all = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    if (budget.id) {
      const idx = all.findIndex((b) => b.id === budget.id && b.userId === userId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...budget };
        this.setItem(STORAGE_KEYS.BUDGETS, all);
        this.recalculateBudgets(userId);
        return all[idx];
      }
    }

    const newBud: Budget = {
      ...budget,
      id: `bud_${userId}_${Date.now()}`,
      userId,
      spent: 0,
      createdAt: new Date().toISOString(),
    };
    all.push(newBud);
    this.setItem(STORAGE_KEYS.BUDGETS, all);
    this.recalculateBudgets(userId);
    return newBud;
  }

  public deleteBudget(userId: string, id: string): void {
    const all = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    this.setItem(
      STORAGE_KEYS.BUDGETS,
      all.filter((b) => !(b.id === id && b.userId === userId))
    );
  }

  public saveSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }): SavingsGoal {
    const all = this.getItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
    if (goal.id) {
      const idx = all.findIndex((g) => g.id === goal.id && g.userId === userId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...goal, updatedAt: new Date().toISOString() };
        this.setItem(STORAGE_KEYS.SAVINGS_GOALS, all);
        return all[idx];
      }
    }

    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal_${userId}_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newGoal);
    this.setItem(STORAGE_KEYS.SAVINGS_GOALS, all);
    return newGoal;
  }

  public updateGoalDeposit(userId: string, goalId: string, amountChange: number): SavingsGoal {
    const all = this.getItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
    const idx = all.findIndex((g) => g.id === goalId && g.userId === userId);
    if (idx === -1) throw new Error('Goal not found');

    const goal = all[idx];
    goal.currentAmount = Math.max(0, goal.currentAmount + amountChange);
    goal.updatedAt = new Date().toISOString();
    all[idx] = goal;
    this.setItem(STORAGE_KEYS.SAVINGS_GOALS, all);
    return goal;
  }

  public deleteSavingsGoal(userId: string, id: string): void {
    const all = this.getItem<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS, []);
    this.setItem(
      STORAGE_KEYS.SAVINGS_GOALS,
      all.filter((g) => !(g.id === id && g.userId === userId))
    );
  }

  public saveSubscription(userId: string, sub: Omit<Subscription, 'id' | 'userId'> & { id?: string }): Subscription {
    const all = this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    if (sub.id) {
      const idx = all.findIndex((s) => s.id === sub.id && s.userId === userId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...sub };
        this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, all);
        return all[idx];
      }
    }

    const newSub: Subscription = {
      ...sub,
      id: `sub_${userId}_${Date.now()}`,
      userId,
    };
    all.push(newSub);
    this.setItem(STORAGE_KEYS.SUBSCRIPTIONS, all);
    return newSub;
  }

  public deleteSubscription(userId: string, id: string): void {
    const all = this.getItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    this.setItem(
      STORAGE_KEYS.SUBSCRIPTIONS,
      all.filter((s) => !(s.id === id && s.userId === userId))
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                            Notifications Center                            */
  /* -------------------------------------------------------------------------- */

  public markNotificationRead(userId: string, id: string): void {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = all.findIndex((n) => n.id === id && n.userId === userId);
    if (idx !== -1) {
      all[idx].read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  public clearAllNotifications(userId: string): void {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    this.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      all.filter((n) => n.userId !== userId)
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                    Financial Health & Rule-based Insights                  */
  /* -------------------------------------------------------------------------- */

  public calculateFinancialHealth(userId: string): FinancialHealthScore {
    const accounts = this.getAccounts(userId);
    const txns = this.getTransactions(userId);
    const budgets = this.getBudgets(userId);

    const totalIncome = txns
      .filter((t) => t.transactionType === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = txns
      .filter((t) => t.transactionType === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // 1. Savings Rate (0 - 100) -> 35% weight
    const netSavings = Math.max(0, totalIncome - totalExpense);
    const savingsRate = totalIncome > 0 ? Math.min(100, Math.round((netSavings / totalIncome) * 100)) : 0;

    // 2. Budget Adherence (0 - 100) -> 30% weight
    let budgetAdherence = 100;
    if (budgets.length > 0) {
      const withinBudgetCount = budgets.filter((b) => b.spent <= b.amount).length;
      budgetAdherence = Math.round((withinBudgetCount / budgets.length) * 100);
    }

    // 3. Spending Consistency (0 - 100) -> 20% weight
    const spendingConsistency = totalIncome > 0 && totalExpense / totalIncome < 0.7 ? 88 : 65;

    // 4. Debt Ratio (0 - 100) -> 15% weight
    const creditDebt = accounts
      .filter((a) => a.accountType === 'CREDIT_CARD')
      .reduce((sum, a) => sum + a.balance, 0);

    const liquidAssets = accounts
      .filter((a) => a.accountType !== 'CREDIT_CARD')
      .reduce((sum, a) => sum + a.balance, 0);

    const debtRatio = liquidAssets > 0 ? Math.min(100, Math.round((creditDebt / liquidAssets) * 100)) : 0;
    const debtHealthScore = Math.max(0, 100 - debtRatio * 2);

    // Composite Score (0 - 100)
    const compositeScore = Math.round(
      savingsRate * 0.35 +
      budgetAdherence * 0.30 +
      spendingConsistency * 0.20 +
      debtHealthScore * 0.15
    );

    const finalScore = Math.min(100, Math.max(10, compositeScore));

    let rating: FinancialHealthScore['rating'] = 'Needs Attention';
    if (finalScore >= 80) rating = 'Excellent';
    else if (finalScore >= 65) rating = 'Good';
    else if (finalScore >= 45) rating = 'Fair';

    const insights: string[] = [];
    if (savingsRate >= 30) {
      insights.push(`Strong savings rate of ${savingsRate}%. You are outpacing inflation!`);
    } else {
      insights.push(`Your current savings rate is ${savingsRate}%. Aim for at least 25% of monthly income.`);
    }

    const overBudgetList = budgets.filter((b) => b.spent > b.amount);
    if (overBudgetList.length > 0) {
      insights.push(`Warning: ${overBudgetList.length} budget categories have exceeded their limit this month.`);
    } else {
      insights.push('Great discipline! All active budgets are currently within allocated limits.');
    }

    if (creditDebt > 0 && debtRatio < 20) {
      insights.push(`Your credit utilization is healthy at ${debtRatio}% of total liquid assets.`);
    } else if (creditDebt > 0) {
      insights.push(`Consider clearing ₹${creditDebt.toLocaleString('en-IN')} credit card outstanding to avoid interest.`);
    }

    return {
      score: finalScore,
      rating,
      savingsRate,
      budgetAdherence,
      spendingConsistency,
      debtRatio,
      insights,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                             Debt / Udhaar Tracker                          */
  /* -------------------------------------------------------------------------- */

  public getDebts(userId: string): DebtRecord[] {
    const allDebts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    return allDebts.filter((d) => d.userId === userId);
  }

  public saveDebt(
    userIdOrDebt: string | (Omit<DebtRecord, 'id' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'status'> & Partial<DebtRecord>),
    maybeDebtData?: Omit<DebtRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'status'> & Partial<DebtRecord>
  ): DebtRecord {
    const debtData: any = typeof userIdOrDebt === 'string'
      ? { ...maybeDebtData, userId: userIdOrDebt }
      : userIdOrDebt;

    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    const now = new Date().toISOString();

    if (debtData.id) {
      const existingIdx = debts.findIndex((d) => d.id === debtData.id);
      if (existingIdx !== -1) {
        const existing = debts[existingIdx];
        const paid = Number(debtData.paidAmount ?? existing.paidAmount) || 0;
        const total = Number(debtData.amount ?? existing.amount) || 0;
        const status: DebtStatus = paid >= total ? 'SETTLED' : paid > 0 ? 'PARTIAL' : 'PENDING';

        debts[existingIdx] = {
          ...existing,
          ...debtData,
          amount: total,
          paidAmount: paid,
          status,
          updatedAt: now,
        };
        this.setItem(STORAGE_KEYS.DEBTS, debts);
        return debts[existingIdx];
      }
    }

    const totalAmount = Number(debtData.amount) || 0;
    const paidAmount = Number(debtData.paidAmount) || 0;
    const status: DebtStatus = debtData.status || (paidAmount >= totalAmount ? 'SETTLED' : paidAmount > 0 ? 'PARTIAL' : 'PENDING');

    const newDebt: DebtRecord = {
      id: debtData.id || `debt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: debtData.userId,
      type: debtData.type || 'LENT',
      personName: (debtData.personName || 'Person').trim(),
      phone: debtData.phone?.trim() || '',
      amount: totalAmount,
      paidAmount: paidAmount,
      status,
      dueDate: debtData.dueDate || '',
      createdDate: debtData.createdDate || new Date().toISOString().split('T')[0],
      notes: debtData.notes?.trim() || '',
      payments: debtData.payments || [],
      createdAt: debtData.createdAt || now,
      updatedAt: now,
    };

    debts.unshift(newDebt);
    this.setItem(STORAGE_KEYS.DEBTS, debts);
    return newDebt;
  }

  public updateDebt(debt: DebtRecord): void {
    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    const index = debts.findIndex((d) => d.id === debt.id);
    if (index !== -1) {
      // Re-evaluate status
      let status: DebtStatus = 'PENDING';
      if (debt.paidAmount >= debt.amount) {
        status = 'SETTLED';
      } else if (debt.paidAmount > 0) {
        status = 'PARTIAL';
      }
      debts[index] = {
        ...debt,
        status,
        updatedAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.DEBTS, debts);
    }
  }

  public deleteDebt(userIdOrId: string, maybeId?: string): void {
    const id = maybeId || userIdOrId;
    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    this.setItem(
      STORAGE_KEYS.DEBTS,
      debts.filter((d) => d.id !== id)
    );
  }

  public recordDebtPayment(debtId: string, amount: number, notes?: string): DebtRecord {
    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) throw new Error('Record not found');

    const paymentAmount = Math.max(0, Number(amount) || 0);
    const newPaidAmount = debt.paidAmount + paymentAmount;
    const newStatus: DebtStatus = newPaidAmount >= debt.amount ? 'SETTLED' : 'PARTIAL';

    const newPayment: DebtPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      notes: notes || 'Partial repayment',
    };

    debt.paidAmount = newPaidAmount;
    debt.status = newStatus;
    debt.payments = [...(debt.payments || []), newPayment];
    debt.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.DEBTS, debts);
    return debt;
  }

  public recordDebtRepayment(
    userId: string,
    debtId: string,
    amount: number,
    accountId?: string,
    notes?: string
  ): DebtRecord {
    const updated = this.recordDebtPayment(debtId, amount, notes);

    // If linked account specified, automatically adjust balance
    if (accountId && amount > 0) {
      const accounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
      const accIdx = accounts.findIndex((a) => a.id === accountId);
      if (accIdx !== -1) {
        // If it was money you LENT, repayment means cash INFLOW (positive)
        // If it was money you BORROWED, repayment means cash OUTFLOW (negative)
        const delta = updated.type === 'LENT' ? amount : -amount;
        accounts[accIdx].balance += delta;
        accounts[accIdx].updatedAt = new Date().toISOString();
        this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
      }
    }

    return updated;
  }

  public resetUserDataToZero(userId: string): void {
    this.resetUserFinancialDataToZero(userId);
  }


  public settleDebt(debtId: string): DebtRecord {
    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []);
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) throw new Error('Record not found');

    const remaining = Math.max(0, debt.amount - debt.paidAmount);
    if (remaining > 0) {
      debt.payments = [
        ...(debt.payments || []),
        {
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          amount: remaining,
          date: new Date().toISOString().split('T')[0],
          notes: 'Full settlement marked',
        },
      ];
    }
    debt.paidAmount = debt.amount;
    debt.status = 'SETTLED';
    debt.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.DEBTS, debts);
    return debt;
  }

  /**
   * Resets all user financial data to zero balances and empty logs
   */
  public resetUserFinancialDataToZero(userId: string): void {
    // 1. Reset accounts to 0 balance
    const accounts = this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []).map((acc) => {
      if (acc.userId === userId) {
        return { ...acc, balance: 0, updatedAt: new Date().toISOString() };
      }
      return acc;
    });
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);

    // 2. Remove user transactions
    const txns = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []).filter(
      (t) => t.userId !== userId
    );
    this.setItem(STORAGE_KEYS.TRANSACTIONS, txns);

    // 3. Remove user debts
    const debts = this.getItem<DebtRecord[]>(STORAGE_KEYS.DEBTS, []).filter(
      (d) => d.userId !== userId
    );
    this.setItem(STORAGE_KEYS.DEBTS, debts);

    // 4. Reset budgets spent to 0
    const budgets = this.getItem<Budget[]>(STORAGE_KEYS.BUDGETS, []).map((b) => {
      if (b.userId === userId) {
        return { ...b, spent: 0 };
      }
      return b;
    });
    this.setItem(STORAGE_KEYS.BUDGETS, budgets);
  }

  /* -------------------------------------------------------------------------- */
  /*                             Theme Preferences                              */
  /* -------------------------------------------------------------------------- */

  public getTheme(): 'dark' | 'light' {
    return this.getItem<'dark' | 'light'>(STORAGE_KEYS.THEME, 'light');
  }

  public setTheme(theme: 'dark' | 'light'): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }
}

export const storageService = new StorageService();
