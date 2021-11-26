import axios from "axios";
import { useEffect, useState } from "react";
import configuration from "../configuration";

type Subscription = {
  id: string;
  name: string;
};

type Topic = {
  id: string;
  name: string;
  subscriptions: Subscription[];
};

const useTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data } = await axios(configuration.TOPICS_URL);
        setTopics(data);
      } catch (error: any) {
        console.error("Error retrieving topics", error);
      }
    };

    fetchTopics();
  }, []);

  return topics;
};

export default useTopics;
