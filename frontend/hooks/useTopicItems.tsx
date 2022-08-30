import {useEffect, useState} from "react";
import {Topic} from "../entities/Topic";
import {TopicItem} from "../entities/TopicItem";
import {getTopicItems} from "../services/topicService";

const useTopicItems = (topic?: Topic): [TopicItem[], () => void] => {
  const [topicItems, setTopicItems] = useState<TopicItem[]>([]);

  function refreshTopicItems(topic?: Topic) {
    if (topic) {
      getTopicItems(topic.uuid)
        .then(setTopicItems)
        .catch(error => console.log("Error retrieving topic items " + error));
    } else {
      setTopicItems([]);
    }
  }

  useEffect(() => {
    refreshTopicItems(topic)
  }, [topic]);

  return [topicItems, () => refreshTopicItems(topic)];
}

export default useTopicItems;
