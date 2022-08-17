import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";
import {Topic} from "./useTopics";

export type TopicItem = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
  published_at: Date;
};

interface TopicItemsResponse {
  elements: TopicItem[];
}

const mapJsonToTopicItemsResponse = (json: Record<string, any>): TopicItemsResponse => {
  return {
    elements: json.elements.map((element: Record<string, any>) => {
      const published_at = new Date(element.published_at);
      if (isNaN(published_at.getTime())) {
        throw new Error("Published at is not a valid date");
      }
      return {
        uuid: element.uuid,
        name: element.name,
        url: element.url,
        thumbnail: element.thumbnail,
        published_at: new Date(element.published_at)
      };
    })
  };
}

const useTopicItems = (topic?: Topic) => {
  const [topicItems, setTopicItems] = useState<TopicItem[]>([]);

  useEffect(() => {
    const fetchTopicItems = async () => {
      if (topic) {
        try {
          const url = configuration.TOPICS_URL + topic.uuid + "/items";
          const response = await axios.get(url, {withCredentials: true});
          if (response.status === 200) {
            const items = mapJsonToTopicItemsResponse(response.data).elements;
            setTopicItems(items);
          }
        } catch (error: any) {
          console.error("Error retrieving topic items", error);
        }
      } else {
        setTopicItems([]);
      }
    };

    fetchTopicItems();
  }, [topic]);

  return topicItems;
};

export default useTopicItems;
