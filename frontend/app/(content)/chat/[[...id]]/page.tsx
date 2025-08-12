import ChatPageComponent from './components/ChatPage';

type ChatPageParams = {
  params: Promise<{ id: string[] | string }>
};

export default async function ChatPage({ params }: ChatPageParams) {
  const { id } = await params;
  const conversationId = Array.isArray(id) ? id[0] : id;

  return <ChatPageComponent conversationId={conversationId === 'new' ? null : conversationId} />
}