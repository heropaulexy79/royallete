'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types/schema';
import { Check, Clock, Package, Utensils, MessageSquare, CheckCircle2, FileText, ShoppingBag } from 'lucide-react';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import Link from 'next/link';

const STATUS_CONFIG: Record<OrderStatus, { label: string, icon: React.ElementType, color: string, description: string }> = {
  pending: { 
    label: 'Order Placed on WhatsApp', 
    icon: Clock, 
    color: 'text-amber-500', 
    description: 'Your order details have been received. The kitchen has been notified.' 
  },
  preparing: { 
    label: 'Preparing in Kitchen', 
    icon: Utensils, 
    color: 'text-orange-500', 
    description: 'Our chefs are cooking your fresh meal right now!' 
  },
  ready: { 
    label: 'Ready for Pickup / Dine-in', 
    icon: Package, 
    color: 'text-emerald-500', 
    description: 'Your food is hot, packed, and ready for you to collect!' 
  },
  completed: { 
    label: 'Order Completed', 
    icon: CheckCircle2, 
    color: 'text-brand-primary', 
    description: 'Thank you for ordering with Déskilz! We hope you enjoyed your meal.' 
  },
  cancelled: {
    label: 'Order Cancelled',
    icon: Clock,
    color: 'text-red-500',
    description: 'This order was cancelled.'
  }
};

const STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

export default function TrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'demo-id') {
      const timer = setTimeout(() => {
        setOrder({
          customer_name: 'Customer',
          phone: '07030574580',
          order_notes: 'Pickup ready in 20 mins',
          items: [
            { food_item_id: '1', name: 'Déskilz Jollof Rice Combo', price: 3000, quantity: 2 }
          ],
          status: 'preparing',
          total_price: 6000,
          payment_method: 'whatsapp',
          created_at: new Date(),
        });
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const unsub = onSnapshot(doc(db, 'orders', id as string), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-brand-dark mb-4">Order Not Found</h2>
          <p className="text-slate-500 mb-6">We couldn&apos;t locate this order in our system.</p>
          <Link href="/menu" className="btn-primary">Back to Menu</Link>
        </div>
      </main>
    );
  }

  const currentStatusIndex = STEPS.indexOf(order.status as OrderStatus);
  const currentConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = currentConfig.icon;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Status Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 mb-4 uppercase tracking-wider">
            Order Ref: #{order.id ? order.id.slice(-6).toUpperCase() : 'DEMO'}
          </div>

          <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
            <StatusIcon size={40} className={currentConfig.color} />
          </div>

          <h1 className="text-3xl font-black text-brand-dark mb-2">{currentConfig.label}</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">{currentConfig.description}</p>

          {/* Stepper */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-brand-primary -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${Math.max(0, currentStatusIndex / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((step, index) => {
                const isPassed = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent 
                        ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-110' 
                        : isPassed 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                      {isPassed ? <Check size={16} /> : index + 1}
                    </div>
                    <span className={`text-[11px] font-bold mt-2 uppercase tracking-tight hidden sm:block ${
                      isCurrent ? 'text-brand-dark font-black' : isPassed ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {STATUS_CONFIG[step].label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & WhatsApp Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-brand-dark text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-brand-primary" /> Ordered Dishes
            </h3>
            <div className="space-y-3 mb-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-none">
                  <div>
                    <span className="font-bold text-brand-dark text-sm">{item.quantity}x {item.name}</span>
                    <p className="text-xs text-slate-400">₦{item.price.toLocaleString()} each</p>
                  </div>
                  <span className="font-bold text-brand-dark text-sm">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {order.order_notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-900 mb-4 flex items-start gap-2.5">
                <FileText size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5">Order Notes:</strong>
                  {order.order_notes}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-600">Total Price</span>
              <span className="text-2xl font-black text-brand-primary">₦{order.total_price.toLocaleString()}</span>
            </div>
          </div>

          {/* WhatsApp Support Box */}
          <div className="bg-brand-dark text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare size={24} />
              </div>
              <h4 className="font-black text-lg mb-2">Need to update your order?</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Connect with our kitchen directly on WhatsApp for real-time pickup updates or questions.
              </p>
            </div>

            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#25D366]/20 transition-all"
            >
              <MessageSquare size={18} /> Chat with Restaurant
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
