import React from 'react';
import { SubscriptionItem } from '../../entities/SubscriptionItem';
import { readableAgoUnits } from '../../utilities/dateFormatter';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { paths } from '../../configuration';
import { SwapButton } from './SwapButton';
import {
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon
} from './Icons';
import { InteractionType, interactWithItem, removeInteractionWithItem } from '../../services/interactionService';
import Miniature from './Miniature';
import { providerIconUrl } from '../../entities/Subscription';

type ItemCardProps = {
  item: SubscriptionItem;
  withInteractions?: boolean;
  onChange?: () => void;
};

const ItemCard = ({ item, withInteractions = true, onChange }: ItemCardProps) => {
  const t = useTranslations("common");


  const handleOpenItem = (itemUrl: string) => {
    const isIOS = /iPad|iPhone/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = itemUrl;
    } else {
      window.open(itemUrl, "_blank");
    }
  };

  const handleInteraction = async (interactionType: InteractionType, checked: boolean) => {
    try {
      if (checked) {
        await interactWithItem(item.uuid, interactionType);
      } else {
        await removeInteractionWithItem(item.uuid, interactionType);
      }
      if (onChange) {
        onChange();
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
    }
  };

  const convertPublishedToAgoText = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const ago = readableAgoUnits(dateObj);
    return t("ago_label", {value: ago.value, unit: t(ago.unit)});
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
    <div className="flex-shrink-0 w-60 bg-base-200 rounded-lg shadow-sm border border-base-300 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="h-40 w-full overflow-hidden rounded-t-lg relative cursor-pointer" onClick={() => handleOpenItem(item.url)}>
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.duration && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-75 rounded text-white text-xs font-medium">
            {formatDuration(item.duration)}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="text-sm font-medium text-base-content line-clamp-2 mb-2 cursor-pointer hover:text-primary"
          onClick={() => handleOpenItem(item.url)}
        >
          {item.name}
        </h3>

        <div className="flex gap-x-2 items-center mb-2">
          <Miniature src={providerIconUrl(item.subscription.provider)} alt={item.subscription.provider} />
          <Miniature src={item.subscription.thumbnail} alt={item.subscription.name} />
          <Link
            href={paths.SUBSCRIPTIONS + "/" + item.subscription.uuid}
            className="text-xs text-base-content/70 hover:text-primary line-clamp-1"
          >
            {item.subscription.name}
          </Link>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-base-content/60">
            {convertPublishedToAgoText(item.published_at)}
          </span>
          {withInteractions && (
            <div className="flex gap-1">
              <SwapButton
                defaultChecked={item.discouraged}
                onChange={(isChecked) => handleInteraction(InteractionType.Discouraged, isChecked)}
              >
                <ThumbsDownFilledIcon />
                <ThumbsDownIcon />
              </SwapButton>
              <SwapButton
                defaultChecked={item.recommended}
                onChange={(isChecked) => handleInteraction(InteractionType.Recommended, isChecked)}
              >
                <ThumbsUpFilledIcon />
                <ThumbsUpIcon />
              </SwapButton>
              <SwapButton
                defaultChecked={item.hidden}
                onChange={(isChecked) => handleInteraction(InteractionType.Hidden, isChecked)}
              >
                <ArchiveBoxFilledIcon />
                <ArchiveBoxIcon />
              </SwapButton>
              <SwapButton
                defaultChecked={item.viewed}
                onChange={(isChecked) => handleInteraction(InteractionType.Viewed, isChecked)}
              >
                <CheckCircleFilledIcon />
                <CheckCircleIcon />
              </SwapButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;