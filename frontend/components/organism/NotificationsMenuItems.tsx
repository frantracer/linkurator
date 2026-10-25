import React from "react";
import classNames from "classnames";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {MenuItem} from "../atoms/MenuItem";
import {Spinner} from "../atoms/Spinner";
import {paths} from "../../configuration";
import {Notification} from "../../entities/Notification";
import useAgoText from "../../hooks/useAgoText";
import {NotificationMessage} from "./NotificationMessage";

type NotificationsMenuItemsProps = {
  notifications: Notification[];
  isLoading: boolean;
}

const NotificationsMenuItems = ({notifications, isLoading}: NotificationsMenuItemsProps) => {
  const t = useTranslations("common");
  const router = useRouter();

  const openItem = (notification: Notification) => {
    window.open(notification.item.url, "_blank");
  };

  const agoText = useAgoText();

  return (
    <>
      {isLoading && notifications.length === 0 &&
          <div className="flex flex-row items-center justify-center gap-2 p-4">
              <Spinner/>
          </div>
      }
      {!isLoading && notifications.length === 0 &&
          <p className="p-4 text-sm text-center text-base-content/70">{t("no_notifications_title")}</p>
      }
      {/* Only the notifications scroll, so "view all" is always visible */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.map(notification => (
          <MenuItem key={notification.id} onClick={() => openItem(notification)}>
            <div className="flex flex-row items-center gap-2">
              <img src={notification.item.thumbnail} alt={notification.item.name}
                   className="w-16 h-9 object-cover rounded shrink-0"/>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs text-base-content/70 truncate">
                  <NotificationMessage notification={notification}/>
                </span>
                <span className="line-clamp-2 break-words">{notification.item.name}</span>
                <span className="text-xs text-base-content/60">{agoText(notification.created_at)}</span>
              </div>
              <span className={classNames("w-2 h-2 rounded-full shrink-0", {"bg-primary": !notification.read})}/>
            </div>
          </MenuItem>
        ))}
      </div>
      <MenuItem onClick={() => router.push(paths.NOTIFICATIONS)}>
        <span className="block text-center text-primary">{t("view_all")}</span>
      </MenuItem>
    </>
  );
};

export default NotificationsMenuItems;
