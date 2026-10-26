'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

const CheckoutContent = dynamic(() => import('@/components/CheckoutContent'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent" />
    </div>
  ),
});

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-28 sm:pb-0">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <CheckoutContent />
      </div>
    </main>
  );
}
