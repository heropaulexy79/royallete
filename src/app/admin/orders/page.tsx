'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Order, OrderStatus, Rider } from '@/types/schema';
import { Check, Clock, Package, Bike, ArrowRight, Eye, User, Phone, MapPin, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'assigned',
  assigned: 'delivered',
  delivered: null,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  assigned: 'Dispatched',
  delivered: 'Delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRiderPanel, setShowRiderPanel] = useState(false);

  useEffect(() => {
    // Listen to orders
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    // Fetch riders
    const fetchRiders = async () => {
      const snapshot = await getDocs(collection(db, 'riders'));
      setRiders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rider)));
      
      // If no riders exist, seed some mock riders
      if (snapshot.docs.length === 0) {
        setRiders([
          { id: 'rider1', name: 'Deji Adekunle', phone: '08123456789', is_available: true },
          { id: 'rider2', name: 'Emeka Obi', phone: '08198765432', is_available: true },
        ]);
      }
    };
    fetchRiders();

    return () => unsubOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (nextStatus === 'assigned') {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order || null);
      setShowRiderPanel(true);
      return;
    }
    
    if (nextStatus) {
      await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
    }
  };

  const assignRider = async (rider: Rider) => {
    if (!selectedOrder) return;
    await updateDoc(doc(db, 'orders', selectedOrder.id!), { 
      status: 'assigned',
      rider_id: rider.id,
      rider_name: rider.name
    });
    setShowRiderPanel(false);
    setSelectedOrder(null);
  };

  const stats = {
    totalOrders: orders.length,
    todayRevenue: orders.reduce((acc, o) => acc + o.total_price, 0),
    activeOrders: orders.filter(o => o.status !== 'delivered').length
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-brand-dark mb-2">Live Orders</h1>
            <p className="text-slate-500">Manage real-time incoming orders and delivery status.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
              <ShoppingBag className="text-brand-primary mb-1" size={20} />
              <span className="text-2xl font-black text-brand-dark">{stats.totalOrders}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
            </div>
            <div className="bg-brand-secondary p-4 rounded-2xl shadow-sm flex flex-col items-center text-white">
              <TrendingUp className="mb-1" size={20} />
              <span className="text-2xl font-black">{stats.activeOrders}</span>
              <span className="text-[10px] font-bold text-emerald-100 uppercase">Active</span>
            </div>
            <div className="bg-brand-dark p-4 rounded-2xl shadow-sm flex flex-col items-center text-white">
              <DollarSign className="text-brand-primary mb-1" size={20} />
              <span className="text-xl font-black">₦{stats.todayRevenue.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
            </div>
          </div>
        </div>

        {/* Live Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr 
                      key={order.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-6">
                        <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">#{order.id?.slice(-5)}</span>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{order.payment_method}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-brand-dark">{order.customer_name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{order.address}</p>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-500">
                        {order.items.length} dishes
                      </td>
                      <td className="px-6 py-6 font-bold text-brand-dark">
                        ₦{order.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {STATUS_FLOW[order.status] ? (
                          <button 
                            onClick={() => handleUpdateStatus(order.id!, order.status)}
                            className="btn-primary py-2 px-4 text-xs flex items-center gap-2 whitespace-nowrap"
                          >
                            Mark {STATUS_LABELS[STATUS_FLOW[order.status]!]} <ArrowRight size={14} />
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                            <Check size={14} /> Completed
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rider Assignment Modal */}
      <AnimatePresence>
        {showRiderPanel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRiderPanel(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-brand-dark mb-2">Assign Rider</h2>
              <p className="text-slate-500 mb-8">Select a rider for Order #{selectedOrder?.id?.slice(-5)}</p>
              
              <div className="space-y-4">
                {riders.map((rider) => (
                  <button
                    key={rider.id}
                    onClick={() => assignRider(rider)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary shadow-sm">
                        <Bike size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-brand-dark">{rider.name}</p>
                        <p className="text-xs text-slate-500">{rider.phone}</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
