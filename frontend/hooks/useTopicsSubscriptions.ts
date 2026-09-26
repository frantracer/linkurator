import {useQuery} from '@tanstack/react-query';
import {Subscription} from '../entities/Subscription';
import {Topic} from '../entities/Topic';
import {getSubscription} from '../services/subscriptionService';
import {getTopic} from '../services/topicService';

type TopicsSubscriptionsState = {
  topicsSubscriptions: Subscription[];
}

// The subscriptions of several topics, without repeating the ones they share.
// The user's topics and subscriptions are only used to save requests, so they are not part of the query key.
const useTopicsSubscriptions = (topicIds: string[], topics: Topic[], subscriptions: Subscription[]): TopicsSubscriptionsState => {
  const fetchTopicsSubscriptions = async () => {
    const resolvedTopics = await Promise.all(topicIds.map(async (topicId) =>
      topics.find((topic) => topic.uuid === topicId) ?? await getTopic(topicId)));
    const subscriptionIds = new Set(resolvedTopics.flatMap((topic) => topic?.subscriptions_ids ?? []));
    const subs = await Promise.all(Array.from(subscriptionIds).map(async (subscriptionId) =>
      subscriptions.find((sub) => sub.uuid === subscriptionId) ?? await getSubscription(subscriptionId)));
    return subs.filter((sub): sub is Subscription => sub !== undefined);
  };

  const {data: topicsSubscriptions = []} = useQuery({
    queryKey: ['topicsSubscriptions', topicIds],
    queryFn: fetchTopicsSubscriptions,
    enabled: topicIds.length > 0,
    staleTime: 60000,
  });

  return {
    topicsSubscriptions,
  };
};

export default useTopicsSubscriptions;
