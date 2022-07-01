import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";

export type Subscription = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
};

export interface SubscriptionResponse {
  elements: Subscription[];
}

const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const {data, status} = await axios.get<SubscriptionResponse>(configuration.SUBSCRIPTIONS_URL, {withCredentials: true});
        if (status === 200) {
          setSubscriptions(data.elements);
        } else {
          console.error("Error retrieving subscriptions", data);
        }
      } catch (error: any) {
        console.error("Error retrieving subscriptions", error);
      }
    };

    fetchSubscriptions();
  }, []);

  return subscriptions;
};

export default useSubscriptions;
