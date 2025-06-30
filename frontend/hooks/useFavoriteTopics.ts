import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { favoriteTopic, unfavoriteTopic } from '../services/topicService';

type UseFavoriteTopics = {
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (topicId: string, isFavorite: boolean) => Promise<void>;
}

export function useFavoriteTopics(): UseFavoriteTopics {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const toggleFavorite = async (topicId: string, isFavorite: boolean): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await unfavoriteTopic(topicId);
      } else {
        await favoriteTopic(topicId);
      }
      
      // Invalidate and refetch topic-related queries
      await queryClient.invalidateQueries({ queryKey: ['topics'] });
      await queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'An error occurred while updating favorite status';
      setError(errorMessage);
      console.error('Error toggling favorite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    toggleFavorite,
  };
}