'use client';

import React from 'react';
import Image from 'next/image';
import Carousel from './Carousel';

type LogoCarouselItem = {
  src: string;
  alt: string;
  label: string;
};

type LogoCarouselProps = {
  items: LogoCarouselItem[];
};

const LogoCarousel = ({ items }: LogoCarouselProps) => {
  return (
    <Carousel ariaLabel="Supported platforms">
      {items.map((item, i) => (
        <div
          key={i}
          className="w-36 h-32 md:w-40 md:h-36 rounded-xl border
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
    </Carousel>
  );
};

export default LogoCarousel;
