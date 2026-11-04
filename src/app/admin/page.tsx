'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Order } from '@/types/schema';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Utensils, 
  ChevronRight, 
  ArrowRight, 
  Clock,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeatureSettings } from '@/context/FeatureSettingsContext';

export default function AdminDashboard() {
  const { settings, updateSetting } = useFeatureSettings();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    averageOrder: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topItems, setTopItems] = useState<{name: string, count: number, revenue: number}[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (ordersSnap) => {
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      const revenue = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
      const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        pendingOrders: pending,
        averageOrder: orders.length > 0 ? revenue / orders.length : 0
      });

      setRecentOrders(orders.slice(0, 5));

      // Calculate Top Ordered Items
      const itemCounts: Record<string, {count: number, revenue: number}> = {};
      orders.forEach(o => {
        (o.items || []).forEach(item => {
          if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 };
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        });
      });

      const sortedItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setTopItems(sortedItems);
    }, (error) => {
      console.warn("Firestore snapshot listener error in admin dashboard:", error);
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-24 sm:pb-12 flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 w-full flex-1">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Déskilz Management Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark">Business Overview</h1>
            <p className="text-[#7a6655] text-sm sm:text-base mt-0.5">Live tracking for WhatsApp customer orders and catalogue management.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
             <Link href="/admin/orders" className="btn-outline px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
                <ShoppingBag size={16} /> Kitchen Orders
             </Link>
             <Link href="/admin/menu" className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
                <Layers size={16} /> Manage 70 Dishes
             </Link>
          </div>
        </div>

        {/* Feature Switches & Settings Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#ede5da] mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede5da]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-brand-dark">Feature Switches & Customer Flow Controls</h2>
                <p className="text-xs text-[#7a6655]">
                  Turn specific customer-facing prompts on or off anytime with 1 click.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-stone-500 bg-[#faf6f0] px-3 py-1 rounded-full border border-[#ede5da] self-start sm:self-auto">
              Real-time synchronization
            </span>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: Add-to-Cart Recommendation Modal */}
            <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ede5da] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-brand-dark">Add-to-Cart Upsell Popup</h3>
                  {settings.enable_upsell_popup ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">
                      <XCircle size={11} /> Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-snug">
                  Displays the &quot;Frequently Bought Together&quot; popup whenever a customer clicks Add to Cart.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateSetting('enable_upsell_popup', !settings.enable_upsell_popup)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                  settings.enable_upsell_popup
                    ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    : 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/20'
                }`}
              >
                {settings.enable_upsell_popup ? 'Suspend Feature' : 'Reactivate Feature'}
              </button>
            </div>

            {/* Feature 2: Cart Page Frequently Bought Together */}
            <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ede5da] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-brand-dark">Cart Add-on Carousel</h3>
                  {settings.enable_cart_frequently_bought ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-stone-600 bg-stone-200 px-2 py-0.5 rounded-full">
                      <XCircle size={11} /> Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-snug">
                  Shows the scrolling 2-item complementary pairing bundle on the basket/cart review page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateSetting('enable_cart_frequently_bought', !settings.enable_cart_frequently_bought)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                  settings.enable_cart_frequently_bought
                    ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    : 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/20'
                }`}
              >
                {settings.enable_cart_frequently_bought ? 'Suspend Feature' : 'Reactivate Feature'}
              </button>
            </div>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {[
            { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, sub: 'From WhatsApp orders', icon: DollarSign, color: 'bg-emerald-500' },
            { label: 'Completed Orders', value: stats.totalOrders, sub: 'Customer orders', icon: ShoppingBag, color: 'bg-brand-primary' },
            { label: 'Active in Kitchen', value: stats.pendingOrders, sub: 'Needs preparation', icon: Clock, color: 'bg-[#facc15] text-brand-dark' },
            { label: 'Average Ticket', value: `₦${Math.round(stats.averageOrder).toLocaleString()}`, sub: 'Per WhatsApp order', icon: TrendingUp, color: 'bg-indigo-600' },
          ].map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-[#ede5da]"
            >
              <div className={`${item.color} w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
                <item.icon size={20} />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-[#a89080] uppercase tracking-wider">{item.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-brand-dark my-1">{item.value}</h3>
              <p className="text-[11px] font-medium text-[#7a6655]">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Breakdown Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Top Selling Dishes */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ede5da] flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-brand-dark mb-5 flex items-center gap-2">
                <Utensils className="text-brand-primary" size={20} /> Top Ordered Dishes
              </h3>
              <div className="space-y-4">
                {topItems.length > 0 ? topItems.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#fdf8f3] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-brand-primary font-black text-xs flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-brand-dark text-sm truncate">{item.name}</p>
                        <p className="text-[11px] text-[#a89080] font-bold">{item.count} ordered</p>
                      </div>
                    </div>
                    <p className="font-black text-brand-primary text-sm whitespace-nowrap">₦{item.revenue.toLocaleString()}</p>
                  </div>
                )) : (
                  <div className="py-10 text-center text-[#a89080] text-xs">
                    No order history recorded yet.
                  </div>
                )}
              </div>
            </div>

            <Link href="/admin/menu" className="mt-6 w-full py-3 border-2 border-dashed border-[#ede5da] rounded-2xl flex items-center justify-center gap-2 text-[#7a6655] font-bold hover:border-brand-primary hover:text-brand-primary transition-all text-xs">
              Manage Products & Prices <ChevronRight size={15} />
            </Link>
          </div>

          {/* Recent Orders Stream */}
          <div className="lg:col-span-2 bg-brand-dark rounded-3xl p-6 sm:p-8 shadow-xl text-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Recent WhatsApp Orders</h3>
                <p className="text-amber-200/60 text-xs mt-0.5">Real-time submissions from customer checkout</p>
              </div>
              <Link href="/admin/orders" className="text-[#facc15] font-bold text-xs flex items-center gap-1 hover:underline">
                View All Orders <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="bg-white/10 hover:bg-white/15 p-4 rounded-2xl flex items-center justify-between gap-3 transition-colors border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                      <ShoppingBag size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-white text-sm truncate">{order.customer_name}</p>
                      <p className="text-[11px] text-amber-200/70 font-medium">
                        {order.items?.length || 0} items • <span className="uppercase text-emerald-400 font-bold">{order.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-[#facc15] text-sm">₦{order.total_price.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-200/50 font-mono">#{order.id?.slice(-5).toUpperCase()}</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-amber-200/50 text-xs">
                  No incoming orders right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
