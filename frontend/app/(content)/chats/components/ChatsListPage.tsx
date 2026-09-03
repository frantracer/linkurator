'use client';

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {v4 as uuidv4} from 'uuid';
import Button from "../../../../components/atoms/Button";
import {InfoBanner} from "../../../../components/atoms/InfoBanner";
import {AddIcon, ChatBubbleIcon} from "../../../../components/atoms/Icons";
import SearchBar from "../../../../components/molecules/SearchBar";
import TopTitle from "../../../../components/molecules/TopTitle";
import {paths} from "../../../../configuration";
import {ChatConversation, conversationSorting} from "../../../../entities/Chat";
import useChatConversations from "../../../../hooks/useChatConversations";

const ChatsListPageComponent = () => {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const {conversations, isLoading} = useChatConversations();
  const [filterText, setFilterText] = useState("");

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredConversations = (normalizedFilter === ""
      ? conversations
      : conversations.filter(conversation => conversation.title.toLowerCase().includes(normalizedFilter))
  ).slice().sort(conversationSorting);

  const goToChat = (conversation: ChatConversation) => {
    router.push(paths.CHATS + "/" + conversation.id);
  }

  const goToNewChat = () => {
    router.push(paths.CHATS + "/" + uuidv4());
  }

  const hasAnyConversations = conversations.length > 0;

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
      <div className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden">
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

          {!isLoading && !hasAnyConversations && (
            <InfoBanner>
              <span>{t("no_conversations_yet")}</span>
            </InfoBanner>
          )}

          {hasAnyConversations && (
            <div className="flex flex-col gap-2">
              {filteredConversations.map(conversation => (
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
        </div>
      </div>
    </>
  );
}

export default ChatsListPageComponent;
