import {useQuery} from '@tanstack/react-query';
import {Subscription} from '../entities/Subscription';
import {getSubscription} from '../services/subscriptionService';

type subscriptionState = {
  subscription: Subscription | null;
  isSubscriptionLoading: boolean;
  isSubscriptionError: boolean;
}

const useSubscription = (subscriptionId: string | undefined, subscriptions: Subscription[]): subscriptionState => {
  const fetchSubscriptions = async () => {
    if (subscriptionId) {
      const subscriptionFromCache = subscriptions.find((subscription) => subscription.uuid === subscriptionId);
      if (subscriptionFromCache) {
        return subscriptionFromCache;
      }
      const subscriptionFromApi = await getSubscription(subscriptionId);
      if (subscriptionFromApi) {
        return subscriptionFromApi;
      }
      throw new Error("Subscription not found");
    }
    return null;
  };

  const {data: subscription = null, isLoading, isError} = useQuery({
    queryKey: ['subscription', subscriptionId, subscriptions],
    queryFn: fetchSubscriptions,
    staleTime: 60000,
    retry: false,
  });

  return {
    subscription: subscription,
    isSubscriptionLoading: isLoading,
    isSubscriptionError: isError,
  };
};

export default useSubscription;
