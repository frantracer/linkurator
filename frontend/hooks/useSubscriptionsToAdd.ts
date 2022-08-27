import {Subscription} from "./useSubscriptions";
import {useEffect, useState} from "react";
import {Topic} from "../entities/Topic";

function useSubscriptionsToAdd(subscriptions: Subscription[], topic: Topic | undefined = undefined):
  [Subscription[], (subscription: Subscription) => void, (subscription: Subscription) => void, () => void] {
  const [subscriptionsToAdd, setSubscriptionsToAdd] = useState<Subscription[]>(subscriptions);

  useEffect(() => {
    if (topic) {
      let filtered_subscriptions: Subscription[] = []
      for (let i = 0; i < topic.subscriptions_ids.length; i++) {
        const subscription = subscriptions.find(s => s.uuid === topic.subscriptions_ids[i]);
        if (subscription) {
          filtered_subscriptions.push(subscription);
        }
      }
      setSubscriptionsToAdd(filtered_subscriptions);
    }
  }, [subscriptions, topic]);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptionsToAdd([...subscriptionsToAdd, subscription]);
  }
  const removeSubscription = (subscription: Subscription) => {
    setSubscriptionsToAdd(subscriptionsToAdd.filter(s => s.uuid !== subscription.uuid));
  }
  const clearSubscriptions = () => {
    setSubscriptionsToAdd([]);
  }
  return [subscriptionsToAdd, addSubscription, removeSubscription, clearSubscriptions];
}

export default useSubscriptionsToAdd;