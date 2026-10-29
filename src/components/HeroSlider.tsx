'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MessageSquare, Sparkles, UtensilsCrossed, Pizza, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

interface Slide {
  id: number;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  cardDetail?: {
    tag: string;
    value: string;
    sub: string;
  };
}

const SLIDES: Slide[] = [
  // Slide 1: Brand Introduction
  {
    id: 1,
    badge: 'Welcome to Déskilz',
    badgeIcon: Sparkles,
    title: 'Satisfying Meals,',
    highlight: 'Craved Flavors.',
    subtitle: 'Fast Casual Dining Redefined',
    description:
      'Déskilz is your premier destination for mouth-watering shawarmas, hand-crafted pizzas, flame-grilled burgers, authentic rice dishes, creamy ice cream, and chilled drinks.',
    primaryCtaText: 'Explore Menu',
    primaryCtaLink: '/menu',
    secondaryCtaText: 'WhatsApp Order',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600',
    cardDetail: {
      tag: 'Fresh Kitchen',
      value: '100% Cooked to Order',
      sub: 'Zero cold reheating',
    },
  },

  // Slide 2: Featured Food or Meal (Approved Rice Combo at ₦3,000)
  {
    id: 2,
    badge: 'Verified Customer Favorite',
    badgeIcon: Flame,
    title: 'The Signature',
    highlight: 'Rice Combo ₦3,000',
    subtitle: 'Smoky Jollof, Fried Rice & Chicken',
    description:
      'Indulge in our chef-prepared combination of rich smoky Nigerian Jollof rice, seasoned vegetable Fried rice, and tender golden flame-grilled chicken quarter.',
    primaryCtaText: 'Order Now',
    primaryCtaLink: '/menu?category=Food',
    secondaryCtaText: 'View Food Section',
    secondaryCtaLink: '/menu?category=Food',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600',
    cardDetail: {
      tag: 'Approved Special',
      value: '₦3,000',
      sub: 'Jollof + Fried Rice + Chicken',
    },
  },

  // Slide 3: Explore More (Category Discovery)
  {
    id: 3,
    badge: '8 Distinct Categories',
    badgeIcon: Pizza,
    title: 'Shawarma, Pizza,',
    highlight: 'Burgers & Treats',
    subtitle: 'Over 70 Approved Dishes & Drinks',
    description:
      'Whether you crave a fiery Chicken Suya Shawarma, a cheesy Meatball Pizza, a creamy Double Beef Burger, or sweet VanChoco Ice Cream, we have your craving covered.',
    primaryCtaText: 'Browse Menu',
    primaryCtaLink: '/menu',
    secondaryCtaText: 'Direct Kitchen Chat',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600',
    cardDetail: {
      tag: 'Complete Variety',
      value: '70 Dishes',
      sub: 'Across 8 rich categories',
    },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = SLIDES[current];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#191514] min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Déskilz Promotions and Brand Showcase"
    >
      {/* Background Images with smooth cross-fade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Multi-layered cinematic gradient overlays in warm espresso & charcoal for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#191514] via-[#191514]/90 to-transparent sm:via-[#191514]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191514] via-transparent to-[#191514]/50" />
        </motion.div>
      </AnimatePresence>

      {/* Main Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Harmonious Red + Amber Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-amber-950/60 backdrop-blur-md border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
                <BadgeIcon size={14} className="text-[#fbbf24]" />
                {slide.badge}
              </div>

              {/* Headline with accompanying gold highlight */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                {slide.title} <br />
                <span className="text-[#fbbf24] drop-shadow-sm">{slide.highlight}</span>
              </h1>

              {/* Subtitle tag */}
              <p className="text-sm sm:text-base font-bold text-amber-200/90 tracking-wide uppercase">
                {slide.subtitle}
              </p>

              {/* Description */}
              <p className="text-[#ede5da] text-sm sm:text-lg leading-relaxed max-w-xl font-normal">
                {slide.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href={slide.primaryCtaLink}
                  className="btn-primary py-3.5 px-8 sm:px-9 text-base group shadow-xl shadow-red-600/30 font-black"
                  id={`hero-cta-${slide.id}`}
                >
                  {slide.primaryCtaText}
                  <ArrowRight
                    size={18}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                {slide.secondaryCtaLink && (
                  <a
                    href={slide.secondaryCtaLink}
                    target={slide.secondaryCtaLink.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-[#fbbf24] border border-amber-400/30 py-3.5 px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base backdrop-blur-md transition-all active:scale-95"
                  >
                    <MessageSquare size={17} className="text-[#25D366]" />
                    {slide.secondaryCtaText}
                  </a>
                )}
              </div>

              {/* Verified Product Badge */}
              {slide.cardDetail && (
                <div className="inline-flex items-center gap-3 bg-[#241e1c]/90 backdrop-blur-md border border-amber-500/20 p-3 sm:p-3.5 rounded-2xl shadow-xl mt-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center font-black">
                    <UtensilsCrossed size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider block">
                      {slide.cardDetail.tag}
                    </span>
                    <span className="text-sm font-black text-white block">
                      {slide.cardDetail.value}
                    </span>
                    <span className="text-xs text-[#ede5da]/70 block">
                      {slide.cardDetail.sub}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls: Arrows */}
      <div className="absolute right-4 sm:right-8 bottom-6 sm:bottom-12 z-20 flex items-center gap-3">
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#191514]/80 hover:bg-brand-primary backdrop-blur-md text-white border border-[#ede5da]/20 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#191514]/80 hover:bg-brand-primary backdrop-blur-md text-white border border-[#ede5da]/20 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide Indicators: Exactly 3 with brand red & amber */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 sm:bottom-8 z-20 flex items-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            aria-label={`Jump to slide ${idx + 1}`}
            className={`transition-all rounded-full ${
              current === idx
                ? 'w-8 h-2.5 bg-brand-primary'
                : 'w-2.5 h-2.5 bg-amber-200/40 hover:bg-amber-200/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
