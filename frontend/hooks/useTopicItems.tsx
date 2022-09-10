import {useEffect, useState} from "react";
import {Topic} from "../entities/Topic";
import {getTopicItems} from "../services/topicService";
import {SubscriptionItem} from "../entities/SubscriptionItem";

const useTopicItems = (topic?: Topic): [SubscriptionItem[], () => void] => {
  const [topicItems, setTopicItems] = useState<SubscriptionItem[]>([]);

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
