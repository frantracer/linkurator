import {useCallback} from "react";
import {Profile} from "../services/profileService";
import useNotifications from "./useNotifications";
import useUnreadNotificationsCount from "./useUnreadNotificationsCount";

const useNotificationsAndMarkAsRead = (profile: Profile | null | undefined) => {
  const {notifications, isLoading, isFinished, refreshNotifications, fetchMoreNotifications} = useNotifications();
  const {unreadCount, refreshUnreadCount, markAllAsRead} = useUnreadNotificationsCount(profile);

  // Fetch before marking as read, so the notifications that were unread are still highlighted
  const loadAndMarkAsRead = useCallback(async () => {
    const [, unreadCountResult] = await Promise.all([refreshNotifications(), refreshUnreadCount()]);
    if ((unreadCountResult.data ?? 0) > 0) {
      markAllAsRead();
    }
  }, [refreshNotifications, refreshUnreadCount, markAllAsRead]);

  return {
    notifications,
    isLoading,
    isFinished,
    fetchMoreNotifications,
    unreadCount,
    loadAndMarkAsRead,
  };
};

export default useNotificationsAndMarkAsRead;
