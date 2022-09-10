import {MenuItem} from "./MenuItem";
import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import CustomButton, {IconForButton} from "./CustomButton";
import {Topic} from "../entities/Topic";
import {scrollToDrawerContentTop} from "../utilities/scrollToDrawerContentTop";

type LateralTopicListProps = {
  topics: Topic[];
  setSelectedTopicId: (topicId: string | undefined) => void;
  selectedTopic: Topic | undefined;
  searchValue: string;
}

const LateralTopicList = (props: LateralTopicListProps) => {

  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.setSelectedTopicId(topic.uuid);
      scrollToDrawerContentTop();
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
    <nav className="flex-grow pb-4 px-4 md:block md:pb-0 md:overflow-y-auto">
      <div className="flex flex-col w-full">
        <CustomButton
          text={"New Topic"}
          icon={IconForButton.add}
          relatedModalId={NewTopicModalId}
          clickAction={() => {
          }}/>
      </div>
      {items}
    </nav>
  )
}


export default LateralTopicList;