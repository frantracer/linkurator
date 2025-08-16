'use client';

import React, {useState, useEffect, useRef} from "react";
import Button from "../../../../../components/atoms/Button";
import FlexRow from "../../../../../components/atoms/FlexRow";
import FlexItem from "../../../../../components/atoms/FlexItem";
import {TrashIcon} from "../../../../../components/atoms/Icons";
import TopTitle from "../../../../../components/molecules/TopTitle";
import {ChatMessage} from "../../../../../entities/Chat";
import {queryAgent, deleteChat} from "../../../../../services/chatService";
import useChat from "../../../../../hooks/useChat";
import {useQueryClient} from '@tanstack/react-query';
import {v4 as uuidv4} from 'uuid';
import {useRouter} from 'next/navigation';
import DeleteChatConfirmationModal, {
  DeleteChatConfirmationModalId
} from "../../../../../components/organism/DeleteChatConfirmationModal";
import ErrorModal, {ErrorModalId} from "../../../../../components/organism/ErrorModal";
import {openModal, closeModal} from "../../../../../utilities/modalAction";
import {useTranslations} from 'next-intl';
import CollapsibleCarousel from "../../../../../components/molecules/CollapsibleCarousel";
import { SubscriptionItem } from "../../../../../entities/SubscriptionItem";
import ReactMarkdown from 'react-markdown';

const MESSAGE_LIMIT = 5;

const ChatPageComponent = ({conversationId}: { conversationId: string }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState({title: '', message: ''});
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('common');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {conversation, isLoading: conversationLoading} = useChat(conversationId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (conversation?.messages) {
      setLocalMessages(conversation.messages);
    }
  }, [conversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Count user messages
  const userMessageCount = localMessages.filter(message => message.sender === 'user').length;
  const isMessageLimitReached = userMessageCount >= MESSAGE_LIMIT;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isMessageLimitReached) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      items: [],
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const agentResponse = await queryAgent(conversationId, userMessage.content);
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: agentResponse,
        sender: 'assistant',
        timestamp: new Date(),
        items: [],
      };
      setLocalMessages(prev => [...prev, aiMessage]);

      // Invalidate and refetch the conversation data
      queryClient.invalidateQueries({queryKey: ['chat', conversationId]});
      queryClient.invalidateQueries({queryKey: ['chatConversations']});
    } catch (error) {
      console.error('Error getting agent response:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: t('chat_error'),
        sender: 'assistant',
        timestamp: new Date(),
        items: [],
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteChat(conversationId);

      // Close the modal and navigate
      closeModal(DeleteChatConfirmationModalId);

      // Invalidate and refetch the conversations list
      queryClient.invalidateQueries({queryKey: ['chatConversations']});
      queryClient.removeQueries({queryKey: ['chat', conversationId]});

      // Navigate back to chat home
      router.push('/chat/' + uuidv4());
    } catch (error) {
      console.error('Error deleting conversation:', error);
      closeModal(DeleteChatConfirmationModalId);
      setErrorMessage({
        title: t('deletion_failed'),
        message: t('delete_conversation_error')
      });
      openModal(ErrorModalId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteButtonClick = () => {
    openModal(DeleteChatConfirmationModalId);
  };

  const handleItemClick = (item: SubscriptionItem) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handleSampleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      <TopTitle>
        <div className="flex flex-row items-center justify-between overflow-visible w-full h-full">
          <div className="flex-shrink-0 w-12"/>
          <div className="flex-grow flex justify-center items-center overflow-hidden h-full">
            <h1 className="text-xl font-bold whitespace-nowrap truncate">
              {conversationLoading
                ? t('loading')
                : conversation?.title || t('new_chat')
              }
            </h1>
          </div>
          <div className="flex-shrink-0 w-12 flex justify-end items-center h-full">
            {localMessages.length > 0 && (
              <Button
                fitContent={true}
                clickAction={handleDeleteButtonClick}
                disabled={isDeleting}
                primary={false}
              >
                <TrashIcon/>
              </Button>
            )}
          </div>
        </div>
      </TopTitle>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localMessages.length === 0 && !conversationLoading && (
            <div className="flex flex-col items-center space-y-6 mt-8">
              <div className="text-center text-base-content/60">
                <p className="text-lg mb-4">{t('start_conversation')}</p>
                <p className="text-sm mb-6">{t('sample_questions')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <button
                  onClick={() => handleSampleQuestionClick(t('sample_question_1'))}
                  className="p-4 text-left bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200 border border-base-300 hover:border-primary"
                >
                  <span className="text-sm">{t('sample_question_1')}</span>
                </button>

                <button
                  onClick={() => handleSampleQuestionClick(t('sample_question_2'))}
                  className="p-4 text-left bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200 border border-base-300 hover:border-primary"
                >
                  <span className="text-sm">{t('sample_question_2')}</span>
                </button>

              </div>
            </div>
          )}

          {conversationLoading && localMessages.length === 0 && (
            <div className="text-center text-base-content/60 mt-8">
              <p>{t('loading_conversation')}</p>
            </div>
          )}

          {localMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content'
                }`}
              >
                <div className="markdown-content">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.items && message.items.length > 0 && (
                  <CollapsibleCarousel
                    items={message.items}
                    title={t('suggested_items')}
                    defaultExpanded={true}
                    onItemClick={handleItemClick}
                  />
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-base-200 text-base-content max-w-[80%] p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                       style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"
                       style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-base-300 p-4">
          <FlexRow>
            <FlexItem grow={true}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('type_message')}
                className="textarea textarea-bordered w-full resize-none"
                rows={2}
                disabled={isLoading || isMessageLimitReached}
              />
            </FlexItem>
            <FlexItem>
              <Button
                clickAction={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isMessageLimitReached}
                primary={true}
                fitContent={true}
              >
                {t('send')}
              </Button>
            </FlexItem>
          </FlexRow>
          
          {/* Message limit counter */}
          <div className="mt-2 text-center">
            {isMessageLimitReached ? (
              <p className="text-sm text-error">{t('message_limit_reached')}</p>
            ) : (
              <p className={`text-sm ${userMessageCount >= MESSAGE_LIMIT - 2 ? 'text-warning' : 'text-base-content/60'}`}>
                {t('messages_remaining', { remaining: MESSAGE_LIMIT - userMessageCount })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteChatConfirmationModal
        onDeleteChat={handleDeleteChat}
        isDeleting={isDeleting}
      />
      <ErrorModal
        title={errorMessage.title}
        message={errorMessage.message}
      />
    </div>
  );
};

export default ChatPageComponent;