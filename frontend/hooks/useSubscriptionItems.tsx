import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";
import {Subscription} from "../entities/Subscription";

export type SubscriptionItem = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
  published_at: Date;
};

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
        published_at: new Date(element.published_at)
      };
    })
  };
}

const useSubscriptionItems = (subscription?: Subscription) => {
  const [subscriptionsItems, setSubscriptionsItems] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    const fetchSubscriptionsItems = async () => {
      if (subscription) {
        try {
          const url = configuration.SUBSCRIPTIONS_URL + subscription.uuid + "/items";
          const response = await axios.get(url, {withCredentials: true});
          if (response.status === 200) {
            const items = mapJsonToSubscriptionItemsResponse(response.data).elements;
            setSubscriptionsItems(items);
          }
        } catch (error: any) {
          console.error("Error retrieving subscriptions", error);
        }
      } else {
        setSubscriptionsItems([]);
      }
    };

    fetchSubscriptionsItems();
  }, [subscription]);

  return subscriptionsItems;
};

export default useSubscriptionItems;
