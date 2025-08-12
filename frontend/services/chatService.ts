import {configuration} from "../configuration";
import {v4 as uuidv4} from 'uuid';
import {ChatConversation, ChatMessage} from "../entities/Chat";

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
      created_at: new Date(chat.created_at),
      updated_at: new Date(chat.updated_at),
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
    })) as ChatMessage[];

    return {
      id: data.uuid,
      title: data.title,
      messages: messages,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    } as ChatConversation;
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw new Error('Failed to fetch chat');
  }
}

export const queryAgent = async (conversationId: string | null, query: string): Promise<string> => {
  try {
    const chatId = conversationId || uuidv4();
    const response = await fetch(configuration.CHATS_URL + "/" + chatId + "/messages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({query: query}),
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
