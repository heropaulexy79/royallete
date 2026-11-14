'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, MessageSquare, Sparkles, UtensilsCrossed, Pizza, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RESTAURANT_WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { useFeatureSettings } from '@/context/FeatureSettingsContext';

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
  // Slide 1: Duo Deal (Double Delight)
  {
    id: 1,
    badge: 'GOOD FOOD IS BETTER SHARED!',
    badgeIcon: Sparkles,
    title: 'Double the Burgers.',
    highlight: 'Double the Enjoyment.',
    subtitle: 'TWO CLASSIC BEEF BURGERS. ONE DELICIOUS PIZZA.',
    description:
      'The perfect combination for sharing, bonding and satisfying those serious cravings. TWICE THE BURGER. MORE REASONS TO ENJOY!',
    primaryCtaText: 'Explore Duo Deal',
    primaryCtaLink: '/menu?category=Combo',
    secondaryCtaText: 'WhatsApp Order',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: '/image/double-delight.png',
    cardDetail: {
      tag: 'Special Combo Deal',
      value: 'JUST ₦10,500',
      sub: '2 Beef Burgers + 1 Pizza',
    },
  },

  // Slide 2: Featured Food or Meal (Signature Rice Combo)
  {
    id: 2,
    badge: 'Verified Customer Favorite',
    badgeIcon: Flame,
    title: 'The Signature',
    highlight: 'Rice Combo',
    subtitle: 'Smoky Jollof, Fried Rice & Chicken',
    description:
      'More variety, great taste and incredible value in every plate. Your next satisfying meal is waiting at Déskilz',
    primaryCtaText: 'EXPLORE MENU',
    primaryCtaLink: '/menu?category=Food',
    secondaryCtaText: 'ORDER ON WHATSAPP',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: '/image/Signature%20Rice%20Combo.png',
  },

  // Slide 3: Snack Time Deal
  {
    id: 3,
    badge: 'JUST ₦2,200',
    badgeIcon: Sparkles,
    title: 'Snack Time,',
    highlight: 'Made Better.',
    subtitle: 'THREE FAVOURITES. ONE DELICIOUS DEAL.',
    description:
      'Enjoy the perfect snack combination with our golden Meat Pie, delicious Chicken Pie and tasty Sausage Roll.',
    primaryCtaText: 'Explore menu',
    primaryCtaLink: '/menu?category=Snacks',
    secondaryCtaText: 'WhatsApp Order',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: '/image/snack-time.png',
  },

  // Slide 4: Family Feast
  {
    id: 4,
    badge: 'BRING EVERYONE TO THE TABLE!',
    badgeIcon: Sparkles,
    title: 'More to Share.',
    highlight: 'More to Love.',
    subtitle: '4 CLASSIC BEEF BURGERS + 1 MEDIUM PIZZA',
    description:
      'Make every gathering more delicious! Perfect for sharing with family and friends.',
    primaryCtaText: 'Explore Family Feast',
    primaryCtaLink: '/menu?category=Combo',
    secondaryCtaText: 'WhatsApp Order',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: '/image/everyone.png',
    cardDetail: {
      tag: 'Family Feast Combo',
      value: 'JUST ₦19,500',
      sub: '4 Burgers + 1 Medium Pizza',
    },
  },

  // Slide 5: Big Cravings (Fries Combo)
  {
    id: 5,
    badge: 'BIG CRAVINGS? WE\'VE GOT YOU!',
    badgeIcon: Flame,
    title: 'Big Cravings?',
    highlight: "We've Got You!",
    subtitle: 'LARGER FRIES + 2 PIECES OF CHICKEN + 1 DRINK',
    description:
      'Everything you need for a satisfying meal, all in one irresistible combo!',
    primaryCtaText: 'Explore Fries Combo',
    primaryCtaLink: '/menu?category=Chicken%20%26%20Chips',
    secondaryCtaText: 'WhatsApp Order',
    secondaryCtaLink: `https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}`,
    image: '/image/big-cravings.png',
    cardDetail: {
      tag: 'Irresistible Combo',
      value: 'JUST ₦6,000',
      sub: 'Fries + 2 Chicken + 1 Drink',
    },
  },
];

export default function HeroSlider() {
  const { settings } = useFeatureSettings();
  const whatsappNumber = settings.whatsapp_number || RESTAURANT_WHATSAPP_NUMBER;
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
            className="w-full h-full object-cover object-right sm:object-center opacity-90"
          />
          {/* Subtle directional gradients that keep the photo vibrant while guaranteeing crystal-clear text readability */}
          {/* Horizontal fade: dark behind text on the left, clear and bright over the food image on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#191514]/90 via-[#191514]/50 to-transparent sm:from-[#191514]/95 sm:via-[#191514]/70 sm:to-transparent" />
          {/* Gentle vertical gradient for bottom contrast and seamless section transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#191514]/80 via-transparent to-[#191514]/30" />
        </motion.div>
      </AnimatePresence>

      {/* Main Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 w-full">
        <div className="max-w-xl lg:max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-3.5 sm:space-y-6"
            >
              {/* Harmonious Red + Amber Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/90 to-amber-950/70 backdrop-blur-md border border-amber-400/30 text-amber-300 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
                <BadgeIcon size={14} className="text-[#fbbf24]" />
                {slide.badge}
              </div>

              {/* Headline with accompanying gold highlight */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {slide.title} <br />
                <span className="text-[#fbbf24] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{slide.highlight}</span>
              </h1>

              {/* Subtitle tag */}
              <p className="text-sm sm:text-xl font-extrabold text-amber-300 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                {slide.subtitle}
              </p>

              {/* Description */}
              <p className="text-[#ede5da] text-xs sm:text-lg leading-relaxed max-w-lg font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
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
                    href={
                      slide.secondaryCtaLink.includes('wa.me')
                        ? `https://wa.me/${whatsappNumber}`
                        : slide.secondaryCtaLink
                    }
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
