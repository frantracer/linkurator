import {paths} from "../configuration";
import {durationOptions, Filters, showEverythingFilters} from "../entities/Filters";
import {InteractionFilter, mapFiltersToInteractionParams} from "../services/common";

export type CuratorRecommendationsFilters = {
  filters: Filters;
  // undefined shows the items of every subscription, even the ones the curator does not follow
  includedSubscriptions: string[] | undefined;
};

type SearchParamsReader = {
  get: (name: string) => string | null;
};

const SECTION_PARAM = "section";
const RECOMMENDATIONS_SECTION = "recommendations";
const SEARCH_PARAM = "search";
const DURATION_PARAM = "duration";
const MIN_DURATION_PARAM = "min";
const MAX_DURATION_PARAM = "max";
const INTERACTIONS_PARAM = "interactions";
const SUBSCRIPTIONS_PARAM = "subscriptions";

const ALL_INTERACTIONS_COUNT = mapFiltersToInteractionParams(showEverythingFilters).length;

export const unfilteredCuratorRecommendations: CuratorRecommendationsFilters = {
  filters: showEverythingFilters,
  includedSubscriptions: undefined,
};

function parseList(value: string | null): string[] | undefined {
  if (value === null) {
    return undefined;
  }
  return value.split(",").filter(element => element !== "");
}

function parseMinutes(value: string | null): number | undefined {
  if (value === null || value.trim() === "") {
    return undefined;
  }
  const minutes = Number(value);
  return Number.isFinite(minutes) ? minutes : undefined;
}

export function parseCuratorRecommendationsFilters(params: SearchParamsReader): CuratorRecommendationsFilters {
  const durationParam = params.get(DURATION_PARAM);
  const durationOption = durationOptions.find(option => option.key === durationParam);
  const durationGroup = durationOption ? durationOption.key : showEverythingFilters.durationGroup;
  const isCustomDuration = durationGroup === "custom";
  const interactions = parseList(params.get(INTERACTIONS_PARAM));
  const isInteractionShown = (interaction: InteractionFilter): boolean =>
    interactions === undefined || interactions.includes(interaction);

  return {
    filters: {
      textSearch: params.get(SEARCH_PARAM) ?? "",
      durationGroup: durationGroup,
      minDuration: isCustomDuration ? parseMinutes(params.get(MIN_DURATION_PARAM)) : undefined,
      maxDuration: isCustomDuration ? parseMinutes(params.get(MAX_DURATION_PARAM)) : undefined,
      displayWithoutInteraction: isInteractionShown(InteractionFilter.WITHOUT_INTERACTIONS),
      displayRecommended: isInteractionShown(InteractionFilter.RECOMMENDED),
      displayDiscouraged: isInteractionShown(InteractionFilter.DISCOURAGED),
      displayViewed: isInteractionShown(InteractionFilter.VIEWED),
      displayHidden: isInteractionShown(InteractionFilter.HIDDEN),
      excludedSubscriptions: [],
    },
    includedSubscriptions: parseList(params.get(SUBSCRIPTIONS_PARAM)),
  };
}

export function curatorRecommendationsPath(
  curatorName: string,
  {filters, includedSubscriptions}: CuratorRecommendationsFilters
): string {
  const params = new URLSearchParams();
  params.set(SECTION_PARAM, RECOMMENDATIONS_SECTION);
  if (filters.textSearch !== "") {
    params.set(SEARCH_PARAM, filters.textSearch);
  }
  if (filters.durationGroup !== showEverythingFilters.durationGroup) {
    params.set(DURATION_PARAM, filters.durationGroup);
  }
  if (filters.durationGroup === "custom" && filters.minDuration !== undefined) {
    params.set(MIN_DURATION_PARAM, String(filters.minDuration));
  }
  if (filters.durationGroup === "custom" && filters.maxDuration !== undefined) {
    params.set(MAX_DURATION_PARAM, String(filters.maxDuration));
  }
  const interactions = mapFiltersToInteractionParams(filters);
  if (interactions.length !== ALL_INTERACTIONS_COUNT) {
    params.set(INTERACTIONS_PARAM, interactions.join(","));
  }
  if (includedSubscriptions !== undefined) {
    params.set(SUBSCRIPTIONS_PARAM, includedSubscriptions.join(","));
  }
  return `${paths.CURATORS}/${encodeURIComponent(curatorName)}?${params.toString()}`;
}
