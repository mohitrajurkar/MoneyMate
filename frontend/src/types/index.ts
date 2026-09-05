export type AccountType = 'BANK' | 'CREDIT_CARD' | 'UPI_WALLET' | 'CASH' | 'INVESTMENT';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type TransactionSource = 
  | 'MANUAL' 
  | 'GOOGLE_PAY' 
  | 'PHONEPE' 
  | 'PAYTM' 
  | 'SLICE'
  | 'CRED'
  | 'BHIM'
  | 'AMAZON_PAY'
  | 'BANK_SMS' 
  | 'UPI_IMPORT'
  | 'SCREENSHOT_AUTO_LOG';

export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  accountType: AccountType;
  balance: number; // For credit cards, this represents credit limit or outstanding balance
  creditLimit?: number; // Optional limit for credit cards
  maskedAccountNumber: string;
  icon: string;
  color: string;
  isDefault: boolean;
  institutionName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId: string;
  amount: number;
  transactionType: TransactionType;
  merchant: string;
  description: string;
  paymentMethod: string; // UPI, NetBanking, Card, Cash, etc.
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm:ss
  upiRefId?: string;
  source: TransactionSource;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  month: number; // 1-12
  year: number;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  categoryId: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  icon?: string;
  reminderDays?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ALERT';
  read: boolean;
  createdAt: string;
}

export interface ParsedUpiData {
  amount: number;
  merchant: string;
  transactionType: TransactionType;
  paymentMethod: string;
  upiRefId?: string;
  vpa?: string;
  date?: string;
  time?: string;
  description?: string;
  suggestedCategory: string;
  source: TransactionSource;
  rawText: string;
  confidence: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType?: 'UPI_REF' | 'EXACT_MATCH' | 'SIMILAR';
  existingTransaction?: Transaction;
  message?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  savingsRate: number; // percentage
  budgetAdherence: number; // percentage
  spendingConsistency: number; // percentage
  debtRatio: number; // percentage
  insights: string[];
}

export type DebtType = 'LENT' | 'BORROWED'; // LENT = You gave money (You'll get), BORROWED = You took money (You owe)
export type DebtStatus = 'PENDING' | 'PARTIAL' | 'SETTLED';

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface DebtRecord {
  id: string;
  userId: string;
  type: DebtType;
  personName: string;
  phone?: string;
  amount: number;
  paidAmount: number;
  status: DebtStatus;
  dueDate?: string;
  createdDate: string;
  notes?: string;
  payments: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export type Debt = DebtRecord;

