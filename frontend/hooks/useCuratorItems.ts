import {CuratorItemsResponse, getCuratorItems, getCuratorItemsFromUrl} from "../services/curatorService";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {useInfiniteQuery} from "@tanstack/react-query";

type OptionalCuratorId = string | null;

type UseCuratorItems = {
  curatorItems: SubscriptionItem[],
  isLoading: boolean,
  isFinished: boolean,
  refreshCuratorItems: () => void,
  refreshCuratorItem: (itemId: string) => void,
  fetchMoreItems: () => void,
}

const useCuratorItems = (curatorId: OptionalCuratorId): UseCuratorItems => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<CuratorItemsResponse>({
    queryKey: ["curatorItems", curatorId],
    queryFn: async ({pageParam = undefined}) => {
      if (curatorId === null) {
        const emptyResponse: CuratorItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        return await getCuratorItems(curatorId);
      }
      return await getCuratorItemsFromUrl(pageParam);
    },
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
        refetch({refetchPage: (_page, index) => index === i}).then(() => {});
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
