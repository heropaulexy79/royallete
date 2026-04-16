'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Order, FoodItem } from '@/types/schema';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Utensils, 
  Calendar,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeRiders: 2, // Fixed for Phase 1
    averageOrder: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topItems, setTopItems] = useState<{name: string, count: number, revenue: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      const revenue = orders.reduce((acc, o) => acc + o.total_price, 0);
      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        activeRiders: 2,
        averageOrder: orders.length > 0 ? revenue / orders.length : 0
      });

      setRecentOrders(orders.slice(0, 5));

      // Calculate Top Items
      const itemCounts: Record<string, {count: number, revenue: number}> = {};
      orders.forEach(o => {
        o.items.forEach(item => {
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
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-brand-dark mb-1">Business Overview</h1>
            <p className="text-slate-500">Welcome back, Restaurant Owner. Here's what's happening today.</p>
          </div>
          <div className="flex gap-4">
             <button className="bg-white px-4 py-2 rounded-xl text-brand-dark font-bold border border-slate-100 flex items-center gap-2 shadow-sm">
                <Calendar size={18} /> Last 24 Hours
             </button>
             <Link href="/admin/menu" className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2">
                <Plus size={18} /> Add Menu Item
             </Link>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, sub: '+12% from yesterday', icon: DollarSign, color: 'bg-emerald-500' },
            { label: 'Total Orders', value: stats.totalOrders, sub: 'Daily average: 24', icon: ShoppingBag, color: 'bg-brand-primary' },
            { label: 'Active Riders', value: stats.activeRiders, sub: 'All riders available', icon: Users, color: 'bg-blue-500' },
            { label: 'Avg. Order Value', value: `₦${Math.round(stats.averageOrder).toLocaleString()}`, sub: 'Consistent performance', icon: TrendingUp, color: 'bg-purple-500' },
          ].map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
                <item.icon size={24} />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-black text-brand-dark my-1">{item.value}</h3>
              <p className="text-xs font-bold text-emerald-500">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Selling Items */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-brand-dark mb-6 flex items-center gap-2">
              <Utensils className="text-brand-primary" /> Top Selling Items
            </h3>
            <div className="space-y-6">
              {topItems.length > 0 ? topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-black text-brand-dark">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{item.count} orders</p>
                    </div>
                  </div>
                  <p className="font-black text-brand-primary">₦{item.revenue.toLocaleString()}</p>
                </div>
              )) : (
                <p className="text-slate-400 italic">No sales data yet.</p>
              )}
            </div>
            <Link href="/admin/menu" className="mt-8 w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-brand-primary hover:text-brand-primary transition-all">
              Manage Menu <ChevronRight size={18} />
            </Link>
          </div>

          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-brand-dark rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white">Recent Orders</h3>
              <Link href="/admin/orders" className="text-brand-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">{order.customer_name}</p>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-primary mb-1">₦{order.total_price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-mono">#{order.id?.slice(-5).toUpperCase()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 italic">No orders recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
