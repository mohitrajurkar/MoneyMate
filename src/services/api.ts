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
  Debt,
  ParsedUpiData,
} from '../types';
import { DailyStreakInfo, WarrenBuffettQuote } from './streakService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'moneymate_jwt_token';
const USER_KEY = 'moneymate_active_user';

class ApiService {
  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getActiveUser(): User | null {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  public setActiveUser(user: User | null): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized, clear token and active user
      this.setToken(null);
      this.setActiveUser(null);
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // Ignored
      }
      throw new Error(errorMessage);
    }

    // Return JSON if present
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return {} as T;
  }

  /* -------------------------------- Auth -------------------------------- */

  public async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    this.setToken(res.token);
    this.setActiveUser(res.user);
    return res;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
    this.setToken(res.token);
    this.setActiveUser(res.user);
    return res;
  }

  public async getMe(): Promise<User> {
    const user = await this.request<User>('/api/auth/me');
    this.setActiveUser(user);
    return user;
  }

  public logout(): void {
    this.setToken(null);
    this.setActiveUser(null);
  }

  public async updateProfile(data: { name?: string; avatar?: string; currency?: string }): Promise<User> {
    const user = await this.request<User>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.setActiveUser(user);
    return user;
  }

  public async resetUserData(): Promise<void> {
    await this.request('/api/users/reset-data', {
      method: 'POST',
    });
  }

  /* ------------------------------ Accounts ------------------------------ */

  public async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>('/api/accounts');
  }

  public async saveAccount(
    account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Account> {
    if (account.id) {
      return this.request<Account>(`/api/accounts/${account.id}`, {
        method: 'PUT',
        body: JSON.stringify(account),
      });
    }
    return this.request<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  public async setDefaultAccount(accountId: string): Promise<Account[]> {
    return this.request<Account[]>(`/api/accounts/${accountId}/default`, {
      method: 'POST',
    });
  }

  public async deleteAccount(accountId: string): Promise<void> {
    await this.request(`/api/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  /* ----------------------------- Categories ----------------------------- */

  public async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  public async saveCategory(
    category: Omit<Category, 'id' | 'userId'> & { id?: string }
  ): Promise<Category> {
    if (category.id) {
      return this.request<Category>(`/api/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
    }
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    await this.request(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  /* ---------------------------- Transactions ---------------------------- */

  public async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/api/transactions');
  }

  public async addTransaction(
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateTransaction(
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteTransaction(id: string): Promise<void> {
    await this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  /* ------------------------------- Budgets ------------------------------ */

  public async getBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>('/api/budgets');
  }

  public async saveBudget(
    budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'spent'> & { id?: string }
  ): Promise<Budget> {
    if (budget.id) {
      return this.request<Budget>(`/api/budgets/${budget.id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      });
    }
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  public async deleteBudget(id: string): Promise<void> {
    await this.request(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  /* ---------------------------- Savings Goals --------------------------- */

  public async getSavingsGoals(): Promise<SavingsGoal[]> {
    return this.request<SavingsGoal[]>('/api/goals');
  }

  public async saveSavingsGoal(
    goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<SavingsGoal> {
    if (goal.id) {
      return this.request<SavingsGoal>(`/api/goals/${goal.id}`, {
        method: 'PUT',
        body: JSON.stringify(goal),
      });
    }
    return this.request<SavingsGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  public async updateGoalDeposit(goalId: string, amountChange: number): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/goals/${goalId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amountChange }),
    });
  }

  public async deleteSavingsGoal(id: string): Promise<void> {
    await this.request(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  }

  /* ---------------------------- Subscriptions --------------------------- */

  public async getSubscriptions(): Promise<Subscription[]> {
    return this.request<Subscription[]>('/api/subscriptions');
  }

  public async saveSubscription(
    sub: Omit<Subscription, 'id' | 'userId'> & { id?: string }
  ): Promise<Subscription> {
    if (sub.id) {
      return this.request<Subscription>(`/api/subscriptions/${sub.id}`, {
        method: 'PUT',
        body: JSON.stringify(sub),
      });
    }
    return this.request<Subscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(sub),
    });
  }

  public async deleteSubscription(id: string): Promise<void> {
    await this.request(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  /* -------------------------------- Debts ------------------------------- */

  public async getDebts(): Promise<Debt[]> {
    return this.request<Debt[]>('/api/debts');
  }

  public async saveDebt(
    debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'status'> & Partial<Debt>
  ): Promise<Debt> {
    if (debt.id) {
      return this.request<Debt>(`/api/debts/${debt.id}`, {
        method: 'PUT',
        body: JSON.stringify(debt),
      });
    }
    return this.request<Debt>('/api/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    });
  }

  public async recordDebtRepayment(
    debtId: string,
    amount: number,
    accountId?: string,
    notes?: string
  ): Promise<Debt> {
    return this.request<Debt>(`/api/debts/${debtId}/repay`, {
      method: 'POST',
      body: JSON.stringify({ amount, accountId, notes }),
    });
  }

  public async settleDebt(debtId: string): Promise<Debt> {
    return this.request<Debt>(`/api/debts/${debtId}/settle`, {
      method: 'POST',
    });
  }

  public async deleteDebt(id: string): Promise<void> {
    await this.request(`/api/debts/${id}`, {
      method: 'DELETE',
    });
  }

  /* ---------------------------- Notifications --------------------------- */

  public async getNotifications(): Promise<AppNotification[]> {
    return this.request<AppNotification[]>('/api/notifications');
  }

  public async markNotificationRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  public async clearAllNotifications(): Promise<void> {
    await this.request('/api/notifications', {
      method: 'DELETE',
    });
  }

  /* -------------------------- Financial Health -------------------------- */

  public async getFinancialHealth(): Promise<FinancialHealthScore> {
    return this.request<FinancialHealthScore>('/api/insights/health');
  }

  /* ------------------------------- Streaks ------------------------------ */

  public async getStreakInfo(): Promise<DailyStreakInfo> {
    return this.request<DailyStreakInfo>('/api/streaks');
  }

  public async recordDailyCheckIn(): Promise<{ success: boolean; streak: number; message: string }> {
    return this.request<{ success: boolean; streak: number; message: string }>('/api/streaks/check-in', {
      method: 'POST',
    });
  }

  public async recoverStreak(): Promise<{ success: boolean; streak: number; message: string }> {
    return this.request<{ success: boolean; streak: number; message: string }>('/api/streaks/recover', {
      method: 'POST',
    });
  }

  public async getQuote(): Promise<WarrenBuffettQuote> {
    return this.request<WarrenBuffettQuote>('/api/streaks/quote');
  }

  public async shuffleQuote(): Promise<WarrenBuffettQuote> {
    return this.request<WarrenBuffettQuote>('/api/streaks/quote/shuffle', {
      method: 'POST',
    });
  }

  /* ----------------------- Screenshot OCR Parsing ----------------------- */

  public async parseScreenshot(imageBase64: string, mimeType: string = 'image/png'): Promise<{
    success: boolean;
    source: string;
    data: ParsedUpiData;
  }> {
    return this.request<{
      success: boolean;
      source: string;
      data: ParsedUpiData;
    }>('/api/parse-screenshot', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  }
}

export const apiService = new ApiService();
