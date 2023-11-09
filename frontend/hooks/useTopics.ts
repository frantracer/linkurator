import {useEffect, useState} from "react";
import {Profile} from "./useProfile";
import {Topic, topicSorting} from "../entities/Topic";
import {getTopics} from "../services/topicService";

type UseTopics = {
  topics: Topic[];
  topicsAreLoading: boolean;
  refreshTopics: () => void;
}

type TopicsState = {
  topics: Topic[];
  topicsAreLoading: boolean;
}

export function useTopics(profile: Profile | undefined): UseTopics {
  const [topics, setTopics] = useState<TopicsState>({topics: [], topicsAreLoading: true});

  function refreshTopics(profile: Profile | undefined) {
    if (profile) {
      getTopics()
        .then(topics => {
          topics.sort(topicSorting)
          setTopics({topics: topics, topicsAreLoading: false})
        })
        .catch(error => console.error("Error retrieving subscriptions", error));
    } else {
      setTopics({topics: [], topicsAreLoading: false});
    }
  }

  useEffect(() => {
    setTopics({topics: [], topicsAreLoading: true})
    refreshTopics(profile);
  }, [profile]);

  return {
    topics: topics.topics,
    topicsAreLoading: topics.topicsAreLoading,
    refreshTopics: () => refreshTopics(profile)
  };
}
