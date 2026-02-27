import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Topic } from "../entities/Topic";
import { getFavoriteTopicsItems } from "../services/topicService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestFavoriteTopicItems = {
  latestFavoriteItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useLatestFavoriteTopicItems = (
  topics: Topic[],
  limit: number = 10,
  filters: Filters
): UseLatestFavoriteTopicItems => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["latestFavoriteTopicItems", limit, filters],
    queryFn: async () => {
      const response = await getFavoriteTopicsItems(
        undefined,
        undefined,
        "",
        mapFiltersToInteractionParams(filters),
        []
      );
      return response.elements
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: topics.length > 0
  });

  return {
    latestFavoriteItems: data || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};

export default useLatestFavoriteTopicItems;