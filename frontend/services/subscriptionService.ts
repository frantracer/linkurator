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

const mapJsonToSubscriptionItemsResponse = (json: Record<string, any>): SubscriptionItemsResponse => {
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
      };
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

export async function getSubscriptionItems(subscription_uuid: string): Promise<SubscriptionItem[]> {
  const url = configuration.SUBSCRIPTIONS_URL + subscription_uuid + "/items";
  const response = await axios.get(url, {withCredentials: true});
  if (response.status === 200) {
    return mapJsonToSubscriptionItemsResponse(response.data).elements;
  } else {
    throw("Error retrieving subscription items " + response.data);
  }
}