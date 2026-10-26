'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { FoodItem } from '@/types/schema';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Search, UtensilsCrossed, ShoppingCart, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

function FoodItemCard({ item, index }: { item: FoodItem; index: number }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(item, quantity);
    setIsAdded(true);
    setQuantity(1);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card group overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-52 -mx-3.5 sm:-mx-5 -mt-3.5 sm:-mt-5 mb-3 sm:mb-4 overflow-hidden">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full font-black text-brand-dark text-xs sm:text-sm shadow-sm">
          ₦{item.price.toLocaleString()}
        </div>
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold uppercase text-xs tracking-widest">
            Sold Out
          </div>
        )}
      </div>

      <div className="flex-1">
        <span className="text-[9px] sm:text-[10px] font-bold text-brand-secondary uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
          {item.category || 'General'}
        </span>
        <h3 className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2 mt-1.5 leading-snug min-h-[2.5rem] sm:min-h-[3rem]">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2 mt-1 leading-relaxed hidden sm:block">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2.5 sm:space-y-3">
        {/* Quantity Row */}
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase pl-1.5 hidden sm:block">Qty</p>
          <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center font-black text-brand-dark text-sm sm:text-base">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="text-xs font-bold text-brand-primary pr-1">₦{(item.price * quantity).toLocaleString()}</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!item.is_available}
          className={`w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm sm:text-base ${
            isAdded
              ? 'bg-brand-secondary text-white'
              : 'bg-brand-primary text-white hover:brightness-110 active:scale-[0.98]'
          } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <ShoppingCart size={16} /> Added!
              </motion.div>
            ) : (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Plus size={16} /> Add to Cart
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'foodItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category || 'General')))];
  const filteredItems = items.filter(item => {
    const cat = selectedCategory === 'All' || item.category === selectedCategory;
    const search = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return cat && search;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-brand-dark text-white py-8 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#25D366]/20 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <MessageSquare size={13} /> WhatsApp Pickup Orders
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-2 sm:mb-4">
            Crave it? <span className="text-brand-primary">Order on WhatsApp.</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg mb-5 sm:mb-8 max-w-lg">
            Freshly cooked meals prepared to perfection. Add items to cart and checkout directly on WhatsApp!
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search for a dish..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-white placeholder:text-slate-500 text-sm sm:text-base"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 -mt-5 sm:-mt-8">
        <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all text-xs sm:text-sm shadow-sm flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white shadow-amber-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-12 pb-24 sm:pb-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredItems.map((item, i) => (
              <FoodItemCard key={item.id} item={item} index={i} />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-2 sm:col-span-full py-16 text-center">
                <UtensilsCrossed size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 text-sm font-medium">No dishes found. Try a different search or category.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
