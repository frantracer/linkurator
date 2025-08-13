'use client';

import React, { useState } from 'react';
import ItemCard from '../atoms/ItemCard';
import { SubscriptionItem } from '../../entities/SubscriptionItem';
import { ChevronDownIcon, ChevronUpIcon } from '../atoms/Icons';

type CollapsibleCarouselProps = {
  items: SubscriptionItem[];
  title?: string;
  defaultExpanded?: boolean;
  onItemClick?: (item: SubscriptionItem) => void;
};

const CollapsibleCarousel = ({ 
  items, 
  title = "Items", 
  defaultExpanded = false,
  onItemClick 
}: CollapsibleCarouselProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="my-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 text-sm font-medium text-base-content bg-base-300/50 rounded-lg hover:bg-base-300 transition-colors duration-200"
      >
        <span className="flex items-center gap-2">
          {title}
          <span className="badge badge-sm bg-primary/20 text-primary border-none">
            {items.length}
          </span>
        </span>
        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {/* Carousel Content */}
      {isExpanded && (
        <div className="mt-2">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
            {items.map((item) => (
              <ItemCard 
                key={item.uuid} 
                item={item} 
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleCarousel;