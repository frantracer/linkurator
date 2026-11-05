import {useQueries} from '@tanstack/react-query';
import {Subscription, subscriptionSorting} from '../entities/Subscription';
import {getSubscriptionsByNameOrUrl} from '../services/subscriptionService';

export type ProviderSearchResult = {
  provider: string;
  subscriptions: Subscription[];
  isLoading: boolean;
  refresh: () => void;
}

// Searching a provider calls its external API, so it only runs for the providers the user asked for
const useProviderSubscriptionSearch = (name: string, providerNames: string[]): ProviderSearchResult[] => {
  const queries = useQueries({
    queries: providerNames.map(provider => ({
      // Same key as useFindSubscriptions, so both hooks share the cached results
      queryKey: ['subscriptions', name, provider],
      queryFn: () => getSubscriptionsByNameOrUrl(name, provider).then(
        subscriptions => subscriptions.sort(subscriptionSorting)
      ),
      staleTime: 60000,
      enabled: name !== '',
    })),
  });

  return providerNames.map((provider, index) => ({
    provider,
    subscriptions: queries[index].data ?? [],
    isLoading: queries[index].isLoading,
    refresh: () => {
      queries[index].refetch();
    },
  }));
};

export default useProviderSubscriptionSearch;
