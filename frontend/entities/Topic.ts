import {Subscription} from "./Subscription";

export type Topic = {
  uuid: string;
  name: string;
  subscriptions_ids: string[];
  is_owner: boolean;
  followed: boolean;
  is_favorite: boolean;
  curator: {
    id: string;
    username: string;
    avatar_url: string;
    followed: boolean;
  };
};

export function topicSorting(a: Topic, b: Topic): number {
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

export function isTopicScanned(topic: Topic, subscriptions: Subscription[]): boolean {
  return !topic.subscriptions_ids.some((subscriptionId) => {
    return subscriptions.some((subscription) => subscription.uuid === subscriptionId && subscription.isBeingScanned);
  });
}
