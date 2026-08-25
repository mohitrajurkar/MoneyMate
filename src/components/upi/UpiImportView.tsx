import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Check,
  Zap,
  Building2,
  Calendar,
  Share2,
  Smartphone,
  Receipt,
  FileCheck2,
  ArrowDown,
  ArrowUpRight,
  TrendingDown,
  Info,
  Copy,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  ArrowLeft,
  Home,
  CreditCard,
  PlusCircle,
  BarChart3,
  User,
  ShoppingBag,
  Coffee,
  MoreHorizontal,
  Wifi,
  Battery,
  Signal,
  MousePointer,
  Lock,
  EyeOff,
  Database,
  Cpu,
  SmartphoneNfc,
  CheckCircle,
} from 'lucide-react';
import {
  GooglePayLogo,
  PhonePeLogo,
  PaytmLogo,
  CredLogo,
  BhimLogo,
  AmazonPayLogo,
  SliceLogo,
} from '../common/UpiLogos';
import {
  Account,
  Category,
  Transaction,
  ParsedUpiData,
  DuplicateCheckResult,
} from '../../types';
import { upiParserManager } from '../../services/upiParser';
import { formatDDMMYYYY } from '../../utils/dateUtils';

interface UpiImportViewProps {
  accounts: Account[];
  categories: Category[];
  existingTransactions: Transaction[];
  onSaveTransaction: (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => void;
  onClose?: () => void;
}

export const UpiImportView: React.FC<UpiImportViewProps> = ({
  accounts = [],
  categories = [],
  existingTransactions = [],
  onSaveTransaction,
  onClose,
}) => {
  const [parsedData, setParsedData] = useState<ParsedUpiData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeMobileStep, setActiveMobileStep] = useState<number>(0);
  const [manualInputText, setManualInputText] = useState('');

