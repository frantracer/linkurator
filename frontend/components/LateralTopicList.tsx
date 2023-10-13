import {MenuItem} from "./MenuItem";
import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import CustomButton, {IconForButton} from "./CustomButton";
import {Topic} from "../entities/Topic";
import {paths} from "../configuration";
import {useRouter} from "next/router";
import {hideLateralMenu} from "../utilities/hideLateralMenu";

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
