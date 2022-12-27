import {Topic} from "../entities/Topic";
import configuration from "../configuration";
import axios from "axios";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";

export interface TopicResponse {
  elements: Topic[];
  next_page: URL | null;
}

interface TopicItemsResponse {
  elements: SubscriptionItem[];
  nextPage: URL | null;
}

export async function getTopics(): Promise<Topic[]> {
  let topics: Topic[] = []
  let nextPage = configuration.TOPICS_URL;
  while (nextPage !== "") {
    const {data, status} = await axios.get(nextPage, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToTopicResponse(data);
      topics = topics.concat(response.elements);
      nextPage = response.next_page?.toString() || "";
    } else {
      console.error("Error retrieving topics", data);
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

export async function updateTopic(uuid: string, name: string | undefined, subscriptions: string[] | undefined) {
  const {data, status} = await axios.patch(
    configuration.TOPICS_URL + uuid,
    {
      name: name,
      subscriptions_ids: subscriptions
    },
    {withCredentials: true});
  if (status !== 204) {
    console.error("Error updating topic", data);
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

export async function getTopicItems(uuid: string): Promise<[SubscriptionItem[], string]> {
  let items: SubscriptionItem[] = []
  let nextPage = "";
  try {
    const url = configuration.TOPICS_URL + uuid + "/items?page_size=20";
    const {data, status} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToTopicItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage?.toString() || "";
    }
  } catch (error: any) {
    console.error("Error retrieving topic items", error);
  }
  return [items, nextPage];
}

export async function getTopicItemsFromUrl(url: string): Promise<[SubscriptionItem[], string]> {
  let items: SubscriptionItem[] = []
  let nextPage = "";
  try {
    const {data, status} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToTopicItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage?.toString() || "";
    }
  } catch (error: any) {
    console.error("Error retrieving topic items from url", error);
  }
  return [items, nextPage];
}

export async function assignSubscriptionToTopic(topic_uuid: string, subscription_uuid: string): Promise<void> {
  const {data, status} = await axios.post(
    configuration.TOPICS_URL + topic_uuid + "/subscriptions/" + subscription_uuid,
    {},
    {withCredentials: true});
  if (status !== 201) {
    throw("Error assigning subscription to topic " + data);
  }
}

const mapJsonToTopicResponse = (json: Record<string, any>): TopicResponse => {
  let nextPage: URL | null = null;
  if (json.next_page) {
    nextPage = replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL));
  }

  return {
    elements: json.elements.map((element: Record<string, any>) => {
      return {
        uuid: element.uuid,
        name: element.name,
        subscriptions_ids: element.subscriptions_ids,
      };
    }),
    next_page: nextPage,
  };
}

const mapJsonToTopicItemsResponse = (json: Record<string, any>): TopicItemsResponse => {
  let nextPage: URL | null = null;
  if (json.next_page) {
    nextPage = replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL));
  }

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
        published_at: new Date(element.published_at),
        subscription_uuid: element.subscription_uuid,
        recommended: element.recommended,
        discouraged: element.discouraged,
        viewed: element.viewed,
        hidden: element.hidden,
      };
    }),
    nextPage: nextPage,
  };
}