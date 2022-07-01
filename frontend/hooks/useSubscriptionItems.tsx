import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";
import {Subscription} from "./useSubscriptions";

export type SubscriptionItem = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
};

interface SubscriptionItemsResponse {
  elements: SubscriptionItem[];
}

const useSubscriptionItems = (subscription?: Subscription) => {
  const [subscriptionsItems, setSubscriptionsItems] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    const fetchSubscriptionsItems = async () => {
      if (subscription) {
        try {
          const url = configuration.SUBSCRIPTIONS_URL + subscription.uuid + "/items";
          const {data} = await axios.get<SubscriptionItemsResponse>(url, {withCredentials: true});
          setSubscriptionsItems(data.elements);
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
