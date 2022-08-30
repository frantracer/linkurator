import configuration from "../configuration";
import axios from "axios";
import {Subscription} from "../entities/Subscription";

export interface SubscriptionResponse {
  elements: Subscription[];
  next_page: string;
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