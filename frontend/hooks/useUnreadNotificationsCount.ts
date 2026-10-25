import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Profile} from "../services/profileService";
import {getUnreadNotificationsCount, markAllNotificationsAsRead} from "../services/notificationService";

const UNREAD_NOTIFICATIONS_POLLING_INTERVAL_MS = 60000;

const useUnreadNotificationsCount = (profile: Profile | null | undefined) => {
  const queryClient = useQueryClient();

  const {data: unreadCount, refetch} = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: getUnreadNotificationsCount,
    enabled: !!profile,
    refetchInterval: UNREAD_NOTIFICATIONS_POLLING_INTERVAL_MS,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData(['unreadNotificationsCount'], 0);
    },
  });

  return {
    unreadCount: profile ? unreadCount ?? 0 : 0,
    refreshUnreadCount: refetch,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};

export default useUnreadNotificationsCount;
