import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Save,
  Download,
  Trash2,
  RefreshCw,
  Bell,
  Wallet,
  Check,
  Smartphone,
  Globe,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  onResetData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('moneymate_currency') || 'INR (₹)');
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState('80');
  const [enableUpiAutoparse, setEnableUpiAutoparse] = useState(true);
  const [enableSoundEffects, setEnableSoundEffects] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('moneymate_currency', currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportAllData = () => {
    try {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('moneymate_') || key.startsWith('aurora_'))) {
          try {
            allData[key] = JSON.parse(localStorage.getItem(key) || '{}');
          } catch {
            allData[key] = localStorage.getItem(key);
          }
        }
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneymate_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div id="settings-view-container" className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-[#30363d]">
        <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#58a6ff]" />
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Customize currency defaults, budget notifications, and personal finance data storage.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Currency & Financial Preferences */}
        <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117] p-5 space-y-4 text-xs">
          <div className="font-bold text-sm text-[#f0f6fc] border-b border-[#30363d] pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#58a6ff]" />
            <span>Currency & Region</span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <label className="text-[#f0f6fc] font-semibold">Primary Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
              <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
              <option value="SGD (S$)">SGD (S$) - Singapore Dollar</option>
            </select>
            <p className="text-[11px] text-[#8b949e]">
              Selected currency symbol will format all ledger balances, savings goals, and budgets.
            </p>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117] p-5 space-y-4 text-xs">
          <div className="font-bold text-sm text-[#f0f6fc] border-b border-[#30363d] pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#a371f7]" />
            <span>Smart Automation & Alerts</span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <label className="text-[#f0f6fc] font-semibold">Monthly Budget Warning Threshold</label>
            <select
              value={budgetAlertThreshold}
              onChange={(e) => setBudgetAlertThreshold(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-2 text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              <option value="75">Notify when spending reaches 75% of budget</option>
              <option value="80">Notify when spending reaches 80% of budget (Recommended)</option>
              <option value="90">Notify when spending reaches 90% of budget</option>
              <option value="100">Notify only when budget is completely exhausted (100%)</option>
            </select>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-[#f0f6fc]">
              <input
                type="checkbox"
                checked={enableUpiAutoparse}
                onChange={(e) => setEnableUpiAutoparse(e.target.checked)}
                className="w-4 h-4 accent-[#238636] rounded"
              />
              <span className="font-medium">Enable Instant UPI SMS & Share detection</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-[#f0f6fc]">
              <input
                type="checkbox"
                checked={enableSoundEffects}
                onChange={(e) => setEnableSoundEffects(e.target.checked)}
                className="w-4 h-4 accent-[#238636] rounded"
              />
              <span className="font-medium">Play celebratory animations on goal achievements</span>
            </label>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="gh-btn gh-btn-primary text-xs flex items-center gap-1.5"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saved ? 'Preferences Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117] p-5 space-y-4 text-xs">
          <div className="font-bold text-sm text-[#f0f6fc] border-b border-[#30363d] pb-2 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#3fb950]" />
            <span>Data Backup & Export</span>
          </div>

          <p className="text-[#8b949e]">
            Your data is stored securely in your browser session. You can download a complete backup anytime.
          </p>

          <div>
            <button
              type="button"
              onClick={handleExportAllData}
              className="gh-btn text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Download JSON Data Backup</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="border border-[#f85149]/40 rounded-md overflow-hidden bg-[#0d1117]">
          <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#f85149]/30 text-xs font-bold text-[#f85149] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#f85149]" />
            <span>Data Management & Reset</span>
          </div>

          <div className="p-4 divide-y divide-[#21262d] text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
              <div>
                <div className="font-bold text-[#f0f6fc]">Clear & Reset Financial Workspace</div>
                <div className="text-[#8b949e]">
                  Permanently clear stored transactions, bank balances, and start fresh with a ₹0 clean slate.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all stored financial records and reset your workspace?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="gh-btn gh-btn-danger text-xs whitespace-nowrap self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
