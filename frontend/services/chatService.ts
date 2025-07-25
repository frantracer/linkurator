import {ChatConversation, ChatMessage} from "../entities/Chat";

// Mock service for chat functionality
// In a real implementation, this would make API calls to a chat backend

export const getChatConversations = async (): Promise<ChatConversation[]> => {
  // Mock implementation - in real app this would fetch from API
  return [];
};

export const getChatConversation = async (conversationId: string): Promise<ChatConversation | null> => {
  // Mock implementation - in real app this would fetch from API
  return null;
};

export const createChatConversation = async (title: string, initialMessage?: string): Promise<ChatConversation> => {
  // Mock implementation - in real app this would create via API
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

  return conversation;
};

export const sendChatMessage = async (conversationId: string, message: string): Promise<ChatMessage> => {
  // Mock implementation - in real app this would send via API and get AI response
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content: message,
    sender: 'user',
    timestamp: new Date()
  };

  // Simulate AI response
  setTimeout(() => {
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `AI response to: "${message}"`,
      sender: 'assistant',
      timestamp: new Date()
    };
    // In real implementation, this would be handled by the hook or component
  }, 1000);

  return userMessage;
};

export const deleteChatConversation = async (conversationId: string): Promise<void> => {
  // Mock implementation - in real app this would delete via API
  return Promise.resolve();
};