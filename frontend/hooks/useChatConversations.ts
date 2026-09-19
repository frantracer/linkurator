import {InfiniteData, keepPreviousData, useInfiniteQuery} from '@tanstack/react-query';
import {conversationSorting} from "../entities/Chat";
import {ChatsPageResponse, getChats, getChatsFromUrl} from "../services/chatService";

const useChatConversations = (search: string = "") => {
  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfiniteQuery<ChatsPageResponse, Error, InfiniteData<ChatsPageResponse>, readonly unknown[], string | undefined>({
    queryKey: ['chatConversations', search],
    queryFn: async ({pageParam}): Promise<ChatsPageResponse> => {
      if (pageParam === undefined) {
        return await getChats(search);
      }
      return await getChatsFromUrl(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage?.toString(),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const conversations = (data ? data.pages.map(page => page.elements).flat() : []).sort(conversationSorting);

  return {
    conversations,
    isLoading: isFetching || isFetchingNextPage,
    isFinished: !hasNextPage,
    fetchMoreConversations: fetchNextPage,
    error,
    refetch
  };
};

export default useChatConversations;