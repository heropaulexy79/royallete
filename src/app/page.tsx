'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowRight, Play, Star, Clock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <UtensilsCrossed size={20} />
             </div>
             <span className="font-bold text-2xl tracking-tighter text-brand-dark">Royallete</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/menu" className="btn-primary py-2.5 px-6 rounded-2xl text-sm">Order Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
              <Star size={14} fill="currentColor" /> Premium Food Experience
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-brand-dark leading-[0.9] mb-8">
              Tastes that <span className="text-brand-primary">Linger</span>.
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed">
              Order from the most exclusive restaurants in town. Chef-curated meals delivered with royal precision to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/menu" className="btn-primary h-16 px-10 flex items-center justify-center gap-3 text-lg group">
                Explore Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="h-16 px-10 rounded-2xl border-2 border-slate-200 font-bold text-brand-dark flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
                  <Play size={16} fill="currentColor" />
                </div>
                How it works
              </button>
            </div>

            <div className="mt-16 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-brand-dark">12k+</span>
                <span className="text-sm font-bold text-slate-400 uppercase">Happy Clients</span>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-3xl font-black text-brand-dark">45+</span>
                <span className="text-sm font-bold text-slate-400 uppercase">Top Chefs</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative"
          >
            {/* Visual element representing a dish */}
            <div className="relative w-full aspect-square rounded-[4rem] bg-gradient-to-br from-brand-primary to-orange-600 shadow-2xl overflow-hidden p-3 rotate-3">
               <div className="w-full h-full rounded-[3.5rem] bg-slate-900 border-4 border-white/10 flex items-center justify-center">
                  <UtensilsCrossed size={120} className="text-brand-primary animate-pulse" />
               </div>
            </div>

            {/* Floating Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-12 -left-12 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Fast Delivery</p>
                  <p className="font-black text-brand-dark">25-30 Mins</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute -bottom-8 -right-8 bg-brand-dark text-white p-6 rounded-3xl shadow-2xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Track Order</p>
                  <p className="font-black">Real-time GPS</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badge */}
      <section className="bg-white py-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale">
          <span className="text-2xl font-black italic">FOODIE</span>
          <span className="text-2xl font-black italic">DINE-IN</span>
          <span className="text-2xl font-black italic">CHEF.CO</span>
          <span className="text-2xl font-black italic">GOURMET</span>
          <span className="text-2xl font-black italic">FAST-BITE</span>
        </div>
      </section>
    </main>
  );
}
