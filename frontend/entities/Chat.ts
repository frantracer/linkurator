import { SubscriptionItem } from './SubscriptionItem';

export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'error' | 'rate_limit';
  timestamp: Date;
  items: SubscriptionItem[];
  topicsWereCreated: boolean;
  // The scope a user message was sent with, which its answer is based on.
  scope?: ChatScope;
};

export type ChatIncludeInteraction = 'without_interactions' | 'recommended' | 'discouraged' | 'viewed' | 'hidden';

export type ChatScope = {
  subscriptionIds?: string[];
  topicIds?: string[];
  curatorIds?: string[];
  textSearch?: string;
  minDuration?: number;
  maxDuration?: number;
  includeInteractions?: ChatIncludeInteraction[];
  excludedSubscriptions?: string[];
};

export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isWaitingForResponse?: boolean;
};

export function conversationSorting(a: ChatConversation, b: ChatConversation): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}

export function newTopicsWereCreated(chat: ChatConversation): boolean {
  return chat.messages.some(message => message.topicsWereCreated);
}

// The scope of the latest user message.
export function getLatestScope(messages: ChatMessage[]): ChatScope | undefined {
  return messages.findLast(message => message.sender === 'user')?.scope;
}
