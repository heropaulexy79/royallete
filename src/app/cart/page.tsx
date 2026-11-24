'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { FoodItem } from '@/types/schema';
import { APPROVED_CATALOGUE } from '@/data/approvedCatalogue';
import FrequentlyBoughtTogether from '@/components/FrequentlyBoughtTogether';
import { useFeatureSettings } from '@/context/FeatureSettingsContext';
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
  Star,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, runTransaction, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { generateWhatsAppUrl, formatOrderRef, RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { buildCoPurchaseMap, CoPurchaseMap } from '@/lib/recommendations';
import { loadMenuIndexedDB } from '@/lib/menuCache';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

function OrderConfirmed({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  whatsappUrl,
  restaurantNumber,
}: {
  orderId: string;
  orderNumber?: number;
  customerName?: string;
  customerPhone?: string;
  whatsappUrl: string;
  restaurantNumber?: string;
}) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(customerName || '');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a short comment about your experience.');
      return;
    }

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        order_id: orderId,
        ...(orderNumber !== undefined ? { order_number: orderNumber } : {}),
        customer_name: reviewerName.trim().slice(0, 80),
        phone: (customerPhone || '').trim().slice(0, 25),
        rating,
        comment: comment.trim().slice(0, 1000),
        show_on_homepage: false,
        created_at: serverTimestamp(),
      });
      setReviewSubmitted(true);
      setShowReviewForm(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Could not submit review right now. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto py-12 sm:py-16 text-center px-4"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#25D366]/15 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#25D366]/10">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">Order Sent to WhatsApp! 🎉</h2>

      <div className="bg-white rounded-2xl border border-[#ede5da] shadow-sm p-5 mb-6 text-left space-y-3">
        <div className="flex justify-between items-center border-b border-[#ede5da] pb-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Order Ref</span>
          <span className="font-mono font-bold text-brand-dark text-sm">
            {orderNumber !== undefined
              ? formatOrderRef(orderNumber, orderId)
              : orderId.startsWith('pending-')
              ? 'Assigning...'
              : formatOrderRef(undefined, orderId)}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-[#ede5da] pb-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Déskilz Restaurant</span>
          <span className="font-bold text-stone-700 text-sm">+{restaurantNumber || RESTAURANT_WHATSAPP_NUMBER}</span>
        </div>
      </div>

      {/* Inline Review Form */}
      <AnimatePresence>
        {showReviewForm && !reviewSubmitted && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-white rounded-2xl border border-[#ede5da] shadow-md p-5 mb-6 text-left space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-brand-dark text-base flex items-center gap-1.5">
                <Star size={18} className="text-amber-500 fill-amber-400" /> Rate Your Experience
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-xs font-bold text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </div>

            {/* Star Picker */}
            <div className="text-center py-2 bg-[#faf6f0] rounded-xl border border-[#ede5da]">
              <div className="flex items-center justify-center gap-2 mb-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={28}
                        className={active ? 'text-amber-500 fill-amber-400' : 'text-stone-300'}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-extrabold text-amber-700">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede5da] bg-[#faf6f0] text-sm font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Your Review
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the food or ordering experience?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ede5da] bg-[#faf6f0] text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full h-11 bg-brand-primary hover:bg-[#c4131e] text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              {submittingReview ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={15} /> Submit Review
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Submitted Confirmation Banner */}
      {reviewSubmitted && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>Thank you for your review! We appreciate your feedback.</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="h-12 bg-brand-primary hover:bg-[#c4131e] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all hover:scale-[1.01] text-sm"
        >
          <span>← Back to Homepage</span>
        </Link>
        {!reviewSubmitted && !showReviewForm && (
          <button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="h-12 bg-[#191514] hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
          >
            <Star size={18} className="text-amber-400 fill-amber-400" /> Leave a Review
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, addToCart, clearCart, totalPrice } = useCart();
  const { settings } = useFeatureSettings();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{
    id: string;
    orderNumber?: number;
    customerName: string;
    customerPhone: string;
    whatsappUrl: string;
  } | null>(null);
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [coPurchaseMap, setCoPurchaseMap] = useState<CoPurchaseMap>({});

  useEffect(() => {
    async function fetchMenu() {
      // Hydrate immediately from IndexedDB if available for instant add-on suggestions
      const cachedIdb = await loadMenuIndexedDB();
      if (cachedIdb.length > 0) {
        setAllItems(cachedIdb.filter((i) => i.is_available !== false));
      }

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
      if (cachedIdb.length === 0) {
        setAllItems(APPROVED_CATALOGUE.map((item, idx) => ({ id: `cat-${idx}`, ...item })));
      }
    }

    async function fetchCoPurchaseHistory() {
      try {
        const cached = sessionStorage.getItem('deskilz_copurchase_v1');
        if (cached) {
          setCoPurchaseMap(JSON.parse(cached));
          return;
        }
        const snap = await getDocs(
          query(collection(db, 'orders'), orderBy('created_at', 'desc'), firestoreLimit(100))
        );
        if (!snap.empty) {
          const orders = snap.docs.map((d) => ({ items: d.data().items || [] }));
          const map = buildCoPurchaseMap(orders);
          setCoPurchaseMap(map);
          try {
            sessionStorage.setItem('deskilz_copurchase_v1', JSON.stringify(map));
          } catch {}
        }
      } catch {
        // Public users without orders list permission gracefully rely on the dish-aware pairing engine
      }
    }

    fetchMenu();
    fetchCoPurchaseHistory();
  }, []);

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please enter your name and phone number so the restaurant can confirm your order.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const customerName = formData.name.trim();
    const customerPhone = formData.phone.trim();
    const cartSnapshot = [...cart];
    const tempOrderId = 'pending-' + Date.now().toString(36);

    // Compute verified price synchronously
    const verifiedTotalPrice = cartSnapshot.reduce((sum, item) => {
      const match = allItems.find((d) => d.id === item.food_item_id) ||
                    APPROVED_CATALOGUE.find((d) => d.name === item.name);
      const truePrice = match?.price ?? item.price;
      return sum + truePrice * item.quantity;
    }, 0);

    const targetWhatsAppNumber = settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER;

    const whatsappUrl = generateWhatsAppUrl(
      {
        orderId: tempOrderId,
        customerName,
        phone: customerPhone,
        items: cartSnapshot,
        totalPrice: verifiedTotalPrice,
      },
      targetWhatsAppNumber
    );

    // 1. Respond IMMEDIATELY (0ms): open WhatsApp synchronously inside the tap gesture & show confirmation
    window.open(whatsappUrl, '_blank');
    clearCart();
    setOrderComplete({
      id: tempOrderId,
      customerName,
      customerPhone,
      whatsappUrl,
    });
    setLoading(false);

    // 2. Persist order & assign sequential ascending Order Ref (#0001, #0002...) in the background
    (async () => {
      let orderNumber: number | undefined;
      try {
        try {
          const counterRef = doc(db, 'counters', 'orders');
          orderNumber = await runTransaction(db, async (tx) => {
            const snap = await tx.get(counterRef);
            const current = snap.exists() ? Number(snap.data()?.current) || 0 : 0;
            const next = current + 1;
            tx.set(counterRef, { current: next, updated_at: serverTimestamp() }, { merge: true });
            return next;
          });
        } catch (counterErr) {
          console.warn('Order counter transaction fallback:', counterErr);
        }

        const orderData = {
          ...(orderNumber !== undefined ? { order_number: orderNumber } : {}),
          customer_name: customerName.slice(0, 80),
          phone: customerPhone.slice(0, 25),
          items: cartSnapshot.map((i) => ({
            food_item_id: i.food_item_id,
            name: i.name.slice(0, 100),
            price: Number(i.price) || 0,
            quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),
            image_url: i.image_url || '',
          })),
          total_price: verifiedTotalPrice,
          status: 'pending' as const,
          payment_method: 'whatsapp' as const,
          created_at: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        setOrderComplete((prev) =>
          prev ? { ...prev, id: docRef.id, orderNumber } : prev
        );
      } catch (error) {
        console.warn('Firestore background order save fallback:', error);
        setOrderComplete((prev) =>
          prev ? { ...prev, id: 'ord-' + Date.now().toString(36) } : prev
        );
      }
    })();
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
            You haven&apos;t added any delicious items yet. Explore our full menu and pick your cravings!
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
        <OrderConfirmed
          orderId={orderComplete.id}
          orderNumber={orderComplete.orderNumber}
          customerName={orderComplete.customerName}
          customerPhone={orderComplete.customerPhone}
          whatsappUrl={orderComplete.whatsappUrl}
          restaurantNumber={settings.whatsapp_number}
        />
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
          <ArrowLeft size={16} /> Back to Menu
        </Link>

        {/* 3 Step Flow breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
          {['1. Select Items', '2. Review Cart', '3. WhatsApp Kitchen'].map((step, idx) => (
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
                  ({cart.length} item{cart.length !== 1 ? 's' : ''})
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
            </div>

            {/* Amazon / Shopify-Style Frequently Bought Together Bundle */}
            {settings.enable_cart_frequently_bought && (
              <FrequentlyBoughtTogether
                cart={cart}
                allItems={allItems}
                coPurchaseMap={coPurchaseMap}
                onAddItems={(items) => {
                  items.forEach((item) => addToCart(item, 1));
                }}
              />
            )}
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
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
