'use client';

import React from "react";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import Dropdown from "../atoms/Dropdown";
import {BellIcon} from "../atoms/Icons";
import useNotificationsAndMarkAsRead from "../../hooks/useNotificationsAndMarkAsRead";
import {Profile} from "../../services/profileService";
import {formatUnreadCount} from "../../utilities/unreadCount";
import NotificationsMenuItems from "./NotificationsMenuItems";

const MAX_NOTIFICATIONS_IN_DROPDOWN = 5;

type NotificationsDropdownProps = {
  profile: Profile;
  bottom?: boolean;
  position?: "start" | "center" | "end";
};

const NotificationsDropdown = ({profile, bottom = true, position = "end"}: NotificationsDropdownProps) => {
  const t = useTranslations("common");
  const {notifications, isLoading, unreadCount, loadAndMarkAsRead} = useNotificationsAndMarkAsRead(profile);

  return (
    <Dropdown
      button={
        <div onClick={loadAndMarkAsRead} className="indicator">
          {unreadCount > 0 &&
              <span className="indicator-item badge badge-primary badge-sm">
                {formatUnreadCount(unreadCount)}
              </span>
          }
          <Button fitContent={true} primary={false} borderless={true} tooltip={t("notifications")}
                  stopPropagation={false}>
            <BellIcon/>
          </Button>
        </div>
      }
      bottom={bottom}
      position={position}
      closeOnClickInside={true}
    >
      <NotificationsMenuItems
        notifications={notifications.slice(0, MAX_NOTIFICATIONS_IN_DROPDOWN)}
        isLoading={isLoading}
      />
    </Dropdown>
  );
};

export default NotificationsDropdown;
