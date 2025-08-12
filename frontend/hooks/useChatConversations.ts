import {useQuery} from '@tanstack/react-query';
import {ChatConversation, conversationSorting} from "../entities/Chat";
import {getChats} from "../services/chatService";

const useChatConversations = () => {
  const {data: conversations = [], isLoading, error, refetch} = useQuery({
    queryKey: ['chatConversations'],
    queryFn: async (): Promise<ChatConversation[]> => {
      try {
        const rawConversations = await getChats();
        return rawConversations.sort(conversationSorting);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    conversations,
    isLoading,
    error,
    refetch
  };
};

export default useChatConversations;