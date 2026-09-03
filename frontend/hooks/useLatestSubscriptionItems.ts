import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Subscription } from "../entities/Subscription";
import {
  getFollowedSubscriptionsItems,
  getSubscriptionItemsFromUrl,
  SubscriptionItemsResponse
} from "../services/subscriptionService";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Filters, getFilterDuration } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestSubscriptionItems = {
  latestItems: SubscriptionItem[];
  isLoading: boolean;
  isFinished: boolean;
  error: Error | null;
  refetch: () => void;
  fetchMoreItems: () => void;
}

const useLatestSubscriptionItems = (
  subscriptions: Subscription[],
  pageSize: number = 10,
  filters: Filters
): UseLatestSubscriptionItems => {
  const {
    data,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<SubscriptionItemsResponse, Error, InfiniteData<SubscriptionItemsResponse>, readonly unknown[], URL | undefined>({
    queryKey: ["latestSubscriptionItems", pageSize, filters],
    queryFn: async ({ pageParam }) => {
      if (!subscriptions || subscriptions.length === 0) {
        return { elements: [], nextPage: undefined };
      }
      if (pageParam === undefined) {
        const filterDuration = getFilterDuration(filters);
        return await getFollowedSubscriptionsItems(
          filterDuration.min,
          filterDuration.max,
          filters.textSearch,
          mapFiltersToInteractionParams(filters),
          pageSize
        );
      }
      return await getSubscriptionItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: subscriptions.length > 0
  });

  return {
    latestItems: data ? data.pages.flatMap((page) => page.elements) : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    error: error as Error | null,
    refetch,
    fetchMoreItems: fetchNextPage
  };
};

export default useLatestSubscriptionItems;
