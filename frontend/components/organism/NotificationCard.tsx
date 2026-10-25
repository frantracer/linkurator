import React from "react";
import classNames from "classnames";
import Link from "next/link";
import {useLocale} from "next-intl";
import Avatar from "../atoms/Avatar";
import Miniature from "../atoms/Miniature";
import {paths} from "../../configuration";
import {
  CuratorRecommendedItemNotification,
  Notification,
  NotificationItem,
  NotificationType
} from "../../entities/Notification";
import {getProviderIcon, Provider} from "../../entities/Provider";
import useAgoText from "../../hooks/useAgoText";
import {formatDuration} from "../../utilities/duration";
import {curatorRecommendationsUrl, NotificationMessage, NotificationTypeIcon} from "./NotificationMessage";

type NotificationCardProps = {
  notification: Notification;
  providers: Provider[];
}

const openItem = (item: NotificationItem) => {
  window.open(item.url, "_blank");
};

const ItemPreview = ({item, providers}: { item: NotificationItem, providers: Provider[] }) => {
  const agoText = useAgoText();

  return (
    <div className="flex flex-row gap-3 min-w-0">
      <figure className="relative w-32 sm:w-44 aspect-video shrink-0 cursor-pointer" onClick={() => openItem(item)}>
        <img className="w-full h-full object-cover rounded-md" src={item.thumbnail} alt={item.name}/>
        {item.duration !== undefined &&
            <span className="absolute bottom-0 right-0 m-1 px-1 bg-black bg-opacity-90 rounded text-xs text-white">
              {formatDuration(item.duration)}
            </span>
        }
      </figure>
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-sm font-medium line-clamp-2 break-words cursor-pointer hover:text-primary"
            title={item.name}
            onClick={() => openItem(item)}>
          {item.name}
        </h3>
        <div className="flex flex-row gap-1 items-center text-xs text-base-content/70 min-w-0">
          <Miniature src={getProviderIcon(providers, item.subscription.provider)} alt={item.subscription.provider}/>
          <Miniature src={item.subscription.thumbnail} alt={item.subscription.name}/>
          <Link className="truncate hover:text-primary" href={paths.SUBSCRIPTIONS + "/" + item.subscription.id}>
            {item.subscription.name}
          </Link>
        </div>
        <span className="text-xs text-base-content/60">{agoText(item.published_at)}</span>
      </div>
    </div>
  );
};

const CuratorRecommendedItemContent = (
  {notification, providers}: { notification: CuratorRecommendedItemNotification, providers: Provider[] }
) => {
  return <ItemPreview item={notification.item} providers={providers}/>;
};

const NotificationAvatar = ({notification}: { notification: Notification }) => {
  switch (notification.type) {
    case NotificationType.CuratorRecommendedItem:
      return (
        <Link href={curatorRecommendationsUrl(notification.curator.username)}>
          <Avatar src={notification.curator.avatar_url} alt={notification.curator.username}/>
        </Link>
      );
  }
};

const NotificationContent = ({notification, providers}: NotificationCardProps) => {
  switch (notification.type) {
    case NotificationType.CuratorRecommendedItem:
      return <CuratorRecommendedItemContent notification={notification} providers={providers}/>;
  }
};

const NotificationCard = ({notification, providers}: NotificationCardProps) => {
  const locale = useLocale();
  const agoText = useAgoText();

  return (
    <div className={classNames(
      "flex flex-col gap-3 w-full bg-base-200 rounded-lg p-3 border shadow-sm",
      {
        "border-primary": !notification.read,
        "border-neutral": notification.read,
      }
    )}>
      <div className="flex flex-row items-center gap-3">
        <div className="relative h-fit shrink-0">
          <NotificationAvatar notification={notification}/>
          <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full
            bg-primary text-primary-content [&_svg]:size-3.5">
            <NotificationTypeIcon notification={notification}/>
          </span>
        </div>
        <span className="text-sm flex-1 min-w-0 break-words">
          <NotificationMessage notification={notification} withLinks={true}/>
        </span>
        <span className="text-xs text-base-content/60 whitespace-nowrap"
              title={notification.created_at.toLocaleString(locale)}>
          {agoText(notification.created_at)}
        </span>
        {!notification.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0"/>}
      </div>
      <NotificationContent notification={notification} providers={providers}/>
    </div>
  );
};

export default NotificationCard;
