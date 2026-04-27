import {MenuItem} from "../atoms/MenuItem";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import Miniature from "../atoms/Miniature";
import FlexItem from "../atoms/FlexItem";
import React from "react";

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  isLoading: boolean;
  closeMenu: () => void;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const router = useRouter();

  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.TOPICS + "/" + topic.uuid)
    }
  }

  const favoriteTopics = props.topics.filter(topic => topic.is_favorite);

  const renderTopicItem = (topic: Topic) => (
    <MenuItem
      key={topic.uuid}
      onClick={() => handleClick(topic.uuid)}
      selected={topic.uuid === props.selectedTopic?.uuid}
    >
      <FlexRow position={"start"}>
        <span className={"text-wrap"}>{topic.name}</span>
        <FlexItem grow={true}/>
        {!topic.is_owner &&
            <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
        }
      </FlexRow>
    </MenuItem>
  );

  return (
    <Menu>
      <div className="space-y-1">
        {favoriteTopics.map(renderTopicItem)}
      </div>
    </Menu>
  )
}

export default LateralTopicList;
