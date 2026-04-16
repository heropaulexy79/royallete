'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types/schema';
import { Check, Clock, Package, Bike, Home, Utensils, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<OrderStatus, { label: string, icon: any, color: string, description: string }> = {
  pending: { label: 'Order Received', icon: Clock, color: 'text-amber-500', description: 'Your order has been received and is waiting for restaurant approval.' },
  accepted: { label: 'Order Accepted', icon: Check, color: 'text-emerald-500', description: 'The restaurant has accepted your order and will start preparing shortly.' },
  preparing: { label: 'Preparing', icon: Utensils, color: 'text-orange-500', description: 'Our chefs are working their magic to prepare your delicious meal.' },
  ready: { label: 'Ready for Pickup', icon: Package, color: 'text-brand-primary', description: 'Your order is packed and ready! We are waiting for a rider.' },
  assigned: { label: 'On the Way', icon: Bike, color: 'text-blue-500', description: 'Our rider is en route to your location. Get ready!' },
  delivered: { label: 'Delivered', icon: Home, color: 'text-brand-secondary', description: 'Enjoy your meal! The order has been successfully delivered.' },
};

const STEPS: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'delivered'];

export default function TrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'demo-id') {
      // Mock for demo
      setOrder({
        customer_name: 'John Doe',
        phone: '1234567890',
        address: '123 Luxury Lane, Royal City',
        items: [],
        status: 'preparing',
        total_price: 5000,
        payment_method: 'cod',
        payment_status: 'pending',
        created_at: new Date(),
      });
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'orders', id as string), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
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
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-slate-500 mb-8">We couldn't find the order you're looking for. Please check your order ID.</p>
        </div>
      </main>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-brand-dark mb-2">Track Order</h1>
          <p className="text-slate-500">Order ID: <span className="font-mono text-brand-primary">#{id?.toString().slice(-8).toUpperCase()}</span></p>
        </div>

        {/* Current Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-8 -mt-8" />
          
          <div className="flex items-start gap-6 relative">
            <div className={`p-4 rounded-2xl bg-slate-50 ${STATUS_CONFIG[order.status].color}`}>
              {React.createElement(STATUS_CONFIG[order.status].icon, { size: 32 })}
            </div>
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter">Current Status</span>
              <h2 className="text-2xl font-black text-brand-dark mb-2">{STATUS_CONFIG[order.status].label}</h2>
              <p className="text-slate-500">{STATUS_CONFIG[order.status].description}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Config = STATUS_CONFIG[step];

              return (
                <div key={step} className="flex gap-6 mb-8 last:mb-0 relative">
                  {/* Line */}
                  {idx !== STEPS.length - 1 && (
                    <div className={`absolute left-[15px] top-8 w-0.5 h-full ${idx < currentStepIndex ? 'bg-brand-secondary' : 'bg-slate-100'}`} />
                  )}

                  {/* Dot */}
                  <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCurrent ? 'bg-brand-primary ring-4 ring-brand-primary/20 scale-125' : 
                    isCompleted ? 'bg-brand-secondary' : 'bg-slate-100'
                  }`}>
                    {isCompleted ? <Check size={16} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                    <h3 className={`font-bold ${isCurrent ? 'text-brand-dark text-lg' : 'text-slate-600'}`}>{Config.label}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold mb-6">Delivery Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon size={20} className="text-brand-primary" />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Customer</p>
                  <p className="font-bold">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-brand-primary" />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
                  <p className="font-bold">{order.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={24} className="text-brand-primary mt-1" />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Address</p>
                <p className="font-bold leading-relaxed">{order.address}</p>
              </div>
            </div>
          </div>
          
          {order.rider_name && (
            <div className="mt-8 pt-8 border-t border-slate-700">
               <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center">
                    <Bike size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Assigned Rider</p>
                    <p className="font-black text-lg">{order.rider_name}</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function UserIcon({ size, className }: { size: number, className?: string }) {
  return <Clock size={size} className={className} />; // Fallback for User icon
}

function MapPin({ size, className }: { size: number, className?: string }) {
  return <Package size={size} className={className} />; // Fallback
}
