'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, UtensilsCrossed, MessageSquare, Menu, X, Flame, ShieldAlert } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { getKitchenStatus, KitchenStatus } from '@/lib/kitchenStatus';

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>(getKitchenStatus());

  useEffect(() => {
    // Check kitchen status on load and every 60 seconds
    setKitchenStatus(getKitchenStatus());
    const interval = setInterval(() => {
      setKitchenStatus(getKitchenStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Real-time Kitchen Status Top Strip: 9:00 AM – 9:00 PM Africa/Lagos automatic detection */}
      <div className="bg-[#191514] text-white py-2 px-3 sm:px-4 border-b border-[#2d2624] text-xs font-medium flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 max-w-full truncate mx-auto sm:mx-0">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
              kitchenStatus.isOpen
                ? 'bg-[#25D366] shadow-[0_0_10px_#25D366] animate-pulse'
                : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <span className="font-black text-white text-xs tracking-tight">
            {kitchenStatus.statusText}
          </span>
          <span className="text-stone-500 hidden sm:inline">•</span>
          <span className="text-amber-100/90 text-[11px] sm:text-xs truncate">
            {kitchenStatus.subText}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs flex-shrink-0">
          <span className="text-stone-400 font-medium">9:00 AM – 9:00 PM Daily</span>
          <span className="text-stone-600">•</span>
          <a
            href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fbbf24] hover:underline font-bold flex items-center gap-1"
          >
            WhatsApp Order Line: +{RESTAURANT_WHATSAPP_NUMBER}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#faf6f0]/95 backdrop-blur-md border-b border-[#ede5da] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            onClick={() => setMenuOpen(false)}
          >
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden flex items-center justify-center p-0.5 shadow-md shadow-red-900/10 group-hover:scale-105 transition-transform bg-white border border-[#ede5da]">
              <img
                src="/image/deskilz-logo.png"
                alt="Déskilz Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl sm:text-3xl tracking-tight text-[#191514] leading-none">
                  Dé<span className="text-brand-primary">skilz</span>
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-xs animate-pulse" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-900/60 uppercase tracking-widest leading-none mt-1">
                Restaurant & Fast Food
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-[#191514]/80 hover:text-brand-primary font-bold text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-[#191514]/80 hover:text-brand-primary font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              <UtensilsCrossed size={16} className="text-brand-primary" /> Full Menu (70)
            </Link>
            <Link
              href="/menu?category=Food"
              className="text-[#191514]/80 hover:text-brand-primary font-bold text-sm transition-colors flex items-center gap-1"
            >
              <Flame size={15} className="text-[#f59e0b]" /> Rice Combo
            </Link>
            <Link
              href="/admin"
              className="text-stone-500 hover:text-[#191514] font-medium text-xs transition-colors flex items-center gap-1"
            >
              <ShieldAlert size={14} className="text-stone-400" /> Admin
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <MessageSquare size={15} /> WhatsApp Order
            </a>

            <Link
              href="/cart"
              className="relative p-2.5 text-[#191514] hover:text-brand-primary transition-colors rounded-xl bg-white hover:bg-amber-50/50 border border-[#ede5da]"
              aria-label="View shopping cart"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#faf6f0] shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/cart"
              className="relative p-2 text-[#191514] hover:text-brand-primary transition-colors bg-white rounded-xl border border-[#ede5da]"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#191514] hover:text-brand-primary transition-colors rounded-xl bg-white border border-[#ede5da] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="sm:hidden bg-[#faf6f0] border-t border-[#ede5da] px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#191514] hover:bg-white font-bold text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href="/menu"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#191514] hover:bg-white font-bold text-sm transition-colors"
            >
              <UtensilsCrossed size={18} className="text-brand-primary" /> Browse Full Menu (70 Dishes)
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-[#191514] hover:bg-white font-bold text-sm transition-colors"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={18} className="text-brand-primary" /> My Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-brand-primary text-white text-xs px-2.5 py-0.5 rounded-full font-black">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-white font-semibold text-xs transition-colors"
            >
              <ShieldAlert size={16} /> Admin Portal
            </Link>
            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md shadow-emerald-500/20"
            >
              <MessageSquare size={18} /> Chat & Order on WhatsApp
            </a>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-[#faf6f0]/95 backdrop-blur-md border-t border-[#ede5da] shadow-2xl grid grid-cols-3 py-1">
        <Link
          href="/"
          className="flex flex-col items-center justify-center py-2 gap-1 text-stone-600 hover:text-brand-primary active:scale-95 transition-all"
        >
          <Flame size={20} className="text-[#f59e0b]" />
          <span className="text-[10px] font-bold">Featured</span>
        </Link>
        <Link
          href="/menu"
          className="flex flex-col items-center justify-center py-2 gap-1 text-stone-600 hover:text-brand-primary active:scale-95 transition-all"
        >
          <UtensilsCrossed size={20} className="text-brand-primary" />
          <span className="text-[10px] font-bold">Menu</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center py-2 gap-1 text-stone-600 hover:text-brand-primary relative active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#faf6f0]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
        </Link>
      </div>
    </>
  );
}
