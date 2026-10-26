'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, UtensilsCrossed, MessageSquare, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:rotate-12 transition-transform">
              <UtensilsCrossed size={16} className="sm:hidden" />
              <UtensilsCrossed size={20} className="hidden sm:block" />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-brand-dark">Royallete</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/menu" className="text-slate-600 hover:text-brand-primary font-semibold text-sm transition-colors">
              Menu
            </Link>
            <Link href="/admin" className="text-slate-600 hover:text-brand-primary font-semibold text-sm transition-colors">
              Admin
            </Link>
            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366] hover:text-white px-3 py-1.5 rounded-xl transition-all"
            >
              <MessageSquare size={15} /> WhatsApp
            </a>
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-brand-primary transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-brand-primary transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-700 hover:text-brand-primary transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2 shadow-lg">
            <Link
              href="/menu"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <UtensilsCrossed size={18} className="text-brand-primary" /> Browse Menu
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <ShoppingCart size={18} className="text-brand-primary" /> Admin Dashboard
            </Link>
            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-sm"
            >
              <MessageSquare size={18} /> Chat with Us on WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-2xl grid grid-cols-3">
        <Link href="/menu" className="flex flex-col items-center justify-center py-2.5 gap-0.5 text-slate-500 hover:text-brand-primary transition-colors active:scale-95">
          <UtensilsCrossed size={20} />
          <span className="text-[10px] font-bold">Menu</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center justify-center py-2.5 gap-0.5 text-slate-500 hover:text-brand-primary transition-colors relative active:scale-95">
          <div className="relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
        </Link>
        <a
          href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2.5 gap-0.5 text-[#25D366] active:scale-95"
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-bold">Chat</span>
        </a>
      </div>
    </>
  );
}
