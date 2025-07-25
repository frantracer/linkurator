import {MenuItem} from "../atoms/MenuItem";
import {ChatConversation} from "../../entities/Chat";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexItem from "../atoms/FlexItem";
import React from "react";

type LateralChatListProps = {
  conversations: ChatConversation[];
  selectedConversation: ChatConversation | undefined;
  closeMenu: () => void;
}

const LateralChatList = (props: LateralChatListProps) => {
  const router = useRouter();

  const handleClick = (conversationId: string) => {
    const conversation = props.conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push("/chat/" + conversation.id)
    }
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
      <span className={"text-sm"}>No conversations yet. Start a new chat!</span>
    </InfoBanner>
  )

  return (
    <Menu>
      {props.conversations.length > 0 
        ? props.conversations.map(renderConversationItem)
        : noItems
      }
    </Menu>
  )
}

export default LateralChatList;