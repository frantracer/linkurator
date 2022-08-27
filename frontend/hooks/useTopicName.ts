import {useEffect, useState} from "react";
import {Topic} from "../entities/Topic";


export function useTopicName(topic: Topic): [string, (name: string) => void] {
  const [topicName, setTopicName] = useState("");

  useEffect(() => {
    setTopicName(topic.name);
  }, [topic]);

  return [topicName, setTopicName];
}
