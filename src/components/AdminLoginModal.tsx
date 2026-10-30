'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, X, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { verifyAdminCredentials, setAdminAuthenticated } from '@/lib/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const isValid = verifyAdminCredentials(username, password);
      if (isValid) {
        setAdminAuthenticated(remember);
        setLoading(false);
        onSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#191514] text-white rounded-3xl shadow-2xl border border-stone-800 overflow-hidden relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="p-6 sm:p-7 pb-4 text-center border-b border-stone-800/80">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mx-auto mb-3 text-brand-primary shadow-lg shadow-red-950/40">
              <Lock size={26} />
            </div>
            <h3 className="font-black text-xl text-white tracking-tight">Admin Portal Access</h3>
            <p className="text-stone-400 text-xs mt-1">
              Please enter your credentials to manage orders and menu catalogue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/15 border border-red-500/30 text-red-200 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2"
              >
                <ShieldAlert size={15} className="text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200/90 flex items-center gap-1.5">
                <User size={13} className="text-[#fbbf24]" /> Username
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#241e1c] border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-200/90 flex items-center gap-1.5">
                <Lock size={13} className="text-[#fbbf24]" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#241e1c] border border-stone-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-stone-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-primary"
                />
                <span>Remember on this device</span>
              </label>
              <span className="text-[11px] text-stone-500">Default: admin / deskilz2024</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-brand-primary hover:bg-[#c4131e] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-700/25 active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
