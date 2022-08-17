import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Topic} from "../hooks/useTopics";
import {TopicItem} from "../hooks/useTopicItems";

type TopicVideoCardGridProps = {
  topic: Topic | undefined;
  items: TopicItem[];
}

const TopicVideoCardGrid = (props: TopicVideoCardGridProps) => {
  const cards = [];

  if (props.topic) {
    for (let i = 0; i < props.items.length; i++) {
      cards.push(
        <div className="m-4" key={i}>
          <VideoCard
            img={props.items[i].thumbnail}
            name={props.items[i].name}
            description={readableAgoUnits(props.items[i].published_at)}
            url={props.items[i].url}
          />
        </div>
      );
    }
  }

  return (
    <div>
      <div className="text-3xl text-center text-gray-800">{props.topic ? props.topic.name : ""}</div>
      <div className="flex flex-row flex-wrap m-6">{cards}</div>
    </div>
  )
}

export default TopicVideoCardGrid;