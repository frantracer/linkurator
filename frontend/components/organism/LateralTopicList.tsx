import {MenuItem} from "../atoms/MenuItem";
import React from "react";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/router";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import Tag from "../atoms/Tag";

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
        <div className="flex flex-row gap-2 items-center">
          <div className="whitespace-nowrap overflow-auto truncate w-full">{topic.name}</div>
          <Tag>{topic.subscriptions_ids.length}</Tag>
        </div>
      </MenuItem>
    ))

  return (
    <Menu>
      {items}
    </Menu>
  )
}


export default LateralTopicList;
