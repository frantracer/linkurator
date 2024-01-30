import {hasInteraction, SubscriptionItem} from "./SubscriptionItem";

export type Filters = {
  displayWithoutInteraction: boolean;
  displayHidden: boolean;
  displayViewed: boolean;
  displayDiscouraged: boolean;
  displayRecommended: boolean;
  textSearch: string;
  minDuration: number;
  maxDuration: number;
}

export function isItemShown(item: SubscriptionItem, filters: Filters) {
  if (!filters.displayRecommended && !filters.displayDiscouraged &&
    !filters.displayViewed && !filters.displayHidden &&
    !filters.displayWithoutInteraction) {
    return true;
  }
  return (
    (filters.displayWithoutInteraction && !hasInteraction(item)) ||
    (filters.displayHidden && item.hidden) ||
    (filters.displayViewed && item.viewed) ||
    (filters.displayDiscouraged && item.discouraged) ||
    (filters.displayRecommended && item.recommended)
  );
}
