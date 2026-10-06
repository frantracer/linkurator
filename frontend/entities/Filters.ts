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

// Upper bound used as "no maximum" by the long duration preset.
export const UNBOUNDED_DURATION_SECONDS = 999999;

const PRESET_DURATION_RANGES = {
  short: {min: 0, max: 119},
  medium: {min: 120, max: 3599},
  long: {min: 3600, max: UNBOUNDED_DURATION_SECONDS},
} as const;

export function getFilterDuration(filters: Filters): { min: number | undefined, max: number | undefined } {
  switch (filters.durationGroup) {
    case "short":
    case "medium":
    case "long":
      return PRESET_DURATION_RANGES[filters.durationGroup];
    case "all":
      return {min: undefined, max: undefined};
    default:
      return {
        min: filters.minDuration !== undefined ? filters.minDuration * 60 : undefined,
        max: filters.maxDuration !== undefined ? filters.maxDuration * 60 : undefined
      };
  }
}

// Inverse of getFilterDuration; "custom" when the range matches no preset.
export function getDurationGroupFromRange(min: number | undefined, max: number | undefined): DurationGroup {
  if (min === undefined && max === undefined) return "all";
  for (const [group, range] of Object.entries(PRESET_DURATION_RANGES)) {
    if (range.min === min && range.max === max) return group as DurationGroup;
  }
  return "custom";
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

export function areFiltersEqual(a: Filters, b: Filters): boolean {
  const excludedA = new Set(a.excludedSubscriptions);
  const excludedB = new Set(b.excludedSubscriptions);
  return a.displayWithoutInteraction === b.displayWithoutInteraction &&
    a.displayHidden === b.displayHidden &&
    a.displayViewed === b.displayViewed &&
    a.displayDiscouraged === b.displayDiscouraged &&
    a.displayRecommended === b.displayRecommended &&
    a.textSearch === b.textSearch &&
    a.durationGroup === b.durationGroup &&
    a.minDuration === b.minDuration &&
    a.maxDuration === b.maxDuration &&
    excludedA.size === excludedB.size &&
    a.excludedSubscriptions.every(uuid => excludedB.has(uuid));
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
