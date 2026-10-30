'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminAuthenticated, logoutAdmin } from '@/lib/adminAuth';
import AdminLoginModal from '@/components/AdminLoginModal';
import { Lock, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = isAdminAuthenticated();
    setIsAuthenticated(auth);
    if (!auth) {
      setShowLoginModal(true);
    }
  }, [pathname]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setShowLoginModal(true);
  };

  // Initial check state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 font-bold text-sm">Checking administrator session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#191514] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center mx-auto mb-4 text-brand-primary">
            <Lock size={30} />
          </div>
          <h1 className="text-2xl font-black text-white">Protected Admin Area</h1>
          <p className="text-stone-400 text-xs mt-2">
            This dashboard requires authenticated restaurant credentials.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-brand-primary hover:bg-[#c4131e] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Enter Password
            </button>
            <Link
              href="/"
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>

        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => {
            // Keep modal open or redirect to home if closed without logging in
            router.push('/');
          }}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Authenticated
  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col">
      {/* Admin Session Bar */}
      <div className="bg-[#241e1c] text-white px-4 py-1.5 border-b border-stone-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-200">Admin Mode Active</span>
          <span className="text-stone-500 hidden sm:inline">•</span>
          <span className="text-stone-400 hidden sm:inline text-[11px]">Déskilz Restaurant Control Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-stone-400 hover:text-red-400 transition-colors text-xs font-bold"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
