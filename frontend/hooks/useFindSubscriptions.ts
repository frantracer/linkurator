import {useQuery} from '@tanstack/react-query';
import {Subscription, subscriptionSorting} from '../entities/Subscription';
import {getSubscriptionsByNameOrUrl} from '../services/subscriptionService';

type subscriptionState = {
  subscriptions: Subscription[];
  subscriptionsAreLoading: boolean;
  refreshSubscriptions: () => void;
}

const useFindSubscriptions = (nameOrUrl: string, provider?: string): subscriptionState => {
  const fetchSubscriptions = () => {
    if (nameOrUrl === '') {
      return [];
    }
    return getSubscriptionsByNameOrUrl(nameOrUrl, provider).then(
      subscriptions => subscriptions.sort(subscriptionSorting)
    );
  };

  const {data: subscriptions = [], isLoading: subscriptionsAreLoading, refetch: refreshSubscriptions} = useQuery({
    queryKey: ['subscriptions', nameOrUrl, provider ?? ''],
    queryFn: fetchSubscriptions,
    staleTime: 60000,
  });

  return {
    subscriptions,
    subscriptionsAreLoading,
    refreshSubscriptions,
  };
};

export default useFindSubscriptions;
