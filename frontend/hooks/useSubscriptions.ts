import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import {Subscription, subscriptionSorting} from '../entities/Subscription';
import {getSubscriptions} from '../services/subscriptionService';
import {Profile} from "../services/profileService";

type subscriptionState = {
  subscriptions: Subscription[];
  subscriptionsAreLoading: boolean;
  refreshSubscriptions: () => void;
}

const useSubscriptions = (profile: Profile | null | undefined): subscriptionState => {
  const fetchSubscriptions = () => {
    if (profile) {
      return getSubscriptions().then(
        subscriptions => subscriptions.sort(subscriptionSorting)
      );
    } else {
      return Promise.resolve([]);
    }
  };

  const queryClient = useQueryClient();
  const {data: subscriptions = [], isLoading: subscriptionsAreLoading, refetch} = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
    enabled: !!profile,
    staleTime: 60000,
  });

  const refreshSubscriptions = useCallback(() => {
    queryClient.invalidateQueries({queryKey: ['latestSubscriptionItems']});
    refetch();
  }, [queryClient, refetch]);

  return {
    subscriptions,
    subscriptionsAreLoading,
    refreshSubscriptions,
  };
};

export default useSubscriptions;
