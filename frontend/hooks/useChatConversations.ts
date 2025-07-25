import {useState, useCallback} from 'react';
import {ChatConversation, ChatMessage, conversationSorting} from "../entities/Chat";

const useChatConversations = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const createConversation = useCallback((title: string = "New Chat", initialMessage?: string): ChatConversation => {
    const conversation: ChatConversation = {
      id: Date.now().toString(),
      title: title,
      messages: initialMessage ? [{
        id: '1',
        content: initialMessage,
        sender: 'user',
        timestamp: new Date()
      }] : [],
      created_at: new Date(),
      updated_at: new Date()
    };

    setConversations(prev => [conversation, ...prev]);
    return conversation;
  }, []);

  const updateConversation = useCallback((conversationId: string, updates: Partial<ChatConversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, ...updates, updated_at: new Date() }
          : conv
      ).sort(conversationSorting)
    );
  }, []);

  const addMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, message],
              updated_at: new Date()
            }
          : conv
      ).sort(conversationSorting)
    );
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
  }, []);

  const getConversation = useCallback((conversationId: string): ChatConversation | undefined => {
    return conversations.find(conv => conv.id === conversationId);
  }, [conversations]);

  return {
    conversations,
    createConversation,
    updateConversation,
    addMessage,
    deleteConversation,
    getConversation
  };
};

export default useChatConversations;