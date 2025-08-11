import {ChatConversation, ChatMessage} from "../entities/Chat";
import {configuration} from "../configuration";

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
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content: message,
    sender: 'user',
    timestamp: new Date()
  };

  return userMessage;
};

export const queryAgent = async (query: string): Promise<string> => {
  try {
    const response = await fetch(configuration.AGENT_QUERY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ query: query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.message || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Error querying agent:', error);
    throw new Error('Failed to get response from agent');
  }
};

export const deleteChatConversation = async (conversationId: string): Promise<void> => {
  // Mock implementation - in real app this would delete via API
  return Promise.resolve();
};