import type { Metadata } from 'next';
import ChatPageComponent from './components/ChatPage';

type ChatPageParams = {
  params: Promise<{ id: string[] | string }>
};

export async function generateMetadata(
  { params }: ChatPageParams,
): Promise<Metadata> {
  const id = (await params).id;
  let title = 'Chat - Linkurator';

  if (id && id !== 'new') {
    const chatId = Array.isArray(id) ? id[0] : id;
    title = `Chat ${chatId} - Linkurator`;
  }

  return {
    title: title,
  }
}

export default async function ChatPage({ params }: ChatPageParams) {
  const { id } = await params;
  const conversationId = Array.isArray(id) ? id[0] : id;
  
  return <ChatPageComponent conversationId={conversationId === 'new' ? undefined : conversationId} />
}