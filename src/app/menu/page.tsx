'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { FoodItem, APPROVED_CATEGORIES } from '@/types/schema';
import { APPROVED_CATALOGUE } from '@/data/approvedCatalogue';
import { useCart } from '@/context/CartContext';
import { getRecommendations, getItemRecommendations } from '@/lib/recommendations';
import AddToCartPopup from '@/components/AddToCartPopup';
import ProductConfiguratorModal from '@/components/ProductConfiguratorModal';
import { ItemCustomization } from '@/context/CartContext';
import {
  Plus,
  Minus,
  Search,
  UtensilsCrossed,
  ShoppingCart,
  Check,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

function FoodCard({
  item,
  onAdd,
  onCustomize,
}: {
  item: FoodItem;
  onAdd: (item: FoodItem, qty: number) => void;
  onCustomize: (item: FoodItem) => void;
}) {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item, qty);
    setIsAdded(true);
    setQty(1);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const isConfigurable = item.is_configurable || item.category === 'Shawarma' || item.category === 'Pizza';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="card group flex flex-col justify-between h-full bg-white relative hover:border-amber-300/80 cursor-pointer"
      onClick={() => {
        if (isConfigurable && item.is_available) {
          onCustomize(item);
        }
      }}
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative h-44 sm:h-52 -mx-3.5 sm:-mx-5 -mt-3.5 sm:-mt-5 mb-3.5 overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-[#f5efe6]">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          />
          {/* Price Tag: "From ₦..." for Shawarma, flat price for Pizza & standard dishes */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full font-black text-brand-dark text-xs sm:text-sm shadow-md border border-[#ede5da]">
            {item.category === 'Shawarma' ? `From ₦${item.price.toLocaleString()}` : `₦${item.price.toLocaleString()}`}
          </div>

          {/* Category Tag in warm dark & amber */}
          <div className="absolute top-3 left-3 bg-[#191514]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-amber-300 uppercase tracking-wider border border-amber-400/20">
            {item.category}
          </div>

          {/* Sold Out Overlay */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-[#191514]/75 backdrop-blur-[2px] flex items-center justify-center text-white font-extrabold uppercase text-xs sm:text-sm tracking-widest">
              Sold Out
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="font-extrabold text-sm sm:text-base text-brand-dark group-hover:text-brand-primary transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Action Row */}
      <div className="mt-4 pt-3 border-t border-[#ede5da] space-y-2.5" onClick={(e) => e.stopPropagation()}>
        {item.is_available ? (
          isConfigurable ? (
            <button
              type="button"
              onClick={() => onCustomize(item)}
              className="w-full h-11 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-md text-xs sm:text-sm bg-[#191514] hover:bg-black text-[#fbbf24] border border-amber-400/30 active:scale-95"
            >
              <Sparkles size={15} className="text-[#f59e0b]" />
              <span>Customize & Order</span>
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between bg-[#fbf8f3] p-1.5 rounded-xl border border-[#ede5da]">
                <span className="text-[10px] font-bold text-stone-400 uppercase pl-1.5 hidden sm:inline">Qty</span>
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-[#ede5da] flex items-center justify-center text-stone-600 hover:border-brand-primary transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center font-black text-brand-dark text-xs sm:text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#ede5da] flex items-center justify-center text-stone-600 hover:border-brand-primary transition-colors active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-xs font-black text-brand-primary pr-1">
                  ₦{(item.price * qty).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs sm:text-sm ${
                  isAdded
                    ? 'bg-[#25D366] text-white shadow-emerald-500/20'
                    : 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/20 active:scale-95'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                      <Check size={16} /> Added!
                    </motion.div>
                  ) : (
                    <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                      <ShoppingCart size={15} /> Add to Cart
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </>
          )
        ) : (
          <div className="w-full h-11 rounded-xl bg-stone-100 text-stone-400 font-bold text-xs flex items-center justify-center">
            Currently Unavailable
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MenuInner() {
  const { cart, addToCart } = useCart();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Shawarma';

  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');

  // Configurator state
  const [configuratorItem, setConfiguratorItem] = useState<FoodItem | null>(null);

  // Popup state
  const [popupTriggerItem, setPopupTriggerItem] = useState<FoodItem | null>(null);
  const [popupRecs, setPopupRecs] = useState<FoodItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'foodItems'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as FoodItem))
            .filter((item) => !(item as { is_legacy?: boolean }).is_legacy);
          setItems(fetched);
        } else {
          setItems(APPROVED_CATALOGUE.map((item, idx) => ({ id: `cat-${idx}`, ...item })));
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore menu snapshot listener fallback:', err);
        setItems(APPROVED_CATALOGUE.map((item, idx) => ({ id: `cat-${idx}`, ...item })));
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      const matchCat = item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      // If user is searching, allow cross-category results; otherwise strict category view
      return searchTerm ? matchSearch : matchCat;
    });

    return list.sort((a, b) => {
      // 1. Pizza ordering: Mini (1), Small (2), Medium (3)
      if (a.category === 'Pizza' && b.category === 'Pizza') {
        const getPizzaRank = (item: FoodItem) => {
          const name = item.name.toLowerCase();
          if (item.pizza_size === 'mini' || name.includes('mini')) return 1;
          if (item.pizza_size === 'small' || name.includes('small')) return 2;
          if (item.pizza_size === 'medium' || name.includes('medium')) return 3;
          return 4;
        };
        return getPizzaRank(a) - getPizzaRank(b);
      }

      // 2. Shawarma ordering: No Hotdog (1), Single Hotdog (2), Double Hotdog (3)
      if (a.category === 'Shawarma' && b.category === 'Shawarma') {
        const getShawarmaRank = (item: FoodItem) => {
          const name = item.name.toLowerCase();
          if (item.shawarma_type === 'no_hotdog' || name.includes('no hotdog') || name.includes('plain')) return 1;
          if (item.shawarma_type === 'single_hotdog' || name.includes('single')) return 2;
          if (item.shawarma_type === 'double_hotdog' || name.includes('double')) return 3;
          return 4;
        };
        return getShawarmaRank(a) - getShawarmaRank(b);
      }

      // 3. Fallback to approved catalogue sequence
      const indexA = APPROVED_CATALOGUE.findIndex(
        (c) => c.name.toLowerCase().trim() === a.name.toLowerCase().trim()
      );
      const indexB = APPROVED_CATALOGUE.findIndex(
        (c) => c.name.toLowerCase().trim() === b.name.toLowerCase().trim()
      );
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      return 0;
    });
  }, [items, selectedCategory, searchTerm]);

  const recommendations = useMemo(() => {
    return getRecommendations({ cart, allItems: items, limit: 3 });
  }, [cart, items]);

  const categories = APPROVED_CATEGORIES;

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col">
      <Navbar />

      {/* Header Banner in Espresso Dark + Amber Gold Highlights */}
      <section className="bg-[#191514] text-white py-10 sm:py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-amber-950/60 text-[#fbbf24] border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-[#f59e0b]" /> Handcrafted Kitchen & Bakery
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-2 tracking-tight text-white">
            Déskilz <span className="text-[#fbbf24]">Restaurant Menu</span>
          </h1>
          <p className="text-[#ede5da]/80 text-sm sm:text-base max-w-xl mb-6 sm:mb-8">
            Authentic Shawarma, artisanal Pizza, flame-grilled Burgers, delicious Nigerian Food, refreshing Drinks, and sweet Ice Cream.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search by dish name (e.g. Suya Shawarma, Rice Combo, Meatball Pizza)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#241e1c] border border-stone-700/80 rounded-2xl py-3.5 pl-12 pr-10 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs bg-stone-800 px-2.5 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 8 Approved Category Filter Tabs */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#faf6f0]/95 backdrop-blur-md border-b border-[#ede5da] py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;

            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-brand-primary text-white shadow-md shadow-red-600/25 scale-100'
                    : 'bg-white hover:bg-amber-50/60 text-[#191514] border border-[#ede5da]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-white/20 text-[#fbbf24]'
                      : 'bg-[#f5efe6] text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Upselling Bar in Harmonious Amber & Gold */}
      {cart.length > 0 && recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-6 w-full">
          <div className="bg-gradient-to-r from-amber-50 via-red-50/50 to-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#f59e0b]" /> Recommended Pairings
              </span>
              <p className="text-[#191514] font-extrabold text-sm sm:text-base mt-0.5">
                Complete your meal with these complementary selections:
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white p-2 rounded-xl border border-[#ede5da] shadow-xs flex items-center gap-2.5"
                >
                  <img
                    src={rec.image_url}
                    alt={rec.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-bold text-xs text-[#191514] leading-tight line-clamp-1">{rec.name}</p>
                    <p className="text-[11px] font-black text-brand-primary">₦{rec.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(rec, 1)}
                    className="p-1.5 bg-brand-primary hover:bg-[#c4131e] text-white rounded-lg transition-transform active:scale-90"
                    title={`Add ${rec.name} to cart`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Food Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-28 sm:pb-20 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-stone-500 text-sm font-bold">Loading approved menu dishes...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                Showing <span className="text-[#191514] font-black">{filteredItems.length}</span> dishes in{' '}
                <span className="text-brand-primary font-black">{selectedCategory}</span>
              </p>
            </div>

            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              {filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onCustomize={(itm) => setConfiguratorItem(itm)}
                  onAdd={(itm, q) => {
                    addToCart(itm, q);
                    const recs = getItemRecommendations({ item: itm, cart, allItems: items, limit: 3 });
                    setPopupRecs(recs);
                    setPopupTriggerItem(itm);
                  }}
                />
              ))}
            </motion.div>

            {filteredItems.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#ede5da] p-8 my-8">
                <UtensilsCrossed size={48} className="mx-auto text-stone-300 mb-3" />
                <h3 className="text-lg font-black text-brand-dark mb-1">No dishes match your filter</h3>
                <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Shawarma');
                  }}
                  className="btn-primary py-2.5 px-6 text-sm"
                >
                  Reset Menu Filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Product Configurator Modal for Shawarma & Pizza */}
      <ProductConfiguratorModal
        item={configuratorItem}
        isOpen={!!configuratorItem}
        onClose={() => setConfiguratorItem(null)}
        onConfirm={(item, qty, customization) => {
          addToCart(item, qty, customization);
          const recs = getItemRecommendations({ item, cart, allItems: items, limit: 3 });
          setPopupRecs(recs);
          setPopupTriggerItem(item);
        }}
      />

      {/* Smart Add-to-Cart Recommendation Popup */}
      {popupTriggerItem && (
        <AddToCartPopup
          triggerItem={popupTriggerItem}
          recommendations={popupRecs}
          onClose={() => setPopupTriggerItem(null)}
        />
      )}
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuInner />
    </Suspense>
  );
}
