'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cart, removeFromCart, addToCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-4">Your cart is empty</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Let's find something delicious!</p>
          <Link href="/menu" className="btn-primary inline-flex items-center gap-2">
            Browse Menu <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
          <ShoppingBag className="text-brand-primary" />
          Your Cart ({cart.length} items)
        </h1>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {cart.map((item, index) => (
              <motion.div 
                key={item.food_item_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between py-6 ${index !== cart.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">{item.name}</h3>
                    <p className="text-sm text-slate-500">₦{item.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1">
                    <button 
                      onClick={() => removeFromCart(item.food_item_id)}
                      className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-brand-dark">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart({ id: item.food_item_id, name: item.name, price: item.price } as any)}
                      className="p-1.5 hover:bg-white hover:text-brand-primary rounded-lg transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="w-24 text-right">
                    <p className="font-bold text-brand-dark">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-brand-dark text-white rounded-3xl p-8 sticky bottom-8 shadow-2xl shadow-brand-dark/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="text-xl font-bold">₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-700">
              <span className="text-slate-400 font-medium">Delivery Fee</span>
              <span className="text-xl font-bold text-brand-secondary">FREE</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-3xl font-black text-brand-primary">₦{totalPrice.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="w-full btn-primary h-14 flex items-center justify-center gap-3 text-lg">
              Proceed to Checkout <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
