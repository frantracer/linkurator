import {useEffect, useState} from "react";
import {Profile} from "./useProfile";
import {Subscription, subscriptionSorting} from "../entities/Subscription";
import {getSubscriptions} from "../services/subscriptionService";

type subscriptionState = {
  subscriptions: Subscription[];
  refreshSubscriptions: () => void;
}

const useSubscriptions = (profile: Profile | undefined): subscriptionState => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  function refreshSubscriptions(profile: Profile | undefined) {
    if (profile) {
      getSubscriptions().then(
        subscriptions => setSubscriptions(subscriptions.sort(subscriptionSorting))
      ).catch(error => console.error("Error retrieving topics", error))
    } else {
      setSubscriptions([]);
    }
  }

  useEffect(() => {
    refreshSubscriptions(profile)
  }, [profile]);

  return {
    subscriptions: subscriptions,
    refreshSubscriptions: () => {refreshSubscriptions(profile)}
  }
};

export default useSubscriptions;