  // Form State for Editable Preview
  const [editForm, setEditForm] = useState<{
    amount: number;
    merchant: string;
    categoryId: string;
    accountId: string;
    transactionType: 'INCOME' | 'EXPENSE';
    paymentMethod: string;
    upiRefId: string;
    transactionDate: string;
    description: string;
  }>({
    amount: 0,
    merchant: '',
    categoryId: categories[0]?.id || '',
    accountId: accounts[0]?.id || '',
    transactionType: 'EXPENSE',
    paymentMethod: 'UPI',
    upiRefId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Automatically read Web Share Target query params if launched via OS share
  React.useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedText =
        urlParams.get('text') ||
        urlParams.get('share_text') ||
        urlParams.get('title') ||
        urlParams.get('body');

      if (sharedText && sharedText.trim()) {
        handleParse(sharedText.trim());
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleParse = (textToParse: string) => {
    if (!textToParse || !textToParse.trim()) {
      setErrorMessage('No UPI transaction text found.');
      return;
    }

    setErrorMessage(null);
    setIsParsing(true);
    setDuplicateWarning(null);
    setSaveSuccess(false);
    setIsEditing(false);

    setTimeout(() => {
      try {
        const result = upiParserManager.parseText(textToParse);
        if (!result) {
          throw new Error(
            'Could not detect transaction details in this text. Please check the snippet.'
          );
        }

        setParsedData(result);

        // Match category
        const matchedCategory =
          categories.find(
            (c) =>
              c.name.toLowerCase() === result.suggestedCategory.toLowerCase()
          ) ||
          categories.find((c) =>
            c.name.toLowerCase().includes(result.suggestedCategory.toLowerCase())
          ) ||
          categories[0];

        // Match account
        const matchedAccount =
          accounts.find((a) => a.accountType === 'UPI_WALLET') ||
          accounts.find((a) => a.isDefault) ||
          accounts[0];

        setEditForm({
          amount: result.amount,
          merchant: result.merchant,
          categoryId: matchedCategory ? matchedCategory.id : categories[0]?.id || '',
          accountId: matchedAccount ? matchedAccount.id : accounts[0]?.id || '',
          transactionType: result.transactionType,
          paymentMethod: result.paymentMethod || 'UPI',
          upiRefId: result.upiRefId || '',
          transactionDate: result.date || new Date().toISOString().split('T')[0],
          description: `Imported via ${result.source.replace('_', ' ')}`,
        });

        // Run Duplicate Detection
        const dupCheck = upiParserManager.checkForDuplicate(
          {
            amount: result.amount,
            merchant: result.merchant,
            date: result.date,
            upiRefId: result.upiRefId,
          },
          existingTransactions
        );

        if (dupCheck.isDuplicate) {
          setDuplicateWarning(dupCheck);
        }

        // Scroll down to parsed preview
        setTimeout(() => {
          document.getElementById('parsed-preview-card')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err: any) {
        setErrorMessage(err.message || 'Parsing failed.');
      } finally {
        setIsParsing(false);
      }
    }, 200);
  };

  const handleTestSimulatedShare = (appName: string, amount: number, merchant: string) => {
    const sample = `Paid ₹${amount} to ${merchant} using ${appName}. UPI Ref: 51234567${Math.floor(
      1000 + Math.random() * 9000
    )}. Transferred from HDFC Bank. Date: 20 Aug 2025, 10:45 AM.`;
    handleParse(sample);
  };

  const handleConfirmSave = (forceDuplicate = false) => {
    if (duplicateWarning?.isDuplicate && !forceDuplicate) {
      return;
    }

    onSaveTransaction({
      accountId: editForm.accountId,
      categoryId: editForm.categoryId,
      amount: Number(editForm.amount),
      transactionType: editForm.transactionType,
      merchant: editForm.merchant,
      description: editForm.description || `Paid to ${editForm.merchant}`,
      paymentMethod: editForm.paymentMethod,
      transactionDate: editForm.transactionDate,
      transactionTime: new Date().toTimeString().split(' ')[0],
      upiRefId: editForm.upiRefId,
      source: parsedData?.source || 'UPI_IMPORT',
      tags: ['UPI', editForm.merchant],
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6'],
      });
    } catch {
      // ignore
    }

    setSaveSuccess(true);
    setDuplicateWarning(null);
  };

  const categoryName = categories.find((c) => c.id === editForm.categoryId)?.name || 'Shopping';
  const accountName = accounts.find((a) => a.id === editForm.accountId)?.name || 'Bank Account';

  const flowSteps = [
    {
      num: '1',
      title: 'Open UPI App Receipt',
      caption: 'User completes a payment and opens the receipt',
      screen: (
        <div className="flex flex-col h-full justify-between p-3.5 bg-white text-slate-800 font-sans text-left select-none">
          {/* Phone Status Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1 pt-0.5">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="w-2.5 h-2.5 fill-current" />
              <Wifi className="w-2.5 h-2.5" />
              <Battery className="w-3 h-3 fill-current" />
            </div>
          </div>

          {/* Success Checkmark & Amount */}
          <div className="flex flex-col items-center text-center mt-3 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Payment Successful</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">₹1,250</div>
            </div>
            <div className="text-[11px]">
              <span className="text-slate-500">Paid to </span>
              <span className="font-bold text-slate-800">Rahul Sharma</span>
              <div className="text-[9px] text-slate-400 font-mono">rahul@okaxis</div>
            </div>
          </div>

          {/* Receipt Details Card */}
          <div className="bg-slate-50 rounded-xl p-2.5 space-y-2 border border-slate-200/80 my-2 text-[10px]">
            <div>
              <div className="text-[9px] text-slate-400 font-medium">Date & Time</div>
              <div className="font-semibold text-slate-700">20 Aug 2025, 10:45 AM</div>
            </div>
            <div className="border-t border-slate-200/60 pt-1.5">
              <div className="text-[9px] text-slate-400 font-medium">UPI Transaction ID</div>
              <div className="font-mono text-slate-700 font-medium">512345678901</div>
            </div>
            <div className="border-t border-slate-200/60 pt-1.5">
              <div className="text-[9px] text-slate-400 font-medium">From</div>
              <div className="font-mono text-slate-700 font-medium text-[9px]">user@okhdfcbank</div>
            </div>
          </div>

          {/* Share Button (Highlighted) */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Google Pay', 1250, 'Rahul Sharma')}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/40"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      ),
    },
    {
      num: '2',
      title: 'Tap Share',
      caption: 'User taps the Share icon and selects MoneyMate',
      screen: (
        <div className="flex flex-col h-full justify-between bg-slate-900/30 text-slate-800 font-sans text-left relative overflow-hidden select-none">
          {/* Mock Background Screen (Blurred Receipt) */}
          <div className="p-3.5 opacity-30 blur-[0.5px]">
            <div className="flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 fill-current" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3 fill-current" />
              </div>
            </div>
            <div className="flex flex-col items-center mt-3 text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold mt-1">₹1,250</div>
            </div>
          </div>

          {/* Bottom Sheet Modal ("Share via") */}
          <div className="bg-white rounded-t-2xl p-3.5 shadow-2xl border-t border-slate-200 mt-auto space-y-3 z-10">
            <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto" />
            <div className="text-[11px] font-bold text-slate-700">Share via</div>

            {/* App Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* MoneyMate App (Highlighted with Cursor) */}
              <button
                type="button"
                onClick={() => handleTestSimulatedShare('UPI Share', 1250, 'Rahul Sharma')}
                className="flex flex-col items-center gap-1 group cursor-pointer relative"
              >
                <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] border border-blue-400 shadow-md ring-2 ring-blue-400/60 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <img
                    src="/moneymate-logo.png"
                    alt="MoneyMate"
                    className="w-full h-auto object-contain rounded"
                  />
                </div>
                <span className="text-[9px] font-bold text-blue-700 tracking-tight">MoneyMate</span>
                {/* Visual Tap Indicator */}
                <div className="absolute -bottom-1 -right-1 text-slate-900 animate-bounce">
                  <MousePointer className="w-4 h-4 fill-slate-900 text-white" />
                </div>
              </button>

              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-1 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  💬
                </div>
                <span className="text-[9px] text-slate-600">WhatsApp</span>
              </div>

              {/* Gmail */}
              <div className="flex flex-col items-center gap-1 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ✉️
                </div>
                <span className="text-[9px] text-slate-600">Gmail</span>
              </div>

              {/* More */}
              <div className="flex flex-col items-center gap-1 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-slate-600">More</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '3',
      title: 'Review & Confirm Details',
      caption: 'User reviews the extracted details and can edit if needed',
      screen: (
        <div className="flex flex-col h-full justify-between p-3.5 bg-white text-slate-800 font-sans text-left select-none">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 fill-current" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3 fill-current" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-b border-slate-100 pb-2">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Review Transaction</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-2 py-1 text-[10px]">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Amount</span>
              <span className="font-bold text-slate-900 text-xs">₹1,250</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Paid to</span>
              <span className="font-semibold text-slate-800">Rahul Sharma</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">UPI ID</span>
              <span className="font-mono text-slate-600 text-[9px]">rahul@okaxis</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Date & Time</span>
              <span className="text-slate-700 text-[9px]">20 Aug 2025, 10:45 AM</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-medium border border-slate-200">
                🛒 Shopping ▾
              </span>
            </div>
            <div className="py-0.5">
              <span className="text-slate-400 text-[9px] block">Note (optional)</span>
              <span className="font-medium text-slate-700 text-[10px]">Lunch payment</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleTestSimulatedShare('UPI Share', 1250, 'Rahul Sharma')}
              className="w-full py-1.5 px-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl text-xs font-bold flex items-center justify-center shadow transition-all cursor-pointer"
            >
              Confirm & Save
            </button>
            <div className="text-center text-[9px] text-[#2563eb] font-semibold cursor-pointer">
              Edit Details
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '4',
      title: 'Transaction Saved',
      caption: 'Transaction is saved successfully to the ledger',
      screen: (
        <div className="flex flex-col h-full justify-between p-3.5 bg-white text-slate-800 font-sans text-left select-none">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="w-2.5 h-2.5 fill-current" />
              <Wifi className="w-2.5 h-2.5" />
              <Battery className="w-3 h-3 fill-current" />
            </div>
          </div>

          {/* Success Check with Celebration Confetti */}
          <div className="flex flex-col items-center text-center my-auto space-y-2 relative">
            {/* Confetti decoration */}
            <div className="text-xs absolute -top-3 left-4 animate-bounce">🎉</div>
            <div className="text-xs absolute -top-2 right-4">✨</div>
            <div className="text-xs absolute top-8 -left-1">🎊</div>
            <div className="text-xs absolute top-8 -right-1">⭐</div>

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900">Transaction Saved!</div>
              <p className="text-[10px] text-slate-500 leading-tight px-2">
                <strong className="text-slate-800">₹1,250 to Rahul Sharma</strong> has been added to your transactions
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleTestSimulatedShare('UPI Share', 1250, 'Rahul Sharma')}
              className="w-full py-2 px-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-xl text-xs font-bold flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              View Transactions
            </button>
            <div className="text-center text-[10px] text-slate-500 font-medium">Done</div>
          </div>
        </div>
      ),
    },
    {
      num: '5',
      title: 'Visible in Transactions',
      caption: 'The transaction appears in the transaction list',
      screen: (
        <div className="flex flex-col h-full justify-between p-3.5 bg-white text-slate-800 font-sans text-left select-none">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 fill-current" />
                <Wifi className="w-2.5 h-2.5" />
                <Battery className="w-3 h-3 fill-current" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Transactions</span>
              <Search className="w-3.5 h-3.5 text-slate-700" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold">
                All
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-medium">
                Income
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-medium">
                Expense
              </span>
            </div>
          </div>

          {/* Transaction Items */}
          <div className="space-y-2 py-1 text-[10px] flex-1 overflow-hidden">
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Today</div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/70 border border-blue-200/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-bold text-[10px]">
                    M
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-[10px]">Rahul Sharma</div>
                    <div className="text-[8px] text-slate-400">Lunch payment</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-600 text-[10px]">- ₹1,250</div>
                  <div className="text-[8px] text-slate-400">10:45 AM</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Yesterday</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[9px]">
                      a
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-[9px]">Amazon</div>
                      <div className="text-[8px] text-slate-400">Shopping</div>
                    </div>
                  </div>
                  <div className="font-bold text-rose-600 text-[9px]">- ₹699</div>
                </div>

                <div className="flex items-center justify-between p-1 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-[9px]">Starbucks</div>
                      <div className="text-[8px] text-slate-400">Coffee</div>
                    </div>
                  </div>
                  <div className="font-bold text-rose-600 text-[9px]">- ₹230</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom App Navigation Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 px-1 text-[8px] text-slate-400">
            <div className="flex flex-col items-center">
              <Home className="w-3 h-3" />
              <span>Home</span>
            </div>
            <div className="flex flex-col items-center text-emerald-700 font-bold">
              <Receipt className="w-3 h-3" />
              <span>Transactions</span>
            </div>
            <div className="flex flex-col items-center">
              <PlusCircle className="w-3 h-3 text-slate-400" />
              <span>Add</span>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className="w-3 h-3" />
              <span>Insights</span>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-3 h-3" />
              <span>Profile</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="upi-import-container" className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Brand & Context Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1e3a8a]/30 via-[#1d4ed8]/20 to-[#2563eb]/10 border border-[#3b82f6]/30 shadow-[0_0_25px_rgba(37,99,235,0.15)]">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-2 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] border border-blue-400/40 shadow-[0_0_20px_rgba(37,99,235,0.35)] shrink-0">
              <img
                src="/moneymate-logo.png"
                alt="MoneyMate Logo"
                className="h-10 w-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f0f6fc]">
                  UPI Direct Import
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <Smartphone className="w-3 h-3" />
                  App Only
                </span>
              </div>
              <p className="text-xs text-[#93c5fd]/90 pt-0.5">
                Zero-effort instant receipt import from all major Indian UPI payment apps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="gh-btn text-xs px-3.5 py-2 cursor-pointer self-start sm:self-auto"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Small Notice: Only accessible in the app */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#1e3a8a]/20 border border-[#3b82f6]/30 text-blue-200 text-xs shadow-sm">
          <Info className="w-4 h-4 shrink-0 text-[#60a5fa]" />
          <span className="leading-snug text-[11px] sm:text-xs">
            <strong className="text-white font-semibold">Note:</strong>{' '}
            <span className="text-blue-100/90">
              Direct 1-click OS share target is only accessible in the mobile app / PWA. On the web, you can use the interactive simulator or paste transaction snippets below.
            </span>
          </span>
        </div>
      </div>

      {/* 📱 USER FLOW (UI FLOW) WITH REALISTIC MOBILE FRAMES */}
      <div
        id="upi-user-flow-section"
        className="p-4 sm:p-7 rounded-3xl bg-[#0d1117] border border-[#30363d] space-y-6 shadow-2xl text-[#c9d1d9]"
      >
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#21262d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1e3a8a]/40 text-[#60a5fa] flex items-center justify-center font-bold text-sm border border-[#3b82f6]/40 shadow-sm">
              ✓
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#60a5fa] tracking-wide uppercase font-mono">
                User Flow (UI Flow)
              </h2>
              <p className="text-[11px] text-[#8b949e]">
                How payments are shared and recorded in MoneyMate instantly
              </p>
            </div>
          </div>

          {/* Quick interactive test button */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Google Pay', 1250, 'Rahul Sharma')}
            className="gh-btn gh-btn-primary text-xs px-3.5 py-1.5 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test Demo Share (₹1,250 to Rahul)</span>
          </button>
        </div>

        {/* 💻 DESKTOP & TABLET VIEW: Complete Horizontal Flow with Flowing Arrows */}
        <div className="hidden lg:flex items-start justify-between gap-3 overflow-x-auto pb-4 pt-1">
          {flowSteps.map((step, idx) => (
            <React.Fragment key={step.num}>
              {/* Single Step with Mobile Frame */}
              <div className="flex-1 min-w-[190px] max-w-[220px] flex flex-col items-center text-center space-y-3">
                {/* Step Header Badge */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                    {step.num}
                  </span>
                  <h3 className="text-xs font-bold text-[#f0f6fc] truncate">
                    {step.title}
                  </h3>
                </div>

                {/* 📱 Realistic Smartphone Mockup Box */}
                <div className="w-full h-[370px] rounded-[32px] p-2 bg-[#1c2128] border-2 border-[#30363d] shadow-2xl relative transition-all duration-300 hover:border-[#3b82f6] hover:scale-[1.02] group">
                  {/* Speaker / Dynamic Island Top Notch */}
                  <div className="w-16 h-3.5 bg-[#0d1117] rounded-full mx-auto mb-1.5 flex items-center justify-center gap-1 border border-[#30363d]/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <div className="w-6 h-1 rounded-full bg-slate-800" />
                  </div>

                  {/* Inner Mobile Screen Content */}
                  <div className="w-full h-[318px] rounded-[22px] overflow-hidden shadow-inner bg-white border border-slate-300">
                    {step.screen}
                  </div>
                </div>

                {/* Caption description */}
                <p className="text-[11px] text-[#8b949e] leading-snug px-1">
                  {step.caption}
                </p>
              </div>

              {/* Connecting Flow Arrow (Between Steps) */}
              {idx < flowSteps.length - 1 && (
                <div className="flex items-center justify-center pt-48 text-[#3b82f6] shrink-0">
                  <ArrowRight className="w-5 h-5 stroke-[2.5] animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 📱 MOBILE SCREEN VIEW: Optimized Touch Carousel + Step Navigator */}
        <div className="lg:hidden space-y-4">
          {/* Step Navigator Pills for Mobile */}
          <div className="flex items-center justify-between bg-[#161b22] p-1.5 rounded-2xl border border-[#30363d] overflow-x-auto gap-1">
            {flowSteps.map((s, idx) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveMobileStep(idx)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMobileStep === idx
                    ? 'bg-[#1d4ed8] text-white shadow-md'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px]">
                  {s.num}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Step Card on Mobile */}
          <div className="flex flex-col items-center text-center space-y-3 p-3 bg-[#161b22] rounded-3xl border border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow">
                {flowSteps[activeMobileStep].num}
              </span>
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                {flowSteps[activeMobileStep].title}
              </h3>
            </div>

            {/* Mobile Phone Mockup Box (Centered & Crisp) */}
            <div className="w-[240px] h-[400px] rounded-[36px] p-2.5 bg-[#1c2128] border-2 border-[#3fb950] shadow-2xl relative">
              {/* Dynamic Island Notch */}
              <div className="w-20 h-4 bg-[#0d1117] rounded-full mx-auto mb-1.5 flex items-center justify-center gap-1 border border-[#30363d]/60">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Inner Screen */}
              <div className="w-full h-[345px] rounded-[24px] overflow-hidden shadow-inner bg-white border border-slate-300">
                {flowSteps[activeMobileStep].screen}
              </div>
            </div>

            <p className="text-xs text-[#8b949e] max-w-xs leading-relaxed">
              {flowSteps[activeMobileStep].caption}
            </p>

            {/* Prev / Next Mobile Buttons */}
            <div className="flex items-center justify-between w-full max-w-[240px] pt-1">
              <button
                type="button"
                onClick={() => setActiveMobileStep((prev) => Math.max(0, prev - 1))}
                disabled={activeMobileStep === 0}
                className="gh-btn text-xs px-3 py-1.5 cursor-pointer disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="text-[11px] font-mono text-[#8b949e]">
                {activeMobileStep + 1} / {flowSteps.length}
              </span>

              <button
                type="button"
                onClick={() => setActiveMobileStep((prev) => Math.min(flowSteps.length - 1, prev + 1))}
                disabled={activeMobileStep === flowSteps.length - 1}
                className="gh-btn text-xs px-3 py-1.5 cursor-pointer disabled:opacity-30 flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🛡️ BENEFITS & SECURITY (Minimal & Clean) */}
      <div id="upi-benefits-security-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#c9d1d9]">
        {/* Key Benefits Card */}
        <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#21262d] pb-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#3fb950]/15 text-[#3fb950] flex items-center justify-center font-bold text-xs border border-[#3fb950]/30">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider font-mono">Key Benefits</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">Instant Auto-Fill</span>
              <span className="text-[#8b949e] text-[11px]">— Extracts amount, payee & UTR</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">Auto-Categorization</span>
              <span className="text-[#8b949e] text-[11px]">— Smart tags for food, shopping, bills</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">Duplicate Protection</span>
              <span className="text-[#8b949e] text-[11px]">— Prevents double logging</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">No Bank Login</span>
              <span className="text-[#8b949e] text-[11px]">— Zero passwords or bank sync needed</span>
            </div>
          </div>
        </div>

        {/* Security & Privacy Card */}
        <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#21262d] pb-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#58a6ff]/15 text-[#58a6ff] flex items-center justify-center font-bold text-xs border border-[#58a6ff]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider font-mono">Security & Privacy</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">100% On-Device</span>
              <span className="text-[#8b949e] text-[11px]">— Parsed locally in your browser/app</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">Zero PIN / Credential Access</span>
              <span className="text-[#8b949e] text-[11px]">— Only reads shared receipt info</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">Native OS Sandbox</span>
              <span className="text-[#8b949e] text-[11px]">— No background SMS eavesdropping</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] shrink-0" />
              <span className="text-[#f0f6fc] font-medium">User Confirmation</span>
              <span className="text-[#8b949e] text-[11px]">— Always review before adding to ledger</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📲 SUPPORTED UPI APPS */}
      <div id="supported-upi-apps-section" className="p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-4 text-[#c9d1d9] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#21262d] pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#3fb950]" />
            <h3 className="text-sm font-bold text-[#f0f6fc]">
              Supported UPI Apps for Instant Share
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30 self-start sm:self-auto font-bold">
            All Major Indian UPI Apps Supported
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
          {/* Google Pay */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Google Pay', 1250, 'Rahul Sharma')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <GooglePayLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">Google Pay</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* PhonePe */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('PhonePe', 850, 'Swiggy')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <PhonePeLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">PhonePe</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* Paytm */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Paytm', 420, 'Blue Tokai Coffee')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <PaytmLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">Paytm</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* Slice */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Slice UPI', 499, 'Zomato')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <SliceLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">Slice</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* CRED */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('CRED', 2499, 'Amazon India')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <CredLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">CRED</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* BHIM UPI */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('BHIM', 600, 'Metro Card Recharge')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <BhimLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">BHIM</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>

          {/* Amazon Pay */}
          <button
            type="button"
            onClick={() => handleTestSimulatedShare('Amazon Pay', 1499, 'Electricity Bill')}
            className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col items-center text-center space-y-2 hover:border-[#3fb950] transition-colors shadow-sm cursor-pointer group active:scale-95"
          >
            <AmazonPayLogo size={36} className="rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
            <div className="text-xs font-bold text-[#f0f6fc]">Amazon Pay</div>
            <span className="text-[9px] font-mono text-[#3fb950] bg-[#238636]/10 px-1.5 py-0.5 rounded">Import Demo</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#f85149]/15 border border-[#f85149]/30 text-[#f85149] text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#f85149]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning && duplicateWarning.isDuplicate && (
        <div
          id="duplicate-warning-box"
          className="p-5 rounded-2xl bg-[#d29922]/15 border border-[#d29922]/40 space-y-4 shadow-xl text-[#c9d1d9] animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d29922]/20 text-[#d29922] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">
                Possible Duplicate Detected
              </h3>
              <p className="text-xs text-[#8b949e] mt-0.5">
                {duplicateWarning.message || 'This transaction has matching UPI reference ID or amount/merchant.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="gh-btn text-xs px-3.5 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-duplicate-anyway-btn"
              type="button"
              onClick={() => handleConfirmSave(true)}
              className="gh-btn gh-btn-primary text-xs px-4 py-1.5 cursor-pointer"
            >
              Add Anyway
            </button>
          </div>
        </div>
      )}

      {/* ⭐ SPECIFIED TRANSACTION DETECTED CARD */}
      {parsedData && !saveSuccess && (
        <div
          id="parsed-preview-card"
          className="p-6 sm:p-8 rounded-3xl bg-[#0d1117] border border-[#30363d] space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#c9d1d9]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#21262d] pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#3fb950]">
                Transaction Captured From Share
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#21262d] text-[#58a6ff] border border-[#30363d]">
              {Math.round(parsedData.confidence * 100)}% Auto-Match
            </span>
          </div>

          {/* Large Amount */}
          <div className="text-center py-2">
            <div className="text-4xl sm:text-5xl font-black text-[#f0f6fc] font-mono tracking-tight">
              ₹{Number(editForm.amount).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[#8b949e] mt-1 font-mono">
              {editForm.transactionType === 'INCOME' ? 'Credit • Income' : 'Debit • Expense'}
            </p>
          </div>

          {/* Summary Details Grid (or Edit mode) */}
          {!isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#161b22] border border-[#30363d] text-xs">
              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Merchant / Payee</span>
                <span className="text-sm font-bold text-[#f0f6fc] mt-0.5 block truncate">
                  {editForm.merchant}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Category</span>
                <span className="text-sm font-bold text-[#3fb950] mt-0.5 block truncate">
                  {categoryName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Payment</span>
                <span className="text-sm font-bold text-[#58a6ff] mt-0.5 block">
                  {editForm.paymentMethod}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Date (DD-MM-YYYY)</span>
                <span className="text-xs font-medium text-[#f0f6fc] mt-0.5 block font-mono">
                  {formatDDMMYYYY(editForm.transactionDate)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">UPI Ref ID</span>
                <span className="text-xs font-medium text-[#c9d1d9] mt-0.5 block font-mono truncate">
                  {editForm.upiRefId || '512345678901'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8b949e] uppercase font-mono block">Account</span>
                <span className="text-xs font-semibold text-[#f0f6fc] mt-0.5 block truncate">
                  {accountName}
                </span>
              </div>
            </div>
          ) : (
            /* Inline Edit Fields */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#8b949e]">Amount (₹)</label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#f0f6fc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#8b949e]">Merchant / Payee</label>
                <input
                  type="text"
                  value={editForm.merchant}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#f0f6fc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#8b949e]">Category</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#f0f6fc]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#8b949e]">Account</label>
                <select
                  value={editForm.accountId}
                  onChange={(e) => setEditForm({ ...editForm, accountId: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#f0f6fc]"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons: [ Edit ] [ Add Transaction ] */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="upi-edit-toggle-btn"
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="gh-btn flex-1 py-2.5 px-4 text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Details'}</span>
            </button>

            <button
              id="upi-confirm-add-btn"
              type="button"
              onClick={() => handleConfirmSave(false)}
              className="gh-btn gh-btn-primary flex-2 py-2.5 px-6 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add Transaction to Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Animation Card */}
      {saveSuccess && (
        <div className="p-8 rounded-3xl bg-[#0d1117] border border-[#238636]/50 text-center space-y-4 shadow-xl animate-in zoom-in-95 text-[#c9d1d9]">
          <div className="w-14 h-14 rounded-2xl bg-[#238636]/20 text-[#3fb950] flex items-center justify-center mx-auto border border-[#238636]/40">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#f0f6fc]">Transaction Logged Successfully!</h3>
            <p className="text-xs text-[#8b949e]">
              Ledger, 52-week activity heatmap, and account balances updated for <strong className="text-[#f0f6fc]">{accountName}</strong>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSaveSuccess(false);
                setParsedData(null);
              }}
              className="gh-btn text-xs px-4 py-2 cursor-pointer"
            >
              Import Another
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="gh-btn gh-btn-primary text-xs px-5 py-2 cursor-pointer"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
