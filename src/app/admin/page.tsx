'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Order } from '@/types/schema';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Utensils, 
  ChevronRight, 
  ArrowRight, 
  Plus,
  MessageSquare,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
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

      // Calculate Top Items
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
        .slice(0, 4);
      
      setTopItems(sortedItems);
    }, (error) => {
      console.warn("Firestore snapshot listener error in admin dashboard:", error);
    });

    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <MessageSquare size={13} /> WhatsApp Orders System
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark mb-1">Business Overview</h1>
            <p className="text-slate-500 text-sm sm:text-base">Real-time stats on your WhatsApp restaurant orders.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
             <Link href="/admin/orders" className="bg-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-brand-dark font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 text-sm">
                <ShoppingBag size={16} /> Orders
             </Link>
             <Link href="/admin/menu" className="btn-primary px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 text-sm">
                <Plus size={16} /> Add Food
             </Link>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          {[
            { label: 'Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, sub: 'All orders', icon: DollarSign, color: 'bg-emerald-500' },
            { label: 'Orders', value: stats.totalOrders, sub: 'Via WhatsApp', icon: ShoppingBag, color: 'bg-brand-primary' },
            { label: 'Pending', value: stats.pendingOrders, sub: 'In kitchen', icon: Clock, color: 'bg-orange-500' },
            { label: 'Avg. Value', value: `₦${Math.round(stats.averageOrder).toLocaleString()}`, sub: 'Per order', icon: TrendingUp, color: 'bg-purple-500' },
          ].map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100"
            >
              <div className={`${item.color} w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3 sm:mb-4`}>
                <item.icon size={18} className="sm:hidden" />
                <item.icon size={24} className="hidden sm:block" />
              </div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-brand-dark my-0.5 sm:my-1">{item.value}</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Top Selling Items */}
          <div className="lg:col-span-1 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100">
            <h3 className="text-base sm:text-xl font-black text-brand-dark mb-4 sm:mb-6 flex items-center gap-2">
              <Utensils className="text-brand-primary" size={18} /> Top Ordered Dishes
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {topItems.length > 0 ? topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-black text-brand-dark text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-brand-dark text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{item.count} ordered</p>
                    </div>
                  </div>
                  <p className="font-black text-brand-primary text-sm whitespace-nowrap">₦{item.revenue.toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-slate-400 italic text-sm">No sales recorded yet.</p>
              )}
            </div>
            <Link href="/admin/menu" className="mt-5 sm:mt-8 w-full py-3 sm:py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-brand-primary hover:text-brand-primary transition-all text-sm">
              Manage Products <ChevronRight size={16} />
            </Link>
          </div>

          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-brand-dark rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-5 sm:mb-8">
              <h3 className="text-base sm:text-xl font-black text-white">Recent Orders</h3>
              <Link href="/admin/orders" className="text-brand-primary font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <ShoppingBag size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{order.status}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-brand-primary text-sm">₦{order.total_price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-mono">#{order.id?.slice(-5).toUpperCase()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 italic text-sm">No orders received yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
