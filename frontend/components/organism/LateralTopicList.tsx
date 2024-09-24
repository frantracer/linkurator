import {MenuItem} from "../atoms/MenuItem";
import React from "react";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import Tag from "../atoms/Tag";
import FlexRow from "../atoms/FlexRow";
import FlexItem from "../atoms/FlexItem";
import Miniature from "../atoms/Miniature";

export const LATERAL_TOPIC_MENU_ID = 'lateral-topic-menu';

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  searchValue: string;
  closeMenu: () => void;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const router = useRouter()
  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.TOPICS + "/" + topic.uuid)
    }
  }

  const items = props.topics
    .filter((topic) => {
      return topic.name.toLowerCase().includes(props.searchValue.toLowerCase());
    })
    .map((topic) => (
      <MenuItem
        key={topic.uuid}
        onClick={() => handleClick(topic.uuid)}
        selected={topic.uuid === props.selectedTopic?.uuid}
      >
        <FlexRow>
          <span>{topic.name}</span>
          <FlexItem grow={true}/>
          <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
          <Tag>{topic.subscriptions_ids.length}</Tag>
        </FlexRow>
      </MenuItem>
    ))

  return (
    <Menu>
      {items}
    </Menu>
  )
}


export default LateralTopicList;
