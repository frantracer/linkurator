import {useQuery} from '@tanstack/react-query';
import {Profile} from './useProfile';
import {Subscription, subscriptionSorting} from '../entities/Subscription';
import {getSubscriptions} from '../services/subscriptionService';

type subscriptionState = {
  subscriptions: Subscription[];
  refreshSubscriptions: () => void;
}

const useSubscriptions = (profile: Profile | undefined): subscriptionState => {
  const fetchSubscriptions = () => {
    if (profile) {
      return getSubscriptions().then(
        subscriptions => subscriptions.sort(subscriptionSorting)
      );
    } else {
      return Promise.resolve([]);
    }
  };

  const {data: subscriptions = [], refetch: refreshSubscriptions} = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
    enabled: !!profile,
    staleTime: 60000,
  });

  return {
    subscriptions,
    refreshSubscriptions,
  };
};

export default useSubscriptions;
