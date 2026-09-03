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
  minDuration: number | undefined;
  maxDuration: number | undefined;
  excludedSubscriptions: string[];
}

export function getFilterDuration(filters: Filters): { min: number | undefined, max: number | undefined } {
  switch (filters.durationGroup) {
    case "short":
      return {min: 0, max: 119};
    case "medium":
      return {min: 120, max: 3599};
    case "long":
      return {min: 3600, max: 999999};
    case "all":
      return {min: undefined, max: undefined};
    default:
      return {
        min: filters.minDuration !== undefined ? filters.minDuration * 60 : undefined,
        max: filters.maxDuration !== undefined ? filters.maxDuration * 60 : undefined
      };
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

export const durationOptions: { key: DurationGroup, label: string }[] = [
  {key: "short", label: "short_duration"},
  {key: "medium", label: "medium_duration"},
  {key: "long", label: "long_duration"},
  {key: "all", label: "any_duration"},
  {key: "custom", label: "custom_duration"}
]

export const defaultFilters: Filters = {
  textSearch: "",
  displayHidden: false,
  displayViewed: true,
  displayDiscouraged: false,
  displayRecommended: true,
  displayWithoutInteraction: true,
  durationGroup: "all",
  minDuration: undefined,
  maxDuration: undefined,
  excludedSubscriptions: [],
}
