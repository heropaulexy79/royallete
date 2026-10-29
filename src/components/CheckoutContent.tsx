'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, User as UserIcon, CheckCircle2, MessageSquare, ShoppingBag, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import Link from 'next/link';

export default function CheckoutContent() {
  const { cart, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', orderNotes: '' });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; whatsappUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    let orderId = 'ord-' + Date.now().toString(36);

    try {
      const orderData = {
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        order_notes: formData.orderNotes.trim(),
        items: cart,
        total_price: totalPrice,
        status: 'pending' as const,
        payment_method: 'whatsapp' as const,
        created_at: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      orderId = docRef.id;
    } catch (error) {
      console.warn('Fallback order generation:', error);
    }

    const whatsappUrl = generateWhatsAppUrl({
      orderId,
      customerName: formData.name,
      phone: formData.phone,
      orderNotes: formData.orderNotes,
      items: cart,
      totalPrice,
    });

    clearCart();
    setOrderComplete({ id: orderId, whatsappUrl });
    window.open(whatsappUrl, '_blank');
    setLoading(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!orderComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12"
        >
          {/* Form */}
          <div className="space-y-5 sm:space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                <MessageSquare size={13} /> WhatsApp Ordering
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Checkout on WhatsApp</h1>
              <p className="text-slate-500 text-sm sm:text-base">
                Provide your details. We will format your full order receipt and send it to Déskilz Kitchen via WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserIcon size={15} className="text-brand-primary" /> Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={15} className="text-brand-primary" /> WhatsApp / Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0801 234 5678"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={15} className="text-brand-primary" /> Order Notes (optional)
                  </label>
                  <textarea
                    placeholder="e.g. Pickup at 2:00 PM, extra pepper, dine-in..."
                    className="input h-24 sm:h-28 resize-none text-sm"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  />
                  <p className="text-xs text-slate-400">Specify pickup time, seating, or dietary notes.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 text-base transition-all active:scale-95"
              >
                {loading ? (
                  'Preparing Order...'
                ) : (
                  <>
                    <MessageSquare size={18} />
                    Send Order on WhatsApp
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Cart Summary */}
          <div className="bg-slate-100/70 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 border border-slate-200/80">
            <h2 className="font-black text-lg text-brand-dark flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-primary" />
              Order Summary ({cart.length} items)
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.food_item_id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-sm text-brand-dark">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-black text-sm text-brand-dark">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-500">Total Amount:</span>
              <span className="font-black text-2xl text-brand-primary">₦{totalPrice.toLocaleString()}</span>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Payment is made directly on pickup via Cash or Bank Transfer.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-md mx-auto text-center py-12 px-4 space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-brand-dark">Order Ready for Kitchen!</h2>
          <p className="text-slate-500 text-sm">
            WhatsApp opened with your details. Tap send to finish!
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <a href={orderComplete.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-3">
              Re-open WhatsApp
            </a>
            <Link href={`/track/${orderComplete.id}`} className="btn-primary py-3">
              Track Order Status
            </Link>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
