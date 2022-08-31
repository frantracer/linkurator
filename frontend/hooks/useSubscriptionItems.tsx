import {useEffect, useState} from "react";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/TopicItem";
import {getSubscriptionItems} from "../services/subscriptionService";


const useSubscriptionItems = (subscription?: Subscription): [SubscriptionItem[], () => void] => {
  const [subscriptionsItems, setSubscriptionsItems] = useState<SubscriptionItem[]>([]);

  function refreshSubscriptionItems(subscription?: Subscription) {
    if (subscription) {
      getSubscriptionItems(subscription.uuid)
        .then(setSubscriptionsItems)
        .catch(console.error);
    } else {
      setSubscriptionsItems([]);
    }
  }

  useEffect(() => {
    refreshSubscriptionItems(subscription);
  }, [subscription]);

  return [subscriptionsItems, () => refreshSubscriptionItems(subscription)];
};

export default useSubscriptionItems;
