'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const emptySubscribe = () => () => {};

export default function FloatingCart() {
  const { cart, totalPrice } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const prevCount = useRef(cartCount);
  const [bump, setBump] = useState(false);

  // useSyncExternalStore to reliably detect client mounting without cascading render warnings
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (cartCount > prevCount.current) {
      const t1 = setTimeout(() => setBump(true), 0);
      const t2 = setTimeout(() => setBump(false), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.8 }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40"
        >
          <Link href="/cart">
            <motion.div
              animate={bump ? { scale: [1, 1.18, 0.95, 1.08, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 bg-brand-dark text-white pl-4 pr-5 py-3 rounded-2xl shadow-2xl shadow-slate-900/40 hover:shadow-slate-900/60 transition-shadow cursor-pointer group"
            >
              {/* Icon + Badge */}
              <div className="relative">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:rotate-6 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <span className="absolute -top-2 -right-2 bg-[#25D366] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-brand-dark">
                  {cartCount}
                </span>
              </div>

              {/* Text */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  My Cart
                </p>
                <p className="font-black text-base text-white leading-none">
                  ₦{totalPrice.toLocaleString()}
                </p>
              </div>

              {/* Arrow */}
              <div className="ml-1 w-7 h-7 bg-white/10 group-hover:bg-brand-primary rounded-xl flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
