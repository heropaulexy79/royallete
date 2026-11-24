'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, Send, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

function ReviewFormInner() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order') || '';
  const nameParam = searchParams.get('name') || '';

  const parsedOrderNumber = orderParam && /^\d+$/.test(orderParam) ? Number(orderParam) : undefined;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState(nameParam);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a short comment about your meal or experience.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...(parsedOrderNumber !== undefined ? { order_number: parsedOrderNumber } : {}),
        ...(orderParam && parsedOrderNumber === undefined ? { order_id: orderParam } : {}),
        customer_name: customerName.trim().slice(0, 80),
        rating,
        comment: comment.trim().slice(0, 1000),
        show_on_homepage: false,
        created_at: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Could not submit your review right now. Please check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-28 sm:pb-16 flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8 sm:py-14 w-full flex-1 flex flex-col justify-center">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#ede5da] shadow-sm p-8 text-center"
          >
            <div className="w-20 h-20 bg-[#25D366]/15 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">
              Thank You for Your Review!
            </h1>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              We truly appreciate your feedback. It helps us keep serving you hot, fresh, delicious meals every time.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/menu"
                className="h-12 bg-brand-primary hover:bg-[#c4131e] text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 text-sm transition-all"
              >
                Explore Déskilz Menu
              </Link>
              <Link
                href="/"
                className="h-12 bg-[#faf6f0] hover:bg-[#ede5da] text-brand-dark font-bold rounded-xl flex items-center justify-center gap-2 text-sm border border-[#ede5da] transition-all"
              >
                <ArrowLeft size={16} /> Back to Homepage
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-[#ede5da] shadow-sm p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} className="text-amber-500" /> Déskilz Customer Feedback
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
                How Was Your Meal?
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                Tell us about your order — it only takes 15 seconds.
              </p>
              {parsedOrderNumber !== undefined && (
                <span className="inline-block mt-2 text-[11px] font-mono font-bold text-brand-primary bg-red-50 px-2.5 py-0.5 rounded-full">
                  Order #{String(parsedOrderNumber).padStart(4, '0')}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Picker */}
              <div className="text-center py-4 bg-[#faf6f0] rounded-2xl border border-[#ede5da]">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Tap to Rate
                </p>
                <div className="flex items-center justify-center gap-2 mb-1.5">
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
                          size={34}
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
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tunde A."
                  className="w-full px-4 py-3 rounded-xl border border-[#ede5da] bg-[#faf6f0] text-sm font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you order and how did you enjoy it?"
                  className="w-full px-4 py-3 rounded-xl border border-[#ede5da] bg-[#faf6f0] text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-brand-primary hover:bg-[#c4131e] text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  'Submitting Review...'
                ) : (
                  <>
                    <Send size={16} /> Submit Review
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReviewFormInner />
    </Suspense>
  );
}

