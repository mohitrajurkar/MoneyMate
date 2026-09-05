import React from 'react';
import {
  Zap,
  Smartphone,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  GooglePayLogo,
  PhonePeLogo,
  PaytmLogo,
  BhimLogo,
  CredLogo,
  SliceLogo,
} from '../common/UpiLogos';

interface UpiOneTapBannerProps {
  onOpenUpiImport: () => void;
}

export const UpiOneTapBanner: React.FC<UpiOneTapBannerProps> = ({ onOpenUpiImport }) => {
  return (
    <div
      id="upi-one-tap-banner"
      className="p-5 rounded-2xl bg-[#0d1117] border border-[#238636]/40 shadow-xl relative overflow-hidden transition-all hover:border-[#3fb950]/60 group"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#238636]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left Col: Info & Supported Apps */}
        <div className="space-y-3 max-w-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40">
              <Zap className="w-3 h-3 fill-current" />
              NEW
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#f0f6fc] tracking-tight">
              Track UPI payments <span className="text-[#3fb950]">in one tap</span>
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
            Share any UPI payment receipt from GPay, PhonePe, Paytm, Slice, CRED or BHIM directly to MoneyMate.
          </p>

          {/* Supported Brand Badges */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* GPay */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <GooglePayLogo size={18} className="rounded shrink-0" />
              <span>GPay</span>
            </div>

            {/* PhonePe */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <PhonePeLogo size={18} className="rounded shrink-0" />
              <span className="text-[#a371f7]">PhonePe</span>
            </div>

            {/* Paytm */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <PaytmLogo size={20} className="rounded shrink-0" />
            </div>

            {/* Slice */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <SliceLogo size={20} className="rounded shrink-0" />
            </div>

            {/* CRED */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <CredLogo size={18} className="rounded shrink-0" />
              <span className="text-[#f0f6fc] font-bold">CRED</span>
            </div>

            {/* BHIM */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] shadow-sm">
              <BhimLogo size={18} className="rounded shrink-0" />
              <span className="text-[#f0f6fc] font-bold">BHIM</span>
            </div>
          </div>
        </div>

        {/* Center: 4-Step Interactive Visual Flow */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-1 overflow-x-auto">
          {/* Step 1: Pay */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#161b22] border border-[#30363d] text-[#58a6ff] flex items-center justify-center shadow-md relative group-hover:border-[#58a6ff]/40 transition-colors">
              <div className="relative flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#8b949e]" />
                <span className="absolute text-[9px] font-mono font-bold text-[#3fb950] -top-1 right-0">₹</span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#8b949e]">1. Pay</span>
          </div>

          {/* Dotted Arrow */}
          <div className="flex items-center justify-center px-1 text-[#484f58]">
            <span className="text-xs tracking-widest font-mono">···&gt;</span>
          </div>

          {/* Step 2: Share */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#161b22] border border-[#30363d] text-[#3fb950] flex items-center justify-center shadow-md group-hover:border-[#3fb950]/40 transition-colors">
              <Share2 className="w-5 h-5 text-[#3fb950]" />
            </div>
            <span className="text-[11px] font-medium text-[#8b949e]">2. Share</span>
          </div>

          {/* Dotted Arrow */}
          <div className="flex items-center justify-center px-1 text-[#484f58]">
            <span className="text-xs tracking-widest font-mono">···&gt;</span>
          </div>

          {/* Step 3: MoneyMate */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#238636] border border-[#2ea043] text-white flex items-center justify-center shadow-md shadow-[#238636]/20 font-black text-lg">
              M
            </div>
            <span className="text-[11px] font-medium text-[#8b949e]">3. MoneyMate</span>
          </div>

          {/* Dotted Arrow */}
          <div className="flex items-center justify-center px-1 text-[#484f58]">
            <span className="text-xs tracking-widest font-mono">···&gt;</span>
          </div>

          {/* Step 4: Added */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#238636]/15 border border-[#3fb950]/40 text-[#3fb950] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 text-[#3fb950]" />
            </div>
            <span className="text-[11px] font-medium text-[#3fb950] font-semibold">4. Added!</span>
          </div>
        </div>

        {/* Right: How It Works Action Button */}
        <div className="flex items-center justify-end shrink-0">
          <button
            onClick={onOpenUpiImport}
            className="px-4 py-2.5 rounded-xl bg-[#161b22] border border-[#3fb950]/50 hover:border-[#3fb950] hover:bg-[#238636]/15 text-[#3fb950] hover:text-[#56d364] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 group/btn"
          >
            <span>How it works</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
