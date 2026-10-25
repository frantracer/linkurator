export enum NotificationType {
  CuratorRecommendedItem = "curator_recommended_item",
}

export type NotificationCurator = {
  id: string;
  username: string;
  avatar_url: string;
}

export type NotificationSubscription = {
  id: string;
  name: string;
  thumbnail: string;
  provider: string;
}

export type NotificationItem = {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number | undefined;
  published_at: Date;
  subscription: NotificationSubscription;
}

type BaseNotification = {
  id: string;
  created_at: Date;
  read: boolean;
}

export type CuratorRecommendedItemNotification = BaseNotification & {
  type: NotificationType.CuratorRecommendedItem;
  curator: NotificationCurator;
  item: NotificationItem;
}

export type Notification = CuratorRecommendedItemNotification;
