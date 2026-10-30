'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  UtensilsCrossed,
  MessageSquare,
  Menu,
  X,
  Flame,
  ShieldAlert,
  Lock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { getKitchenStatus, KitchenStatus } from '@/lib/kitchenStatus';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import AdminLoginModal from '@/components/AdminLoginModal';

export const RESTAURANT_ADDRESS = 'Inside Mobil filling station, Odo-Eran, Obantoko';
export const GOOGLE_MAPS_URL = 'https://maps.google.com/?q=Mobil+filling+station,+Odo-Eran,+Obantoko';

function FacebookIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.85-4.47V8.58a8.27 8.27 0 0 0 4.92 1.58V6.69z" />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatus>(getKitchenStatus());
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    // Check kitchen status on load and every 60 seconds
    setKitchenStatus(getKitchenStatus());
    const interval = setInterval(() => {
      setKitchenStatus(getKitchenStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdminAuthenticated()) {
      router.push('/admin');
    } else {
      setAdminModalOpen(true);
    }
  };

  return (
    <>
      {/* Real-time Kitchen Status + Social Icons Top Strip (9am – 9pm Africa/Lagos) */}
      <div className="bg-[#191514] text-white py-2 px-3 sm:px-6 border-b border-[#2d2624] text-xs font-medium flex items-center justify-between gap-3 overflow-hidden">
        {/* Left: Kitchen Status Indicator */}
        <div className="flex items-center gap-2 max-w-full truncate">
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

        {/* Center: Clickable Address link to Google Maps */}
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
          className="hidden md:flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors text-xs group py-0.5 px-2 rounded-lg hover:bg-stone-800/60"
        >
          <MapPin size={13} className="text-[#fbbf24] flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-stone-200 group-hover:text-amber-300 group-hover:underline truncate max-w-xs lg:max-w-md">
            {RESTAURANT_ADDRESS}
          </span>
          <ExternalLink size={11} className="text-stone-400 group-hover:text-amber-300 opacity-70" />
        </a>

        {/* Right: Social Media Icons + Hours & WhatsApp */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs flex-shrink-0">
          {/* Social Media Channels */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-stone-400">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Déskilz on Facebook"
              className="hover:text-[#1877F2] transition-colors p-1"
            >
              <FacebookIcon size={14} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Déskilz on Instagram"
              className="hover:text-[#E4405F] transition-colors p-1"
            >
              <InstagramIcon size={14} />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Déskilz on TikTok"
              className="hover:text-white transition-colors p-1"
            >
              <TikTokIcon size={13} />
            </a>
          </div>

          <span className="text-stone-600 hidden md:inline">•</span>

          <span className="text-stone-400 font-medium hidden md:inline">
            9:00 AM – 9:00 PM Daily
          </span>

          <span className="text-stone-600 hidden md:inline">•</span>

          <a
            href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fbbf24] hover:underline font-bold hidden sm:inline-flex items-center gap-1"
          >
            WhatsApp Line: +{RESTAURANT_WHATSAPP_NUMBER}
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
            <button
              type="button"
              onClick={handleAdminClick}
              className="text-stone-500 hover:text-[#191514] font-medium text-xs transition-colors flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-stone-200/50"
            >
              <ShieldAlert size={14} className="text-stone-400" /> Admin
            </button>
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

            {/* Admin Trigger Button in Mobile Drawer */}
            <button
              type="button"
              onClick={(e) => {
                setMenuOpen(false);
                handleAdminClick(e);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-stone-600 hover:bg-white font-semibold text-xs transition-colors text-left"
            >
              <span className="flex items-center gap-3">
                <ShieldAlert size={16} /> Admin Portal
              </span>
              <Lock size={13} className="text-stone-400" />
            </button>

            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-md shadow-emerald-500/20"
            >
              <MessageSquare size={18} /> Chat & Order on WhatsApp
            </a>

            {/* Clickable Location Card in Mobile Drawer */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white text-stone-700 hover:text-brand-primary border border-[#ede5da] font-bold text-xs shadow-xs transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                <MapPin size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-black">Pickup Address (Google Maps)</p>
                <p className="truncate text-stone-800 text-xs font-bold group-hover:text-brand-primary">{RESTAURANT_ADDRESS}</p>
              </div>
              <ExternalLink size={13} className="text-stone-400" />
            </a>

            {/* Social Icons in Mobile Drawer */}
            <div className="flex items-center justify-center gap-5 pt-3 border-t border-[#ede5da] text-stone-600">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 hover:text-[#1877F2] transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 hover:text-[#E4405F] transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 hover:text-black transition-colors"
              >
                <TikTokIcon size={17} />
              </a>
            </div>
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

      {/* Admin Login Modal (Triggered on clicking Admin anywhere in Navbar) */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => {
          setAdminModalOpen(false);
          router.push('/admin');
        }}
      />
    </>
  );
}
