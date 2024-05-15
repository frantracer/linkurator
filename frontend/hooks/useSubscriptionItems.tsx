import {SubscriptionItem} from "../entities/SubscriptionItem";
import {
  getSubscriptionItems,
  getSubscriptionItemsFromUrl,
  SubscriptionItemsResponse
} from "../services/subscriptionService";
import {useInfiniteQuery} from "@tanstack/react-query";
import {Subscription} from "../entities/Subscription";
import {Filters} from "../entities/Filters";
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
  } = useInfiniteQuery<SubscriptionItemsResponse>({
    queryKey: ["subscriptionItems", subscription, filters],
    queryFn: async ({pageParam = undefined}) => {
      if (!subscription || (subscription && subscription.isBeingScanned)) {
        const emptyResponse: SubscriptionItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        return await getSubscriptionItems(subscription.uuid, filters.minDuration, filters.maxDuration,
          filters.textSearch, mapFiltersToInteractionParams(filters));
      }
      return await getSubscriptionItemsFromUrl(pageParam as URL);
    },
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
        refetch({refetchPage: (page, index) => index === i}).then(() => {
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
