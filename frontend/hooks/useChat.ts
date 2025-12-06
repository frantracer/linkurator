import { useQuery } from '@tanstack/react-query';
import { ChatConversation } from '../entities/Chat';
import { getChat } from '../services/chatService';

const useChat = (conversationId: string | undefined) => {
  const { data: conversation, isLoading, error, refetch } = useQuery({
    queryKey: ['chat', conversationId],
    queryFn: async (): Promise<ChatConversation | undefined> => {
      if (!conversationId) return undefined;

      try {
        const rawConversation = await getChat(conversationId);

        if (!rawConversation) return undefined;

        return {
          id: rawConversation.id,
          title: rawConversation.title,
          messages: rawConversation.messages,
          createdAt: new Date(rawConversation.createdAt),
          updatedAt: new Date(rawConversation.updatedAt),
          isWaitingForResponse: rawConversation.isWaitingForResponse
        };
      } catch (error) {
        console.error('Error fetching conversation:', error);
        return undefined;
      }
    },
    enabled: !!conversationId,
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: (query) => query.state.data?.isWaitingForResponse ? 10 * 1000 : false, // Refetch every 10 seconds if waiting for response
  });

  return {
    conversation,
    isLoading,
    error,
    refetch
  };
};

export default useChat;