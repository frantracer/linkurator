export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
};

export function conversationSorting(a: ChatConversation, b: ChatConversation): number {
  return b.updated_at.getTime() - a.updated_at.getTime();
}