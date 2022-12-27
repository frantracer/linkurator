import configuration from "../configuration";
import axios from "axios";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";

export interface SubscriptionResponse {
  elements: Subscription[];
  nextPage: URL | null;
}

interface SubscriptionItemsResponse {
  elements: SubscriptionItem[];
  nextPage: URL | null;
}

const mapJsonItemToSubscriptionItem = (json: Record<string, any>): SubscriptionItem => {
  const published_at = new Date(json.published_at);
  if (isNaN(published_at.getTime())) {
    throw new Error("Published at is not a valid date");
  }
  return {
    uuid: json.uuid,
    name: json.name,
    url: json.url,
    thumbnail: json.thumbnail,
    published_at: new Date(json.published_at),
    subscription_uuid: json.subscription_uuid,
    recommended: json.recommended,
    discouraged: json.discouraged,
    viewed: json.viewed,
    hidden: json.hidden,
  };
}

const mapJsonToSubscriptionItemsResponse = (json: Record<string, any>): SubscriptionItemsResponse => {
  return {
    elements: json.elements.map((element: Record<string, any>) => {
      return mapJsonItemToSubscriptionItem(element);
    }),
    nextPage: json.next_page ? replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL)) : null,
  };
}

const mapJsonToSubscriptionResponse = (json: Record<string, any>): SubscriptionResponse => {
  return {
    elements: json.elements.map((element: Record<string, any>) => {
      return {
        uuid: element.uuid,
        name: element.name,
        url: element.url,
        thumbnail: element.thumbnail,
        topic_uuid: element.topic_uuid,
      };
    }),
    nextPage: json.next_page ? replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL)) : null,
  };
}

export async function getSubscriptions(): Promise<Subscription[]> {
  let subscriptions: Subscription[] = []
  let nextPage = configuration.SUBSCRIPTIONS_URL;
  while (nextPage !== "") {
    const {data, status} = await axios.get(nextPage, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionResponse(data);
      subscriptions = subscriptions.concat(response.elements);
      nextPage = response.nextPage?.toString() || "";
    } else {
      console.error("Error retrieving subscriptions", data);
      nextPage = "";
    }
  }
  return subscriptions
}

export async function getSubscriptionItems(uuid: string): Promise<[SubscriptionItem[], string]> {
  let items: SubscriptionItem[] = []
  let nextPage = "";
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/items?page_size=20";
    const {status, data} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage?.toString() || "";
    }
  } catch (error: any) {
    console.error("Error retrieving topic items", error);
  }
  return [items, nextPage];
}

export async function getSubscriptionItemsFromUrl(url: string): Promise<[SubscriptionItem[], string]> {
  let items: SubscriptionItem[] = []
  let nextPage = "";
  try {
    const {status, data} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage?.toString() || "";
    }
  } catch (error: any) {
    console.error("Error retrieving topic items from url", error);
  }
  return [items, nextPage];
}

export async function getItem(uuid: string): Promise<SubscriptionItem | undefined> {
  try {
    const url = configuration.ITEMS_URL + uuid;
    const response = await axios.get(url, {withCredentials: true});
    if (response.status === 200) {
      return mapJsonItemToSubscriptionItem(response.data);
    }
  } catch (error: any) {
    console.error("Error retrieving topic items", error);
  }
  return undefined;
}
