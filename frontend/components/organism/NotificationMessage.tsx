import React from "react";
import {useTranslations} from "next-intl";
import Link from "next/link";
import {paths} from "../../configuration";
import {Notification, NotificationType} from "../../entities/Notification";
import {ThumbsUpIcon} from "../atoms/Icons";

type NotificationProps = {
  notification: Notification;
}

type NotificationMessageProps = NotificationProps & {
  // Links can not be used inside menu items, since they are buttons
  withLinks?: boolean;
}

export const NotificationMessage = ({notification, withLinks = false}: NotificationMessageProps) => {
  const t = useTranslations("common");

  switch (notification.type) {
    case NotificationType.CuratorRecommendedItem:
      return t.rich("recommended_item", {
        curator: notification.curator.username,
        b: (chunks) => withLinks
          ? <Link className="font-bold hover:text-primary" href={curatorRecommendationsUrl(notification.curator.username)}>
            {chunks}
          </Link>
          : <b>{chunks}</b>,
      });
  }
}

export const curatorRecommendationsUrl = (username: string) =>
  `${paths.CURATORS}/${encodeURIComponent(username)}?section=recommendations`;

export const NotificationTypeIcon = ({notification}: NotificationProps) => {
  switch (notification.type) {
    case NotificationType.CuratorRecommendedItem:
      return <ThumbsUpIcon/>;
  }
}
