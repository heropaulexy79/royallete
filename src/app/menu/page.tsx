'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { FoodItem } from '@/types/schema';
import { useCart } from '@/context/CartContext';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data for Phase 1 (until DB is seeded)
const MOCK_ITEMS: FoodItem[] = [
  { id: '1', name: 'Gourmet Truffle Burger', price: 4500, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { id: '2', name: 'Spicy Margherita Pizza', price: 6000, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { id: '3', name: 'Atlantic Salmon Salad', price: 5500, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { id: '4', name: 'Creamy Pesto Pasta', price: 4800, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { id: '5', name: 'Double Cheese Fries', price: 2500, category: 'Sides', image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { id: '6', name: 'Chocolate Lava Cake', price: 3200, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800', is_available: true, restaurant_id: 'r1' },
];

export default function MenuPage() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(MOCK_ITEMS.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? MOCK_ITEMS 
    : MOCK_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Header */}
      <section className="bg-brand-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black mb-4">Crave it? <span className="text-brand-primary text-glow">Order it.</span></h1>
            <p className="text-slate-400 text-lg mb-8">Premium dishes from the finest chefs, delivered to your doorstep in minutes.</p>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search for your favorite dish..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-white"
              />
            </div>
          </div>
          <div className="hidden lg:block w-72 h-72 bg-gradient-to-br from-brand-primary to-orange-600 rounded-3xl rotate-12 shadow-2xl shadow-brand-primary/20 p-2">
            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
              < UtensilsCrossed size={80} className="text-brand-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
                selectedCategory === cat 
                ? 'bg-brand-primary text-white scale-105' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card group overflow-hidden"
            >
              <div className="relative h-56 -m-4 mb-4 overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-bold text-brand-dark shadow-sm">
                  ₦{item.price.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-bold text-xl text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-1">{item.name}</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">Fresh ingredients and house-made sauces for an unforgettable experience.</p>
              <button 
                onClick={() => addToCart(item)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Add to Cart</span>
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
