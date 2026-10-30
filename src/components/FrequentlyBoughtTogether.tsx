'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, OrderItem } from '@/types/schema';
import { getRecommendations } from '@/lib/recommendations';
import { Plus, Check, Sparkles, ShoppingBag, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface FrequentlyBoughtTogetherProps {
  cart: OrderItem[];
  allItems: FoodItem[];
  onAddItems: (items: FoodItem[]) => void;
}

export default function FrequentlyBoughtTogether({
  cart,
  allItems,
  onAddItems,
}: FrequentlyBoughtTogetherProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Recommendations based on current cart
  const recommendations = getRecommendations({ cart, allItems, limit: 2 });

  // Default select all recommended add-ons when recommendations change
  useEffect(() => {
    if (recommendations.length > 0) {
      setSelectedIds(new Set(recommendations.map((r) => r.id)));
    }
  }, [recommendations.map((r) => r.id).join(',')]);

  if (cart.length === 0 || recommendations.length === 0) {
    return null;
  }

  // Primary anchor item from the cart (first item)
  const primaryCartItem = cart[0];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedItems = recommendations.filter((item) => selectedIds.has(item.id));
  const totalBundleAddonPrice = selectedItems.reduce((acc, item) => acc + item.price, 0);

  const handleAddBundle = () => {
    if (selectedItems.length === 0) return;
    onAddItems(selectedItems);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#ede5da] shadow-sm relative overflow-hidden">
      {/* Decorative Warm Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#ede5da]">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
            <Flame size={13} className="text-[#f59e0b] fill-[#f59e0b]" />
            Frequently Bought Together
          </span>
          <h3 className="font-extrabold text-brand-dark text-base sm:text-lg leading-tight mt-0.5">
            Complete Your Meal with Popular Pairings
          </h3>
        </div>
        <span className="text-xs text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full font-bold self-start sm:self-auto flex items-center gap-1">
          <Sparkles size={12} className="text-[#f59e0b]" /> 1-Click Bundle Add
        </span>
      </div>

      {/* Visual Product Cards with Plus Signs (Amazon / Shopify style) */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
        {/* Item 1: Already in Cart */}
        <div className="relative bg-[#faf6f0] border-2 border-stone-300/80 rounded-2xl p-2.5 w-28 sm:w-36 flex-shrink-0 text-center">
          <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-white mb-2">
            <img
              src={primaryCartItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300'}
              alt={primaryCartItem.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="inline-block bg-stone-800 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-1 leading-none">
            In Your Cart
          </span>
          <p className="text-xs font-extrabold text-brand-dark truncate">{primaryCartItem.name}</p>
          <p className="text-xs font-black text-brand-primary">₦{primaryCartItem.price.toLocaleString()}</p>
        </div>

        {/* Plus Connector & Recommended Items */}
        {recommendations.map((rec) => {
          const isSelected = selectedIds.has(rec.id);
          return (
            <React.Fragment key={rec.id}>
              {/* Bold Plus Icon */}
              <div className="w-7 h-7 rounded-full bg-[#ede5da] flex items-center justify-center text-stone-600 font-black flex-shrink-0">
                <Plus size={16} strokeWidth={3} />
              </div>

              {/* Addon Item Card */}
              <div
                onClick={() => toggleSelect(rec.id)}
                className={`cursor-pointer relative rounded-2xl p-2.5 w-28 sm:w-36 flex-shrink-0 text-center transition-all border-2 ${
                  isSelected
                    ? 'bg-amber-50/50 border-amber-400 shadow-sm'
                    : 'bg-[#faf6f0]/60 border-stone-200 opacity-60'
                }`}
              >
                <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden bg-white mb-2 relative">
                  <img
                    src={rec.image_url}
                    alt={rec.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-[#191514]/80 text-amber-300 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                    {rec.category}
                  </div>
                </div>
                <span
                  className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mb-1 leading-none ${
                    isSelected ? 'bg-amber-500 text-[#191514]' : 'bg-stone-300 text-stone-600'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Tap to Add'}
                </span>
                <p className="text-xs font-extrabold text-brand-dark truncate">{rec.name}</p>
                <p className="text-xs font-black text-brand-primary">₦{rec.price.toLocaleString()}</p>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Checkboxes List and 1-Click Action Bar */}
      <div className="bg-[#faf6f0] rounded-2xl p-3 sm:p-4 border border-[#ede5da] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Checkbox Rows */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span className="w-4 h-4 rounded bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>
              <strong className="text-brand-dark">This item:</strong> {primaryCartItem.name} (₦{primaryCartItem.price.toLocaleString()})
            </span>
          </div>

          {recommendations.map((rec) => {
            const isSelected = selectedIds.has(rec.id);
            return (
              <label
                key={rec.id}
                className="flex items-center gap-2 cursor-pointer text-stone-700 select-none hover:text-brand-dark transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(rec.id)}
                  className="w-4 h-4 rounded accent-brand-primary text-brand-primary cursor-pointer"
                />
                <span>
                  <strong className="text-brand-dark">{rec.name}</strong> (₦{rec.price.toLocaleString()})
                  <span className="text-[10px] text-amber-700 font-bold ml-1.5">
                    • {rec.category === 'Drinks' ? 'Chilled pairing' : 'Crispy side'}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {/* Bundle CTA Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#ede5da]">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Add-ons Total
            </span>
            <span className="text-base sm:text-lg font-black text-brand-primary leading-none">
              ₦{totalBundleAddonPrice.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            disabled={selectedItems.length === 0 || addedSuccess}
            className={`h-11 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap ${
              addedSuccess
                ? 'bg-[#25D366] text-white shadow-emerald-500/25'
                : selectedItems.length > 0
                ? 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/25'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add Selected ({selectedItems.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
