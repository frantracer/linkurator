import React from 'react';
import { SubscriptionItem } from '../../entities/SubscriptionItem';

type ItemCardProps = {
  item: SubscriptionItem;
  onClick?: (item: SubscriptionItem) => void;
};

const ItemCard = ({ item, onClick }: ItemCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="flex-shrink-0 w-48 bg-base-200 rounded-lg shadow-sm border border-base-300 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="h-24 w-full overflow-hidden rounded-t-lg">
        <img 
          src={item.thumbnail} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-base-content line-clamp-2 mb-1">
          {item.name}
        </h3>
        <p className="text-xs text-base-content/70 line-clamp-1 mb-2">
          {item.subscription.name}
        </p>
        <div className="flex items-center justify-between">
          {item.duration && (
            <span className="text-xs text-base-content/60">
              {formatDuration(item.duration)}
            </span>
          )}
          {item.recommended && (
            <span className="inline-block px-2 py-1 text-xs bg-success/10 text-success rounded-full">
              ★
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;