import {configuration} from "../configuration";
import {v4 as uuidv4} from 'uuid';
import {ChatConversation, ChatMessage, ChatScope} from "../entities/Chat";
import {mapJsonItemToSubscriptionItem} from "./subscriptionService";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";
import {CHATS_PER_PAGE} from "../utilities/constants";

const mapChatScopeToJson = (scope: ChatScope): Record<string, any> => ({
  subscription_ids: scope.subscriptionIds || [],
  topic_ids: scope.topicIds || [],
  curator_ids: scope.curatorIds || [],
  text_search: scope.textSearch,
  min_duration: scope.minDuration,
  max_duration: scope.maxDuration,
  include_interactions: scope.includeInteractions,
  excluded_subscriptions: scope.excludedSubscriptions || [],
});

const mapJsonToChatScope = (json: Record<string, any> | null | undefined): ChatScope | undefined => {
  if (!json) return undefined;
  return {
    subscriptionIds: json.subscription_ids || [],
    topicIds: json.topic_ids || [],
    curatorIds: json.curator_ids || [],
    textSearch: json.text_search || undefined,
    minDuration: json.min_duration ?? undefined,
    maxDuration: json.max_duration ?? undefined,
    includeInteractions: json.include_interactions || undefined,
    excludedSubscriptions: json.excluded_subscriptions || [],
  };
};

export class ChatRateLimitError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

export type ChatsPageResponse = {
  elements: ChatConversation[];
  nextPage: URL | undefined;
};

const mapJsonToChatsPageResponse = (json: Record<string, any>): ChatsPageResponse => {
  let nextPage: URL | undefined = undefined;
  if (json.next_page) {
    nextPage = replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL));
  }

  return {
    elements: json.elements.map((chat: any) => ({
      id: chat.uuid,
      title: chat.title,
      messages: [],
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.updated_at),
    })) as ChatConversation[],
    nextPage: nextPage,
  };
}

const fetchChatsPage = async (url: string): Promise<ChatsPageResponse> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as Error & { status: number }).status = response.status;
      throw error;
    }

    const data = await response.json();
    return mapJsonToChatsPageResponse(data);
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw new Error('Failed to fetch chats' + (error instanceof Error ? `: ${error.message}` : ''));
  }
}

export const getChats = async (search: string = "", pageSize: number = CHATS_PER_PAGE): Promise<ChatsPageResponse> => {
  const searchParam = search ? "&search=" + encodeURIComponent(search) : "";
  return fetchChatsPage(configuration.CHATS_URL + "?page_size=" + pageSize + searchParam);
}

export const getChatsFromUrl = async (url: string): Promise<ChatsPageResponse> => {
  return fetchChatsPage(url);
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
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as Error & { status: number }).status = response.status;
      throw error;
    }

    const data = await response.json();

    const messages = data.messages.map((msg: any) => ({
      id: uuidv4(),
      content: msg.content,
      sender: msg.role,
      timestamp: new Date(msg.timestamp),
      items: msg.items.map((item: any) => {
        return mapJsonItemToSubscriptionItem(item)
      }) || [],
      topicsWereCreated: msg.topics_were_created || false,
      scope: mapJsonToChatScope(msg.scope),
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
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
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
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as Error & { status: number }).status = response.status;
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat');
  }
};

export const queryAgent = async (conversationId: string, query: string, scope?: ChatScope): Promise<ChatConversation> => {
  const response = await fetch(
    configuration.CHATS_URL + "/" + conversationId + "/messages",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({query: query, scope: scope ? mapChatScopeToJson(scope) : undefined}),
      signal: AbortSignal.timeout(3 * 60 * 1000) // 3 minutes timeout
    });

  if (response.status === 429) {
    throw new ChatRateLimitError('Rate limit exceeded. Please try again later.');
  }

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  const data = await response.json();

  const messages = data.messages.map((msg: any) => ({
    id: uuidv4(),
    content: msg.content,
    sender: msg.role,
    timestamp: new Date(msg.timestamp),
    items: msg.items || [],
    topicsWereCreated: msg.topics_were_created || false,
    scope: mapJsonToChatScope(msg.scope),
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
