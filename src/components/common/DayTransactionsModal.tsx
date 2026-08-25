import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit2,
  Tag,
  CreditCard,
  Building2,
  Clock,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Transaction, Account, Category } from '../../types';
import { formatDDMMYYYY, formatDateWithDayName } from '../../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';

interface DayTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  transactions: Transaction[];
  accounts?: Account[];
  categories?: Category[];
  onAddTransactionForDate?: (dateStr: string) => void;
  onEditTransaction?: (txn: Transaction) => void;
}

export const DayTransactionsModal: React.FC<DayTransactionsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  transactions = [],
  accounts = [],
  categories = [],
  onAddTransactionForDate,
  onEditTransaction,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');

  // Transactions on the selected day
  const dayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((t) => t.transactionDate === selectedDate);
  }, [transactions, selectedDate]);

  // Financial calculations for the selected day
  const { totalCredited, totalDebited, totalTransfers, netFlow, closingBalance, openingBalance } =
    useMemo(() => {
      let credited = 0;
      let debited = 0;
      let transfers = 0;

      dayTransactions.forEach((t) => {
        if (t.transactionType === 'INCOME') {
          credited += t.amount;
        } else if (t.transactionType === 'EXPENSE') {
          debited += t.amount;
        } else if (t.transactionType === 'TRANSFER') {
          transfers += t.amount;
        }
      });

      const dayNet = credited - debited;

      // Calculate closing liquid balance on that day end
      // 1. Current total balance across all liquid accounts (Bank, UPI, Cash)
      const currentLiquidBalance = (accounts || [])
        .filter((a) => a.accountType !== 'CREDIT_CARD')
        .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

      // 2. Adjust for all transactions that occurred strictly AFTER selectedDate
      const futureTransactions = (transactions || []).filter(
        (t) => t.transactionDate && t.transactionDate > selectedDate
      );

      const futureExpenses = futureTransactions
        .filter((t) => t.transactionType === 'EXPENSE')
        .reduce((s, t) => s + t.amount, 0);

      const futureIncomes = futureTransactions
        .filter((t) => t.transactionType === 'INCOME')
        .reduce((s, t) => s + t.amount, 0);

      // Day End Closing Balance = Current Balance + Future Expenses - Future Incomes
      const endBalance = currentLiquidBalance + futureExpenses - futureIncomes;
      const startBalance = endBalance - credited + debited;

      return {
        totalCredited: credited,
        totalDebited: debited,
        totalTransfers: transfers,
        netFlow: dayNet,
        closingBalance: endBalance,
        openingBalance: startBalance,
      };
    }, [dayTransactions, transactions, accounts, selectedDate]);

  // Filtered transactions for view
  const filteredList = useMemo(() => {
    if (filterType === 'ALL') return dayTransactions;
    return dayTransactions.filter((t) => t.transactionType === filterType);
  }, [dayTransactions, filterType]);

  if (!isOpen || !selectedDate) return null;

  const formattedDateDDMMYYYY = formatDDMMYYYY(selectedDate);
  const formattedWithDay = formatDateWithDayName(selectedDate);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);
  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Primary Account';
  };

  return (
    <div
      id="day-transactions-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="day-transactions-modal-dialog"
        className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#c9d1d9] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/20 border border-[#1f6feb]/40 flex items-center justify-center text-[#58a6ff]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#f0f6fc] font-mono">
                  {formattedDateDDMMYYYY}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                  {dayTransactions.length} {dayTransactions.length === 1 ? 'Transaction' : 'Transactions'}
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-0.5">
                {formattedWithDay} • Daily Financial Summary & Balance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial KPI Deck for this Day */}
        <div className="p-5 bg-[#0d1117] border-b border-[#30363d] grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Day End Closing Balance */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
              <span>Day-End Balance</span>
              <Wallet className="w-3.5 h-3.5 text-[#58a6ff]" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#f0f6fc] truncate">
              ₹{closingBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono">
              Closing liquid total
            </div>
          </div>

          {/* Total Credited (Income) */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#238636]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#3fb950]">
              <span>Total Credited</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#3fb950] truncate">
              +₹{totalCredited.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono">
              {dayTransactions.filter((t) => t.transactionType === 'INCOME').length} credit entries
            </div>
          </div>

          {/* Total Debited (Expenses) */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#f85149]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#f85149]">
              <span>Total Debited</span>
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#f85149] truncate">
              -₹{totalDebited.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono">
              {dayTransactions.filter((t) => t.transactionType === 'EXPENSE').length} debit entries
            </div>
          </div>

          {/* Net Day Flow */}
          <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
              <span>Net Cash Flow</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#d29922]" />
            </div>
            <div
              className={`text-base sm:text-lg font-bold font-mono truncate ${
                netFlow > 0
                  ? 'text-[#3fb950]'
                  : netFlow < 0
                  ? 'text-[#f85149]'
                  : 'text-[#f0f6fc]'
              }`}
            >
              {netFlow > 0 ? `+₹${netFlow.toLocaleString('en-IN')}` : netFlow < 0 ? `-₹${Math.abs(netFlow).toLocaleString('en-IN')}` : '₹0'}
            </div>
            <div className="text-[10px] text-[#8b949e] font-mono">
              {netFlow >= 0 ? 'Surplus' : 'Deficit'} for day
            </div>
          </div>
        </div>

        {/* Transactions Tab Filter Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#161b22] border-b border-[#30363d] text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              All ({dayTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'EXPENSE'
                  ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Debits ({dayTransactions.filter((t) => t.transactionType === 'EXPENSE').length})
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'INCOME'
                  ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Credits ({dayTransactions.filter((t) => t.transactionType === 'INCOME').length})
            </button>
            {dayTransactions.some((t) => t.transactionType === 'TRANSFER') && (
              <button
                onClick={() => setFilterType('TRANSFER')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filterType === 'TRANSFER'
                    ? 'bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                Transfers
              </button>
            )}
          </div>

          {onAddTransactionForDate && (
            <button
              onClick={() => {
                onClose();
                onAddTransactionForDate(selectedDate);
              }}
              className="gh-btn gh-btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to {formattedDateDDMMYYYY}</span>
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[380px]">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
              <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center mx-auto text-[#8b949e]">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#f0f6fc]">
                  No {filterType === 'ALL' ? '' : filterType.toLowerCase() + ' '}transactions recorded on{' '}
                  <span className="font-mono text-[#58a6ff]">{formattedDateDDMMYYYY}</span>
                </p>
                <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                  Day-end balance stood at{' '}
                  <strong className="font-mono text-[#f0f6fc]">
                    ₹{closingBalance.toLocaleString('en-IN')}
                  </strong>
                  . You can log expenses, income, or UPI payments for this day.
                </p>
              </div>

              {onAddTransactionForDate && (
                <button
                  onClick={() => {
                    onClose();
                    onAddTransactionForDate(selectedDate);
                  }}
                  className="gh-btn gh-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Transaction for {formattedDateDDMMYYYY}</span>
                </button>
              )}
            </div>
          ) : (
            filteredList.map((txn) => {
              const isIncome = txn.transactionType === 'INCOME';
              const isTransfer = txn.transactionType === 'TRANSFER';
              const cat = getCategory(txn.categoryId);
              const acc = accounts.find((a) => a.id === txn.accountId);

              return (
                <div
                  key={txn.id}
                  className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff]/40 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isIncome
                          ? 'bg-[#238636]/15 text-[#3fb950] border-[#238636]/40'
                          : isTransfer
                          ? 'bg-[#1f6feb]/15 text-[#58a6ff] border-[#1f6feb]/40'
                          : 'bg-[#f85149]/15 text-[#f85149] border-[#f85149]/40'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : isTransfer ? (
                        <ArrowUpDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#f0f6fc] text-xs sm:text-sm truncate">
                          {txn.merchant}
                        </span>

                        {txn.source && txn.source !== 'MANUAL' && (
                          <span className="px-1.5 py-0.2 rounded bg-[#388bfd]/20 text-[#58a6ff] text-[9px] font-mono border border-[#388bfd]/30">
                            {txn.source.replace('_', ' ')}
                          </span>
                        )}

                        {txn.transactionTime && (
                          <span className="text-[10px] text-[#8b949e] font-mono flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{txn.transactionTime}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#8b949e] flex-wrap">
                        <span className="inline-flex items-center gap-1 font-medium text-[#c9d1d9]">
                          <CategoryIcon icon={cat?.icon} className="w-3 h-3 text-[#58a6ff]" />
                          <span>{cat?.name || 'General'}</span>
                        </span>
                        <span>•</span>
                        <span>{acc?.name || 'Bank Account'}</span>
                        {txn.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{txn.paymentMethod}</span>
                          </>
                        )}
                      </div>

                      {txn.description && txn.description !== txn.merchant && (
                        <p className="text-[11px] text-[#8b949e] truncate">
                          {txn.description}
                        </p>
                      )}

                      {txn.upiRefId && (
                        <div className="text-[10px] text-[#8b949e] font-mono">
                          UPI Ref: {txn.upiRefId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div
                        className={`font-mono font-bold text-sm sm:text-base ${
                          isIncome
                            ? 'text-[#3fb950]'
                            : isTransfer
                            ? 'text-[#58a6ff]'
                            : 'text-[#f85149]'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}₹
                        {txn.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-mono text-[#8b949e]">
                        {isIncome ? 'Credited' : isTransfer ? 'Transfer' : 'Debited'}
                      </div>
                    </div>

                    {onEditTransaction && (
                      <button
                        onClick={() => {
                          onClose();
                          onEditTransaction(txn);
                        }}
                        className="p-1.5 rounded text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between text-xs">
          <div className="text-[#8b949e] font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            <span>
              Date: <strong className="text-[#f0f6fc]">{formattedDateDDMMYYYY}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="gh-btn text-xs px-3 py-1.5 cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
