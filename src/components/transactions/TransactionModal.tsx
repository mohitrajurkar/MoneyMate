import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Info,
  Star,
  Plus,
} from 'lucide-react';
import { Account, AccountType, Category, Transaction, TransactionType } from '../../types';
import { suggestCategoryAndType } from '../../services/upiParser';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  initialData?: Transaction | null;
  initialDate?: string; // YYYY-MM-DD
  onSave: (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => void;
  onOpenAddAccount?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  initialData,
  initialDate,
  onSave,
  onOpenAddAccount,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('EXPENSE');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionDate, setTransactionDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    // Determine default primary account
    const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
    const secondAcc = accounts.find((a) => a.id !== defaultAcc?.id) || accounts[0];

    if (initialData) {
      setAmount(initialData.amount);
      setMerchant(initialData.merchant || '');
      setDescription(initialData.description || '');
      setTransactionType(initialData.transactionType);
      setAccountId(initialData.accountId);
      setToAccountId(initialData.toAccountId || secondAcc?.id || '');
      setCategoryId(initialData.categoryId);
      setPaymentMethod(initialData.paymentMethod || 'UPI');
      setTransactionDate(initialData.transactionDate);
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setMerchant('');
      setDescription('');
      setTransactionType('EXPENSE');
      setAccountId(defaultAcc?.id || '');
      setToAccountId(secondAcc?.id || '');
      setCategoryId((categories && categories[0]?.id) || '');
      setPaymentMethod('UPI');
      setTransactionDate(initialDate || new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setBalanceError(null);
  }, [initialData, initialDate, accounts, categories, isOpen]);

  // Real-time balance validation
  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setBalanceError(null);
      return;
    }

    const numAmount = Number(amount);

    if (transactionType === 'EXPENSE') {
      const selectedAcc = accounts.find((a) => a.id === accountId);
      if (selectedAcc && selectedAcc.accountType !== 'CREDIT_CARD' && selectedAcc.balance < numAmount) {
        setBalanceError(
          `Insufficient Balance Error: "${selectedAcc.name}" has only ₹${selectedAcc.balance.toLocaleString('en-IN')}, but your expense is ₹${numAmount.toLocaleString('en-IN')}. Please select another account or lower the amount.`
        );
        return;
      }
    } else if (transactionType === 'TRANSFER') {
      const fromAcc = accounts.find((a) => a.id === accountId);
      if (fromAcc && fromAcc.accountType !== 'CREDIT_CARD' && fromAcc.balance < numAmount) {
        setBalanceError(
          `Insufficient Balance Error: Source account "${fromAcc.name}" has only ₹${fromAcc.balance.toLocaleString('en-IN')}, which is less than the transfer amount of ₹${numAmount.toLocaleString('en-IN')}.`
        );
        return;
      }
      if (accountId === toAccountId && accounts.length > 1) {
        setBalanceError('Source and destination accounts cannot be the same.');
        return;
      }
    }

    setBalanceError(null);
  }, [amount, accountId, toAccountId, transactionType, accounts]);

  // Smart category suggestion when typing merchant
  const handleMerchantChange = (val: string) => {
    setMerchant(val);
    if (!initialData && val.length > 2) {
      const suggestion = suggestCategoryAndType(val);
      const match = (categories || []).find(
        (c) => c.name.toLowerCase() === suggestion.category.toLowerCase()
      );
      if (match) {
        setCategoryId(match.id);
        setTransactionType(suggestion.type);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    if (!accountId) {
      setBalanceError('Please select a bank account.');
      return;
    }

    const numAmount = Number(amount);

    // Validate account balance for expense
    if (transactionType === 'EXPENSE') {
      const selectedAcc = accounts.find((a) => a.id === accountId);
      if (selectedAcc && selectedAcc.accountType !== 'CREDIT_CARD' && selectedAcc.balance < numAmount) {
        setBalanceError(
          `Insufficient Balance: ${selectedAcc.name} has only ₹${selectedAcc.balance.toLocaleString('en-IN')}, but expense is ₹${numAmount.toLocaleString('en-IN')}.`
        );
        return;
      }
    }

    // Validate account balance for transfer
    if (transactionType === 'TRANSFER') {
      const fromAcc = accounts.find((a) => a.id === accountId);
      if (fromAcc && fromAcc.accountType !== 'CREDIT_CARD' && fromAcc.balance < numAmount) {
        setBalanceError(
          `Insufficient Balance: ${fromAcc.name} has only ₹${fromAcc.balance.toLocaleString('en-IN')}, which is less than the transfer amount.`
        );
        return;
      }
    }

    onSave(
      {
        amount: numAmount,
        merchant:
          merchant.trim() ||
          (transactionType === 'INCOME'
            ? 'Income'
            : transactionType === 'TRANSFER'
            ? 'Account Transfer'
            : 'Expense'),
        description:
          description.trim() ||
          merchant.trim() ||
          (transactionType === 'INCOME'
            ? 'Income'
            : transactionType === 'TRANSFER'
            ? 'Account Transfer'
            : 'Expense'),
        transactionType,
        accountId,
        toAccountId: transactionType === 'TRANSFER' ? toAccountId : undefined,
        categoryId,
        paymentMethod,
        transactionDate,
        transactionTime: new Date().toTimeString().split(' ')[0],
        source: 'MANUAL',
        tags: [paymentMethod, merchant.trim()].filter(Boolean),
        notes: notes.trim(),
      },
      initialData?.id
    );

    onClose();
  };

  const filteredCategories = categories.filter((c) => {
    if (transactionType === 'INCOME') return c.type === 'INCOME' || c.type === 'BOTH';
    if (transactionType === 'EXPENSE') return c.type === 'EXPENSE' || c.type === 'BOTH';
    return true;
  });

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'BANK':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'UPI_WALLET':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'CREDIT_CARD':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'INVESTMENT':
        return <TrendingUp className="w-3.5 h-3.5" />;
      default:
        return <Wallet className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      id="quick-add-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="quick-add-content"
        className="w-full sm:max-w-lg max-h-[94dvh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl text-[#c9d1d9] relative animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#30363d] bg-[#161b22] rounded-t-2xl sm:rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
            <h2 className="text-sm font-bold text-[#f0f6fc]">
              {initialData ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 space-y-4">
            {/* 1. Transaction Type Segmented Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#161b22] border border-[#30363d]">
              {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTransactionType(type)}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    transactionType === type
                      ? type === 'EXPENSE'
                        ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40 shadow-sm font-bold'
                        : type === 'INCOME'
                        ? 'bg-[#238636]/25 text-[#3fb950] border border-[#238636]/50 shadow-sm font-bold'
                        : 'bg-[#1f6feb]/25 text-[#58a6ff] border border-[#1f6feb]/50 shadow-sm font-bold'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/50'
                  }`}
                >
                  {type === 'EXPENSE' ? 'Expense' : type === 'INCOME' ? 'Income' : 'Transfer'}
                </button>
              ))}
            </div>

            {/* 2. Amount Input Hero */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] text-center">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e] block mb-1">
                Transaction Amount
              </label>
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#f0f6fc] font-mono">₹</span>
                <input
                  id="quick-add-amount-input"
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === '' ? '' : Math.abs(parseFloat(e.target.value)))
                  }
                  className="w-44 sm:w-52 text-center text-3xl sm:text-4xl font-bold bg-transparent border-none text-[#f0f6fc] focus:outline-none placeholder:text-[#484f58] font-mono tracking-tight"
                />
              </div>
              {amount ? (
                <p className="text-[11px] text-[#3fb950] font-mono mt-0.5">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </p>
              ) : (
                <p className="text-[10px] text-[#8b949e] mt-0.5">Enter numeric amount in ₹</p>
              )}
            </div>

            {/* Insufficient Balance Error Notification */}
            {balanceError && (
              <div
                id="insufficient-balance-alert"
                className="p-3 rounded-lg bg-red-950/70 border border-red-800/60 text-red-200 text-xs flex items-start gap-2 animate-in fade-in duration-150 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-red-300">Balance Warning</div>
                  <div>{balanceError}</div>
                </div>
              </div>
            )}

            {/* 3. Merchant / Source / Payee */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#f0f6fc] flex items-center justify-between">
                <span>
                  {transactionType === 'EXPENSE'
                    ? 'Merchant / Store'
                    : transactionType === 'INCOME'
                    ? 'Source / Payer'
                    : 'Transfer Purpose'}
                </span>
                <span className="text-[10px] text-[#8b949e] font-normal">e.g. Swiggy, Salary, Rent</span>
              </label>
              <input
                id="quick-add-merchant-input"
                type="text"
                placeholder={
                  transactionType === 'EXPENSE'
                    ? 'e.g. Swiggy, Amazon, Uber'
                    : transactionType === 'INCOME'
                    ? 'e.g. Monthly Salary, Freelance, Dividend'
                    : 'e.g. Savings deposit, Credit card bill'
                }
                value={merchant}
                onChange={(e) => handleMerchantChange(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff] transition-colors"
              />
            </div>

            {/* 4. Category Selector (Only for Expense & Income) */}
            {transactionType !== 'TRANSFER' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#f0f6fc] flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-[10px] text-[#8b949e] font-mono">
                    {filteredCategories.find((c) => c.id === categoryId)?.name || 'Select'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-[#161b22]/60 rounded-md border border-[#30363d]">
                  {(filteredCategories.length > 0 ? filteredCategories : categories).map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/50 font-semibold'
                            : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                        }`}
                      >
                        <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[120px]">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. All Available Accounts Selector with Low Balance Badges */}
            {accounts.length === 0 ? (
              <div className="p-3.5 rounded-lg bg-[#161b22] border border-dashed border-[#30363d] text-center space-y-2">
                <p className="text-xs text-[#8b949e]">No bank accounts found in your workspace.</p>
                {onOpenAddAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddAccount();
                    }}
                    className="gh-btn gh-btn-primary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bank Account</span>
                  </button>
                )}
              </div>
            ) : transactionType === 'TRANSFER' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    From Account ({accounts.length} available)
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] font-mono"
                  >
                    {accounts.map((acc) => {
                      const isLow =
                        Number(amount) > 0 &&
                        acc.accountType !== 'CREDIT_CARD' &&
                        acc.balance < Number(amount);
                      return (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (₹{acc.balance.toLocaleString('en-IN')}){' '}
                          {isLow ? '⚠️ LOW BALANCE' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    To Destination Account
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] font-mono"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (₹{acc.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                    Select Account ({accounts.length} Available)
                  </label>
                  <span className="text-[10px] text-[#8b949e]">
                    Selected:{' '}
                    <strong className="text-[#f0f6fc]">
                      {accounts.find((a) => a.id === accountId)?.name || 'None'}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {accounts.map((acc) => {
                    const isSelected = accountId === acc.id;
                    const isLowBalance =
                      transactionType === 'EXPENSE' &&
                      Number(amount) > 0 &&
                      acc.accountType !== 'CREDIT_CARD' &&
                      acc.balance < Number(amount);

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccountId(acc.id)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? isLowBalance
                              ? 'bg-red-950/40 border-red-600 text-red-100 ring-1 ring-red-500'
                              : 'bg-[#1f6feb]/20 border-[#58a6ff] text-[#f0f6fc] ring-1 ring-[#58a6ff]/40 shadow-sm'
                            : isLowBalance
                            ? 'bg-[#161b22] border-red-900/40 text-[#8b949e] hover:border-red-600'
                            : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#484f58] hover:text-[#f0f6fc]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="shrink-0 text-[#8b949e]">
                            {getAccountIcon(acc.accountType)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate text-[#f0f6fc] flex items-center gap-1">
                              <span>{acc.name}</span>
                              {acc.isDefault && (
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-[#8b949e] font-mono">
                              ₹{acc.balance.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {isLowBalance && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-900/60 text-red-200 border border-red-700 shrink-0">
                            Low Balance
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Payment Method & Date in compact row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['UPI', 'CARD', 'NET_BANKING', 'CASH'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-1 rounded text-[10px] font-mono font-medium transition-all cursor-pointer text-center ${
                        paymentMethod === pm
                          ? 'bg-[#a371f7]/20 text-[#d2a8ff] border border-[#a371f7]/50 font-bold'
                          : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                      }`}
                    >
                      {pm === 'NET_BANKING' ? 'NET' : pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#f0f6fc] block">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] font-mono"
                />
              </div>
            </div>

            {/* Optional Remarks */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Add optional remarks, note or tag..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          </div>

          {/* Modal Footer: Fixed at bottom with Action Buttons */}
          <div className="px-4 sm:px-5 py-3 border-t border-[#30363d] bg-[#161b22] rounded-b-2xl sm:rounded-b-xl shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="gh-btn text-xs px-3.5 py-1.5 text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="quick-add-submit-btn"
              type="submit"
              disabled={!amount || Number(amount) <= 0 || !!balanceError}
              className="gh-btn gh-btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{initialData ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
