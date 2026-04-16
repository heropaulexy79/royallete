'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, UtensilsCrossed, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:rotate-12 transition-transform">
            <UtensilsCrossed size={20} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-brand-dark">Royallete</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/menu" className="hidden md:block text-slate-600 hover:text-brand-primary font-medium transition-colors">Menu</Link>
          <Link href="/admin/orders" className="text-slate-600 hover:text-brand-primary font-medium transition-colors">Admin</Link>
          
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-brand-primary transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-brand-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button className="hidden md:flex items-center gap-2 text-slate-600 hover:text-brand-primary font-medium transition-colors">
            <User size={20} />
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
