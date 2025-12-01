import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Subscription } from "../entities/Subscription";
import { getFollowedSubscriptionsItems } from "../services/subscriptionService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestSubscriptionItems = {
  latestItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useLatestSubscriptionItems = (
  subscriptions: Subscription[],
  limit: number = 10,
  filters: Filters
): UseLatestSubscriptionItems => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["latestSubscriptionItems", limit, filters],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) {
        return [];
      }

      // Fetch items from all followed subscriptions in a single query
      const response = await getFollowedSubscriptionsItems(
        0, // min duration
        Number.MAX_SAFE_INTEGER, // max duration
        "", // no text search
        mapFiltersToInteractionParams(filters),
        limit
      );

      return response.elements;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: subscriptions.length > 0
  });

  return {
    latestItems: data || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export default useLatestSubscriptionItems;