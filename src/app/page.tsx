'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowRight, Star, MessageSquare, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <UtensilsCrossed size={16} className="sm:hidden" />
              <UtensilsCrossed size={20} className="hidden sm:block" />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tighter text-brand-dark">Royallete</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors hidden sm:inline">
              Admin Portal
            </Link>
            <Link href="/menu" className="btn-primary py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm">
              <ShoppingBag size={14} className="mr-1.5" /> Order Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-72 sm:w-[600px] h-72 sm:h-[600px] bg-brand-primary/10 rounded-full blur-3xl -mr-32 sm:-mr-64 -mt-32 sm:-mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-[400px] h-48 sm:h-[400px] bg-[#25D366]/10 rounded-full blur-3xl -ml-16 sm:-ml-32 -mb-16 sm:-mb-32 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#25D366]/15 text-emerald-800 px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-widest mb-5">
              <MessageSquare size={13} className="text-[#25D366]" /> Direct WhatsApp Ordering
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-brand-dark leading-[0.9] mb-5 sm:mb-8">
              Fresh Food, <br />
              <span className="text-brand-primary">Ordered on<br className="sm:hidden" /> WhatsApp</span>.
            </h1>
            <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Browse our chef-curated menu, build your order, and send it directly to our kitchen via WhatsApp. No card details or online payment needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-10">
              <Link href="/menu" className="btn-primary h-12 sm:h-14 px-7 sm:px-10 text-base sm:text-lg group w-full sm:w-auto justify-center">
                Browse Menu <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/2347030574580"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl border-2 border-slate-200 font-bold text-brand-dark flex items-center justify-center gap-2.5 hover:bg-slate-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <MessageSquare size={18} className="text-[#25D366]" /> Chat with Us
              </a>
            </div>

            <div className="flex items-center gap-8 sm:gap-10 justify-center lg:justify-start">
              <div className="flex flex-col text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-brand-dark">100%</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">No Online Cards</span>
              </div>
              <div className="w-px h-10 sm:h-12 bg-slate-200" />
              <div className="flex flex-col text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-brand-dark">Instant</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Confirmation</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Column – hide on very small screens to save space */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.1 }}
            className="relative hidden sm:block"
          >
            <div className="relative w-full aspect-square max-w-sm mx-auto rounded-[3rem] sm:rounded-[4rem] bg-gradient-to-br from-brand-primary to-amber-600 shadow-2xl overflow-hidden p-3 rotate-3">
              <div className="w-full h-full rounded-[2.5rem] sm:rounded-[3.5rem] bg-slate-900 border-4 border-white/10 flex items-center justify-center">
                <UtensilsCrossed size={100} className="text-brand-primary animate-pulse" />
              </div>
            </div>

            {/* Floating Card: Pickup */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -left-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Freshly Made</p>
                  <p className="font-black text-brand-dark text-sm sm:text-base">Quick Pickup</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card: WhatsApp */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 bg-brand-dark text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366]/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#25D366]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">WhatsApp Checkout</p>
                  <p className="font-black text-sm sm:text-base">+234 703 057 4580</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3 Step Process */}
      <section className="bg-white py-12 sm:py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
            <span className="text-brand-primary font-bold text-xs uppercase tracking-widest">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mt-2">Order in 3 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Select Your Dishes',
                desc: 'Browse our menu of hot meals, drinks, and sides and add your favorites to the cart.',
              },
              {
                step: '02',
                title: 'Add Order Notes',
                desc: 'Tell us your name, pickup time, or any culinary preferences (e.g., extra pepper, dine-in).',
              },
              {
                step: '03',
                title: 'Checkout on WhatsApp',
                desc: 'One click sends your complete order to our WhatsApp. Pay cash or transfer on pickup!',
              },
            ].map((card, i) => (
              <div key={i} className="bg-slate-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 group hover:border-brand-primary transition-colors">
                <span className="text-3xl sm:text-4xl font-black text-brand-primary/20 group-hover:text-brand-primary/40 transition-colors">
                  {card.step}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark mt-3 mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/menu" className="btn-primary inline-flex px-10 h-12 text-base">
              Start Ordering <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
