import {configuration} from "../configuration";
import axios from "axios";
import {isBeingScanned, Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";
import {ITEMS_PER_PAGE} from "../utilities/constants";
import {InteractionFilter} from "./common";

export type SubscriptionResponse = {
  elements: Subscription[];
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
    subscription: {
      uuid: json.subscription.uuid,
      name: json.subscription.name,
      url: json.subscription.url,
      thumbnail: json.subscription.thumbnail,
      provider: json.subscription.provider,
      topicUuid: json.subscription.topic_uuid,
      followed: json.subscription.followed,
      isBeingScanned: isBeingScanned(json.subscription.scanned_at),
    },
    recommended: json.recommended,
    discouraged: json.discouraged,
    viewed: json.viewed,
    hidden: json.hidden,
    duration: json.duration,
    recommended_by: [],
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
        provider: element.provider,
        topicUuid: element.topic_uuid,
        followed: element.followed,
        isBeingScanned: isBeingScanned(element.scanned_at),
      };
    }),
  };
}

export async function getSubscriptions(): Promise<Subscription[]> {
  let subscriptions: Subscription[] = []
  const {data, status} = await axios.get(configuration.SUBSCRIPTIONS_URL, {withCredentials: true});
  if (status === 200) {
    const response = mapJsonToSubscriptionResponse(data);
    subscriptions = response.elements;
  } else {
    console.error("Error retrieving subscriptions", data);
  }
  return subscriptions
}

export async function getSubscriptionsByNameOrUrl(nameOrUrl: string): Promise<Subscription[]> {
  let subscriptions: Subscription[] = []
  const {data, status} = await axios.get(configuration.SUBSCRIPTIONS_URL + "search?name_or_url=" + nameOrUrl,
    {withCredentials: true});
  if (status === 200) {
    const response = mapJsonToSubscriptionResponse(data);
    subscriptions = response.elements;
  } else {
    console.error("Error retrieving subscriptions", data);
  }
  return subscriptions
}

export async function getSubscription(uuid: string): Promise<Subscription | undefined> {
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid;
    const response = await axios.get(url, {withCredentials: true});
    if (response.status === 200) {
      return {
        uuid: response.data.uuid,
        name: response.data.name,
        url: response.data.url,
        topicUuid: response.data.topic_uuid,
        provider: response.data.provider,
        followed: response.data.followed,
        thumbnail: response.data.thumbnail,
        isBeingScanned: Date.parse(response.data.scanned_at) < 946684800000, // It was scanned before 2000-01-01
      };
    }
  } catch (error: any) {
    console.error("Error retrieving subscription", error);
  }
  return undefined;
}

export async function getSubscriptionItems(
  uuid: string,
  minDuration: number,
  maxDuration: number,
  searchText: string = "",
  interactionsToInclude: InteractionFilter[] = []
): Promise<SubscriptionItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage: URL | undefined = undefined;
  try {
    const searchParam = searchText ? "&search=" + searchText : "";
    const interactionsParam = interactionsToInclude.length > 0 ? "&include_interactions=" + interactionsToInclude.join(",") : "";
    const minDurationParam = "&min_duration=" + minDuration;
    const maxDurationParam = "&max_duration=" + maxDuration;
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/items?page_size=" + ITEMS_PER_PAGE + searchParam +
      interactionsParam + minDurationParam + maxDurationParam;
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

export async function followSubscription(uuid: string): Promise<boolean> {
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/follow";
    const response = await axios.post(url, {}, {withCredentials: true});
    if (response.status === 201) {
      return true;
    }
  } catch (error: any) {
    console.error("Error following subscription", error);
  }
  return false;
}

export async function unfollowSubscription(uuid: string): Promise<boolean> {
  try {
    const url = configuration.SUBSCRIPTIONS_URL + uuid + "/follow";
    const response = await axios.delete(url, {withCredentials: true});
    if (response.status === 204) {
      return true;
    }
  } catch (error: any) {
    console.error("Error unfollowing subscription", error);
  }
  return false;
}

export async function getFollowedSubscriptionsItems(
  minDuration: number,
  maxDuration: number,
  searchText: string = "",
  interactionsToInclude: InteractionFilter[] = [],
  pageSize: number = ITEMS_PER_PAGE
): Promise<SubscriptionItemsResponse> {
  let items: SubscriptionItem[] = []
  let nextPage: URL | undefined = undefined;
  try {
    const searchParam = searchText ? "&search=" + searchText : "";
    const interactionsParam = interactionsToInclude.length > 0 ? "&include_interactions=" + interactionsToInclude.join(",") : "";
    const minDurationParam = "&min_duration=" + minDuration;
    const maxDurationParam = "&max_duration=" + maxDuration;
    const url = configuration.SUBSCRIPTIONS_URL + "items?page_size=" + pageSize + searchParam +
      interactionsParam + minDurationParam + maxDurationParam;
    const {status, data} = await axios.get(url, {withCredentials: true});
    if (status === 200) {
      const response = mapJsonToSubscriptionItemsResponse(data);
      items = response.elements;
      nextPage = response.nextPage ? new URL(response.nextPage) : undefined;
    }
  } catch (error: any) {
    console.error("Error retrieving followed subscriptions items", error);
  }
  return {elements: items, nextPage: nextPage};
}
