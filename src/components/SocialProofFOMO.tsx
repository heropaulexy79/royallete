'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle, X, Sparkles } from 'lucide-react';

interface FOMOOrder {
  id: string;
  item: string;
  location: string;
  timeAgo: string;
  price: string;
  image: string;
}

const SAMPLE_ORDERS: FOMOOrder[] = [
  {
    id: 'fomo-1',
    item: 'Chicken Shawarma Special',
    location: 'Campus',
    timeAgo: '2m ago',
    price: '₦2,500',
    image: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=200',
  },
  {
    id: 'fomo-2',
    item: 'Jollof Rice & Beef + Plantain',
    location: 'North Gate',
    timeAgo: '4m ago',
    price: '₦3,800',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200',
  },
  {
    id: 'fomo-3',
    item: 'Beef Pizza (Sharing Pack)',
    location: 'West Wing',
    timeAgo: '6m ago',
    price: '₦6,500',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200',
  },
  {
    id: 'fomo-4',
    item: 'Crispy Chicken & Chips',
    location: 'Hostel B',
    timeAgo: '8m ago',
    price: '₦3,200',
    image: 'https://images.unsplash.com/photo-1518013034477-2990fa317e23?q=80&w=200',
  },
  {
    id: 'fomo-5',
    item: 'Double Sausage Suya Shawarma',
    location: 'Medical Hostel',
    timeAgo: '11m ago',
    price: '₦2,800',
    image: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=200',
  },
  {
    id: 'fomo-6',
    item: 'Chilled Monster + Meat Pie Combo',
    location: 'Main Gate',
    timeAgo: '14m ago',
    price: '₦2,400',
    image: 'https://images.unsplash.com/photo-1621200414838-84423c723707?q=80&w=200',
  },
];

export default function SocialProofFOMO() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial delay before first FOMO appears (3.5s)
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed || isHovered) return;

    // Cycle order every 8 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SAMPLE_ORDERS.length);
        setVisible(true);
      }, 700);
    }, 8500);

    return () => clearInterval(interval);
  }, [isDismissed, isHovered]);

  if (isDismissed) return null;

  const current = SAMPLE_ORDERS[index];

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-30 max-w-[340px] pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="flex items-center gap-3 bg-[#191514]/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl border border-stone-700/80 shadow-2xl shadow-black/50 group"
          >
            {/* Dish Thumbnail with Fire Badge */}
            <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-stone-800 border border-stone-700">
              <img
                src={current.image}
                alt={current.item}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-0 left-0 bg-brand-primary p-0.5 rounded-br-lg text-[9px] text-white">
                <Flame size={10} className="fill-white" />
              </div>
            </div>

            {/* Order Copy */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 uppercase tracking-wider">
                  <CheckCircle size={10} className="stroke-[3]" /> Verified Pickup
                </span>
                <span className="text-stone-500 text-[10px]">•</span>
                <span className="text-[10px] text-stone-400 font-medium">{current.timeAgo}</span>
              </div>
              <p className="font-extrabold text-xs sm:text-sm text-stone-100 truncate leading-snug">
                {current.item}
              </p>
              <p className="text-[11px] text-amber-300/90 leading-none mt-0.5 font-medium truncate">
                Hot takeaway pickup • <span className="font-bold text-emerald-300">Ready in ~15 mins</span>
              </p>
            </div>

            {/* Close / Dismiss */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              aria-label="Dismiss notification"
              className="w-6 h-6 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
