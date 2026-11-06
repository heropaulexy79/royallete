'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FoodItem } from '@/types/schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  category: string;
  items: FoodItem[];
  renderItem: (item: FoodItem) => React.ReactNode;
}

export default function CategoryCarousel({
  category,
  items,
  renderItem,
}: CategoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-14 relative">
      {/* Category Header with Counter & Nav Buttons */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
            {category}
          </h2>
          <span className="text-xs font-bold text-stone-500 bg-[#ede5da]/70 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${category} left`}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all ${
              canScrollLeft
                ? 'bg-white text-brand-dark border-[#ede5da] shadow-xs hover:bg-stone-50 hover:border-stone-400 cursor-pointer active:scale-95'
                : 'bg-stone-100 text-stone-300 border-transparent cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={`Scroll ${category} right`}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all ${
              canScrollRight
                ? 'bg-white text-brand-dark border-[#ede5da] shadow-xs hover:bg-stone-50 hover:border-stone-400 cursor-pointer active:scale-95'
                : 'bg-stone-100 text-stone-300 border-transparent cursor-not-allowed'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel Track: 4 visible on lg/xl, 2 on sm/md, 1.2 on mobile */}
      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1 -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 snap-start w-[82%] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] flex flex-col"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

