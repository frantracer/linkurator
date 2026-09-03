import {SubscriptionItem} from "../entities/SubscriptionItem";
import {
  getSubscriptionItems,
  getSubscriptionItemsFromUrl,
  SubscriptionItemsResponse
} from "../services/subscriptionService";
import {InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import {Subscription} from "../entities/Subscription";
import {Filters, getFilterDuration} from "../entities/Filters";
import {mapFiltersToInteractionParams} from "../services/common";

type OptionalSubscription = Subscription | null;

type UseSubscriptionItems = {
  subscriptionsItems: SubscriptionItem[],
  isLoading: boolean,
  isFinished: boolean,
  refreshSubscriptionItem: (itemId: string) => void,
  fetchMoreItems: () => void,
}


const useSubscriptionItems = (subscription: OptionalSubscription, filters: Filters): UseSubscriptionItems => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<SubscriptionItemsResponse, Error, InfiniteData<SubscriptionItemsResponse>, readonly unknown[], URL | undefined>({
    queryKey: ["subscriptionItems", subscription, filters],
    queryFn: async ({pageParam}) => {
      if (!subscription || (subscription && subscription.isBeingScanned)) {
        const emptyResponse: SubscriptionItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        const filterDuration = getFilterDuration(filters);
        return await getSubscriptionItems(subscription.uuid, filterDuration.min, filterDuration.max,
          filters.textSearch, mapFiltersToInteractionParams(filters));
      }
      return await getSubscriptionItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage
    },
    staleTime: Infinity
  })

  function refreshSubscriptionItem(itemId: string) {
    for (let i = 0; i < data!.pages.length; i++) {
      const page = data!.pages[i];
      const item = page.elements.find(item => item.uuid === itemId);
      if (item) {
        refetch().then(() => {
        });
        break;
      }
    }
  }

  return {
    subscriptionsItems: data ? data.pages.map((page) => page.elements).flat() : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    refreshSubscriptionItem: (itemId: string) => refreshSubscriptionItem(itemId),
    fetchMoreItems: () => fetchNextPage().then(() => {
    })
  };
};

export default useSubscriptionItems;
