'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, MapPin, Phone, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod' as 'cod' | 'paystack',
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: "customer@example.com", // In a real app, use auth user email
    amount: totalPrice * 100, // Paystack amount is in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePlaceOrder = async (isPaid = false) => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: cart,
        total_price: totalPrice,
        status: 'pending',
        payment_method: formData.paymentMethod,
        payment_status: isPaid ? 'paid' : 'pending',
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderComplete(true);
      clearCart();
      
      setTimeout(() => {
        router.push(`/track/${docRef.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to place order. Using simulation...');
      // Simulation for demo if Firebase fails
      setOrderComplete(true);
      setTimeout(() => router.push('/track/demo-id'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.paymentMethod === 'paystack') {
      initializePayment({
        onSuccess: () => handlePlaceOrder(true),
        onClose: () => alert('Payment cancelled')
      });
    } else {
      handlePlaceOrder();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!orderComplete ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Form Section */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-brand-dark mb-2">Checkout</h1>
                  <p className="text-slate-500">Please provide your delivery details to complete the order.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <UserIcon size={16} className="text-brand-primary" /> Full Name
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Phone size={16} className="text-brand-primary" /> Phone Number
                      </label>
                      <input 
                        required
                        type="tel" 
                        placeholder="+234 000 000 0000"
                        className="input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <MapPin size={16} className="text-brand-primary" /> Delivery Address
                      </label>
                      <textarea 
                        required
                        placeholder="House number, Street name, City"
                        className="input h-32 resize-none"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-brand-dark mb-6">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                          formData.paymentMethod === 'cod' 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-dark' 
                          : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <Truck size={24} className="mb-2" />
                        <span className="font-bold">Cash on Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'paystack' })}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                          formData.paymentMethod === 'paystack' 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-dark' 
                          : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <CreditCard size={24} className="mb-2" />
                        <span className="font-bold">Pay with Paystack</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    disabled={loading || cart.length === 0}
                    type="submit" 
                    className="w-full btn-primary h-16 text-lg"
                  >
                    {loading ? 'Processing...' : `Place Order (₦${totalPrice.toLocaleString()})`}
                  </button>
                </form>
              </div>

              {/* Order Summary Section */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                      <div key={item.food_item_id} className="flex justify-between items-center text-slate-300">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-bold text-white">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Subtotal</span>
                      <span className="font-bold">₦{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Delivery</span>
                      <span className="text-brand-secondary font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-bold text-white">Total</span>
                      <span className="text-3xl font-black text-brand-primary">₦{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto py-20 text-center"
            >
              <div className="w-24 h-24 bg-brand-secondary/20 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-brand-dark mb-4">Order Placed!</h2>
              <p className="text-slate-500 mb-8">Thank you for your order. We're redirecting you to your real-time order tracking page...</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-full bg-brand-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
