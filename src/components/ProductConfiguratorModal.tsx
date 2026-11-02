'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, Plus, Minus, Sparkles, AlertCircle } from 'lucide-react';
import { FoodItem } from '@/types/schema';
import { ItemCustomization } from '@/context/CartContext';

interface ProductConfiguratorModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: FoodItem, quantity: number, customization: ItemCustomization) => void;
}

// Shawarma price calculation lookup table based on user's exact specifications:
// No Hotdog, 1Portion: 2700 | No Hotdog, 2Portions: 3500
// 1 Hotdog, 1Portion: 3200  | 1 Hotdog, 2Portions: 4000
// 2 Hotdogs, 1Portion: 3700 | 2 Hotdogs, 2Portions: 4500
const SHAWARMA_PRICE_MAP: Record<string, Record<string, number>> = {
  'No Hotdog': {
    Regular: 2700,
    Special: 3500,
  },
  'Single Hotdog': {
    Regular: 3200,
    Special: 4000,
  },
  'Double Hotdog': {
    Regular: 3700,
    Special: 4500,
  },
};

const PIZZA_FLAVORS_MINI = [
  { name: 'Meatball', desc: 'Italian spiced meatballs & melted mozzarella' },
  { name: 'Chicken', desc: 'Roasted shredded herb chicken' },
  { name: 'Chicken Suya', desc: 'Fiery spiced suya chicken bits & peppers' },
  { name: 'Mini Pizza & Burger Combo', desc: 'Personal mini pizza paired with classic beef burger' },
];

const PIZZA_FLAVORS_STANDARD = [
  { name: 'Meatball', desc: 'Italian spiced meatballs & melted mozzarella' },
  { name: 'Chicken', desc: 'Roasted shredded herb chicken & sweet corn' },
  { name: 'Chicken Suya', desc: 'Fiery spiced suya chicken & onions' },
];

function resolveSausageFromItem(item: FoodItem | null): string {
  if (!item) return 'No Hotdog';
  if (item.shawarma_type === 'single_hotdog' || item.name.toLowerCase().includes('single')) {
    return 'Single Hotdog';
  }
  if (item.shawarma_type === 'double_hotdog' || item.name.toLowerCase().includes('double')) {
    return 'Double Hotdog';
  }
  return 'No Hotdog';
}

