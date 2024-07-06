import {hasInteraction, SubscriptionItem} from "./SubscriptionItem";

type DurationGroup = "all" | "short" | "medium" | "long" | "custom";

export type Filters = {
  displayWithoutInteraction: boolean;
  displayHidden: boolean;
  displayViewed: boolean;
  displayDiscouraged: boolean;
  displayRecommended: boolean;
  textSearch: string;
  durationGroup: DurationGroup;
  minDuration: number;
  maxDuration: number;
}

export function getFilterDuration(filters: Filters): { min: number, max: number } {
  switch (filters.durationGroup) {
    case "short":
      return {min: 0, max: 62};
    case "medium":
      return {min: 63, max: 3599};
    case "long":
      return {min: 3600, max: 999999};
    case "all":
      return {min: 0, max: 999999};
    default:
      return {min: filters.minDuration, max: filters.maxDuration};
  }
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

export const durationOptions = [
  {key: "short", label: "Corta"},
  {key: "medium", label: "Intermedia"},
  {key: "long", label: "Larga"},
  {key: "all", label: "Cualquiera"},
  {key: "custom", label: "Personalizada"}
]
