import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Curator } from "../entities/Curators";
import { getCuratorItems } from "../services/curatorService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";

type UseLatestFollowedCuratorItems = {
  latestCuratorItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
}

const useLatestFollowedCuratorItems = (
  curators: Curator[],
  limit: number = 10,
  filters: Filters
): UseLatestFollowedCuratorItems => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latestFollowedCuratorItems", curators, limit, filters],
    queryFn: async () => {
      const followedCurators = curators.filter(curator => curator.followed);

      if (!followedCurators || followedCurators.length === 0) {
        return [];
      }

      // Fetch items from all followed curators in parallel
      const itemPromises = followedCurators.map(async (curator) => {
        try {
          const response = await getCuratorItems(
            curator.id,
            0, // min duration
            Number.MAX_SAFE_INTEGER, // max duration
            filters.textSearch || ""
          );
          return response.elements;
        } catch (error) {
          console.error(`Error fetching items for curator ${curator.id}:`, error);
          return [];
        }
      });

      const allItemsArrays = await Promise.all(itemPromises);
      const allItems = allItemsArrays.flat();

      // Sort by publication date (newest first) and take the limit
      return allItems
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: curators.length > 0
  });

  return {
    latestCuratorItems: data || [],
    isLoading,
    error: error as Error | null
  };
};

export default useLatestFollowedCuratorItems;