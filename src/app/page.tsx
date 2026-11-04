'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import { useCart } from '@/context/CartContext';
import { FoodItem } from '@/types/schema';
import { APPROVED_CATALOGUE } from '@/data/approvedCatalogue';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import AddToCartPopup from '@/components/AddToCartPopup';
import { getItemRecommendations } from '@/lib/recommendations';
import {
  UtensilsCrossed,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Clock,
  ShieldCheck,
  ChefHat,
  Flame,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

// Category discovery card data
const CATEGORY_TILES = [
  { name: 'Shawarma', count: '12 items', image: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=800', tag: 'Chicken & Suya' },
  { name: 'Pizza', count: '9 items', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800', tag: 'Personal & Sharing' },
  { name: 'Burger', count: '2 items', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800', tag: 'Beef Patties' },
  { name: 'Chicken & Chips', count: '4 items', image: 'https://images.unsplash.com/photo-1518013034477-2990fa317e23?q=80&w=800', tag: 'Golden Fries' },
  { name: 'Food', count: '8 items', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', tag: 'Rice & Soups' },
  { name: 'Drinks', count: '18 items', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800', tag: 'Chilled & Fresh' },
  { name: 'Ice Cream', count: '12 items', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800', tag: 'Sweet Scoops' },
  { name: 'Snacks', count: '5 items', image: 'https://images.unsplash.com/photo-1621200414838-84423c723707?q=80&w=800', tag: 'Fresh Pastries' },
];

function FeaturedFoodCard({
  item,
  onAdd,
}: {
  item: FoodItem;
  onAdd: (item: FoodItem, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="card-premium flex flex-col justify-between group">
      <div>
        <div className="relative h-44 sm:h-52 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-[#f5efe6]">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full font-black text-brand-dark text-xs sm:text-sm shadow-sm border border-[#ede5da]">
            ₦{item.price.toLocaleString()}
          </div>
          <div className="absolute bottom-3 left-3 bg-[#191514]/85 backdrop-blur-sm text-amber-300 border border-amber-400/20 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {item.category}
          </div>
        </div>

        <h3 className="font-extrabold text-brand-dark text-base sm:text-lg group-hover:text-brand-primary transition-colors line-clamp-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-stone-500 text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#ede5da] space-y-3">
        <div className="flex items-center justify-between bg-[#fbf8f3] p-1.5 rounded-xl border border-[#ede5da]">
          <span className="text-[10px] font-bold text-stone-400 uppercase pl-1.5">Qty</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-[#ede5da] flex items-center justify-center text-stone-600 hover:border-brand-primary transition-colors active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center font-black text-brand-dark text-xs sm:text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-7 h-7 rounded-lg bg-white border border-[#ede5da] flex items-center justify-center text-stone-600 hover:border-brand-primary transition-colors active:scale-90"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>
          <span className="text-xs font-black text-brand-primary pr-1">
            ₦{(item.price * qty).toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs sm:text-sm ${
            added
              ? 'bg-[#25D366] text-white shadow-emerald-500/25'
              : 'bg-brand-primary hover:bg-[#c4131e] text-white shadow-red-600/20 active:scale-95'
          }`}
        >
          {added ? (
            <>
              <Check size={16} /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { cart, addToCart } = useCart();
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([]);
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [popupTriggerItem, setPopupTriggerItem] = useState<FoodItem | null>(null);
  const [popupRecs, setPopupRecs] = useState<FoodItem[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      let itemsList: FoodItem[] = [];
      try {
        const q = query(collection(db, 'foodItems'), where('is_available', '==', true));
        const snap = await getDocs(q);
        if (!snap.empty) {
          itemsList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
        }
      } catch (err) {
        console.warn('Using catalogue fallbacks for featured cards:', err);
      }
      if (itemsList.length === 0) {
        itemsList = APPROVED_CATALOGUE.map((item, idx) => ({ id: `cat-${idx}`, ...item } as FoodItem));
      }
      setAllItems(itemsList);
      const highlighted = itemsList.filter((d) => d.is_featured).slice(0, 4);
      setFeaturedItems(highlighted.length > 0 ? highlighted : itemsList.slice(0, 4));
    }
    loadFeatured();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col">
      <Navbar />

      {/* Hero Slider with exactly 3 creative slides */}
      <HeroSlider />

      {/* ── Section: Explore by Category ── */}
      <section className="py-12 sm:py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-primary text-xs font-black uppercase tracking-widest mb-1.5">
              <Sparkles size={14} className="text-[#f59e0b]" /> Full Menu Range
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
              Explore Our 8 Approved Categories
            </h2>
            <p className="text-stone-500 text-sm sm:text-base mt-1">
              Select any craving to jump right into that menu section.
            </p>
          </div>
          <Link
            href="/menu"
            className="text-brand-primary font-bold text-sm flex items-center gap-1.5 hover:underline"
          >
            View All 70 Dishes <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#ede5da] shadow-xs hover:shadow-xl hover:border-amber-300/60 transition-all hover:-translate-y-1 block"
            >
              <div className="h-32 sm:h-44 w-full overflow-hidden bg-[#f5efe6] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191514]/90 via-[#191514]/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider block">
                    {cat.tag}
                  </span>
                  <h3 className="text-base sm:text-xl font-black leading-tight drop-shadow-sm text-white">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-amber-100/80 font-medium">{cat.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section: Verified Value Highlight in Espresso & Gold ── */}
      <section className="bg-[#191514] text-white py-14 sm:py-20 px-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center relative z-10">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
            <img
              src="https://images.unsplash.com/photo-1512058560566-d8d437a17364?q=80&w=1200"
              alt="Rice Combo Special"
              className="w-full h-72 sm:h-96 object-cover"
            />
            <div className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              Chef Special
            </div>
            <div className="absolute bottom-4 right-4 bg-[#191514]/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/30">
              <span className="text-xs text-amber-200/80 block font-bold">Approved Price</span>
              <span className="text-2xl font-black text-[#fbbf24]">₦3,000</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-amber-950/60 text-[#fbbf24] border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Flame size={14} className="text-[#f59e0b]" /> Approved Value Meal
            </div>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white">
              The Legendary <span className="text-brand-primary">Rice Combo</span>
            </h2>
            <p className="text-[#ede5da] text-sm sm:text-base leading-relaxed">
              Experience the best of both culinary worlds: genuine smoky Nigerian party Jollof rice, seasoned vegetable Fried rice, and a tender flame-grilled chicken quarter. Freshly cooked, generously portioned, and ready for swift pickup.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#241e1c] p-3.5 rounded-xl border border-stone-800 text-center">
                <span className="text-xs text-amber-200/70 block font-bold">Rice 1</span>
                <span className="text-sm font-black text-white">Smoky Jollof</span>
              </div>
              <div className="bg-[#241e1c] p-3.5 rounded-xl border border-stone-800 text-center">
                <span className="text-xs text-amber-200/70 block font-bold">Rice 2</span>
                <span className="text-sm font-black text-white">Fried Rice</span>
              </div>
              <div className="bg-[#241e1c] p-3.5 rounded-xl border border-stone-800 text-center">
                <span className="text-xs text-amber-200/70 block font-bold">Protein</span>
                <span className="text-sm font-black text-white">Grilled Chicken</span>
              </div>
            </div>
            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                href="/menu?category=Food"
                className="btn-primary py-3.5 px-8 text-base font-black shadow-lg shadow-red-600/30"
              >
                Order Combo on Menu <ArrowRight size={18} className="ml-1" />
              </Link>
              <a
                href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Hello Déskilz! I would like to order the Rice Combo (₦3,000).'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp py-3.5 px-6 text-sm font-bold flex items-center gap-2"
              >
                <MessageSquare size={17} /> Fast WhatsApp Order
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Must-Try Featured Selections ── */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[#f59e0b]" /> Handcrafted Specials
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-1">
            Featured Selections
          </h2>
          <p className="text-stone-500 text-sm sm:text-base mt-2">
            Cooked with authentic herbs, premium cuts, and fresh ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredItems.map((item) => (
            <FeaturedFoodCard
              key={item.id}
              item={item}
              onAdd={(itm, q) => {
                addToCart(itm, q);
                const recs = getItemRecommendations({
                  item: itm,
                  cart,
                  allItems: allItems.length > 0 ? allItems : (APPROVED_CATALOGUE as unknown as FoodItem[]),
                  limit: 3,
                });
                setPopupRecs(recs);
                setPopupTriggerItem(itm);
              }}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="btn-primary inline-flex py-3.5 px-10 text-base font-black"
          >
            Explore All 70 Dishes <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* ── Section: 3-Step WhatsApp Process ── */}
      <section className="bg-white py-14 sm:py-20 border-t border-[#ede5da]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-16">
            <span className="text-brand-primary font-black text-xs uppercase tracking-widest">
              Frictionless Ordering
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-1">
              How Ordering Works
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              No online card input. No sign-up friction. Order directly into our kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Select Your Dishes',
                desc: 'Browse our complete 70-product catalogue across Shawarma, Pizza, Burgers, Rice meals, and Ice cream.',
                icon: UtensilsCrossed,
              },
              {
                step: '02',
                title: 'Review Cart & Add Notes',
                desc: 'Confirm your items, prices in NGN, and mention your preferred pickup time or dining requests.',
                icon: ShoppingBag,
              },
              {
                step: '03',
                title: 'Send on WhatsApp',
                desc: 'One tap opens WhatsApp with your pre-formatted order. Pay cash or bank transfer upon collection!',
                icon: MessageSquare,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#faf6f0] p-6 sm:p-8 rounded-3xl border border-[#ede5da] hover:border-amber-400/50 transition-all hover:shadow-lg relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100/70 text-brand-primary flex items-center justify-center font-bold">
                    <card.icon size={22} />
                  </div>
                  <span className="text-4xl font-black text-[#ede5da]">{card.step}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-2">
                  {card.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Déskilz ── */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[#f59e0b]" /> The Déskilz Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-1">
            Why Food Lovers Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card-premium flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-brand-primary flex items-center justify-center flex-shrink-0">
              <ChefHat size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base mb-1">Authentic Suya & Spices</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Handcrafted using secret suya spices and fresh ingredients sourced daily for full aroma and flavor.
              </p>
            </div>
          </div>

          <div className="card-premium flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base mb-1">Rapid Kitchen Turnaround</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Orders are queued instantly upon WhatsApp confirmation so your food is sizzling hot when you arrive.
              </p>
            </div>
          </div>

          <div className="card-premium flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base mb-1">Zero Payment Stress</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                No credit cards needed online. Simple, transparent WhatsApp confirmation with pay on pickup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: WhatsApp CTA Banner in Rich Red & Amber ── */}
      <section className="bg-gradient-to-br from-[#de1b27] via-[#c4131e] to-[#991b1b] text-white py-14 sm:py-18 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto text-[#fbbf24] shadow-inner border border-white/20">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black">Ready to satisfy your hunger?</h2>
          <p className="text-rose-100 text-sm sm:text-base max-w-lg mx-auto">
            Browse our full 70-product approved catalogue, customize your portions, and hand your order directly to our kitchen.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/menu"
              className="bg-white text-brand-dark hover:bg-amber-50 font-black px-8 py-3.5 rounded-2xl shadow-xl transition-all"
            >
              Browse Full Menu
            </Link>
            <a
              href={`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} /> Chat with Kitchen
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#191514] text-stone-400 py-12 px-4 mt-auto border-t border-stone-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 overflow-hidden">
                <img
                  src="/image/deskilz-logo.png"
                  alt="Déskilz Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black text-white">
                Dé<span className="text-brand-primary">skilz</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Déskilz Restaurant & Fast Food is your home for quality shawarma, pizza, burgers, fresh Nigerian meals, desserts, and drinks.
            </p>
          </div>

          <div>
            <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/menu?category=Shawarma" className="hover:text-white transition-colors">Shawarma (12 dishes)</Link></li>
              <li><Link href="/menu?category=Pizza" className="hover:text-white transition-colors">Pizza (9 dishes)</Link></li>
              <li><Link href="/menu?category=Burger" className="hover:text-white transition-colors">Burgers (2 dishes)</Link></li>
              <li><Link href="/menu?category=Food" className="hover:text-white transition-colors">Rice & Food (8 dishes)</Link></li>
              <li><Link href="/menu?category=Ice Cream" className="hover:text-white transition-colors">Ice Cream (12 flavours)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-3">Orders & Location</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-white">
                <Phone size={14} className="text-[#25D366]" /> +{RESTAURANT_WHATSAPP_NUMBER}
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[#25D366]" /> Direct WhatsApp Kitchen Handoff
              </li>
              <li>
                <span className="text-stone-500">Service:</span> Fast Hot Pickup & Takeaway
              </li>
              <li className="pt-1.5 border-t border-stone-800/80">
                <a
                  href="https://maps.google.com/?q=Mobil+filling+station,+Odo-Eran,+Obantoko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-stone-300 hover:text-amber-300 transition-colors group"
                >
                  <MapPin size={15} className="text-[#fbbf24] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">Pickup Address (Google Maps):</span>
                    <span className="leading-snug block font-medium group-hover:underline text-white">
                      Inside Mobil filling station, Odo-Eran, Obantoko
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-3">Management</h4>
            <p className="text-xs text-stone-400 mb-3">
              Restaurant administrator access for menu prices and live order monitoring.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-[#241e1c] hover:bg-stone-800 text-amber-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-stone-700 transition-colors"
            >
              Open Admin Portal
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Déskilz Restaurant. All rights reserved.</p>
          <a
            href="https://maps.google.com/?q=Mobil+filling+station,+Odo-Eran,+Obantoko"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors group"
          >
            <MapPin size={13} className="text-[#fbbf24]" />
            <span className="group-hover:underline">Inside Mobil filling station, Odo-Eran, Obantoko</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>
        </div>
      </footer>

      {/* Smart Add-to-Cart Recommendation Popup */}
      {popupTriggerItem && (
        <AddToCartPopup
          triggerItem={popupTriggerItem}
          recommendations={popupRecs}
          onClose={() => setPopupTriggerItem(null)}
        />
      )}
    </main>
  );
}
