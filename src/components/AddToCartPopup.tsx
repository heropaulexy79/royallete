'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Plus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodItem } from '@/types/schema';
import { useCart } from '@/context/CartContext';

interface AddToCartPopupProps {
  triggerItem: FoodItem | null;
  recommendations: FoodItem[];
  onClose: () => void;
}

const PAIRING_REASON: Record<string, string> = {
  Drinks: '🔥 84% of customers pair this with a chilled drink',
  Snacks: '⚡ Popular crispy side bite with this order',
  Shawarma: '👑 Top-rated meal combo pairing',
  Pizza: '🍕 Customers frequently share with pizza',
  Burger: '🍔 Upgrade your meal with a juicy burger',
  'Chicken & Chips': '🍗 Golden crispy sides that go together',
  Food: '🍚 Hearty traditional side pairing',
  'Ice Cream': '🍦 Sweet scoop to complete your meal',
};

function RecommendationCard({
  item,
  onAdd,
}: {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
}) {
  const [added, setAdded] = useState(false);
  const reason = PAIRING_REASON[item.category] ?? '🔥 Frequently bought together';

  const handleAdd = () => {
    onAdd(item);
    setAdded(true);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-[#ede5da] hover:border-amber-400/80 hover:shadow-sm transition-all group"
    >
      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-[#f5efe6] relative">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-[#191514]/80 backdrop-blur-xs text-amber-300 text-[8px] font-black uppercase tracking-wider text-center py-0.5 leading-none">
          {item.category}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#191514] text-sm leading-tight line-clamp-1">{item.name}</p>
        <p className="text-[10px] text-amber-700 font-bold mt-0.5 leading-tight line-clamp-1">{reason}</p>
        <p className="font-black text-brand-primary text-sm mt-1">₦{item.price.toLocaleString()}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={added}
        aria-label={`Add ${item.name} to cart`}
        className={`flex-shrink-0 h-9 px-3.5 rounded-xl flex items-center gap-1 font-bold text-xs transition-all shadow-xs ${
          added
            ? 'bg-[#25D366] text-white cursor-default'
            : 'bg-brand-primary hover:bg-[#c4131e] text-white active:scale-95'
        }`}
      >
        {added ? (
          <>
            <Check size={14} className="stroke-[3]" /> Added
          </>
        ) : (
          <>
            <Plus size={14} className="stroke-[3]" /> Add
          </>
        )}
      </button>
    </motion.div>
  );
}

export default function AddToCartPopup({ triggerItem, recommendations, onClose }: AddToCartPopupProps) {
  const { addToCart } = useCart();
  const backdropRef = useRef<HTMLDivElement>(null);
  const [allAdded, setAllAdded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleAddRec = (item: FoodItem) => {
    addToCart(item, 1);
  };

  const handleAddAllRecs = () => {
    recommendations.forEach((item) => {
      addToCart(item, 1);
    });
    setAllAdded(true);
  };

  if (!triggerItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="popup-backdrop"
        ref={backdropRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === backdropRef.current) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
        aria-label="Frequently bought together"
      >
        <motion.div
          key="popup-panel"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#faf6f0] rounded-3xl shadow-2xl overflow-hidden border border-[#ede5da] max-h-[88vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Card with Social Proof and Frequently Bought Together Label */}
          <div className="relative bg-gradient-to-br from-[#191514] via-[#241a18] to-[#2d1f1b] px-5 py-4 sm:py-5 text-white flex-shrink-0">
            <button
              onClick={onClose}
              aria-label="Close popup"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-950/40">
                <Check size={20} className="text-white stroke-[3]" />
              </div>
              <div className="min-w-0 pr-6">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  ✓ Added to Your Cart
                </p>
                <p className="text-white font-extrabold text-sm sm:text-base leading-tight truncate mt-0.5">
                  {triggerItem.name}
                </p>
              </div>
            </div>

            {/* High-Converting Frequently Bought Together Banner */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#fbbf24] flex-shrink-0" />
                  Frequently Bought Together
                </p>
                <p className="text-stone-300 text-[11px] mt-0.5">
                  Customers usually complete this dish with:
                </p>
              </div>

              {recommendations.length > 1 && (
                <button
                  type="button"
                  onClick={handleAddAllRecs}
                  disabled={allAdded}
                  className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all ${
                    allAdded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-400 hover:bg-amber-300 text-[#191514] active:scale-95 shadow-xs'
                  }`}
                >
                  {allAdded ? '✓ All Added' : '+ Add All'}
                </button>
              )}
            </div>
          </div>

          {/* Recommendations List */}
          <div className="px-4 py-3 space-y-2.5 max-h-[42vh] overflow-y-auto overscroll-contain flex-1 min-h-0">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <RecommendationCard key={rec.id} item={rec} onAdd={handleAddRec} />
              ))
            ) : (
              <p className="text-center text-[#a89080] text-sm py-6">Your order is set! Head to cart to checkout.</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 sm:pb-5 pt-3 flex flex-col gap-2 bg-[#faf6f0] border-t border-[#ede5da] flex-shrink-0">
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-brand-primary hover:bg-[#c4131e] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-red-700/25 active:scale-95"
            >
              <ShoppingCart size={16} />
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 rounded-xl text-[#7a6655] hover:text-[#191514] font-bold text-xs hover:bg-[#ede5da] transition-colors"
            >
              Continue Browsing Dishes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
