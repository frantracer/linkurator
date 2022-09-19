import {useEffect, useState} from "react";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {getItem, getSubscriptionItems} from "../services/subscriptionService";


const useSubscriptionItems = (subscription?: Subscription): [SubscriptionItem[], () => void, (itemId: string) => void] => {
  const [subscriptionsItems, setSubscriptionsItems] = useState<SubscriptionItem[]>([]);

  function refreshSubscriptionItem(itemId: string) {
    if (subscriptionsItems.map(item => item.uuid).includes(itemId)) {
      getItem(itemId).then((updatedItem) => {
        if (updatedItem) {
          const newSubscriptionsItems = subscriptionsItems.map((item) => {
              if (item.uuid == itemId) {
                return updatedItem;
              } else {
                return item;
              }
            }
          )
          setSubscriptionsItems(newSubscriptionsItems);
        }
      })
    }
  }

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

  return [subscriptionsItems, () => refreshSubscriptionItems(subscription), (itemId: string) => refreshSubscriptionItem(itemId)];
};

export default useSubscriptionItems;
