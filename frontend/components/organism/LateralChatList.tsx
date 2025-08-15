import {MenuItem} from "../atoms/MenuItem";
import {ChatConversation} from "../../entities/Chat";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexItem from "../atoms/FlexItem";
import Button from "../atoms/Button";
import React from "react";
import {v4 as uuidv4} from 'uuid';
import {useTranslations} from 'next-intl';
import {AddIcon} from "../atoms/Icons";

type LateralChatListProps = {
  conversations: ChatConversation[];
  selectedConversation: ChatConversation | undefined;
  closeMenu: () => void;
  isLoading: boolean;
}

const LateralChatList = (props: LateralChatListProps) => {
  const router = useRouter();
  const t = useTranslations('common');

  const handleClick = (conversationId: string) => {
    const conversation = props.conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push("/chat/" + conversation.id)
    }
  }

  const handleNewChat = () => {
    props.closeMenu();
    scrollToDrawerTop();
    router.push("/chat/" + uuidv4());
  }

  const renderConversationItem = (conversation: ChatConversation) => (
    <MenuItem
      key={conversation.id}
      onClick={() => handleClick(conversation.id)}
      selected={conversation.id === props.selectedConversation?.id}
    >
      <FlexRow position={"start"}>
        <FlexItem grow={true}>
          <div className="flex flex-col items-start">
            <span className="text-wrap font-medium">{conversation.title}</span>
            <span className="text-xs text-base-content/60">
              {new Date(conversation.updated_at).toLocaleDateString()}
            </span>
          </div>
        </FlexItem>
      </FlexRow>
    </MenuItem>
  );

  const noItems = (
    <InfoBanner>
      <span className={"text-sm"}>{t('no_conversations_yet')}</span>
    </InfoBanner>
  )

  const loadingItems = (
    <InfoBanner>
      <span className={"text-sm"}>{t('loading_conversations')}</span>
    </InfoBanner>
  )

  return (
    <div>
      <Button
        clickAction={handleNewChat}
        primary={true}
        fitContent={false}
      >
        <AddIcon/>
        {t('new_chat')}
      </Button>
      <Menu>
        {props.isLoading
          ? loadingItems
          : props.conversations.length > 0
            ? props.conversations.map(renderConversationItem)
            : noItems
        }
      </Menu>
    </div>
  )
}

export default LateralChatList;