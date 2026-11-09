'use client';

import React, {useEffect, useRef, useState} from "react";
import EmptyStateBox from "../../../../components/atoms/EmptyStateBox";
import EndOfList from "../../../../components/atoms/EndOfList";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {v4 as uuidv4} from 'uuid';
import Button from "../../../../components/atoms/Button";
import {Spinner} from "../../../../components/atoms/Spinner";
import {AddIcon, ChatBubbleIcon} from "../../../../components/atoms/Icons";
import PageFilterBar from "../../../../components/molecules/PageFilterBar";
import SearchBar from "../../../../components/molecules/SearchBar";
import PageHeader from "../../../../components/organism/PageHeader";
import EmptyStateNoMatches from "../../../../components/organism/EmptyStateNoMatches";
import {paths} from "../../../../configuration";
import {ChatConversation} from "../../../../entities/Chat";
import useChatConversations from "../../../../hooks/useChatConversations";
import {useDebounce} from "../../../../hooks/useDebounce";

const ChatsListPageComponent = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [filterText, setFilterText] = useState("");
  const debouncedFilter = useDebounce(filterText.trim(), 300);
  const {conversations, isLoading, isFinished, fetchMoreConversations} = useChatConversations(debouncedFilter);
  // The unfiltered list is the same cached query the page shows without a filter, so it costs no extra request
  const {conversations: allConversations, isFinished: allConversationsLoaded} = useChatConversations();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (isFinished || isLoading) {
      return;
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreConversations();
    }
  };

  // If there's no scrollbar fetch more conversations
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isFinished || isLoading) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight) {
      fetchMoreConversations();
    }
  }, [conversations.length, isLoading, isFinished, fetchMoreConversations]);

  const goToChat = (conversation: ChatConversation) => {
    router.push(paths.CHATS + "/" + conversation.id);
  }

  const goToNewChat = () => {
    router.push(paths.CHATS + "/" + uuidv4());
  }

  const hasAnyConversations = conversations.length > 0;

  // Chats load a page at a time, so until the last page arrives the count is only a lower bound
  const chatsCountSubtitle = allConversations.length === 0
    ? undefined
    : allConversationsLoaded
      ? t("chats_count", {count: allConversations.length})
      : t("chats_count_lower_bound", {count: allConversations.length});
  const isFiltering = debouncedFilter !== "";

  return (
    <>
      <PageHeader
        title={t("chats")}
        icon={<ChatBubbleIcon/>}
        subtitle={chatsCountSubtitle}
        reserveScrollbarSpace={true}
        actions={
          <Button clickAction={goToNewChat} tooltip={t("new_chat")}>
            <AddIcon/>
            <span className="hidden sm:inline">{t("new_chat")}</span>
          </Button>
        }
      />
      <PageFilterBar width="narrow">
        <SearchBar
          placeholder={t("filter_chats_placeholder")}
          value={filterText}
          handleChange={setFilterText}
          icon="filter"
        />
      </PageFilterBar>
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] pb-mobile-nav"
      >
        <div className="flex flex-col gap-6 p-4 max-w-2xl w-full mx-auto">
          {!isLoading && !hasAnyConversations && !isFiltering && (
            <EmptyStateBox icon={<ChatBubbleIcon/>} title={t("no_conversations_yet")} message={t("start_conversation")}/>
          )}

          {!isLoading && !hasAnyConversations && isFiltering && (
            <EmptyStateNoMatches/>
          )}

          {hasAnyConversations && (
            <div className="flex flex-col gap-2">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => goToChat(conversation)}
                  className="flex flex-row items-center gap-3 w-full bg-base-200 hover:bg-base-100 rounded-lg p-3 border border-neutral hover:border-primary shadow-sm hover:shadow-md duration-200 cursor-pointer"
                >
                  <ChatBubbleIcon/>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate hover:text-primary">
                      {conversation.title}
                    </h3>
                    <span className="text-xs text-base-content/60">
                      {t("chat_initiated_at", {
                        datetime: new Date(conversation.createdAt).toLocaleString(locale, {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        }),
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2">
              <Spinner/>
              <span>{t("loading")}</span>
            </div>
          )}

          {hasAnyConversations && isFinished && !isLoading && (
            <EndOfList text={t("all_caught_up")}/>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatsListPageComponent;
