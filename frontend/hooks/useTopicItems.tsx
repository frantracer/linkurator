import {useEffect, useState} from "react";
import {Topic} from "../entities/Topic";
import {TopicItem} from "../entities/TopicItem";
import {getTopicItems} from "../services/topicService";

export function useTopicItems(topic?: Topic): [TopicItem[], (topic_items: TopicItem[]) => void,] {
  const [topicItems, setTopicItems] = useState<TopicItem[]>([]);

  useEffect(() => {
    const fetchTopicItems = async () => {
      if (topic) {
        getTopicItems(topic.uuid).then(setTopicItems);
      } else {
        setTopicItems([]);
      }
    };

    fetchTopicItems();
  }, [topic]);

  return [topicItems, setTopicItems];
}

export default useTopicItems;
