import {configuration} from "../configuration";
import {v4 as uuidv4} from 'uuid';
import {ChatConversation, ChatMessage} from "../entities/Chat";

export class ChatRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export const getChats = async (): Promise<ChatConversation[]> => {
  try {
    const response = await fetch(configuration.CHATS_URL, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data["chats"].map((chat: any) => ({
      id: chat.uuid,
      title: chat.title,
      messages: [],
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.updated_at),
    })) as ChatConversation[];
  } catch (error) {
    throw new Error('Failed to fetch chats' + (error instanceof Error ? `: ${error.message}` : ''));
  }
}

export const getChat = async (conversationId: string): Promise<ChatConversation | null> => {
  try {
    const response = await fetch(configuration.CHATS_URL + "/" + conversationId, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.status === 404) {
      return null; // Chat not found
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const messages = data.messages.map((msg: any) => ({
      id: uuidv4(),
      content: msg.content,
      sender: msg.role,
      timestamp: new Date(msg.timestamp),
      items: msg.items || [],
      topicsWereCreated: msg.topics_were_created || false,
    })) as ChatMessage[];

    return {
      id: data.uuid,
      title: data.title,
      messages: messages,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isWaitingForResponse: data.is_waiting_for_response || false,
    } as ChatConversation;
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw new Error('Failed to fetch chat');
  }
}

export const deleteChat = async (conversationId: string): Promise<void> => {
  try {
    const response = await fetch(configuration.CHATS_URL + "/" + conversationId, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat');
  }
};

export const queryAgent = async (conversationId: string, query: string): Promise<ChatConversation> => {
  const response = await fetch(
    configuration.CHATS_URL + "/" + conversationId + "/messages",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({query: query}),
      signal: AbortSignal.timeout(3 * 60 * 1000) // 3 minutes timeout
    });

  if (response.status === 429) {
    throw new ChatRateLimitError('Rate limit exceeded. Please try again later.');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  const messages = data.messages.map((msg: any) => ({
    id: uuidv4(),
    content: msg.content,
    sender: msg.role,
    timestamp: new Date(msg.timestamp),
    items: msg.items || [],
    topicsWereCreated: msg.topics_were_created || false,
  })) as ChatMessage[];

  return {
    id: data.uuid,
    title: data.title,
    messages: messages,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isWaitingForResponse: data.is_waiting_for_response || false,
  } as ChatConversation;
};
