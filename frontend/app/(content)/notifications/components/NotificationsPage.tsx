'use client';

import React, {useEffect, useRef} from "react";
import EndOfList from "../../../../components/atoms/EndOfList";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../../../../components/atoms/EmptyStateBox";
import {BellIcon} from "../../../../components/atoms/Icons";
import {Spinner} from "../../../../components/atoms/Spinner";
import PageHeader from "../../../../components/molecules/PageHeader";
import NotificationCard from "../../../../components/organism/NotificationCard";
import useNotificationsAndMarkAsRead from "../../../../hooks/useNotificationsAndMarkAsRead";
import useProfile from "../../../../hooks/useProfile";
import useProviders from "../../../../hooks/useProviders";

const FETCH_MORE_SCROLL_THRESHOLD = 0.90;

const NotificationsPageComponent = () => {
  const t = useTranslations("common");
  const {profile} = useProfile();
  const {providers} = useProviders();
  const {notifications, isLoading, isFinished, fetchMoreNotifications, loadAndMarkAsRead} =
    useNotificationsAndMarkAsRead(profile);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAndMarkAsRead();
  }, [loadAndMarkAsRead]);

  const handleContainerScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (isFinished || isLoading) {
      return;
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= FETCH_MORE_SCROLL_THRESHOLD) {
      fetchMoreNotifications();
    }
  };

  // If there's no scrollbar fetch more notifications
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isFinished || isLoading) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight) {
      fetchMoreNotifications();
    }
  }, [notifications.length, isLoading, isFinished, fetchMoreNotifications]);

  const hasNoNotifications = isFinished && notifications.length === 0;

  return (
    <>
      <PageHeader title={t("notifications")} icon={<BellIcon/>}/>
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col gap-3 p-4 max-w-3xl w-full mx-auto">
          {hasNoNotifications &&
              <EmptyStateBox icon={<BellIcon/>} title={t("no_notifications_title")} message={t("no_notifications_message")}/>
          }
          {notifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} providers={providers}/>
          ))}
          {isLoading &&
              <div className="flex flex-row items-center justify-center gap-2 p-4">
                  <Spinner/>
                  <span>{t("loading")}</span>
              </div>
          }
          {isFinished && notifications.length > 0 &&
              <EndOfList text={t("all_caught_up")}/>
          }
        </div>
      </div>
    </>
  );
}

export default NotificationsPageComponent;
