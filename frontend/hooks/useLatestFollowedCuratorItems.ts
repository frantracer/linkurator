import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Curator } from "../entities/Curators";
import { getCuratorItems } from "../services/curatorService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";

type UseLatestFollowedCuratorItems = {
  latestCuratorItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useLatestFollowedCuratorItems = (
  curators: Curator[],
  limit: number = 10,
  filters: Filters
): UseLatestFollowedCuratorItems => {
  const { data, isLoading, error, refetch } = useQuery({
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
          // Add curator to recommended_by for each item
          return response.elements.map(item => ({
            ...item,
            recommended_by: [...(item.recommended_by || []), curator]
          }));
        } catch (error) {
          console.error(`Error fetching items for curator ${curator.id}:`, error);
          return [];
        }
      });

      const allItemsArrays = await Promise.all(itemPromises);
      const allItems = allItemsArrays.flat();

      // Remove duplicates based on uuid and merge recommended_by arrays
      const itemsMap = new Map<string, SubscriptionItem>();
      allItems.forEach(item => {
        const existing = itemsMap.get(item.uuid);
        if (existing) {
          // Merge recommended_by arrays, avoiding duplicate curators
          const curatorIds = new Set(existing.recommended_by?.map(c => c.id) || []);
          const newCurators = item.recommended_by?.filter(c => !curatorIds.has(c.id)) || [];
          existing.recommended_by = [...(existing.recommended_by || []), ...newCurators];
        } else {
          itemsMap.set(item.uuid, item);
        }
      });
      const uniqueItems = Array.from(itemsMap.values());

      // Sort by publication date (newest first) and take the limit
      return uniqueItems
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: curators.length > 0
  });

  return {
    latestCuratorItems: data || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export default useLatestFollowedCuratorItems;