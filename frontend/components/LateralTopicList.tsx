import {MenuItem} from "./MenuItem";
import {Topic} from "../hooks/useTopics";

type LateralTopicListProps = {
  topics: Topic[];
  setSelectedTopic: (subscription: Topic | undefined) => void;
  selectedTopic: Topic | undefined;
  searchValue: string;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.setSelectedTopic(topic);
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
    <nav className="flex-grow pb-4 px-7 md:block md:pb-0 md:overflow-y-auto">
      {items}
    </nav>
  )
}

export default LateralTopicList;