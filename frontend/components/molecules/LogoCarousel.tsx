'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '../atoms/Icons';

type LogoCarouselItem = {
  src: string;
  alt: string;
  label: string;
};

type LogoCarouselProps = {
  items: LogoCarouselItem[];
};

const SCROLL_STEP = 240;

const LogoCarousel = ({ items }: LogoCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const checkOverflow = () => {
      setCanScroll(container.scrollWidth > container.clientWidth);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [items]);

  const scrollByStep = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const atEnd = container.scrollLeft >= maxScrollLeft - 1;
    const atStart = container.scrollLeft <= 1;

    if (direction === 1 && atEnd) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === -1 && atStart) {
      container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2 w-full max-w-7xl mx-auto px-4 md:px-6">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByStep(-1)}
        className={`flex ${canScroll ? 'md:flex' : 'md:hidden'} btn btn-circle btn-sm btn-ghost flex-shrink-0`}
      >
        <ChevronLeftIcon/>
      </button>
      <div
        ref={scrollRef}
        tabIndex={0}
        role="list"
        aria-label="Supported platforms"
        className={`flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 py-4 min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${canScroll ? '' : 'justify-center'}`}
      >
        {items.map((item, i) => (
          <div
            key={i}
            role="listitem"
            className="flex-shrink-0 snap-start w-36 h-32 md:w-40 md:h-36 rounded-xl border
              bg-base-100 shadow-sm flex flex-col items-center justify-center gap-2 p-4"
          >
            <Image
              src={item.src}
              width={48}
              height={48}
              alt={item.alt}
              className="h-12 w-12 object-contain"
            />
            <span className="text-sm font-medium text-center">{item.label}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByStep(1)}
        className={`flex ${canScroll ? 'md:flex' : 'md:hidden'} btn btn-circle btn-sm btn-ghost flex-shrink-0`}
      >
        <ChevronRightIcon/>
      </button>
    </div>
  );
};

export default LogoCarousel;
