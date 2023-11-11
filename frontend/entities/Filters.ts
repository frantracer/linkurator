import {SubscriptionItem} from "./SubscriptionItem";

export type Filters = {
  display_hidden: boolean;
  display_viewed: boolean;
  display_discouraged: boolean;
  display_recommended: boolean;
  textSearch: string;
}

export function isItemShown(item: SubscriptionItem, filters: Filters) {
  return (
    (filters.display_hidden || !item.hidden) &&
    (filters.display_viewed || !item.viewed) &&
    (filters.display_discouraged || !item.discouraged) &&
    (filters.display_recommended || !item.recommended)
  );
}
