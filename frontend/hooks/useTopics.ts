import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Profile} from "./useProfile";
import {Topic} from "../entities/Topic";
import {getTopics} from "../services/topicService";


export function useTopics(profile: Profile): [Topic[], Dispatch<SetStateAction<Topic[]>>] {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        if (profile) {
          getTopics().then(topics => setTopics(topics));
        } else {
          setTopics([]);
        }
      } catch (error: any) {
        console.error("Error retrieving subscriptions", error);
      }
    };

    fetchTopics();
  }, [profile]);

  return [topics, setTopics];
}
