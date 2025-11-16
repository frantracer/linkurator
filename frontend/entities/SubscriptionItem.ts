import {Subscription} from "./Subscription";
import {Curator} from "./Curators";

export type SubscriptionItem = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
  published_at: Date;
  subscription_uuid: string;
  subscription: Subscription;
  recommended: boolean;
  discouraged: boolean;
  viewed: boolean;
  hidden: boolean;
  duration: undefined | number;
  recommended_by: Curator[];
};

export function hasInteraction(item: SubscriptionItem) {
  return item.viewed || item.discouraged || item.hidden || item.recommended;
}
