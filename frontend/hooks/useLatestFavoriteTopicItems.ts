import { SubscriptionItem } from "../entities/SubscriptionItem";
import { Topic } from "../entities/Topic";
import { getTopicItems } from "../services/topicService";
import { useQuery } from "@tanstack/react-query";
import { Filters } from "../entities/Filters";
import { mapFiltersToInteractionParams } from "../services/common";

type UseLatestFavoriteTopicItems = {
  latestFavoriteItems: SubscriptionItem[];
  isLoading: boolean;
  error: Error | null;
}

const useLatestFavoriteTopicItems = (
  topics: Topic[],
  limit: number = 10,
  filters: Filters
): UseLatestFavoriteTopicItems => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latestFavoriteTopicItems", topics, limit, filters],
    queryFn: async () => {
      const favoriteTopics = topics.filter(topic => topic.is_favorite);

      if (!favoriteTopics || favoriteTopics.length === 0) {
        return [];
      }

      // Fetch items from all favorite topics in parallel
      const itemPromises = favoriteTopics.map(async (topic) => {
        try {
          const response = await getTopicItems(
            topic.uuid,
            0, // min duration
            Number.MAX_SAFE_INTEGER, // max duration
            "", // no text search
            mapFiltersToInteractionParams(filters),
            [] // no excluded subscriptions
          );
          return response.elements;
        } catch (error) {
          console.error(`Error fetching items for topic ${topic.uuid}:`, error);
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
    enabled: topics.length > 0
  });

  return {
    latestFavoriteItems: data || [],
    isLoading,
    error: error as Error | null
  };
};

export default useLatestFavoriteTopicItems;