'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import { useCart } from '@/context/CartContext';
import { FoodItem } from '@/types/schema';
import { APPROVED_CATALOGUE } from '@/data/approvedCatalogue';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import AddToCartPopup from '@/components/AddToCartPopup';
import CategoryCarousel from '@/components/CategoryCarousel';
import { getItemRecommendations } from '@/lib/recommendations';
import { useFeatureSettings } from '@/context/FeatureSettingsContext';
import { isItemFeatured } from '@/lib/featured';
import { loadFeaturedCache, loadMenuCache, saveMenuCache, saveFeaturedCache } from '@/lib/menuCache';
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

// Category discovery card default mapping
const DEFAULT_CATEGORY_IMAGES: Record<string, { image: string; tag: string }> = {
  Shawarma: { image: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=800', tag: 'Chicken & Suya' },
  Pizza: { image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800', tag: 'Personal & Sharing' },
  Burger: { image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800', tag: 'Beef Patties' },
  'Chicken & Chips': { image: 'https://images.unsplash.com/photo-1518013034477-2990fa317e23?q=80&w=800', tag: 'Golden Fries' },
  Food: { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', tag: 'Rice & Soups' },
  Combo: { image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800', tag: 'Value Combos' },
  Drinks: { image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800', tag: 'Chilled & Fresh' },
  'Ice Cream': { image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800', tag: 'Sweet Scoops' },
  Snacks: { image: 'https://images.unsplash.com/photo-1621200414838-84423c723707?q=80&w=800', tag: 'Fresh Pastries' },
};

const BASE_APPROVED_CATEGORIES = [
  'Shawarma',
  'Pizza',
  'Burger',
  'Chicken & Chips',
  'Food',
  'Drinks',
  'Ice Cream',
  'Snacks',
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

export default function HomeClient({ initialFeatured = [] }: { initialFeatured?: FoodItem[] }) {
  const { cart, addToCart } = useCart();
  const { settings } = useFeatureSettings();
  const [allItems, setAllItems] = useState<FoodItem[]>(() => {
    return loadMenuCache();
  });
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>(initialFeatured);
  const [customCategories, setCustomCategories] = useState<{ name: string; image_url?: string; tag?: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('deskilz_categories_cache');
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.warn('HomePage categories cache read error:', e);
      }
    }
    return [];
  });
  const [popupTriggerItem, setPopupTriggerItem] = useState<FoodItem | null>(null);
  const [popupRecs, setPopupRecs] = useState<FoodItem[]>([]);

  useEffect(() => {
    // Sync server-fetched featured items into cache immediately, or hydrate from cache if SSR returned empty
    if (initialFeatured.length > 0) {
      saveFeaturedCache(initialFeatured);
    } else {
      const cachedFeatured = loadFeaturedCache();
      if (cachedFeatured.length > 0) {
        setFeaturedItems(cachedFeatured);
      }
    }

    // 1a. Fast dedicated listener for Featured items ONLY (tiny payload vs full 8MB menu)
    const featuredQuery = query(collection(db, 'foodItems'), where('is_featured', '==', true));
    const unsubFeatured = onSnapshot(
      featuredQuery,
      (snapshot) => {
        const liveFeatured = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as FoodItem))
          .filter((item) => !(item as { is_legacy?: boolean }).is_legacy && item.is_available !== false);
        setFeaturedItems(liveFeatured);
        saveFeaturedCache(liveFeatured);
      },
      (err) => {
        console.warn('Featured items listener error:', err);
      }
    );

    // 1b. Background listener for all menu items (for category item counts & recommendations)
    const q = query(collection(db, 'foodItems'));
    const unsubItems = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const itemsList = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() } as FoodItem))
            .filter((item) => !(item as { is_legacy?: boolean }).is_legacy && item.is_available !== false);
          setAllItems(itemsList);
          const highlighted = itemsList.filter(isItemFeatured);
          setFeaturedItems(highlighted);
          saveMenuCache(itemsList);
        } else {
          const fallback = APPROVED_CATALOGUE.filter((item) => item.is_available !== false).map((item, idx) => ({ id: `cat-${idx}`, ...item } as FoodItem));
          setAllItems(fallback);
          setFeaturedItems(fallback.filter(isItemFeatured));
        }
      },
      (err) => {
        console.warn('Items listener error:', err);
        setAllItems((prev) => prev.length > 0 ? prev : APPROVED_CATALOGUE.filter((item) => item.is_available !== false).map((item, idx) => ({ id: `cat-${idx}`, ...item } as FoodItem)));
      }
    );

    // 2. Listen for custom categories and custom category metadata added from admin dashboard
    const catQuery = query(collection(db, 'custom_categories'));
    const unsubCats = onSnapshot(
      catQuery,
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => ({
          name: (doc.data().name as string) || doc.id,
          image_url: doc.data().image_url as string | undefined,
          tag: doc.data().tag as string | undefined,
        })).filter((c) => Boolean(c.name));
        setCustomCategories(cats);
        try {
          localStorage.setItem('deskilz_categories_cache', JSON.stringify(cats));
        } catch (e) {
          console.warn('HomePage categories cache write error:', e);
        }
      },
      (err) => {
        console.warn('Category listener error on homepage:', err);
      }
    );

    return () => {
      unsubFeatured();
      unsubItems();
      unsubCats();
    };
  }, [initialFeatured]);

  // Compute dynamic category tiles combining approved presets, custom categories, and any items in database
  const categoryTiles = React.useMemo(() => {
    const categorySet = new Set<string>(BASE_APPROVED_CATEGORIES);
    customCategories.forEach((c) => categorySet.add(c.name));
    allItems.forEach((i) => {
      if (i.category) categorySet.add(i.category);
    });

    const customMetaMap = new Map<string, { image_url?: string; tag?: string }>();
    customCategories.forEach((c) => {
      customMetaMap.set(c.name.toLowerCase(), { image_url: c.image_url, tag: c.tag });
    });

    const orderedCategories = Array.from(categorySet);

    return orderedCategories.map((catName) => {
      const itemsInCat = allItems.filter((i) => i.category?.toLowerCase() === catName.toLowerCase());
      const customMeta = customMetaMap.get(catName.toLowerCase());
      const defaultInfo = DEFAULT_CATEGORY_IMAGES[catName] || {
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
        tag: 'Déskilz Special',
      };

      // Priority: Admin custom-chosen image > first available dish image > default preset image
      const displayImage = customMeta?.image_url || defaultInfo.image || itemsInCat[0]?.image_url;
      const displayTag = customMeta?.tag || defaultInfo.tag || 'Déskilz Special';
      const countLabel = `${itemsInCat.length} ${itemsInCat.length === 1 ? 'dish' : 'items'}`;

      return {
        name: catName,
        count: countLabel,
        image: displayImage,
        tag: displayTag,
      };
    });
  }, [allItems, customCategories]);

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col">
      <Navbar />

      {/* Hero Slider with exactly 3 creative slides */}
      <HeroSlider />

      {/* ── Section: Explore by Category ── */}
      <section className="py-8 sm:py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {categoryTiles.map((cat) => (
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
                {/* Subtle black gradient strictly behind the text at the bottom */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 sm:bottom-3 left-3 right-3 text-white z-10">
                  <h3 className="text-base sm:text-xl font-black leading-tight text-white drop-shadow-sm">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-[#fbbf24] font-bold block mt-0.5">{cat.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section: Must-Try Featured Selections ── */}
      {featuredItems.length > 0 && (
        <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-[#f59e0b]" /> Handcrafted Specials
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-1">
              Popular Right Now
            </h2>
            <p className="text-stone-500 text-sm sm:text-base mt-2">
              Cooked with authentic herbs, premium cuts, and fresh ingredients.
            </p>
          </div>

          <CategoryCarousel
            category="Featured Selections"
            items={featuredItems}
            renderItem={(item) => (
              <FeaturedFoodCard
                key={item.id}
                item={item}
                onAdd={(itm, q) => {
                  addToCart(itm, q);
                  if (settings.enable_upsell_popup) {
                    const recs = getItemRecommendations({
                      item: itm,
                      cart,
                      allItems: allItems.length > 0 ? allItems : (APPROVED_CATALOGUE as unknown as FoodItem[]),
                      limit: 3,
                    });
                    setPopupRecs(recs);
                    setPopupTriggerItem(itm);
                  }
                }}
              />
            )}
          />

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="btn-primary inline-flex py-3.5 px-10 text-base font-black"
            >
              Explore Full Menu <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </section>
      )}

      {/* ── Section: 3-Step WhatsApp Process ── */}
      <section className="bg-white py-8 sm:py-20 border-t border-[#ede5da]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-5 sm:mb-16">
            <span className="text-brand-primary font-black text-xs uppercase tracking-widest">
              Frictionless Ordering
            </span>
            <h2 className="text-xl sm:text-4xl font-black text-brand-dark mt-0.5 sm:mt-1">
              How Ordering Works
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              No online card input. No sign-up friction. Order directly into our kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Select Your Items',
                desc: 'Browse our complete menu across Shawarma, Pizza, Burgers, Rice, and more.',
                icon: UtensilsCrossed,
              },
              {
                step: '02',
                title: 'Review Cart & Add Notes',
                desc: 'Confirm your items, quantity, and prices.',
                icon: ShoppingBag,
              },
              {
                step: '03',
                title: 'Send on WhatsApp',
                desc: 'One tap opens WhatsApp with your pre-formatted order to finalize pickup.',
                icon: MessageSquare,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#faf6f0] p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#ede5da] hover:border-amber-400/50 transition-all hover:shadow-lg relative overflow-hidden flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0"
              >
                <div className="flex sm:justify-between items-center sm:items-start sm:w-full flex-shrink-0 sm:mb-4">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100/70 text-brand-primary flex items-center justify-center font-bold">
                    <card.icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <span className="hidden sm:block text-4xl font-black text-[#ede5da]">{card.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between sm:block mb-0.5 sm:mb-2">
                    <h3 className="text-sm sm:text-xl font-bold text-brand-dark leading-snug">
                      {card.title}
                    </h3>
                    <span className="sm:hidden text-base font-black text-[#ede5da]">{card.step}</span>
                  </div>
                  <p className="text-stone-500 text-xs sm:text-sm leading-tight sm:leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Déskilz ── */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[#f59e0b]" /> The Déskilz Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-brand-dark mt-2 mb-3">
            Why Food Lovers Choose Us
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            At Déskilz, every meal is an opportunity to enjoy something delicious. From freshly prepared favourites to irresistible treats, we bring you satisfying meals, generous portions and flavours worth coming back for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card-premium flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-brand-primary flex items-center justify-center flex-shrink-0">
              <ChefHat size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base mb-1">Fresh food, fast service,  great taste</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Enjoy freshly prepared favourites,  quick and convenient service,  satisfying flavours everytime.
              </p>
            </div>
          </div>

          <div className="card-premium flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-base mb-1">Order. Pick up. Enjoy.</h3>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                Zero Wait Time
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
                No credit cards needed online. Simple, transparent WhatsApp confirmation.
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
            Explore our menu, choose your favourites, and place your order directly with our restaurant.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/menu"
              className="bg-white text-brand-dark hover:bg-amber-50 font-black px-8 py-3.5 rounded-2xl shadow-xl transition-all"
            >
              Browse Full Menu
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} /> Order on WhatsApp
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
                Dé<span className="text-brand-primary">skilz</span> Restaurant
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Your destination for delicious shawarma, freshly made pizza, juicy burgers, authentic Nigerian meals, delightful treats and refreshing drinks.
            </p>
          </div>

          <div>
            <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-1.5 text-xs">
              {categoryTiles.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={`/menu?category=${encodeURIComponent(cat.name)}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider mb-3">Orders & Location</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:text-[#25D366] transition-colors font-medium"
                >
                  <Phone size={14} className="text-[#25D366]" /> +{settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-stone-300 hover:text-[#25D366] transition-colors font-medium group"
                >
                  <MessageSquare size={14} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span>Order on WhatsApp</span>
                </a>
              </li>
              <li className="text-stone-400">
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
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">Pickup Address (Get Directions):</span>
                    <span className="leading-snug block font-medium group-hover:underline text-white">
                      Inside Mobil filling station, Odo-Eran, Obantoko
                    </span>
                  </div>
                </a>
              </li>
            </ul>
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
