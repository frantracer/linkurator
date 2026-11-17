import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {areFiltersEqual, Filters, showEverythingFilters} from "../entities/Filters";
import {
  CuratorRecommendationsFilters,
  curatorRecommendationsPath,
  parseCuratorRecommendationsFilters,
  unfilteredCuratorRecommendations
} from "../utilities/curatorRecommendationsUrl";

const TEXT_SEARCH_DEBOUNCE_MS = 500;

type UseCuratorRecommendationsFilters = {
  // What the filter bar shows, including the text being typed
  filters: Filters;
  // What the feed is fetched with, once the text search has settled
  appliedFilters: CuratorRecommendationsFilters;
  areFiltersModified: boolean;
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
}

function haveSameElements(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every(element => b.includes(element));
}

// The curator recommendations filters live in the URL so they survive reloads and can be linked to
const useCuratorRecommendationsFilters = (
  curatorName: string,
  curatorSubscriptionIds: string[]
): UseCuratorRecommendationsFilters => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appliedFilters = useMemo(() => parseCuratorRecommendationsFilters(searchParams), [searchParams]);
  const appliedTextSearch = appliedFilters.filters.textSearch;
  const [textSearch, setTextSearch] = useState(appliedTextSearch);
  // Text search written to the URL by this hook, so its echo does not overwrite what is still being typed
  const writtenTextSearch = useRef<string | null>(null);

  useEffect(() => {
    if (writtenTextSearch.current === appliedTextSearch) {
      writtenTextSearch.current = null;
      return;
    }
    setTextSearch(appliedTextSearch);
  }, [appliedTextSearch]);

  useEffect(() => {
    if (textSearch === appliedTextSearch) {
      return;
    }
    const timer = setTimeout(() => {
      writtenTextSearch.current = textSearch;
      router.replace(curatorRecommendationsPath(curatorName, {
        filters: {...appliedFilters.filters, textSearch: textSearch},
        includedSubscriptions: appliedFilters.includedSubscriptions,
      }), {scroll: false});
    }, TEXT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [textSearch, appliedTextSearch, appliedFilters, curatorName, router]);

  const includedSubscriptions = appliedFilters.includedSubscriptions;
  const excludedSubscriptions = includedSubscriptions === undefined
    ? []
    : curatorSubscriptionIds.filter(uuid => !includedSubscriptions.includes(uuid));
  const filters: Filters = {...appliedFilters.filters, textSearch: textSearch, excludedSubscriptions: excludedSubscriptions};

  const replaceAppliedFilters = (nextFilters: CuratorRecommendationsFilters) => {
    if (nextFilters.filters.textSearch !== appliedTextSearch) {
      writtenTextSearch.current = nextFilters.filters.textSearch;
    }
    router.replace(curatorRecommendationsPath(curatorName, nextFilters), {scroll: false});
  }

  const setFilters = (nextFilters: Filters) => {
    setTextSearch(nextFilters.textSearch);
    if (areFiltersEqual({...nextFilters, textSearch: filters.textSearch}, filters)) {
      return;
    }
    const nextExcludedSubscriptions = nextFilters.excludedSubscriptions;
    const nextIncludedSubscriptions = haveSameElements(nextExcludedSubscriptions, excludedSubscriptions)
      ? includedSubscriptions
      : nextExcludedSubscriptions.length === 0
        ? undefined
        : curatorSubscriptionIds.filter(uuid => !nextExcludedSubscriptions.includes(uuid));
    replaceAppliedFilters({
      filters: {...nextFilters, excludedSubscriptions: []},
      includedSubscriptions: nextIncludedSubscriptions,
    });
  }

  const resetFilters = () => {
    setTextSearch(showEverythingFilters.textSearch);
    replaceAppliedFilters(unfilteredCuratorRecommendations);
  }

  return {
    filters: filters,
    appliedFilters: appliedFilters,
    areFiltersModified: !areFiltersEqual(filters, showEverythingFilters) || includedSubscriptions !== undefined,
    setFilters: setFilters,
    resetFilters: resetFilters,
  };
}

export default useCuratorRecommendationsFilters;
