import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { Subscription, BillingCycle, Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  categories: Category[];
  onSaveSubscription: (sub: Omit<Subscription, 'id' | 'userId'> & { id?: string }) => void;
  onDeleteSubscription: (id: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions = [],
  categories = [],
  onSaveSubscription,
  onDeleteSubscription,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState((categories && categories[0]?.id) || '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [nextBillingDate, setNextBillingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // Calculations
  const monthlyTotal = (subscriptions || [])
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => {
      if (s.billingCycle === 'MONTHLY') return sum + s.amount;
      if (s.billingCycle === 'YEARLY') return sum + s.amount / 12;
      if (s.billingCycle === 'QUARTERLY') return sum + s.amount / 3;
      if (s.billingCycle === 'WEEKLY') return sum + s.amount * 4.33;
      return sum + s.amount;
    }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const handleOpenAdd = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setCategoryId((categories && categories[0]?.id) || '');
    setBillingCycle('MONTHLY');
    setNextBillingDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount);
    setCategoryId(sub.categoryId);
    setBillingCycle(sub.billingCycle);
    setNextBillingDate(sub.nextBillingDate);
    setStatus(sub.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    onSaveSubscription({
      id: editingSub?.id,
      name: name.trim(),
      amount: Number(amount),
      categoryId,
      billingCycle,
      nextBillingDate,
      status,
      icon: 'Tv',
    });

    setModalOpen(false);
  };

  const getCategory = (catId: string) =>
    (categories || []).find((c) => c.id === catId);

  return (
    <div id="subscriptions-view-container" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[#58a6ff]" />
            <span>Recurring Subscriptions</span>
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Track recurring SaaS, OTT media streaming, gym memberships, and renewal schedules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="gh-btn gh-btn-primary text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-[#8b949e]">Monthly Burn Rate</span>
          <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
            ₹{Math.round(monthlyTotal).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8b949e]">
            Across {subscriptions.filter((s) => s.status === 'ACTIVE').length} active recurring plans
          </p>
        </div>

        <div className="gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-[#8b949e]">Projected Annual Expense</span>
          <div className="text-2xl font-bold font-mono text-[#58a6ff]">
            ₹{Math.round(yearlyTotal).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8b949e]">Total annual recurring outflow</p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          const cat = getCategory(sub.categoryId);
          const isPaused = sub.status === 'PAUSED';

          return (
            <div
              key={sub.id}
              className={`gh-box bg-[#0d1117] border border-[#30363d] rounded-md p-4 space-y-3 relative hover:border-[#58a6ff]/50 transition-colors ${
                isPaused ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] text-[#58a6ff]">
                    <CategoryIcon icon={cat?.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f6fc]">{sub.name}</h3>
                    <p className="text-[10px] text-[#8b949e] font-mono">
                      {cat?.name || 'Entertainment'} • {sub.billingCycle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete subscription for ${sub.name}?`)) onDeleteSubscription(sub.id);
                    }}
                    className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xl font-bold font-mono text-[#f0f6fc]">
                  ₹{sub.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#8b949e]">
                    / {sub.billingCycle.toLowerCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#8b949e] font-mono mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#58a6ff]" />
                  <span>Renews on {sub.nextBillingDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#30363d] text-[11px]">
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                    isPaused
                      ? 'bg-[#8b949e]/20 text-[#8b949e] border border-[#8b949e]/30'
                      : 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                  }`}
                >
                  {isPaused ? 'Paused' : 'Active Plan'}
                </span>
                <span className="text-[#8b949e] font-mono text-[10px]">
                  ₹{Math.round(sub.billingCycle === 'YEARLY' ? sub.amount / 12 : sub.amount).toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full sm:max-w-md max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl text-[#c9d1d9] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22] rounded-t-2xl sm:rounded-t-xl shrink-0">
              <h2 className="text-sm font-bold text-[#f0f6fc]">
                {editingSub ? 'Edit Subscription' : 'Add Subscription'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] block">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Spotify, AWS, Gym"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="649"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">Billing Cycle</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] font-mono"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#f0f6fc] block">Next Renewal</label>
                    <input
                      type="date"
                      value={nextBillingDate}
                      onChange={(e) => setNextBillingDate(e.target.value)}
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] font-mono focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#30363d] bg-[#161b22] rounded-b-2xl sm:rounded-b-xl shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="gh-btn text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{editingSub ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
