import {MenuItem} from "../atoms/MenuItem";
import React from "react";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/router";
import {hideLateralMenu} from "../../utilities/hideLateralMenu";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  searchValue: string;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const router = useRouter()
  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      hideLateralMenu()
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
        title={topic.name}
        key={topic.uuid}
        onClick={() => handleClick(topic.uuid)}
        selected={topic.uuid === props.selectedTopic?.uuid}
      />
    ))

  return (
    <nav className="bg-gray-50 rounded h-full overflow-auto">
      {items}
    </nav>
  )
}


export default LateralTopicList;
