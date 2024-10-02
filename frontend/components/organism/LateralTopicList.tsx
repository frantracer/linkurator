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
import {InfoBanner} from "../atoms/InfoBanner";

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
          {!topic.is_owner &&
              <FlexItem>
                  <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
              </FlexItem>
          }
          <span className={"truncate"}>{topic.name}</span>
          <FlexItem grow={true}/>
          <FlexItem>
            <Tag>{topic.subscriptions_ids.length}</Tag>
          </FlexItem>
        </FlexRow>
      </MenuItem>
    ))

  const noItems = (
    <InfoBanner>
      <span className={"text-sm"}>No se encontraron categorías</span>
    </InfoBanner>
  )

  return (
    <Menu>
      {items.length > 0 ? items : noItems}
    </Menu>
  )
}


export default LateralTopicList;
