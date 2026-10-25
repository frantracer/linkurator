import {InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import {Notification} from "../entities/Notification";
import {getNotifications, NotificationsResponse} from "../services/notificationService";

type UseNotifications = {
  notifications: Notification[],
  isLoading: boolean,
  isFinished: boolean,
  refreshNotifications: () => Promise<unknown>,
  fetchMoreNotifications: () => void,
}

// Notifications are not fetched automatically, call refreshNotifications to fetch them
const useNotifications = (): UseNotifications => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useInfiniteQuery<NotificationsResponse, Error, InfiniteData<NotificationsResponse>, readonly unknown[], URL | undefined>({
    queryKey: ["notifications"],
    queryFn: async ({pageParam}) => await getNotifications(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: false,
  })

  const isLoading = data === undefined || isFetching || isFetchingNextPage;

  return {
    notifications: data ? data.pages.map((page) => page.elements).flat() : [],
    isLoading: isLoading,
    isFinished: !hasNextPage && !isLoading,
    refreshNotifications: refetch,
    fetchMoreNotifications: fetchNextPage,
  }
}

export default useNotifications;