export default function ProductConfiguratorModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: ProductConfiguratorModalProps) {
  // Quantity
  const [qty, setQty] = useState(1);

  // Shawarma states
  const [portion, setPortion] = useState<string | null>(null);
  const [protein, setProtein] = useState<string | null>(null);

  // Pizza states
  const [pizzaFlavor, setPizzaFlavor] = useState<string | null>(null);

  // Derive sausage from clicked Shawarma item
  const sausage = useMemo(() => resolveSausageFromItem(item), [item]);

  // Reset when a new item opens
  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setPortion(null);
      setProtein(null);
      setPizzaFlavor(null);
    }
  }, [isOpen, item]);

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const isShawarma = item?.configurator_type === 'shawarma' || item?.category === 'Shawarma';
  const isPizza = item?.configurator_type === 'pizza' || item?.category === 'Pizza';

  // Shawarma pricing calculation: requires both Portion (Regular/Special) and Protein (Chicken/Suya)
  const shawarmaCalculatedPrice = useMemo(() => {
    if (!portion || !protein) return null;
    const base = SHAWARMA_PRICE_MAP[sausage]?.[portion];
    if (!base) return null;
    const beefSurcharge = protein === 'Beef' ? 1000 : 0;
    return base + beefSurcharge;
  }, [sausage, portion, protein]);

  // Pizza pricing calculation: requires flavor
  const pizzaCalculatedPrice = useMemo(() => {
    if (!isPizza || !pizzaFlavor || !item) return null;
    const size = item.pizza_size || (item.name.toLowerCase().includes('mini') ? 'mini' : item.name.toLowerCase().includes('medium') ? 'medium' : 'small');
    if (size === 'mini') return 3500;
    if (size === 'small') return 6000;
    if (size === 'medium') return 10000;
    return item.price;
  }, [isPizza, pizzaFlavor, item]);

  // Combined active unit price
  const activeUnitPrice = isShawarma ? shawarmaCalculatedPrice : isPizza ? pizzaCalculatedPrice : item?.price ?? null;
  const isReadyToAdd = activeUnitPrice !== null;

  const handleAddToCart = () => {
    if (!item || activeUnitPrice === null) return;

    let summary = '';
    if (isShawarma) {
      const portionText = portion === 'Regular' ? '1 Portion' : '2 Portions';
      summary = `${portionText} of ${protein}`;
    } else if (isPizza) {
      summary = `Flavor: ${pizzaFlavor}`;
    }

    onConfirm(item, qty, {
      summary,
      unitPrice: activeUnitPrice,
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#191514]/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#ede5da] overflow-hidden my-auto z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header image banner */}
          <div className="relative h-44 sm:h-48 w-full bg-[#191514] overflow-hidden flex-shrink-0">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191514] via-[#191514]/40 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-[#191514]/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-[#191514] flex items-center justify-center transition-all border border-white/20 active:scale-90"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Title & Badge in Hero */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-[#fbbf24] text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles size={11} /> {item.category} • Customizer
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
                {item.name}
              </h2>
              {item.description && (
                <p className="text-stone-300 text-xs line-clamp-1 mt-0.5 leading-snug">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Scrollable Customization Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-stone-100">
            {/* ── SHAWARMA CONFIGURATOR ── */}
            {isShawarma && (
              <>
                {/* Fixed Selected Sausage Confirmation Badge */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#fdfbf7] border border-[#ede5da]">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-[#b45309] flex items-center justify-center text-sm font-black flex-shrink-0">
                    🌭
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">Selected Sausage Style</p>
                    <p className="font-extrabold text-sm text-[#191514] truncate">
                      {sausage === 'No Hotdog'
                        ? 'No Hotdog (Pure Chicken Wrap)'
                        : sausage === 'Single Hotdog'
                        ? '1 Smoked Hotdog Sausage'
                        : '2 Smoked Hotdog Sausages'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Selected
                  </span>
                </div>

                {/* 1. Portion Choice: Regular (1 Portion) vs Special (2 Portions) */}
                <div className="pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-[#191514] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-black flex items-center justify-center">
                        1
                      </span>
                      Select Portion Size
                    </label>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'Regular',
                        title: 'Regular',
                        subtitle: '1 Portion of Meat',
                        desc: 'Tender seasoned cuts & crisp dressing',
                      },
                      {
                        id: 'Special',
                        title: 'Special',
                        subtitle: '2 Portions of Meat',
                        desc: 'Double portion filling with extra rich sauce',
                      },
                    ].map((opt) => {
                      const isSelected = portion === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPortion(opt.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-brand-primary bg-red-50/60 ring-2 ring-brand-primary/20 shadow-xs'
                              : 'border-[#ede5da] bg-[#fdfbf7] hover:border-amber-300/80 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-black text-sm text-[#191514] block leading-tight">
                                {opt.title}
                              </span>
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                                {opt.subtitle}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'border-brand-primary bg-brand-primary text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={11} className="stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight mt-1">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Protein Choice: Chicken vs Chicken Suya */}
                <div className="pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-[#191514] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-black flex items-center justify-center">
                        2
                      </span>
                      Select Meat / Flavor
                    </label>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Chicken', title: 'Chicken', tag: 'Savory Mild' },
                      { id: 'Chicken Suya', title: 'Chicken Suya', tag: 'Fiery Suya Spiced' },
                      { id: 'Beef', title: 'Beef', tag: 'Coming Soon', disabled: true },
                    ].map((opt) => {
                      const isSelected = protein === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={opt.disabled}
                          onClick={() => !opt.disabled && setProtein(opt.id)}
                          className={`p-3 rounded-2xl border text-left transition-all relative ${
                            opt.disabled
                              ? 'border-dashed border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'border-brand-primary bg-red-50/60 ring-2 ring-brand-primary/20 shadow-xs'
                              : 'border-[#ede5da] bg-[#fdfbf7] hover:border-amber-300/80 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs sm:text-sm text-[#191514] leading-tight">
                              {opt.title}
                            </span>
                            {!opt.disabled && (
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-brand-primary bg-brand-primary text-white'
                                    : 'border-stone-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check size={10} className="stroke-[3]" />}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider block ${
                              opt.disabled ? 'text-stone-400' : 'text-amber-700'
                            }`}
                          >
                            {opt.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── PIZZA CONFIGURATOR ── */}
            {isPizza && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-[#191514] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-black flex items-center justify-center">
                      1
                    </span>
                    Choose Your Pizza Flavor
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Required
                  </span>
                </div>

                <div className="space-y-2">
                  {(item.pizza_size === 'mini' || item.name.toLowerCase().includes('mini')
                    ? PIZZA_FLAVORS_MINI
                    : PIZZA_FLAVORS_STANDARD
                  ).map((flavor) => {
                    const isSelected = pizzaFlavor === flavor.name;
                    return (
                      <button
                        key={flavor.name}
                        type="button"
                        onClick={() => setPizzaFlavor(flavor.name)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-brand-primary bg-red-50/60 ring-2 ring-brand-primary/20 shadow-xs'
                            : 'border-[#ede5da] bg-[#fdfbf7] hover:border-amber-300/80 hover:bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm text-[#191514]">{flavor.name}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{flavor.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                            isSelected
                              ? 'border-brand-primary bg-brand-primary text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Area with Price Reveal & Action */}
          <div className="p-4 sm:p-5 bg-[#faf6f0] border-t border-[#ede5da] space-y-3.5 flex-shrink-0">
            {/* Quantity and Price Row */}
            <div className="flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#ede5da] shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 uppercase pr-1">Qty</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center font-black text-sm text-[#191514]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center active:scale-90 transition-transform shadow-2xs"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Price Reveal State */}
              <div className="text-right">
                <AnimatePresence mode="wait">
                  {isReadyToAdd ? (
                    <motion.div
                      key="price-ready"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-right"
                    >
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">Total Price</span>
                      <span className="text-xl sm:text-2xl font-black text-brand-dark">
                        ₦{((activeUnitPrice ?? 0) * qty).toLocaleString()}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="price-pending"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-stone-400 text-xs font-semibold flex items-center gap-1 justify-end"
                    >
                      <AlertCircle size={13} className="text-amber-500" />
                      <span>Select options to view price</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              disabled={!isReadyToAdd}
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                isReadyToAdd
                  ? 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/25 active:scale-[0.98]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingBag size={18} />
              {isReadyToAdd
                ? `Add ${qty > 1 ? `${qty} items` : 'to Cart'} — ₦${((activeUnitPrice ?? 0) * qty).toLocaleString()}`
                : isShawarma
                ? 'Select Portion & Meat'
                : 'Select Flavor to Proceed'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
