'use client';

import React, { useState } from 'react';
import ItemCard from '../atoms/ItemCard';
import { SubscriptionItem } from '../../entities/SubscriptionItem';
import { ChevronDownIcon, ChevronUpIcon } from '../atoms/Icons';

type ItemCarouselProps = {
  items: SubscriptionItem[];
  title?: string;
  onItemClick?: (item: SubscriptionItem) => void;
  isLoading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  skeletonCount?: number;
};

const ItemCarousel = ({
  items,
  title = "Items",
  onItemClick,
  isLoading = false,
  collapsible = false,
  defaultExpanded = false,
  skeletonCount = 10,
}: ItemCarouselProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const shouldShowContent = !collapsible || isExpanded;
  const containerClass = 'my-3';
  const titleClass = 'text-sm font-medium';

  if (isLoading) {
    return (
      <div className={containerClass}>
        <h2 className={`${titleClass}`}>{title}</h2>
        <div className={`flex gap-3 overflow-x-auto pb-2`}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-32 bg-base-300 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const titleContent = (
    <span className="flex items-center gap-2">
      {title}
      <span className="badge badge-sm bg-primary/20 text-primary border-none">
        {items.length}
      </span>
    </span>
  );

  return (
    <div className={containerClass}>
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-2 text-sm font-medium text-base-content bg-base-300/50 rounded-lg hover:bg-base-300 transition-colors duration-200"
        >
          {titleContent}
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      ) : (
        <h2 className={`${titleClass} mb-2`}>
          {titleContent}
        </h2>
      )}

      {shouldShowContent && (
        <div className={collapsible ? "mt-2" : ""}>
          <div
            className={`flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent`}
            onTouchStart={handleTouchStart}
          >
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

export default ItemCarousel;