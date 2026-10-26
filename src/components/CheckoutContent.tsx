'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Phone, User as UserIcon, CheckCircle2, MessageSquare, ShoppingBag, FileText, ArrowRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWhatsAppUrl, RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import Link from 'next/link';

export default function CheckoutContent() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', orderNotes: '' });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; whatsappUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }
    if (cart.length === 0) { alert('Your cart is empty'); return; }

    setLoading(true);
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
      const orderId = docRef.id;
      const whatsappUrl = generateWhatsAppUrl({ orderId, customerName: formData.name, phone: formData.phone, orderNotes: formData.orderNotes, items: cart, totalPrice });
      clearCart();
      setOrderComplete({ id: orderId, whatsappUrl });
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      const tempId = 'temp-' + Date.now();
      const whatsappUrl = generateWhatsAppUrl({ orderId: tempId, customerName: formData.name, phone: formData.phone, orderNotes: formData.orderNotes, items: cart, totalPrice });
      clearCart();
      setOrderComplete({ id: tempId, whatsappUrl });
      window.open(whatsappUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!orderComplete ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
          {/* Form */}
          <div className="space-y-5 sm:space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                <MessageSquare size={13} /> WhatsApp Ordering
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Checkout on WhatsApp</h1>
              <p className="text-slate-500 text-sm sm:text-base">
                Fill in your details. We'll open WhatsApp with your full order receipt ready to send!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 space-y-4 sm:space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserIcon size={15} className="text-brand-primary" /> Full Name
                  </label>
                  <input required type="text" placeholder="e.g. John Doe" className="input"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={15} className="text-brand-primary" /> WhatsApp / Phone Number
                  </label>
                  <input required type="tel" placeholder="e.g. 0801 234 5678" className="input"
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={15} className="text-brand-primary" /> Order Notes (optional)
                  </label>
                  <textarea
                    placeholder="e.g. Pickup at 2:00 PM, extra pepper, dine-in..."
                    className="input h-24 sm:h-28 resize-none text-sm"
                    value={formData.orderNotes}
                    onChange={e => setFormData({ ...formData, orderNotes: e.target.value })}
                  />
                  <p className="text-xs text-slate-400">Specify pickup time, seating, or dietary notes.</p>
                </div>
              </div>

              {/* No payment notice */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mb-0.5">No Online Card Needed</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Confirm on WhatsApp and pay via cash or transfer on pickup.
                  </p>
                </div>
              </div>

              <button
                disabled={loading || cart.length === 0}
                type="submit"
                className="w-full h-13 sm:h-16 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl sm:rounded-2xl flex items-center justify-center gap-2.5 text-sm sm:text-lg shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                <MessageSquare size={20} />
                {loading ? 'Preparing Order...' : `Send Order (₦${totalPrice.toLocaleString()})`}
              </button>
            </form>
          </div>

          {/* Order Summary — hidden on mobile at bottom only on md+ */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-brand-dark text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
                <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <ShoppingBag size={18} className="text-brand-primary" /> Order Summary
                </h3>
                <span className="text-xs text-slate-400 font-bold">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3 mb-6 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                {cart.map(item => (
                  <div key={item.food_item_id} className="flex justify-between items-start text-slate-300">
                    <div>
                      <p className="font-bold text-white text-xs sm:text-sm leading-tight">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500">Qty {item.quantity} × ₦{item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-700 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Subtotal</span>
                  <span className="font-bold text-sm">₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Order Type</span>
                  <span className="text-brand-secondary font-bold text-xs">WhatsApp Pickup</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                  <span className="text-lg sm:text-xl font-bold text-white">Total</span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-primary">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Confirmation */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto py-10 sm:py-12 text-center px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#25D366]/20">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Order Created!</h2>
          <p className="text-slate-500 mb-6 text-sm sm:text-base">
            Your order was recorded. A WhatsApp window should have opened — send the message to complete your order!
          </p>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 text-left space-y-2.5 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Order Ref</span>
              <span className="font-mono font-bold text-brand-dark">#{orderComplete.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Restaurant WhatsApp</span>
              <span className="font-bold text-slate-700 text-xs">+{RESTAURANT_WHATSAPP_NUMBER}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={orderComplete.whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="h-12 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 text-sm">
              <MessageSquare size={18} /> Re-open WhatsApp
            </a>
            <Link href={`/track/${orderComplete.id}`}
              className="h-12 px-6 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
              <Utensils size={18} /> Track My Order
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
