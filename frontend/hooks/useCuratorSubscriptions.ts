import {getCuratorSubscriptions} from "../services/curatorService";
import {useQuery} from "@tanstack/react-query";
import {subscriptionSorting} from "../entities/Subscription";

export const useCuratorSubscriptions = (curatorId: string | null) => {
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['curator', curatorId, 'subscriptions'],
    queryFn: async () => {
      const subscriptions = await getCuratorSubscriptions(curatorId);
      return subscriptions.sort(subscriptionSorting);
    },
    staleTime: 60000,
  })

  return {
    subscriptions: data === undefined ? [] : data,
    subscriptionsIsLoading: isLoading,
    subscriptionsIsError: error,
    refetchSubscriptions: refetch,
  };
}
