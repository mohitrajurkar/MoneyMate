import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  Receipt,
  Users,
} from 'lucide-react';
import { DebtRecord, DebtType, DebtStatus, User, Account } from '../../types';
import { apiService } from '../../services/api';

interface DebtsViewProps {
  user?: User;
  debts: DebtRecord[];
  accounts?: Account[];
  onSaveDebt?: (debt: Omit<DebtRecord, 'id' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'status'> & Partial<DebtRecord>) => void;
  onDeleteDebt?: (id: string) => void;
  onRecordRepayment?: (debtId: string, amount: number, accountId?: string) => void;
  onRefresh?: () => void;
  currency?: string;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  user,
  debts = [],
  accounts = [],
  onSaveDebt,
  onDeleteDebt,
  onRecordRepayment,
  onRefresh,
  currency = '₹',
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'LENT' | 'BORROWED' | 'SETTLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtRecord | null>(null);
  const [paymentModalDebt, setPaymentModalDebt] = useState<DebtRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formType, setFormType] = useState<DebtType>('LENT');
  const [formPerson, setFormPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidAmount, setFormPaidAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Calculations
  const activeDebts = debts.filter((d) => d.status !== 'SETTLED');
  const settledDebts = debts.filter((d) => d.status === 'SETTLED');

  const totalLentPending = activeDebts
    .filter((d) => d.type === 'LENT')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalBorrowedPending = activeDebts
    .filter((d) => d.type === 'BORROWED')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const netBalance = totalLentPending - totalBorrowedPending;

  const totalSettledAmount = debts
    .reduce((sum, d) => sum + d.paidAmount, 0);

  // Filtered debts
  const filteredDebts = debts.filter((d) => {
    // Filter type
    if (filterType === 'LENT' && (d.type !== 'LENT' || d.status === 'SETTLED')) return false;
    if (filterType === 'BORROWED' && (d.type !== 'BORROWED' || d.status === 'SETTLED')) return false;
    if (filterType === 'SETTLED' && d.status !== 'SETTLED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.personName.toLowerCase().includes(q);
      const matchNote = d.notes?.toLowerCase().includes(q);
      const matchPhone = d.phone?.toLowerCase().includes(q);
      if (!matchName && !matchNote && !matchPhone) return false;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingDebt(null);
    setFormType('LENT');
    setFormPerson('');
    setFormPhone('');
    setFormAmount('');
    setFormPaidAmount('0');
    setFormDueDate('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (debt: DebtRecord) => {
    setEditingDebt(debt);
    setFormType(debt.type);
    setFormPerson(debt.personName);
    setFormPhone(debt.phone || '');
    setFormAmount(debt.amount.toString());
    setFormPaidAmount(debt.paidAmount.toString());
    setFormDueDate(debt.dueDate || '');
    setFormDate(debt.createdDate || new Date().toISOString().split('T')[0]);
    setFormNotes(debt.notes || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPerson.trim()) {
      setFormError('Please enter a person name');
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount');
      return;
    }

    const numPaid = parseFloat(formPaidAmount) || 0;

    const currentUserId = user?.id || 'usr_default';

    if (onSaveDebt) {
      onSaveDebt({
        id: editingDebt?.id,
        userId: currentUserId,
        type: formType,
        personName: formPerson.trim(),
        phone: formPhone.trim(),
        amount: numAmount,
        paidAmount: Math.min(numAmount, numPaid),
        dueDate: formDueDate,
        createdDate: formDate,
        notes: formNotes.trim(),
      });
    } else if (editingDebt) {
      await apiService.saveDebt({
        ...editingDebt,
        type: formType,
        personName: formPerson.trim(),
        phone: formPhone.trim(),
        amount: numAmount,
        paidAmount: Math.min(numAmount, numPaid),
        dueDate: formDueDate,
        createdDate: formDate,
        notes: formNotes.trim(),
      });
    } else {
      await apiService.saveDebt({
        userId: currentUserId,
        type: formType,
        personName: formPerson.trim(),
        phone: formPhone.trim(),
        amount: numAmount,
        paidAmount: Math.min(numAmount, numPaid),
        dueDate: formDueDate,
        createdDate: formDate,
        notes: formNotes.trim(),
        payments: numPaid > 0 ? [{
          id: `pay_${Date.now()}`,
          amount: numPaid,
          date: formDate,
          notes: 'Initial payment recorded',
        }] : [],
      });
    }

    setIsAddModalOpen(false);
    if (onRefresh) onRefresh();
  };

  const handleDeleteDebt = async (id: string) => {
    if (confirm('Are you sure you want to delete this debt record?')) {
      if (onDeleteDebt) {
        onDeleteDebt(id);
      } else {
        await apiService.deleteDebt(id);
      }
      if (onRefresh) onRefresh();
    }
  };

  const handleSettleDebt = async (id: string) => {
    await apiService.settleDebt(id);
    if (onRefresh) onRefresh();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDebt) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (onRecordRepayment) {
      onRecordRepayment(paymentModalDebt.id, amt);
    } else {
      await apiService.recordDebtRepayment(paymentModalDebt.id, amt, undefined, paymentNote.trim() || undefined);
    }
    setPaymentModalDebt(null);
    setPaymentAmount('');
    setPaymentNote('');
    if (onRefresh) onRefresh();
  };

  return (
    <div id="debts-ledger-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#f0f6fc] flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-[#3fb950]" />
            <span>Khata (Lent & Borrowed - Udhar)</span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-1">
            Keep clear, stress-free records of money you lent to friends or borrowed from others.
          </p>
        </div>

        <button
          id="btn-add-debt-record"
          onClick={handleOpenAddModal}
          className="gh-btn gh-btn-primary text-xs py-2 px-3.5 flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Lent / Borrowed</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* You'll Get (Lent) */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">You'll Get (Lent)</span>
            <div className="w-7 h-7 rounded-lg bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#3fb950]">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#3fb950]">
            {currency}{totalLentPending.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {activeDebts.filter((d) => d.type === 'LENT').length} active borrower(s)
          </div>
        </div>

        {/* You Owe (Borrowed) */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">You Owe (Borrowed)</span>
            <div className="w-7 h-7 rounded-lg bg-[#f85149]/20 border border-[#f85149]/40 flex items-center justify-center text-[#f85149]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#f85149]">
            {currency}{totalBorrowedPending.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {activeDebts.filter((d) => d.type === 'BORROWED').length} active lender(s)
          </div>
        </div>

        {/* Net Position */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">Net Position</span>
            <div className="w-7 h-7 rounded-lg bg-[#58a6ff]/20 border border-[#58a6ff]/40 flex items-center justify-center text-[#58a6ff]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
            {netBalance >= 0 ? '+' : '-'}{currency}{Math.abs(netBalance).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {netBalance >= 0 ? "You're in surplus overall" : "You have net liabilities"}
          </div>
        </div>

        {/* Total Settled */}
        <div className="gh-box p-4 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e]">Settled History</span>
            <div className="w-7 h-7 rounded-lg bg-[#a371f7]/20 border border-[#a371f7]/40 flex items-center justify-center text-[#a371f7]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
            {currency}{totalSettledAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#8b949e]">
            {settledDebts.length} record(s) settled
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'ALL'
                ? 'bg-[#238636] text-white font-semibold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
          >
            All ({debts.length})
          </button>
          <button
            onClick={() => setFilterType('LENT')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'LENT'
                ? 'bg-[#238636] text-white font-semibold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>You'll Get ({activeDebts.filter((d) => d.type === 'LENT').length})</span>
          </button>
          <button
            onClick={() => setFilterType('BORROWED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'BORROWED'
                ? 'bg-[#238636] text-white font-semibold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#f85149]" />
            <span>You Owe ({activeDebts.filter((d) => d.type === 'BORROWED').length})</span>
          </button>
          <button
            onClick={() => setFilterType('SETTLED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'SETTLED'
                ? 'bg-[#238636] text-white font-semibold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a371f7]" />
            <span>Settled ({settledDebts.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or note..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
      </div>

      {/* Debt List Cards */}
      {filteredDebts.length === 0 ? (
        <div className="gh-box p-12 bg-[#0d1117] border border-[#30363d] rounded-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#21262d] flex items-center justify-center text-[#8b949e]">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#f0f6fc]">No debt records found</h3>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              {searchQuery
                ? 'No matches for your search. Try a different keyword.'
                : 'You have not recorded any lent or borrowed money yet. Click "Add Loan / Debt" above to log one!'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="gh-btn gh-btn-primary text-xs py-2 px-4 cursor-pointer"
            >
              Add First Record
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((debt) => {
            const isLent = debt.type === 'LENT';
            const remaining = Math.max(0, debt.amount - debt.paidAmount);
            const progressPercent = debt.amount > 0 ? Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100)) : 0;
            const isSettled = debt.status === 'SETTLED' || remaining === 0;
            const isHistoryExpanded = expandedHistoryId === debt.id;

            return (
              <div
                key={debt.id}
                id={`debt-card-${debt.id}`}
                className={`gh-box p-4 rounded-xl border transition-all ${
                  isSettled
                    ? 'bg-[#0d1117]/60 border-[#30363d]/60 opacity-80'
                    : isLent
                    ? 'bg-[#0d1117] border-[#30363d] hover:border-[#238636]/60'
                    : 'bg-[#0d1117] border-[#30363d] hover:border-[#f85149]/60'
                } space-y-3.5`}
              >
                {/* Top Row: Person, Type Badge, Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase ${
                        isLent
                          ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                          : 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40'
                      }`}
                    >
                      {debt.personName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#f0f6fc]">{debt.personName}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSettled
                              ? 'bg-[#a371f7]/20 text-[#a371f7] border border-[#a371f7]/30'
                              : isLent
                              ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                              : 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30'
                          }`}
                        >
                          {isSettled
                            ? 'Settled ✓'
                            : isLent
                            ? "You'll Get"
                            : 'You Owe'}
                        </span>
                      </div>
                      {debt.phone && (
                        <p className="text-[11px] text-[#8b949e] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{debt.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold font-mono ${
                        isSettled
                          ? 'text-[#8b949e] line-through'
                          : isLent
                          ? 'text-[#3fb950]'
                          : 'text-[#f85149]'
                      }`}
                    >
                      {currency}{remaining.toLocaleString('en-IN')}
                    </div>
                    {debt.paidAmount > 0 && !isSettled && (
                      <p className="text-[10px] text-[#8b949e] font-mono">
                        of {currency}{debt.amount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Note / Description */}
                {debt.notes && (
                  <p className="text-xs text-[#c9d1d9] bg-[#161b22] p-2 rounded-md border border-[#30363d]/50">
                    "{debt.notes}"
                  </p>
                )}

                {/* Repayment Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-mono">
                    <span>Paid: {currency}{debt.paidAmount.toLocaleString('en-IN')}</span>
                    <span>{progressPercent}% Repaid</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSettled
                          ? 'bg-[#a371f7]'
                          : isLent
                          ? 'bg-[#238636]'
                          : 'bg-[#f85149]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Dates & Meta */}
                <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1 border-t border-[#30363d]/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8b949e]" />
                    <span>Given: {debt.createdDate}</span>
                  </span>
                  {debt.dueDate ? (
                    <span className="flex items-center gap-1 font-medium text-[#d29922]">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {debt.dueDate}</span>
                    </span>
                  ) : (
                    <span>No due date</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    {!isSettled && (
                      <>
                        <button
                          onClick={() => {
                            setPaymentModalDebt(debt);
                            setPaymentAmount('');
                            setPaymentNote('');
                          }}
                          className="gh-btn text-xs py-1 px-2.5 bg-[#238636]/15 hover:bg-[#238636]/30 text-[#3fb950] border-[#238636]/40 cursor-pointer"
                          title="Record partial payment"
                        >
                          + Repay
                        </button>
                        <button
                          onClick={() => handleSettleDebt(debt.id)}
                          className="gh-btn text-xs py-1 px-2.5 hover:border-[#a371f7] hover:text-[#a371f7] cursor-pointer"
                          title="Mark completely settled"
                        >
                          Settle ✓
                        </button>
                      </>
                    )}

                    {debt.payments && debt.payments.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedHistoryId(isHistoryExpanded ? null : debt.id)
                        }
                        className="gh-btn text-[11px] py-1 px-2 text-[#8b949e] hover:text-[#f0f6fc] flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3 h-3" />
                        <span>({debt.payments.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(debt)}
                      className="p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
                      title="Edit details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="p-1.5 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Payment History */}
                {isHistoryExpanded && debt.payments && debt.payments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#30363d] space-y-1.5 bg-[#161b22]/70 p-2.5 rounded-md text-xs">
                    <div className="text-[11px] font-bold text-[#8b949e] flex items-center gap-1">
                      <History className="w-3 h-3" />
                      <span>Payment History:</span>
                    </div>
                    {debt.payments.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center justify-between text-[11px] py-0.5 text-[#c9d1d9]"
                      >
                        <span className="text-[#8b949e]">{p.date} • {p.notes || 'Repayment'}</span>
                        <span className="font-mono font-bold text-[#3fb950]">
                          +{currency}{p.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT DEBT MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#c9d1d9]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#3fb950]">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#f0f6fc]">
                    {editingDebt ? 'Edit Debt / Loan' : 'Record Loan or Udhaar'}
                  </h3>
                  <p className="text-[11px] text-[#8b949e]">
                    Track money you gave to or borrowed from someone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDebt} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 rounded-md bg-[#f85149]/15 border border-[#f85149]/30 text-[#f85149] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#8b949e] uppercase">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('LENT')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'LENT'
                        ? 'bg-[#238636]/20 border-[#238636] text-[#3fb950]'
                        : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>I Lent (They Owe Me)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('BORROWED')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formType === 'BORROWED'
                        ? 'bg-[#f85149]/20 border-[#f85149] text-[#f85149]'
                        : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>I Borrowed (I Owe)</span>
                  </button>
                </div>
              </div>

              {/* Person Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Person Name <span className="text-[#f85149]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPerson}
                    onChange={(e) => setFormPerson(e.target.value)}
                    placeholder="e.g. Rahul Sharma, Priya"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Phone / Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              {/* Amount & Already Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Total Amount ({currency}) <span className="text-[#f85149]">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Already Repaid ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formPaidAmount}
                    onChange={(e) => setFormPaidAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              {/* Given Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Date Recorded
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8b949e]">
                    Due Date / Target (Optional)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8b949e]">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Dinner bill split at BBQ Nation, Travel booking advance"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="gh-btn text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary text-xs py-2 px-4 cursor-pointer font-semibold"
                >
                  {editingDebt ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD REPAYMENT MODAL */}
      {paymentModalDebt && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setPaymentModalDebt(null)}
        >
          <div
            className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden text-[#c9d1d9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
              <h3 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-[#3fb950]" />
                <span>Record Repayment for {paymentModalDebt.personName}</span>
              </h3>
              <button
                onClick={() => setPaymentModalDebt(null)}
                className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Total Debt:</span>
                  <span className="font-mono font-bold text-[#f0f6fc]">
                    {currency}{paymentModalDebt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8b949e]">Remaining Due:</span>
                  <span className="font-mono font-bold text-[#3fb950]">
                    {currency}{(paymentModalDebt.amount - paymentModalDebt.paidAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8b949e]">
                  Repayment Amount ({currency}) <span className="text-[#f85149]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  max={paymentModalDebt.amount - paymentModalDebt.paidAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max ${currency}${(paymentModalDebt.amount - paymentModalDebt.paidAmount).toLocaleString('en-IN')}`}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8b949e]">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Paid via GPay, Cash received"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebt(null)}
                  className="gh-btn text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary text-xs py-2 px-4 cursor-pointer font-semibold"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
