import {configuration} from "../configuration";
import axios from "axios";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";
import {ITEMS_PER_PAGE} from "../utilities/constants";

export type SubscriptionResponse = {
  elements: Subscription[];
  nextPage: URL | undefined;
}

export type SubscriptionItemsResponse = {
  elements: SubscriptionItem[];
  nextPage: URL | undefined;
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
    nextPage: json.next_page ? replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL)) : undefined,
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
        isBeingScanned: Date.parse(element.scanned_at) < 946684800000, // It was scanned before 2000-01-01
      };
    }),
    nextPage: json.next_page ? replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL)) : undefined,
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

export async function getSubscriptionItems(uuid: string, textSearch: string): Promise<SubscriptionItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage: URL | undefined = undefined;
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/items?page_size=" + ITEMS_PER_PAGE + "&search=" + textSearch;
    const {status, data} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage ? new URL(response.nextPage) : undefined;
    }
  } catch (error: any) {
    console.error("Error retrieving topic items", error);
  }
  return {elements: items, nextPage: nextPage};
}

export async function getSubscriptionItemsFromUrl(url: URL): Promise<SubscriptionItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage: URL | undefined = undefined;
  try {
    const {status, data} = await axios.get(url.toString(), {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage ? new URL(response.nextPage) : undefined;
    }
  } catch (error: any) {
    console.error("Error retrieving topic items from url", error);
  }
  return {elements: items, nextPage: nextPage};
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

export async function refreshSubscription(uuid: string): Promise<boolean> {
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/refresh";
    const response = await axios.post(url, {}, {withCredentials: true});
    if (response.status === 200) {
      return true;
    }
  } catch (error: any) {
    console.error("Error refreshing subscription", error);
  }
  return false;
}
