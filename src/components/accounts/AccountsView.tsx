import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  Plus,
  ArrowRightLeft,
  Trash2,
  Edit2,
  Star,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { Account, AccountType } from '../../types';
import { AddAccountModal } from './AddAccountModal';

interface AccountsViewProps {
  accounts: Account[];
  onSaveAccount: (
    account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => void;
  onDeleteAccount: (id: string) => void;
  onOpenTransferModal: () => void;
  onSetDefaultAccount?: (accountId: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts = [],
  onSaveAccount,
  onDeleteAccount,
  onOpenTransferModal,
  onSetDefaultAccount,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);

  const bankAccounts = (accounts || []).filter((a) => a.accountType !== 'CREDIT_CARD');
  const creditCards = (accounts || []).filter((a) => a.accountType === 'CREDIT_CARD');

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCreditDebt = creditCards.reduce((sum, a) => sum + a.balance, 0);

  const handleOpenAdd = () => {
    setEditingAcc(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAcc(acc);
    setModalOpen(true);
  };

  const handleMakePrimary = (accountId: string) => {
    if (onSetDefaultAccount) {
      onSetDefaultAccount(accountId);
    } else {
      const target = accounts.find((a) => a.id === accountId);
      if (target) {
        onSaveAccount({ ...target, isDefault: true });
      }
    }
  };

  const getAccountIcon = (type: AccountType) => {
    if (type === 'CREDIT_CARD') {
      return <CreditCard className="w-5 h-5 text-[#f85149]" />;
    }
    return <Building2 className="w-5 h-5 text-[#58a6ff]" />;
  };

  return (
    <div id="accounts-view-container" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#58a6ff]" />
            <span>Bank Accounts & Cards</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your linked bank accounts, balances, and primary payment source.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <button
              onClick={onOpenTransferModal}
              className="gh-btn text-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Transfer Funds</span>
            </button>
          )}

          <button
            id="add-account-header-btn"
            onClick={handleOpenAdd}
            className="gh-btn gh-btn-primary text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Total Available Bank Balance</span>
            <Wallet className="w-4 h-4 text-[#3fb950]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#3fb950]">
            ₹{totalBankBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8b949e]">
            Across {bankAccounts.length} {bankAccounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>

        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Linked Accounts & Cards</span>
            <Building2 className="w-4 h-4 text-[#58a6ff]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
            {accounts.length}
          </div>
          <p className="text-[11px] text-[#8b949e]">
            {bankAccounts.length} Bank {bankAccounts.length === 1 ? 'Account' : 'Accounts'}
            {creditCards.length > 0 ? ` • ${creditCards.length} Credit Card${creditCards.length > 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      {/* Accounts List (Single Unified Card Grid) */}
      {accounts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#30363d] rounded-xl bg-[#0d1117] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#f0f6fc]">No Bank Accounts Linked Yet</h3>
            <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
              Add your primary bank account to start logging expenses and tracking your balances.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="gh-btn gh-btn-primary text-xs px-4 py-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Bank Account</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">
              Your Bank Accounts ({accounts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((acc) => {
              const isPrimary = acc.isDefault || (accounts.length === 1);
              return (
                <div
                  key={acc.id}
                  id={`account-card-${acc.id}`}
                  className={`gh-box p-4 bg-[#0d1117] border rounded-lg flex flex-col justify-between transition-all ${
                    isPrimary
                      ? 'border-[#58a6ff]/40 ring-1 ring-[#58a6ff]/20'
                      : 'border-[#30363d] hover:border-[#484f58]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon, Name, and Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] shrink-0">
                          {getAccountIcon(acc.accountType)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#f0f6fc] truncate" title={acc.name}>
                            {acc.name}
                          </h3>
                          <span className="text-[11px] text-[#8b949e]">
                            {acc.accountType === 'CREDIT_CARD' ? 'Credit Card' : 'Bank Account'}
                          </span>
                        </div>
                      </div>

                      {/* Primary Badge */}
                      {isPrimary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          PRIMARY
                        </span>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="pt-2 border-t border-[#21262d]">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8b949e] block">
                        {acc.accountType === 'CREDIT_CARD' ? 'Outstanding Dues' : 'Available Balance'}
                      </span>
                      <div
                        className={`text-xl font-bold font-mono ${
                          acc.accountType === 'CREDIT_CARD' ? 'text-[#f85149]' : 'text-[#3fb950]'
                        }`}
                      >
                        ₹{acc.balance.toLocaleString('en-IN')}
                      </div>
                      {acc.accountType === 'CREDIT_CARD' && acc.creditLimit && (
                        <div className="text-[10px] text-[#8b949e] font-mono mt-0.5">
                          Limit: ₹{acc.creditLimit.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#21262d]">
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(acc.id)}
                        className="text-[11px] text-[#58a6ff] hover:underline font-medium cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set as Primary</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Default Source</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${acc.name}"?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="p-1.5 rounded-md text-[#8b949e] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Account Modal */}
      <AddAccountModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAcc(null);
        }}
        onSaveAccount={onSaveAccount}
        existingAccounts={accounts}
        editingAccount={editingAcc}
      />
    </div>
  );
};
