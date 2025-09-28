import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Subscription } from "../entities/Subscription";
import { getSubscriptionItems } from "../services/subscriptionService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestSubscriptionItems = {
  latestItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
}

const useLatestSubscriptionItems = (
  subscriptions: Subscription[],
  limit: number = 10,
  filters: Filters
): UseLatestSubscriptionItems => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latestSubscriptionItems", subscriptions, limit, filters],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) {
        return [];
      }

      // Fetch items from all subscriptions in parallel
      const itemPromises = subscriptions
        .filter(sub => sub.followed && !sub.isBeingScanned)
        .map(async (subscription) => {
          try {
            const response = await getSubscriptionItems(
              subscription.uuid,
              0, // min duration
              Number.MAX_SAFE_INTEGER, // max duration
              "", // no text search
              mapFiltersToInteractionParams(filters)
            );
            return response.elements;
          } catch (error) {
            console.error(`Error fetching items for subscription ${subscription.uuid}:`, error);
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
    enabled: subscriptions.length > 0
  });

  return {
    latestItems: data || [],
    isLoading,
    error: error as Error | null
  };
};

export default useLatestSubscriptionItems;