import {getTopicItems, getTopicItemsFromUrl, TopicItemsResponse} from "../services/topicService";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {useInfiniteQuery} from "@tanstack/react-query";

type OptionalTopicId = string | undefined;

type UseTopicItems = {
  topicItems: SubscriptionItem[],
  isLoading: boolean,
  isFinished: boolean,
  refreshTopicItems: () => void,
  refreshTopicItem: (itemId: string) => void,
  fetchMoreItems: () => void,
}

const useTopicItems = (topicId: OptionalTopicId, searchText: string): UseTopicItems => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<TopicItemsResponse>({
    queryKey: ["topicItems", topicId, searchText],
    queryFn: async ({pageParam = undefined}) => {
      if (topicId === undefined) {
        const emptyResponse: TopicItemsResponse = {elements: [], nextPage: undefined};
        return emptyResponse;
      }
      if (pageParam === undefined) {
        return await getTopicItems(topicId, searchText);
      }
      return await getTopicItemsFromUrl(pageParam);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage
    },
    staleTime: Infinity
  })

  function refreshTopicItem(itemId: string) {
    for (let i = 0; i < data!.pages.length; i++) {
      const page = data!.pages[i];
      const item = page.elements.find(item => item.uuid === itemId);
      if (item) {
        refetch({refetchPage: (page, index) => index === i}).then(() => {});
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
