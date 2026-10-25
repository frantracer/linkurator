import axios from "axios";
import {configuration} from "../configuration";
import {Notification, NotificationItem, NotificationType} from "../entities/Notification";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";

export type NotificationsResponse = {
  elements: Notification[];
  nextPage: URL | undefined;
}

type NotificationCuratorJson = {
  id: string;
  username: string;
  avatar_url: string;
}

type NotificationSubscriptionJson = {
  id: string;
  name: string;
  thumbnail: string;
  provider: string;
}

type NotificationItemJson = {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number | null;
  published_at: string;
  subscription: NotificationSubscriptionJson;
}

type NotificationJson = {
  id: string;
  type: string;
  created_at: string;
  read: boolean;
  curator: NotificationCuratorJson;
  item: NotificationItemJson;
}

type NotificationsPageJson = {
  elements: NotificationJson[];
  next_page: string | null;
}

type UnreadNotificationsCountJson = {
  count: number;
}

const mapJsonToNotificationItem = (json: NotificationItemJson): NotificationItem => {
  return {
    id: json.id,
    name: json.name,
    url: json.url,
    thumbnail: json.thumbnail,
    duration: json.duration ?? undefined,
    published_at: new Date(json.published_at),
    subscription: {
      id: json.subscription.id,
      name: json.subscription.name,
      thumbnail: json.subscription.thumbnail,
      provider: json.subscription.provider,
    },
  };
}

// Notifications of types unknown to this version of the app are skipped
const mapJsonToNotification = (json: NotificationJson): Notification | undefined => {
  switch (json.type) {
    case NotificationType.CuratorRecommendedItem:
      return {
        type: NotificationType.CuratorRecommendedItem,
        id: json.id,
        created_at: new Date(json.created_at),
        read: json.read,
        curator: {
          id: json.curator.id,
          username: json.curator.username,
          avatar_url: json.curator.avatar_url,
        },
        item: mapJsonToNotificationItem(json.item),
      };
    default:
      return undefined;
  }
}

const mapJsonToNotificationsResponse = (json: NotificationsPageJson): NotificationsResponse => {
  return {
    elements: json.elements
      .map(mapJsonToNotification)
      .filter((notification): notification is Notification => notification !== undefined),
    nextPage: json.next_page ? replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL)) : undefined,
  };
}

export async function getNotifications(url: URL | undefined): Promise<NotificationsResponse> {
  const requestUrl = url ? url.toString() : configuration.NOTIFICATIONS_URL;
  try {
    const {data, status} = await axios.get<NotificationsPageJson>(requestUrl, {withCredentials: true});
    if (status === 200) {
      return mapJsonToNotificationsResponse(data);
    }
    console.error("Error retrieving notifications", data);
  } catch (error) {
    console.error("Error retrieving notifications", error);
  }
  return {elements: [], nextPage: undefined};
}

export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const {data, status} = await axios.get<UnreadNotificationsCountJson>(
      configuration.NOTIFICATIONS_UNREAD_COUNT_URL, {withCredentials: true});
    if (status === 200) {
      return data.count;
    }
  } catch (error) {
    console.error("Error retrieving unread notifications count", error);
  }
  return 0;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const {status} = await axios.post(configuration.NOTIFICATIONS_READ_URL, {}, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error marking notifications as read");
  }
}
