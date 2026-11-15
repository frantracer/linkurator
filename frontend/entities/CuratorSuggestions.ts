import {Subscription} from "./Subscription";
import {Topic} from "./Topic";

export type TopicSuggestion = {
  topic: Topic;
  sharedSubscriptionIds: string[];
  candidateSubscriptionIds: string[];
  matchingUserTopicId: string | null;
};

export type CuratorSuggestions = {
  commonSubscriptionIds: string[];
  topics: TopicSuggestion[];
  subscriptions: Subscription[];
};

export const emptyCuratorSuggestions: CuratorSuggestions = {
  commonSubscriptionIds: [],
  topics: [],
  subscriptions: [],
};
