import configuration from "../configuration";
import axios from "axios";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";

export interface SubscriptionResponse {
  elements: Subscription[];
  next_page: string;
}

interface SubscriptionItemsResponse {
  elements: SubscriptionItem[];
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
    })
  };
}

export async function getSubscriptions(): Promise<Subscription[]> {
  let subscriptions: Subscription[] = []
  let nextPage = configuration.SUBSCRIPTIONS_URL;
  while (nextPage !== "") {
    const {data, status} = await axios.get<SubscriptionResponse>(
      nextPage, {withCredentials: true});
    if (status === 200) {
      subscriptions = subscriptions.concat(data.elements);
      nextPage = data.next_page || "";
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
    const response = await axios.get(url, {withCredentials: true});
    if (response.status === 200) {
      items = mapJsonToSubscriptionItemsResponse(response.data).elements;
      nextPage = response.data.next_page || "";
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
    const response = await axios.get(url, {withCredentials: true});
    if (response.status === 200) {
      items = mapJsonToSubscriptionItemsResponse(response.data).elements;
      nextPage = response.data.next_page || "";
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
