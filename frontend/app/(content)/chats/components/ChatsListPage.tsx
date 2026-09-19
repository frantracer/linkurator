'use client';

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {v4 as uuidv4} from 'uuid';
import Button from "../../../../components/atoms/Button";
import {InfoBanner} from "../../../../components/atoms/InfoBanner";
import {Spinner} from "../../../../components/atoms/Spinner";
import {AddIcon, ChatBubbleIcon} from "../../../../components/atoms/Icons";
import SearchBar from "../../../../components/molecules/SearchBar";
import TopTitle from "../../../../components/molecules/TopTitle";
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
  const isFiltering = debouncedFilter !== "";

  return (
    <>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0"/>
          <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-2">
            <ChatBubbleIcon/>
            <h1 className="text-xl font-bold truncate">{t("chats")}</h1>
          </div>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden"
      >
        <div className="flex flex-col gap-6 p-4 max-w-2xl w-full mx-auto">
          <div className="flex flex-row gap-2 w-full items-center">
            <Button fitContent={true} clickAction={goToNewChat} primary={false}>
              <AddIcon/>
              {t("new_chat")}
            </Button>
            <SearchBar
              placeholder={t("filter_chats_placeholder")}
              value={filterText}
              handleChange={setFilterText}
              icon="filter"
            />
          </div>

          {!isLoading && !hasAnyConversations && !isFiltering && (
            <InfoBanner>
              <span>{t("no_conversations_yet")}</span>
            </InfoBanner>
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
            <InfoBanner>{t("no_more_content")}</InfoBanner>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatsListPageComponent;
