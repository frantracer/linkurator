import {Topic} from "../entities/Topic";
import {configuration} from "../configuration";
import axios from "axios";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";
import {ITEMS_PER_PAGE} from "../utilities/constants";
import {InteractionFilter} from "./common";

export type TopicResponse = {
  elements: Topic[];
  next_page: URL | undefined;
}

export type TopicItemsResponse = {
  elements: SubscriptionItem[];
  nextPage: URL | undefined;
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

export async function getTopicItems(
  uuid: string,
  minDuration: number,
  maxDuration: number,
  searchText: string = "",
  interactionsToInclude: InteractionFilter[] = []
): Promise<TopicItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage = undefined;
  try {
    const searchParam = searchText ? "&search=" + searchText : "";
    const interactionsParam = interactionsToInclude.length > 0 ? "&include_interactions=" + interactionsToInclude.join(",") : "";
    const minDurationParam = "&min_duration=" + minDuration;
    const maxDurationParam = "&max_duration=" + maxDuration;
    const url = configuration.TOPICS_URL + uuid + "/items?page_size=" + ITEMS_PER_PAGE + searchParam +
      interactionsParam + minDurationParam + maxDurationParam;
    const {data, status} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToTopicItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage;
    }
  } catch (error: any) {
    console.error("Error retrieving topic items", error);
  }
  return {elements: items, nextPage: nextPage};
}

export async function getTopicItemsFromUrl(url: string): Promise<TopicItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage = undefined;
  try {
    const {data, status} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToTopicItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage;
    }
  } catch (error: any) {
    console.error("Error retrieving topic items from url", error);
  }
  return {elements: items, nextPage: nextPage};
}

export async function assignSubscriptionToTopic(topic_uuid: string, subscription_uuid: string): Promise<void> {
  const {data, status} = await axios.post(
    configuration.TOPICS_URL + topic_uuid + "/subscriptions/" + subscription_uuid,
    {},
    {withCredentials: true});
  if (status !== 201) {
    throw ("Error assigning subscription to topic " + data);
  }
}

export async function unassignSubscriptionToTopic(topic_uuid: string, subscription_uuid: string): Promise<void> {
  const {data, status} = await axios.delete(
    configuration.TOPICS_URL + topic_uuid + "/subscriptions/" + subscription_uuid,
    {withCredentials: true});
  if (status !== 204) {
    throw ("Error unassigning subscription from topic " + data);
  }
}

const mapJsonToTopicResponse = (json: Record<string, any>): TopicResponse => {
  let nextPage: URL | undefined = undefined;
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
  let nextPage: URL | undefined = undefined;
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
        duration: element.duration,
      };
    }),
    nextPage: nextPage,
  };
}
