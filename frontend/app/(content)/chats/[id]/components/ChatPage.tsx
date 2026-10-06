'use client';

import React, {useCallback, useEffect, useRef, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {FunnelIcon, TrashIcon} from "../../../../../components/atoms/Icons";
import ChatInput from "./ChatInput";
import TopTitle from "../../../../../components/molecules/TopTitle";
import {ChatMessage, ChatScope, getLatestScope, newTopicsWereCreated} from "../../../../../entities/Chat";
import {areFiltersEqual, defaultFilters, Filters} from "../../../../../entities/Filters";
import {ChatRateLimitError, deleteChat, queryAgent} from "../../../../../services/chatService";
import useChat from "../../../../../hooks/useChat";
import {useQueryClient} from '@tanstack/react-query';
import useProfile from "../../../../../hooks/useProfile";
import {v4 as uuidv4} from 'uuid';
import {useRouter} from 'next/navigation';
import DeleteChatConfirmationModal, {
  DeleteChatConfirmationModalId
} from "../../../../../components/organism/DeleteChatConfirmationModal";
import ErrorModal, {ErrorModalId} from "../../../../../components/organism/ErrorModal";
import {closeModal, openModal} from "../../../../../utilities/modalAction";
import {useTranslations} from 'next-intl';
import ItemCarousel from "../../../../../components/molecules/ItemCarousel";
import ReactMarkdown from 'react-markdown';
import {invalidateTopicsCache} from "../../../../../hooks/useTopics";
import {paths} from "../../../../../configuration";
import useProviders from "../../../../../hooks/useProviders";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import useTopicsSubscriptions from "../../../../../hooks/useTopicsSubscriptions";
import useUserFilter from "../../../../../hooks/useUserFilter";
import useFilterBarVisibility from "../../../../../hooks/useFilterBarVisibility";
import Divider from "../../../../../components/atoms/Divider";
import HoverPopover from "../../../../../components/atoms/HoverPopover";
import FilterToggleButton from "../../../../../components/molecules/FilterToggleButton";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import ChatScopeTags from "../../../../../components/organism/ChatScopeTags";
import TagsRow from "../../../../../components/atoms/TagsRow";
import ChatScopeModal, {ChatScopeModalId} from "../../../../../components/organism/ChatScopeModal";
import {PickedEntity} from "../../../../../components/organism/EntityPickerModal";
import {
  addScopeEntity,
  ChatScopeEntity,
  consumeChatScope,
  filtersFromScope,
  isEntityInScope,
  removeScopeEntity,
  scopeFromFilters,
  scopeHasKind,
  scopeUsesInteractions
} from "../../../../../utilities/chatScope";

const MESSAGE_LIMIT = 5;
const CHARACTER_LIMIT = 500;

const scopeEntityFromPicked = (entity: PickedEntity): ChatScopeEntity => {
  switch (entity.kind) {
    case 'topic':
      return {kind: 'topic', id: entity.topic.uuid};
    case 'subscription':
      return {kind: 'subscription', id: entity.subscription.uuid};
    case 'curator':
      return {kind: 'curator', id: entity.curator.id};
  }
};

const ChatPageComponent = ({conversationId}: { conversationId: string }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState({title: '', message: ''});
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('common');
  const {providers} = useProviders();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {conversation, isLoading: conversationLoading} = useChat(conversationId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const consumedScopeRef = useRef(false);
  const {profile, profileIsLoading} = useProfile();
  const isLoggedIn = !!profile;
  const {topics} = useTopics(profile, profileIsLoading);
  const {subscriptions} = useSubscriptions(profile);
  const {userFilter} = useUserFilter();
  const {showFilters, toggleFilters, openFilters} = useFilterBarVisibility();

  // Draft of the scope and filters the next message is sent with, starting from the latest used in the chat.
  // A scope without an entity is the "everything" scope.
  const [scope, setScope] = useState<ChatScope | undefined>();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  // Set once the draft no longer follows the user's default filters.
  const draftInitializedRef = useRef(false);
  const updateDraft = useCallback((newScope: ChatScope | undefined, newFilters: Filters) => {
    draftInitializedRef.current = true;
    setScope(newScope);
    setFilters(newFilters);
  }, []);
  const areFiltersModified = !areFiltersEqual(filters, userFilter);
  // Interactions don't apply to guests or curators.
  const showInteractions = isLoggedIn && scopeUsesInteractions(scope);
  const {topicsSubscriptions} = useTopicsSubscriptions(scope?.topicIds ?? [], topics, subscriptions);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    if (consumedScopeRef.current) return;
    consumedScopeRef.current = true;
    const handedOverScope = consumeChatScope(conversationId);
    if (handedOverScope) {
      updateDraft(handedOverScope, filtersFromScope(handedOverScope, defaultFilters));
      setInputMessage(t('chat_scope_prefill'));
    }
  }, [conversationId, t, updateDraft]);

  useEffect(() => {
    if (draftInitializedRef.current) return;
    const latestScope = conversation ? getLatestScope(conversation.messages) : undefined;
    if (latestScope) {
      updateDraft(latestScope, filtersFromScope(latestScope, userFilter));
    } else {
      setFilters(userFilter);
    }
  }, [conversation, userFilter, updateDraft]);

  useEffect(() => {
    if (conversation) {
      setIsLoading(conversation.isWaitingForResponse || false);
      setLocalMessages(conversation.messages);

      if (newTopicsWereCreated(conversation)) {
        invalidateTopicsCache(queryClient);
      }
    }
  }, [conversation, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Count user messages
  const userMessageCount = localMessages.filter(message => message.sender === 'user').length;
  const isMessageLimitReached = userMessageCount >= MESSAGE_LIMIT;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isMessageLimitReached || inputMessage.length > CHARACTER_LIMIT) return;

    draftInitializedRef.current = true;
    const scopeForThisMessage = scopeFromFilters(filters, scope ?? {});

    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      items: [],
      topicsWereCreated: false,
      scope: scopeForThisMessage,
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await queryAgent(conversationId, userMessage.content, scopeForThisMessage);

      // Invalidate and refetch the conversation data
      await queryClient.invalidateQueries({queryKey: ['chat', conversationId]});
      await queryClient.invalidateQueries({queryKey: ['chatConversations']});
    } catch (error) {
      console.error('Error getting agent response:', error);
      let sender: "error" | "rate_limit" = 'error';
      if (error instanceof ChatRateLimitError) {
        sender = 'rate_limit';
      }

      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "",
        sender: sender,
        timestamp: new Date(),
        items: [],
        topicsWereCreated: false,
      };
      setLocalMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
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
      router.push(paths.CHATS + '/' + uuidv4());
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

  const handleFiltersChange = (newFilters: Filters) => {
    updateDraft(scope, newFilters);
  };

  const handleAddEntity = (entity: ChatScopeEntity) => {
    updateDraft(addScopeEntity(scope, entity), filters);
  };

  const handleRemoveEntity = (entity: ChatScopeEntity) => {
    // The exclusions belong to the topics of the scope, so they don't outlive a removed one.
    const newFilters = entity.kind === 'topic' ? {...filters, excludedSubscriptions: []} : filters;
    updateDraft(removeScopeEntity(scope, entity), newFilters);
  };

  const handleToggleEntity = (pickedEntity: PickedEntity) => {
    const entity = scopeEntityFromPicked(pickedEntity);
    if (isEntityInScope(scope, entity)) {
      handleRemoveEntity(entity);
    } else {
      handleAddEntity(entity);
    }
  };

  const handleClearScope = () => {
    updateDraft(undefined, {...filters, excludedSubscriptions: []});
  };

  const handleShowScopeModal = () => {
    openModal(ChatScopeModalId);
  };

  const handleSampleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  const getMessageContent = (message: ChatMessage) => {
    if (message.sender === 'rate_limit') {
      return t("agent_rate_limit_error");
    }
    if (message.sender === 'error') {
      return t("agent_error");
    }
    return message.content;
  }

  const getMessageClass = (message: ChatMessage) => {
    if (message.sender === 'user') {
      return 'max-w-[80%] p-3 rounded-lg bg-primary text-primary-content';
    }
    if (message.sender === 'assistant') {
      return 'w-full mt-4 text-base-content';
    }
    return 'max-w-[80%] p-3 rounded-lg bg-base-200 text-base-content border border-neutral';
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
      <TopTitle>
        <div className="flex flex-row items-center gap-4 h-full w-full px-4">
          <div className="w-10 shrink-0 flex items-center justify-start">
            <FilterToggleButton isOpen={showFilters} isModified={areFiltersModified} onClick={toggleFilters}/>
          </div>
          <div className="flex-1 min-w-0 flex justify-center items-center overflow-hidden h-full">
            <h1 className="text-xl font-bold min-w-0 whitespace-nowrap truncate">
              {conversationLoading
                ? t('loading')
                : conversation?.title || t('new_chat')
              }
            </h1>
          </div>
          <div className="w-10 shrink-0 flex items-center justify-end">
            {localMessages.length > 0 && (
              <Button
                fitContent={true}
                clickAction={handleDeleteButtonClick}
                disabled={isDeleting}
                primary={false}
                tooltip={t("delete_conversation")}
              >
                <TrashIcon/>
              </Button>
            )}
          </div>
        </div>
      </TopTitle>

      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-hidden">
        {/* What the next message is searched with. Guests have no entities to pick from. */}
        <TagsRow>
          <ChatScopeTags scope={scope}
                         filters={filters}
                         showInteractions={showInteractions}
                         onAddEntity={isLoggedIn ? handleShowScopeModal : undefined}
                         onRemoveEntity={isLoggedIn ? handleRemoveEntity : undefined}
                         onChangeFilters={handleFiltersChange}
                         onOpenFilters={openFilters}/>
        </TagsRow>
        {showFilters &&
            <ContentFilterBar subscriptions={scopeHasKind(scope, 'topic') ? topicsSubscriptions : undefined}
                              providers={providers}
                              filters={filters}
                              showInteractions={showInteractions}
                              setFilters={handleFiltersChange}
                              resetFilters={() => handleFiltersChange(userFilter)}/>
        }
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
                  onClick={() => handleSampleQuestionClick(isLoggedIn ? t('sample_question_1') : t('sample_question_guest_1'))}
                  className="p-4 text-left bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200 border border-base-300 hover:border-primary"
                >
                  <span className="text-sm">{isLoggedIn ? t('sample_question_1') : t('sample_question_guest_1')}</span>
                </button>

                <button
                  onClick={() => handleSampleQuestionClick(isLoggedIn ? t('sample_question_2') : t('sample_question_guest_2'))}
                  className="p-4 text-left bg-base-200 hover:bg-base-300 rounded-lg transition-colors duration-200 border border-base-300 hover:border-primary"
                >
                  <span className="text-sm">{isLoggedIn ? t('sample_question_2') : t('sample_question_guest_2')}</span>
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
              <div className={getMessageClass(message)}>
                <div className="markdown-content">
                  <ReactMarkdown>
                    {getMessageContent(message)}
                  </ReactMarkdown>
                </div>
                {message.sender === 'rate_limit' && (
                  <div className={"py-4"}>
                    <Button fitContent={true} clickAction={() => router.push('/register')} primary={true}>
                      {t('register')}
                    </Button>
                  </div>
                )}
                {message.items && message.items.length > 0 &&
                    <Divider />
                }
                {message.items && message.items.length > 0 && (
                  <ItemCarousel
                    items={message.items}
                    providers={providers}
                    title={t('suggested_items')}
                    collapsible={true}
                    defaultExpanded={true}
                    refreshItem={() => queryClient.invalidateQueries({queryKey: ['chat', conversationId]})}
                  />
                )}
                <div className="flex flex-row items-center gap-2 mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                  {message.sender === 'user' && message.scope && (
                    <HoverPopover trigger={<FunnelIcon/>} label={t('chat_message_filters')}>
                      <p className="mb-2 text-xs font-semibold opacity-70">{t('chat_message_filters')}</p>
                      <div className="flex flex-row flex-wrap gap-1">
                        <ChatScopeTags
                          scope={message.scope}
                          filters={filtersFromScope(message.scope, defaultFilters)}
                          showInteractions={isLoggedIn && scopeUsesInteractions(message.scope)}
                        />
                      </div>
                    </HoverPopover>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(isLoading || conversation?.isWaitingForResponse) && (
            <div className="flex justify-start">
              <div className="bg-base-200 text-base-content max-w-[80%] p-3 rounded-lg border border-neutral">
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
          <div ref={messagesEndRef}/>
        </div>

        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={handleSendMessage}
          disabled={isLoading}
          characterLimit={CHARACTER_LIMIT}
          messageLimit={MESSAGE_LIMIT}
          userMessageCount={userMessageCount}
          isMessageLimitReached={isMessageLimitReached}
        />
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
      {isLoggedIn && <ChatScopeModal scope={scope} onToggleEntity={handleToggleEntity} onClearScope={handleClearScope}/>}
    </div>
  );
};

export default ChatPageComponent;