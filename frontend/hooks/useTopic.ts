import {useQuery} from '@tanstack/react-query';
import {Topic} from '../entities/Topic';
import {getTopic} from '../services/topicService';

type UseTopic = {
  topic: Topic | null;
  topicIsLoading: boolean;
  topicIsError: boolean;
}

const fetchTopic = async (currentTopicId: string | undefined, topics: Topic[]) => {
  if (currentTopicId) {
    const topicFromCache = topics.find((topic) => topic.uuid === currentTopicId);
    if (topicFromCache) {
      return topicFromCache;
    }
    const topicFromApi = await getTopic(currentTopicId);
    if (topicFromApi) {
      return topicFromApi;
    }
    throw new Error("Topic not found");
  }
  return null;
};

export function useTopic(currentTopicId: string | undefined, topics: Topic[], topicsAreLoading: boolean): UseTopic {
  const {data: topic = null, isLoading, isError: topicIsError} = useQuery({
    queryKey: ['topic', currentTopicId, topics],
    queryFn: () => fetchTopic(currentTopicId, topics),
    staleTime: 60000,
    retry: false,
  });

  const topicIsLoading = topicsAreLoading || isLoading;

  return {
    topic,
    topicIsLoading,
    topicIsError
  };
}
