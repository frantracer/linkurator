import {hasInteraction, SubscriptionItem} from "./SubscriptionItem";

export type Filters = {
  display_without_interaction: boolean;
  display_hidden: boolean;
  display_viewed: boolean;
  display_discouraged: boolean;
  display_recommended: boolean;
  textSearch: string;
}

export function isItemShown(item: SubscriptionItem, filters: Filters) {
  if (!filters.display_recommended && !filters.display_discouraged &&
    !filters.display_viewed && !filters.display_hidden &&
    !filters.display_without_interaction) {
    return true;
  }
  return (
    (filters.display_without_interaction && !hasInteraction(item)) ||
    (filters.display_hidden && item.hidden) ||
    (filters.display_viewed && item.viewed) ||
    (filters.display_discouraged && item.discouraged) ||
    (filters.display_recommended && item.recommended)
  );
}
