export type SubscriptionItem = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string
  published_at: Date;
  subscription_uuid: string;
  recommended: boolean;
  discouraged: boolean;
  viewed: boolean;
  hidden: boolean;
  duration: undefined | number;
};

export function hasInteraction(item: SubscriptionItem) {
  return item.viewed || item.discouraged || item.hidden || item.recommended;
}
