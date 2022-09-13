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
};