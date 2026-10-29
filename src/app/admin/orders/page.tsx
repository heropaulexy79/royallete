'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '@/types/schema';
import { 
  Package, 
  ArrowRight, 
  Eye, 
  MessageSquare,
  FileText, 
  CheckCircle2, 
  Utensils,
  ShoppingBag
} from 'lucide-react';

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'New WhatsApp Order',
  preparing: 'Preparing in Kitchen',
  ready: 'Ready for Pickup / Dine-in',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-[#fdf8f3] text-[#7a6655] border-[#ede5da]',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      console.warn("Firestore snapshot listener error in admin orders:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') return order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';
    if (filter === 'completed') return order.status === 'completed' || order.status === 'cancelled';
    return true;
  });

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-24 sm:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 text-brand-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <MessageSquare size={13} /> Déskilz WhatsApp Orders
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark">Kitchen & Order Management</h1>
            <p className="text-[#7a6655] text-sm sm:text-base">Track and prepare customer orders submitted via WhatsApp.</p>
          </div>

          <div className="flex bg-white rounded-xl sm:rounded-2xl p-1 border border-[#ede5da] shadow-sm self-start w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'active' ? 'bg-brand-dark text-white' : 'text-[#7a6655] hover:text-brand-dark'
              }`}
            >
              Active ({orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'all' ? 'bg-brand-dark text-white' : 'text-[#7a6655] hover:text-brand-dark'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'completed' ? 'bg-brand-dark text-white' : 'text-[#7a6655] hover:text-brand-dark'
              }`}
            >
              Done ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => {
                const nextStatus = STATUS_FLOW[order.status];
                const cleanPhone = (order.phone || '').replace(/\D/g, '');
                const waChatUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}` : null;

                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-[#ede5da] hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-[#ede5da]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-brand-dark leading-snug">{order.customer_name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#a89080] mt-0.5">
                            <span className="font-mono">#{order.id?.slice(-6).toUpperCase()}</span>
                            <span>•</span>
                            <span>{order.phone}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {waChatUrl && (
                          <a
                            href={waChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <MessageSquare size={14} /> WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="h-9 px-3 bg-[#ede5da] hover:bg-[#d4c9b8] text-[#7a6655] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye size={14} /> Detail
                        </button>
                      </div>
                    </div>

                    {/* Order Notes Banner if present */}
                    {order.order_notes && (
                      <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                        <FileText size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Customer Notes:</strong> {order.order_notes}
                        </div>
                      </div>
                    )}

                    {/* Order Items Preview */}
                    <div className="space-y-1.5 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-[#7a6655]">
                          <span>
                            <strong className="text-brand-dark">{item.quantity}x</strong> {item.name}
                          </span>
                          <span className="font-semibold text-brand-dark">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Status Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ede5da]">
                      <div>
                        <span className="text-[10px] text-[#a89080] font-bold uppercase">Total Bill</span>
                        <p className="text-lg sm:text-xl font-black text-brand-primary">₦{order.total_price.toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id!, 'cancelled')}
                            className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {nextStatus && (
                          <button
                            onClick={() => handleUpdateStatus(order.id!, nextStatus)}
                            className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center gap-1.5"
                          >
                            Mark {STATUS_LABELS[nextStatus]} <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#ede5da]">
                  <ShoppingBag size={48} className="text-[#c4b8a8] mx-auto mb-4" />
                  <h3 className="font-bold text-brand-dark text-lg mb-1">No orders found</h3>
                  <p className="text-[#a89080] text-sm">
                    {filter === 'active' ? 'All orders are completed! New orders will pop up here live.' : 'No orders in this category.'}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Details Panel */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-[#ede5da] sticky top-20">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#ede5da]">
                    <h3 className="font-black text-xl text-brand-dark">Order #{selectedOrder.id?.slice(-6).toUpperCase()}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${STATUS_COLORS[selectedOrder.status]}`}>
                      {STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-xs font-bold text-[#a89080] uppercase">Customer</span>
                      <p className="font-bold text-brand-dark">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-[#7a6655]">{selectedOrder.phone}</p>
                    </div>

                    {selectedOrder.order_notes && (
                      <div className="p-3 bg-[#fdf8f3] rounded-xl border border-[#ede5da] text-xs">
                        <span className="font-bold text-brand-dark block mb-1">Order Notes:</span>
                        <p className="text-[#7a6655]">{selectedOrder.order_notes}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-bold text-[#a89080] uppercase block mb-2">Item Breakdown</span>
                      <div className="space-y-2 border-t border-[#ede5da] pt-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-brand-dark">{item.quantity}x {item.name}</span>
                            <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#ede5da] flex justify-between items-center">
                      <span className="font-bold text-[#7a6655]">Total</span>
                      <span className="text-2xl font-black text-brand-primary">₦{selectedOrder.total_price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions in Sidebar */}
                  <div className="space-y-2">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id!, 'preparing')}
                        className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Utensils size={16} /> Start Kitchen Preparation
                      </button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id!, 'ready')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Package size={16} /> Mark Ready for Pickup
                      </button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id!, 'completed')}
                        className="w-full bg-brand-dark hover:bg-[#241E1C] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Mark Completed / Picked Up
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-[#ede5da] text-center text-[#a89080]">
                  <Eye size={36} className="mx-auto mb-2 text-[#c4b8a8]" />
                  <p className="text-sm font-medium">Select an order from the list to view full kitchen details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
