import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";
import {Profile} from "./useProfile";

export type Topic = {
  uuid: string;
  name: string;
};

export interface TopicResponse {
  elements: Topic[];
  next_page: string;
}

const useTopics = (profile: Profile) => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        if (profile) {
          let topics: Topic[] = []
          let nextPage = configuration.TOPICS_URL;
          while (nextPage !== "") {
            const {data, status} = await axios.get<TopicResponse>(
              nextPage, {withCredentials: true});
            if (status === 200) {
              topics = topics.concat(data.elements);
              nextPage = data.next_page || "";
            } else {
              console.error("Error retrieving subscriptions", data);
              nextPage = "";
            }
          }
          setTopics(topics);
        } else {
          setTopics([]);
        }
      } catch (error: any) {
        console.error("Error retrieving subscriptions", error);
      }
    };

    fetchTopics();
  }, [profile]);

  return topics;
};

export default useTopics;
