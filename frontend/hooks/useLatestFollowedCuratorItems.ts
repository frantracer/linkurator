import { SubscriptionItem } from "../entities/SubscriptionItem";
import { CuratorItemsResponse, getCuratorItemsFromUrl, getFollowedCuratorsItems } from "../services/curatorService";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";

type UseLatestFollowedCuratorItems = {
  latestCuratorItems: SubscriptionItem[];
  isLoading: boolean;
  isFinished: boolean;
  error: Error | null;
  refetch: () => void;
  fetchMoreItems: () => void;
}

const useLatestFollowedCuratorItems = (
  pageSize: number,
  filters: Filters
): UseLatestFollowedCuratorItems => {
  const {
    data,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<CuratorItemsResponse, Error, InfiniteData<CuratorItemsResponse>, readonly unknown[], URL | undefined>({
    queryKey: ["latestFollowedCuratorItems", pageSize, filters],
    queryFn: async ({ pageParam }) => {
      if (pageParam === undefined) {
        return await getFollowedCuratorsItems(
          filters.minDuration,
          filters.maxDuration,
          filters.textSearch || "",
          pageSize
        );
      }
      return await getCuratorItemsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
  });

  return {
    latestCuratorItems: data ? data.pages.flatMap((page) => page.elements) : [],
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    error: error as Error | null,
    refetch,
    fetchMoreItems: fetchNextPage
  };
};

export default useLatestFollowedCuratorItems;
