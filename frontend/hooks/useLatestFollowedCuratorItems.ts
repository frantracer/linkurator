import { SubscriptionItem } from "../entities/SubscriptionItem";
import { getFollowedCuratorsItems } from "../services/curatorService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";

type UseLatestFollowedCuratorItems = {
  latestCuratorItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useLatestFollowedCuratorItems = (
  limit: number,
  filters: Filters
): UseLatestFollowedCuratorItems => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["latestFollowedCuratorItems", limit, filters],
    queryFn: async () => {
      const response = await getFollowedCuratorsItems(
        filters.minDuration,
        filters.maxDuration,
        filters.textSearch || "",
        limit
      );
      return response.elements;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    latestCuratorItems: data || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export default useLatestFollowedCuratorItems;
