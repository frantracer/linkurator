import {useQuery} from '@tanstack/react-query';
import {Topic, topicSorting} from "../entities/Topic";
import {getTopicsByName} from "../services/topicService";
import {Profile} from "../services/profileService";

type findTopicsState = {
  topics: Topic[];
  topicsAreLoading: boolean;
  refreshTopics: () => void;
}

const useFindTopics = (profile: Profile | undefined, name: string): findTopicsState => {
  const fetchTopics = () => {
    if (name === '') {
      return [];
    }
    return getTopicsByName(name).then(
      topics => topics.sort(topicSorting)
    );
  };

  const {data: topics = [], isLoading: topicsAreLoading, refetch: refreshTopics} = useQuery({
    queryKey: ['topics', profile?.username, name],
    queryFn: fetchTopics,
    staleTime: 60000,
  });

  return {
    topics,
    topicsAreLoading,
    refreshTopics,
  };
};

export default useFindTopics;
