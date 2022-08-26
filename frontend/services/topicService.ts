import {Topic} from "../entities/Topic";
import configuration from "../configuration";
import axios from "axios";

export interface TopicResponse {
  elements: Topic[];
  next_page: string;
}

export async function getTopics(): Promise<Topic[]> {
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
  return topics
}

export async function createTopic(uuid: string, name: string, subscriptions: string[]) {
  const {data, status} = await axios.post(
    configuration.TOPICS_URL,
    {uuid: uuid, name: name, subscriptions_ids: subscriptions},
    {withCredentials: true});
  if (status === 201) {
    return data;
  } else {
    console.error("Error creating topic", data);
  }
}

export async function deleteTopic(uuid: string) {
  const {data, status} = await axios.delete(
    configuration.TOPICS_URL + uuid, {withCredentials: true});
  if (status === 204) {
    return data;
  } else {
    console.error("Error deleting topic", data);
  }
}