import { useQuery } from '@tanstack/react-query';
import { ChatConversation } from '../entities/Chat';
import { getChat } from '../services/chatService';

const useChat = (conversationId: string | null) => {
  const { data: conversation, isLoading, error, refetch } = useQuery({
    queryKey: ['chat', conversationId],
    queryFn: async (): Promise<ChatConversation | null> => {
      if (!conversationId) return null;
      
      try {
        const rawConversation = await getChat(conversationId);
        return {
          id: rawConversation.id,
          title: rawConversation.title || `Chat ${rawConversation.id}`,
          messages: rawConversation.messages || [],
          created_at: new Date(rawConversation.created_at),
          updated_at: new Date(rawConversation.updated_at)
        };
      } catch (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }
    },
    enabled: !!conversationId,
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    conversation,
    isLoading,
    error,
    refetch
  };
};

export default useChat;