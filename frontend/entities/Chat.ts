import { SubscriptionItem } from './SubscriptionItem';

export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'error';
  timestamp: Date;
  items: SubscriptionItem[];
  topicsWereCreated: boolean;
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
