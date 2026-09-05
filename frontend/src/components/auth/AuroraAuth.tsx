import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { User } from '../../types';

interface AuroraAuthProps {
  onAuthSuccess?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
}

export const AuroraAuth: React.FC<AuroraAuthProps> = ({ onAuthSuccess, onLoginSuccess }) => {
  const notifyAuthSuccess = (user: User) => {
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(user);
    }
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(user);
    }
  };

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleToggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        // Log in flow
        if (!formData.email.trim()) {
          throw new Error('Please enter your email address.');
        }
        if (!formData.password) {
          throw new Error('Please enter your password.');
        }
        const res = await apiService.login(formData.email.trim(), formData.password);
        setSuccessMessage('Authenticated successfully! Entering MoneyMate...');
        setTimeout(() => {
          notifyAuthSuccess(res.user);
        }, 500);
      } else {
        // Sign Up flow
        if (!formData.firstName.trim()) {
          throw new Error('First name is required.');
        }
        if (!formData.email.trim()) {
          throw new Error('Email address is required.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
        const res = await apiService.register(fullName, formData.email.trim(), formData.password);
        setSuccessMessage('Account created! Initializing your financial dashboard...');
        setTimeout(() => {
          notifyAuthSuccess(res.user);
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Staggered animation variants for Hero content
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <main
      id="aurora-signup-container"
      className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4"
    >
      {/* Left Column (Hero & Background Video) */}
      <section
        id="hero-column"
        className="relative hidden lg:flex w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full"
      >
        {/* Background Video - STRICTLY NO DARK OVERLAY */}
        <video
          id="hero-background-video"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        {/* Hero Content Container */}
        <motion.div
          id="hero-content"
          className="z-10 w-full max-w-xs space-y-8"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand/Logo */}
          <motion.div
            id="hero-brand"
            variants={heroItemVariants}
            className="flex items-center justify-center"
          >
            <img
              src="/moneymate-logo.png"
              alt="MoneyMate Logo"
              className="h-20 w-auto max-w-[340px] object-contain drop-shadow-[0_6px_24px_rgba(37,99,235,0.45)]"
            />
          </motion.div>

          {/* Heading Block */}
          <motion.div
            id="hero-heading-block"
            variants={heroItemVariants}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-bold tracking-tight whitespace-nowrap text-white">
              {isLoginMode ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed px-4">
              {isLoginMode
                ? 'Access your MoneyMate personal finance dashboard.'
                : 'Zero-effort automated money tracking & analytics.'}
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            id="hero-steps-list"
            variants={heroItemVariants}
            className="space-y-3"
          >
            <StepItem
              id="step-1"
              number={1}
              text="Secure credentials & vault"
              active={!isLoginMode}
            />
            <StepItem
              id="step-2"
              number={2}
              text="Sync accounts & UPI flows"
              active={false}
            />
            <StepItem
              id="step-3"
              number={3}
              text="Zero-effort wealth intelligence"
              active={false}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Right Column (Sign Up / Log In Form) */}
      <section
        id="form-column"
        className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden"
      >
        <motion.div
          id="form-content"
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Mobile Logo Banner */}
          <div className="lg:hidden flex items-center justify-center pb-2">
            <div className="rounded-2xl p-2 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] border border-blue-400/30 shadow-[0_0_20px_rgba(37,99,235,0.35)]">
              <img
                src="/moneymate-logo.png"
                alt="MoneyMate Logo"
                className="h-12 w-auto max-w-[200px] object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Header */}
          <header id="form-header" className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-medium tracking-tight text-white">
                {isLoginMode ? 'Log In to Profile' : 'Create New Profile'}
              </h2>
            </div>
            <p className="text-white/40 text-sm">
              {isLoginMode
                ? 'Enter your credentials to enter your finance tracker.'
                : 'Input your basic details to begin the journey.'}
            </p>
          </header>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                id="auth-error-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/50 text-red-200 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                id="auth-success-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Layout */}
          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name (Sign Up only) */}
            {!isLoginMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup
                  id="input-first-name"
                  label="First Name"
                  placeholder="Jane"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <InputGroup
                  id="input-last-name"
                  label="Last Name"
                  placeholder="Doe"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Email */}
            <InputGroup
              id="input-email"
              label="Email"
              placeholder="jane@example.com"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password with Eye Toggle */}
            <div id="password-group" className="space-y-1.5 text-left">
              <label
                htmlFor="input-password"
                className="text-sm font-medium text-white block"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="input-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-brand-gray border-none rounded-xl h-11 px-4 pr-11 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none w-full text-sm transition-all"
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {!isLoginMode && (
                <p className="text-[11px] text-white/40 pt-0.5">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-white/90 text-black font-semibold rounded-xl h-12 flex items-center justify-center text-sm transition-all shadow-lg cursor-pointer w-full mt-4 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : isLoginMode
                ? 'Sign In to MoneyMate'
                : 'Create Account'}
            </button>
          </form>

          {/* Toggle Log In / Sign Up Mode */}
          <footer
            id="form-footer"
            className="text-center text-xs text-white/40 pt-2"
          >
            {isLoginMode ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  id="btn-switch-to-signup"
                  onClick={handleToggleMode}
                  className="text-white hover:underline font-medium cursor-pointer focus:outline-none inline-block ml-1"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  id="btn-switch-to-login"
                  onClick={handleToggleMode}
                  className="text-white hover:underline font-medium cursor-pointer focus:outline-none inline-block ml-1"
                >
                  Log in
                </button>
              </p>
            )}
          </footer>
        </motion.div>
      </section>
    </main>
  );
};

interface StepItemProps {
  number: number;
  text: string;
  active: boolean;
  id?: string;
}

function StepItem({ number, text, active, id }: StepItemProps) {
  return (
    <div
      id={id}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-sm font-medium transition-all ${
        active
          ? 'bg-white text-black border border-white shadow-lg'
          : 'bg-brand-gray text-white border-none'
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${
          active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
        }`}
      >
        {number}
      </div>
      <span className="truncate">{text}</span>
    </div>
  );
}

interface InputGroupProps {
  label: string;
  placeholder: string;
  type: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function InputGroup({
  label,
  placeholder,
  type,
  id,
  name,
  value,
  onChange,
  required = false,
}: InputGroupProps) {
  return (
    <div id={`${id}-wrapper`} className="space-y-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-white block">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 focus:outline-none w-full text-sm transition-all"
      />
    </div>
  );
}
