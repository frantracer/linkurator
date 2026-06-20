import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Topic } from "../entities/Topic";
import { getFavoriteTopicsItems, getTopicItemsFromUrl, TopicItemsResponse } from "../services/topicService";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestFavoriteTopicItems = {
  latestFavoriteItems: SubscriptionItem[];
  isLoading: boolean;
  isFinished: boolean;
  error: Error | null;
  refetch: () => void;
  fetchMoreItems: () => void;
}

const useLatestFavoriteTopicItems = (
  topics: Topic[],
  filters: Filters
): UseLatestFavoriteTopicItems => {
  const {
    data,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<TopicItemsResponse, Error, InfiniteData<TopicItemsResponse>, readonly unknown[], string | undefined>({
    queryKey: ["latestFavoriteTopicItems", filters],
    queryFn: async ({ pageParam }) => {
      if (topics.length === 0) {
        return { elements: [], nextPage: undefined };
      }
      if (pageParam === undefined) {
        return await getFavoriteTopicsItems(
          undefined,
          undefined,
          "",
          mapFiltersToInteractionParams(filters),
          []
        );
      }
      return await getTopicItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage?.toString(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: topics.length > 0
  });

  return {
    latestFavoriteItems: data ? data.pages.flatMap((page) => page.elements) : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    error: error as Error | null,
    refetch,
    fetchMoreItems: fetchNextPage
  };
};

export default useLatestFavoriteTopicItems;
