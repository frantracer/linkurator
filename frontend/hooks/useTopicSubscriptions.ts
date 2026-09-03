import {useQuery} from '@tanstack/react-query';
import {Subscription} from '../entities/Subscription';
import {getSubscription} from '../services/subscriptionService';
import {Topic} from "../entities/Topic";

type subscriptionState = {
  topicSubscriptions: Subscription[];
}

const useSubscriptions = (topic: Topic | null, subscriptions: Subscription[]): subscriptionState => {
  const fetchTopicSubscriptions = async () => {
    if (topic) {
      const subs = await Promise.all(topic.subscriptions_ids.map(async (subscription_id) => {
        const subscription = subscriptions.find((sub) => sub.uuid === subscription_id);
        if (subscription) {
          return subscription;
        }
        return await getSubscription(subscription_id);
      }))
      return subs.filter((sub) => sub !== undefined) as Subscription[];
    }
    return [];
  };

  const {data: topicSubscriptions = []} = useQuery({
    queryKey: ['topicSubscriptions', topic, subscriptions],
    queryFn: fetchTopicSubscriptions,
    staleTime: 60000,
  });

  return {
    topicSubscriptions,
  };
};

export default useSubscriptions;
