import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Check,
  X,
  Star,
  Sparkles,
  Info,
} from 'lucide-react';
import { Account, AccountType } from '../../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAccount: (
    account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => void;
  existingAccounts: Account[];
  editingAccount?: Account | null;
  isOnboarding?: boolean;
}

const POPULAR_BANKS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'IndusInd Bank',
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSaveAccount,
  existingAccounts = [],
  editingAccount = null,
  isOnboarding = false,
}) => {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('BANK');
  const [balance, setBalance] = useState<number | ''>('');
  const [creditLimit, setCreditLimit] = useState<number | ''>('');
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setAccountType(editingAccount.accountType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'BANK');
      setBalance(editingAccount.balance);
      setCreditLimit(editingAccount.creditLimit ?? '');
      setIsDefault(editingAccount.isDefault ?? false);
    } else {
      setName('');
      setAccountType('BANK');
      setBalance('');
      setCreditLimit('');
      setIsDefault(existingAccounts.length === 0);
    }
    setValidationError(null);
  }, [editingAccount, isOpen, existingAccounts.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter a bank account name.');
      return;
    }
    if (balance === '' || isNaN(Number(balance))) {
      setValidationError('Please enter a valid initial balance (e.g. 0).');
      return;
    }

    onSaveAccount({
      id: editingAccount?.id,
      name: name.trim(),
      accountType,
      balance: Number(balance),
      creditLimit: accountType === 'CREDIT_CARD' ? Number(creditLimit) || 0 : undefined,
      maskedAccountNumber: '',
      institutionName: name.trim(),
      icon: accountType === 'CREDIT_CARD' ? 'CreditCard' : 'Building2',
      color: accountType === 'CREDIT_CARD' ? '#DC2626' : '#2563EB',
      isDefault: existingAccounts.length === 0 ? true : isDefault,
    });

    onClose();
  };

  const handleSelectBankPreset = (presetName: string) => {
    setName(presetName);
    setAccountType('BANK');
  };

  return (
    <div
      id="add-account-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isOnboarding) onClose();
      }}
    >
      <div
        id="add-account-modal-card"
        className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl text-[#c9d1d9] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d] bg-[#161b22] rounded-t-2xl sm:rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1f6feb]/20 border border-[#1f6feb]/40 flex items-center justify-center text-[#58a6ff]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">
                {editingAccount
                  ? 'Edit Bank Account'
                  : isOnboarding
                  ? 'Link Your Bank Account'
                  : 'Add Bank Account'}
              </h2>
              <p className="text-[11px] text-[#8b949e]">
                {isOnboarding
                  ? 'Enter your bank name and starting balance to begin'
                  : 'Add a bank account to track expenses and balance'}
              </p>
            </div>
          </div>
          {!isOnboarding && (
            <button
              id="close-add-account-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Onboarding Welcome Banner */}
        {isOnboarding && (
          <div className="bg-[#1f6feb]/10 border-b border-[#1f6feb]/20 px-5 py-2.5 flex items-center gap-2 text-xs text-[#58a6ff]">
            <Sparkles className="w-4 h-4 shrink-0 text-[#58a6ff]" />
            <span>
              <strong>Welcome to MoneyMate!</strong> Add your bank account to start tracking expenses.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Error Message */}
            {validationError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-xs text-red-200 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quick Popular Bank Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block">
                Popular Bank Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_BANKS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectBankPreset(preset)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
                      name === preset
                        ? 'bg-[#1f6feb] border-[#388bfd] text-white'
                        : 'bg-[#161b22] border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff] hover:text-[#f0f6fc]'
                    }`}
                  >
                    {preset.replace(' (SBI)', '').replace(' (PNB)', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank Name */}
            <div className="space-y-1.5">
              <label htmlFor="account-name-input" className="text-xs font-semibold text-[#f0f6fc] block">
                Bank / Account Name <span className="text-red-400">*</span>
              </label>
              <input
                id="account-name-input"
                type="text"
                required
                placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>

            {/* Account Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#f0f6fc] block">
                Account Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'BANK' as AccountType, label: 'Savings / Salary Account', icon: Building2 },
                  { type: 'CREDIT_CARD' as AccountType, label: 'Credit Card', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = accountType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setAccountType(item.type)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1f6feb]/20 border-[#58a6ff] text-[#f0f6fc] shadow-sm'
                          : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#484f58] hover:text-[#c9d1d9]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="account-balance-input" className="text-xs font-semibold text-[#f0f6fc] block">
                  {accountType === 'CREDIT_CARD' ? 'Outstanding Dues (₹)' : 'Current Balance (₹)'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8b949e]">
                    ₹
                  </span>
                  <input
                    id="account-balance-input"
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={balance}
                    onChange={(e) => {
                      setBalance(e.target.value === '' ? '' : parseFloat(e.target.value));
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3.5 py-2 text-xs sm:text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  />
                </div>
              </div>

              {accountType === 'CREDIT_CARD' && (
                <div className="space-y-1.5">
                  <label htmlFor="account-credit-limit-input" className="text-xs font-semibold text-[#f0f6fc] block">
                    Credit Card Limit (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8b949e]">
                      ₹
                    </span>
                    <input
                      id="account-credit-limit-input"
                      type="number"
                      step="any"
                      placeholder="100000"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-7 pr-3.5 py-2 text-xs sm:text-sm text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Set as Primary Account Toggle */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Star className={`w-4 h-4 ${isDefault ? 'text-amber-400 fill-amber-400' : 'text-[#8b949e]'}`} />
                <div>
                  <div className="text-xs font-bold text-[#f0f6fc]">Set as Primary Account</div>
                  <div className="text-[11px] text-[#8b949e]">
                    Default bank account selected when logging new transactions
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault || existingAccounts.length === 0}
                  disabled={existingAccounts.length === 0}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#238636]"></div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-[#30363d] bg-[#161b22] rounded-b-2xl sm:rounded-b-xl shrink-0 flex items-center justify-end gap-2.5">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="gh-btn text-xs px-3.5 py-2 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="submit-add-bank-btn"
              type="submit"
              className="gh-btn gh-btn-primary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingAccount ? 'Save Changes' : 'Save Bank Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
