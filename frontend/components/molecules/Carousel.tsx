'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../atoms/Icons';

type CarouselProps = {
  children: ReactNode[];
  ariaLabel: string;
  scrollStep?: number;
};

const Carousel = ({ children, ariaLabel, scrollStep = 240 }: CarouselProps) => {
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
  }, [children]);

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
      container.scrollBy({ left: direction * scrollStep, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2 w-full max-w-7xl mx-auto">
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
        aria-label={ariaLabel}
        className={`flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 py-4 min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${canScroll ? '' : 'justify-center'}`}
      >
        {children.map((child, i) => (
          <div key={i} role="listitem" className="flex-shrink-0 snap-start">
            {child}
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

export default Carousel;
