'use client';

import React, {useEffect, useRef} from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../../../../components/atoms/EmptyStateBox";
import {BellIcon} from "../../../../components/atoms/Icons";
import {InfoBanner} from "../../../../components/atoms/InfoBanner";
import {Spinner} from "../../../../components/atoms/Spinner";
import TopTitle from "../../../../components/molecules/TopTitle";
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
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0"/>
          <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-2">
            <BellIcon/>
            <h1 className="text-xl font-bold truncate">{t("notifications")}</h1>
          </div>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col gap-3 p-4 max-w-3xl w-full mx-auto">
          {hasNoNotifications &&
              <EmptyStateBox title={t("no_notifications_title")} message={t("no_notifications_message")}/>
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
              <div className="flex items-center justify-center p-4">
                  <InfoBanner>{t("no_more_content")}</InfoBanner>
              </div>
          }
        </div>
      </div>
    </>
  );
}

export default NotificationsPageComponent;
