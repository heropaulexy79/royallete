'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import {
  Trash2, ShoppingBag, ArrowRight, Minus, Plus,
  MessageSquare, User, Phone, FileText, CheckCircle2,
  Utensils, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateWhatsAppUrl, RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

// ─────────────────────────────────────────────
// Order Confirmation Screen
// ─────────────────────────────────────────────
function OrderConfirmed({
  orderId,
  whatsappUrl,
}: {
  orderId: string;
  whatsappUrl: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto py-10 sm:py-16 text-center px-4"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/15 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#25D366]/10">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Order Sent! 🎉</h2>
      <p className="text-slate-500 mb-7 text-sm sm:text-base leading-relaxed">
        WhatsApp opened with your full order. Just hit <strong>Send</strong> and our kitchen will get right on it!
      </p>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 text-left space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Ref</span>
          <span className="font-mono font-bold text-brand-dark text-sm">
            #{orderId.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restaurant</span>
          <span className="font-bold text-slate-700 text-sm">+{RESTAURANT_WHATSAPP_NUMBER}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.01] text-sm"
        >
          <MessageSquare size={18} /> Re-open WhatsApp
        </a>
        <Link
          href={`/track/${orderId}`}
          className="h-12 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
        >
          <Utensils size={18} /> Track My Order
        </Link>
        <Link href="/menu" className="text-sm text-slate-400 hover:text-brand-primary font-semibold py-2 transition-colors">
          ← Back to Menu
        </Link>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Cart Page
// ─────────────────────────────────────────────
export default function CartPage() {
  const { cart, removeFromCart, addToCart, clearCart, totalPrice } = useCart();

  const [formData, setFormData] = useState({ name: '', phone: '', orderNotes: '' });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; whatsappUrl: string } | null>(null);

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

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
    } catch {
      const tempId = 'temp-' + Date.now();
      const whatsappUrl = generateWhatsAppUrl({
        orderId: tempId,
        customerName: formData.name,
        phone: formData.phone,
        orderNotes: formData.orderNotes,
        items: cart,
        totalPrice,
      });
      clearCart();
      setOrderComplete({ id: tempId, whatsappUrl });
      window.open(whatsappUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ───────────────────────────────
  if (cart.length === 0 && !orderComplete) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="text-slate-400" size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-3">Your cart is empty</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
            You haven't added anything yet. Browse our menu and pick your favourites!
          </p>
          <Link href="/menu" className="btn-primary inline-flex gap-2 px-8 h-12">
            Browse Menu <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  // ── Order confirmed ───────────────────────────
  if (orderComplete) {
    return (
      <main className="min-h-screen bg-slate-50 pb-28 sm:pb-0">
        <Navbar />
        <OrderConfirmed orderId={orderComplete.id} whatsappUrl={orderComplete.whatsappUrl} />
      </main>
    );
  }

  // ── Cart + Inline Checkout ────────────────────
  return (
    <main className="min-h-screen bg-slate-50 pb-36 sm:pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-brand-primary mb-5 transition-colors"
        >
          <ArrowLeft size={15} /> Continue Shopping
        </Link>

        {/* Flow indicator */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10 overflow-x-auto no-scrollbar">
          {['Menu', 'Cart', 'WhatsApp'].map((step, i) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-1.5 whitespace-nowrap ${i === 1 ? 'text-brand-primary' : i < 1 ? 'text-brand-secondary' : 'text-slate-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 1 ? 'bg-brand-primary text-white' : i < 1 ? 'bg-brand-secondary text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span className="text-xs font-bold">{step}</span>
              </div>
              {i < 2 && <div className="w-6 sm:w-10 h-px bg-slate-200 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
          {/* ── Left: Cart Items ── */}
          <div className="lg:col-span-3 space-y-4">
            <h1 className="text-xl sm:text-2xl font-black text-brand-dark flex items-center gap-2">
              <ShoppingBag size={22} className="text-brand-primary" />
              Your Order
              <span className="text-sm font-medium text-slate-400">
                ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </span>
            </h1>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <AnimatePresence initial={false}>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.food_item_id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 ${index !== cart.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 sm:w-13 sm:h-13 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-black text-base sm:text-lg flex-shrink-0">
                      {item.name.charAt(0)}
                    </div>

                    {/* Name + Price */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-brand-dark text-sm leading-snug truncate">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">₦{item.price.toLocaleString()} each</p>
                    </div>

                    {/* Qty controls + subtotal */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="text-sm font-black text-brand-dark">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => removeFromCart(item.food_item_id)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-red-500 rounded-md transition-all active:scale-90 text-slate-500"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                        </button>
                        <span className="w-6 text-center font-black text-brand-dark text-sm">{item.quantity}</span>
                        <button
                          onClick={() => addToCart({ id: item.food_item_id, name: item.name, price: item.price, is_available: true } as any)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-brand-primary rounded-md transition-all active:scale-90 text-slate-500"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Total Summary */}
            <div className="bg-slate-100 rounded-2xl px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Total</p>
                <p className="text-2xl sm:text-3xl font-black text-brand-dark mt-0.5">
                  ₦{totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Payment</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <MessageSquare size={13} /> Cash on Pickup
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: WhatsApp Checkout Form ── */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSendOrder}
              className="bg-brand-dark text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl sticky top-20"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
                <div className="w-11 h-11 bg-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={22} className="text-[#25D366]" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg leading-none">WhatsApp Checkout</h2>
                  <p className="text-slate-400 text-xs mt-0.5">No card needed. Pay on pickup!</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User size={13} className="text-brand-primary" /> Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tunde Adebayo"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Phone size={13} className="text-brand-primary" /> Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0801 234 5678"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText size={13} className="text-brand-primary" /> Order Notes
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Pickup time, extra sauce, dine-in, etc..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all h-20 resize-none"
                    value={formData.orderNotes}
                    onChange={e => setFormData({ ...formData, orderNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full h-13 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    <MessageSquare size={20} />
                    Send Order on WhatsApp
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 mt-3">
                Opens WhatsApp with your full order ready to send.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
