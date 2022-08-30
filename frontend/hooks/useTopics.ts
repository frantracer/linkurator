import {useEffect, useState} from "react";
import {Profile} from "./useProfile";
import {Topic} from "../entities/Topic";
import {getTopics} from "../services/topicService";


export function useTopics(profile: Profile): [Topic[], () => void] {
  const [topics, setTopics] = useState<Topic[]>([]);

  function refreshTopics(profile: Profile) {
    if (profile) {
      getTopics()
        .then(topics => {
          setTopics(topics)
        })
        .catch(error => console.error("Error retrieving subscriptions", error));
    } else {
      setTopics([]);
    }
  }

  useEffect(() => {
    refreshTopics(profile);
  }, [profile]);

  return [topics, () => refreshTopics(profile)];
}
