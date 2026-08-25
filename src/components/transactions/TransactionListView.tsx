import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  QrCode,
  Tag,
  Calendar,
} from 'lucide-react';
import { Transaction, Account, Category, TransactionType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDDMMYYYY } from '../../utils/dateUtils';

interface TransactionListViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onAddTransaction: () => void;
  onEditTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenUpiImport: () => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  transactions = [],
  accounts = [],
  categories = [],
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenUpiImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      // Search
      const searchMatch =
        searchTerm === '' ||
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.upiRefId && t.upiRefId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // Type
      const typeMatch = selectedType === 'ALL' || t.transactionType === selectedType;

      // Category
      const catMatch = selectedCategory === 'ALL' || t.categoryId === selectedCategory;

      // Account
      const accMatch = selectedAccount === 'ALL' || t.accountId === selectedAccount;

      return searchMatch && typeMatch && catMatch && accMatch;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedAccount]);

  // Sort Logic
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.transactionDate + ' ' + b.transactionTime).getTime() - new Date(a.transactionDate + ' ' + a.transactionTime).getTime();
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.transactionDate + ' ' + a.transactionTime).getTime() - new Date(b.transactionDate + ' ' + b.transactionTime).getTime();
      }
      if (sortBy === 'AMOUNT_DESC') {
        return b.amount - a.amount;
      }
      if (sortBy === 'AMOUNT_ASC') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategory = (catId: string) =>
    (categories || []).find((c) => c.id === catId);

  const getAccountName = (accId: string) =>
    (accounts || []).find((a) => a.id === accId)?.name || 'Account';

  return (
    <div id="transactions-view-container" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-[#58a6ff]" />
            <span>Transactions</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Complete transaction records with instant search and category filters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpiImport}
            className="gh-btn text-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>UPI Import</span>
          </button>

          <button
            onClick={onAddTransaction}
            className="gh-btn gh-btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search merchant, notes, UPI Ref..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfers</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Results Count */}
        <div className="flex items-center justify-between pt-2 border-t border-[#30363d] text-xs text-[#8b949e]">
          <span>
            Showing <strong className="text-[#f0f6fc] font-mono">{paginatedTransactions.length}</strong> of <strong className="text-[#f0f6fc] font-mono">{filteredTransactions.length}</strong> entries
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8b949e]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#161b22] border border-[#30363d] rounded-md px-2 py-0.5 text-xs text-[#f0f6fc] focus:outline-none font-mono"
            >
              <option value="DATE_DESC">Newest First</option>
              <option value="DATE_ASC">Oldest First</option>
              <option value="AMOUNT_DESC">Highest Amount</option>
              <option value="AMOUNT_ASC">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-[#8b949e] text-xs">No transactions match your current search or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                setSelectedAccount('ALL');
              }}
              className="gh-btn text-xs"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {paginatedTransactions.map((t) => {
              const isIncome = t.transactionType === 'INCOME';
              const isTransfer = t.transactionType === 'TRANSFER';
              const cat = getCategory(t.categoryId);

              return (
                <div
                  key={t.id}
                  className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#161b22]/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-[#f0f6fc] truncate">
                          {t.merchant}
                        </span>
                        {t.source !== 'MANUAL' && (
                          <span className="px-1.5 py-0.2 rounded bg-[#388bfd]/20 text-[#58a6ff] text-[9px] font-mono border border-[#388bfd]/30">
                            {t.source.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e] truncate mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <CategoryIcon icon={cat?.icon} className="w-3 h-3 text-[#58a6ff]" />
                          <span>{cat?.name || 'General'}</span>
                        </span>
                        <span>•</span>
                        <span>{getAccountName(t.accountId)}</span>
                        <span>•</span>
                        <span className="font-mono">{formatDDMMYYYY(t.transactionDate)}</span>
                      </div>
                      {t.upiRefId && (
                        <span className="text-[10px] text-[#8b949e] font-mono block">
                          Ref: {t.upiRefId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-xs sm:text-sm font-bold font-mono ${
                          isIncome
                            ? 'text-[#3fb950]'
                            : isTransfer
                            ? 'text-[#58a6ff]'
                            : 'text-[#f0f6fc]'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-[#8b949e] font-mono">
                        {t.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete transaction of ₹${t.amount} to "${t.merchant}"? Balance will be restored.`)) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="gh-btn text-xs px-2.5 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="gh-btn text-xs px-2.5 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
