import {CuratorItemsResponse, getCuratorItems, getCuratorItemsFromUrl} from "../services/curatorService";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import {Filters, getFilterDuration} from "../entities/Filters";

type OptionalCuratorId = string | null;

type UseCuratorItems = {
  curatorItems: SubscriptionItem[],
  isLoading: boolean,
  isFinished: boolean,
  refreshCuratorItems: () => void,
  refreshCuratorItem: (itemId: string) => void,
  fetchMoreItems: () => void,
}

const useCuratorItems = (curatorId: OptionalCuratorId, filters: Filters): UseCuratorItems => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<CuratorItemsResponse, Error, InfiniteData<CuratorItemsResponse>, readonly unknown[], URL | undefined>({
    queryKey: ["curatorItems", curatorId, filters],
    queryFn: async ({pageParam}) => {
      if (curatorId === null) {
        const emptyResponse: CuratorItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        const filterDuration = getFilterDuration(filters);
        return await getCuratorItems(curatorId, filterDuration.min, filterDuration.max, filters.textSearch);
      }
      return await getCuratorItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage
    },
    staleTime: Infinity
  })

  function refreshCuratorItem(itemId: string) {
    for (let i = 0; i < data!.pages.length; i++) {
      const page = data!.pages[i];
      const item = page.elements.find(item => item.uuid === itemId);
      if (item) {
        refetch().then(() => {});
        break;
      }
    }
  }

  return {
    curatorItems: data ? data.pages.map((page) => page.elements).flat() : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    refreshCuratorItems: () => refetch(),
    refreshCuratorItem,
    fetchMoreItems: fetchNextPage
  }
}


export default useCuratorItems;
