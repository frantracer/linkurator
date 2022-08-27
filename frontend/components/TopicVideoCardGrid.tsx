import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Topic} from "../entities/Topic";
import CustomButton, {IconForButton} from "./CustomButton";
import {deleteTopic, getTopics} from "../services/topicService";
import {EditTopicModalId} from "./EditTopicModal";
import {TopicItem} from "../entities/TopicItem";

type TopicVideoCardGridProps = {
  setTopics: (topics: Topic[]) => void,
  setSelectedTopicId: (topicId: string | undefined) => void,
  topic: Topic | undefined;
  items: TopicItem[];
}

async function DeleteTopicAndGetAllTopics(uuid: string): Promise<Topic[]> {
  await deleteTopic(uuid);
  return await getTopics();
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

  let topicGrid = <div></div>
  if (props.topic) {
    const topic = props.topic;

    topicGrid = (
      <div className="w-full">
        <div className="flex flex-row justify-center items-center">
          <h1 className="text-4xl text-center text-gray-800">{topic.name}</h1>
          <CustomButton
            text={"Edit"}
            icon={IconForButton.pencil}
            relatedModalId={EditTopicModalId}
            clickAction={() => {
            }}/>
          <CustomButton
            text={"Delete"}
            icon={IconForButton.trash}
            relatedModalId={undefined}
            clickAction={() => {
              DeleteTopicAndGetAllTopics(topic.uuid)
                .then(topics => {
                    props.setTopics(topics);
                    props.setSelectedTopicId(undefined);
                  }
                );
            }}/>
        </div>
        <div className="flex flex-row flex-wrap m-6">{cards}</div>
      </div>
    )
  }

  return topicGrid
}

export default TopicVideoCardGrid;