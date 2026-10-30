'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { FoodItem } from '@/types/schema';
import { APPROVED_CATALOGUE } from '@/data/approvedCatalogue';
import FrequentlyBoughtTogether from '@/components/FrequentlyBoughtTogether';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  MessageSquare,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Utensils,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { generateWhatsAppUrl, RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

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
      className="max-w-md mx-auto py-12 sm:py-16 text-center px-4"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/15 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#25D366]/10">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Order Prepared for WhatsApp! 🎉</h2>
      <p className="text-stone-500 mb-6 text-sm sm:text-base leading-relaxed">
        WhatsApp was opened with your full order. Please tap <strong>Send</strong> in WhatsApp so our chefs can begin preparing your meal immediately!
      </p>

      <div className="bg-white rounded-2xl border border-[#ede5da] shadow-sm p-5 mb-6 text-left space-y-3">
        <div className="flex justify-between items-center border-b border-[#ede5da] pb-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order Ref</span>
          <span className="font-mono font-bold text-brand-dark text-sm">
            #{orderId.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#ede5da] pb-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Déskilz Kitchen</span>
          <span className="font-bold text-stone-700 text-sm">+{RESTAURANT_WHATSAPP_NUMBER}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Payment</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
            Pay Cash or Transfer on Pickup
          </span>
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
          className="h-12 bg-[#191514] hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Utensils size={18} /> Track Order Status
        </Link>
        <Link
          href="/menu"
          className="text-sm text-stone-400 hover:text-brand-primary font-semibold py-2 transition-colors"
        >
          ← Back to Menu
        </Link>
      </div>
    </motion.div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, addToCart, clearCart, totalPrice } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', orderNotes: '' });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{ id: string; whatsappUrl: string } | null>(null);
  const [allItems, setAllItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const snap = await getDocs(query(collection(db, 'foodItems'), where('is_available', '==', true)));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
          setAllItems(list);
          return;
        }
      } catch (err) {
        console.warn('Using catalogue for recommendations in cart:', err);
      }
      setAllItems(APPROVED_CATALOGUE.map((item, idx) => ({ id: `cat-${idx}`, ...item })));
    }
    fetchMenu();
  }, []);

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter your name and phone number so the kitchen can confirm your order.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
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
      console.warn('Firestore offline or fallback order generation:', error);
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

  // Empty cart state
  if (cart.length === 0 && !orderComplete) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 text-center flex-1 flex flex-col justify-center items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100/80 text-brand-primary rounded-full flex items-center justify-center mb-5">
            <ShoppingBag size={38} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-brand-dark mb-2">Your Cart is Empty</h1>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
            You haven&apos;t added any delicious dishes yet. Explore our 70-dish menu and pick your cravings!
          </p>
          <Link href="/menu" className="btn-primary inline-flex gap-2 px-9 h-12 text-sm sm:text-base font-black">
            Browse Déskilz Menu <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  // Order complete state
  if (orderComplete) {
    return (
      <main className="min-h-screen bg-[#faf6f0] pb-28 sm:pb-0 flex flex-col">
        <Navbar />
        <OrderConfirmed orderId={orderComplete.id} whatsappUrl={orderComplete.whatsappUrl} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-36 sm:pb-16 flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 w-full flex-1">
        {/* Navigation back */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 hover:text-brand-primary mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Add more dishes from Menu
        </Link>

        {/* 3 Step Flow breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
          {['1. Select Dishes', '2. Review Cart', '3. WhatsApp Kitchen'].map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold ${
                  idx === 1 ? 'text-brand-primary' : idx < 1 ? 'text-emerald-700' : 'text-stone-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                    idx === 1
                      ? 'bg-brand-primary text-white shadow-sm'
                      : idx < 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#ede5da] text-stone-500'
                  }`}
                >
                  {idx < 1 ? '✓' : idx + 1}
                </span>
                <span>{step}</span>
              </div>
              {idx < 2 && <div className="w-8 sm:w-12 h-px bg-[#ede5da] flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
          {/* Left Column: Cart Items & Upselling */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-black text-brand-dark flex items-center gap-2">
                <ShoppingBag size={22} className="text-brand-primary" />
                Your Order Basket
                <span className="text-xs sm:text-sm font-semibold text-stone-400">
                  ({cart.length} dish{cart.length !== 1 ? 'es' : ''})
                </span>
              </h1>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#ede5da] overflow-hidden divide-y divide-[#ede5da]">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.food_item_id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-100/70 text-brand-primary flex items-center justify-center font-black text-base flex-shrink-0">
                      {item.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-brand-dark text-sm leading-snug line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        ₦{item.price.toLocaleString()} each
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="text-sm font-black text-brand-dark">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center bg-[#faf6f0] border border-[#ede5da] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.food_item_id)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-red-500 rounded-md transition-colors active:scale-90 text-stone-500"
                          aria-label="Decrease quantity"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                        </button>
                        <span className="w-6 text-center font-black text-brand-dark text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart({
                              id: item.food_item_id,
                              name: item.name,
                              price: item.price,
                              is_available: true,
                              category: item.category || 'General',
                              image_url: item.image_url || '',
                            } as FoodItem)
                          }
                          className="w-7 h-7 flex items-center justify-center hover:bg-white hover:text-brand-primary rounded-md transition-colors active:scale-90 text-stone-500"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total Subtotal Box in Warm Linen */}
            <div className="bg-[#f5efe6] rounded-2xl p-5 flex justify-between items-center border border-[#ede5da]">
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Subtotal</p>
                <p className="text-2xl sm:text-3xl font-black text-brand-dark mt-0.5">
                  ₦{totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-stone-500 uppercase">Payment Mode</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck size={14} /> Cash or Transfer on Pickup
                </p>
              </div>
            </div>

            {/* Amazon / Shopify-Style Frequently Bought Together Bundle */}
            <FrequentlyBoughtTogether
              cart={cart}
              allItems={allItems}
              onAddItems={(items) => {
                items.forEach((item) => addToCart(item, 1));
              }}
            />
          </div>

          {/* Right Column: Sticky WhatsApp Checkout Form in Espresso Dark */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSendOrder}
              className="bg-[#191514] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl sticky top-24 border border-stone-800"
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-stone-800">
                <div className="w-11 h-11 bg-[#25D366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={22} className="text-[#25D366]" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg leading-none text-white">WhatsApp Checkout</h2>
                  <p className="text-amber-200/70 text-xs mt-1">No online card needed. Fast pickup!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                    <User size={13} className="text-[#fbbf24]" /> Your Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Samuel Adekunle"
                    className="w-full bg-[#241e1c] border border-stone-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#fbbf24]" /> Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0801 234 5678"
                    className="w-full bg-[#241e1c] border border-stone-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                    <FileText size={13} className="text-[#fbbf24]" /> Order Notes
                    <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Pickup time (e.g. Ready by 2:30 PM), extra pepper, takeaway, etc..."
                    className="w-full bg-[#241e1c] border border-stone-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all h-20 resize-none"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full h-13 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 text-sm sm:text-base cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <MessageSquare size={19} />
                    Send Order on WhatsApp
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
                <ShieldCheck size={13} className="text-[#25D366]" />
                <span>Hands off your order receipt to Déskilz Kitchen instantly</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
