import {getTopicItems, getTopicItemsFromUrl, TopicItemsResponse} from "../services/topicService";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import {Filters, getFilterDuration} from "../entities/Filters";
import {mapFiltersToInteractionParams} from "../services/common";

type OptionalTopicId = string | undefined;

type UseTopicItems = {
  topicItems: SubscriptionItem[],
  isLoading: boolean,
  isFinished: boolean,
  refreshTopicItems: () => void,
  refreshTopicItem: (itemId: string) => void,
  fetchMoreItems: () => void,
}

const useTopicItems = (topicId: OptionalTopicId, filters: Filters): UseTopicItems => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<TopicItemsResponse, Error, InfiniteData<TopicItemsResponse>, readonly unknown[], string | undefined>({
    queryKey: ["topicItems", topicId, filters],
    queryFn: async ({pageParam}) => {
      if (topicId === undefined) {
        const emptyResponse: TopicItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        const filterDuration = getFilterDuration(filters);
        return await getTopicItems(topicId, filterDuration.min, filterDuration.max, filters.textSearch,
          mapFiltersToInteractionParams(filters), filters.excludedSubscriptions);
      }
      return await getTopicItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage?.toString()
    },
    staleTime: Infinity
  })

  function refreshTopicItem(itemId: string) {
    if (!data) return;

    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      const item = page.elements.find(item => item.uuid === itemId);
      if (item) {
        refetch().then(() => {});
        break;
      }
    }
  }

  return {
    topicItems: data ? data.pages.map((page) => page.elements).flat() : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    refreshTopicItems: () => refetch(),
    refreshTopicItem,
    fetchMoreItems: fetchNextPage
  }
}


export default useTopicItems;
