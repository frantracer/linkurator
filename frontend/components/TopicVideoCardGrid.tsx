import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Topic} from "../entities/Topic";
import CustomButton, {IconForButton} from "./CustomButton";
import {deleteTopic} from "../services/topicService";
import {EditTopicModalId} from "./EditTopicModal";
import React from "react";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {Subscription} from "../entities/Subscription";

type TopicVideoCardGridProps = {
  refreshTopics: () => void,
  setSelectedTopicId: (topicId: string | undefined) => void,
  topic: Topic | undefined;
  items: SubscriptionItem[];
  subscriptions: Subscription[];
}

const TopicVideoCardGrid = (props: TopicVideoCardGridProps) => {
  const cards = [];

  if (props.topic) {
    for (let i = 0; i < props.items.length; i++) {
      console.log(props.items[i].subscription_uuid);
      cards.push(
        <div className="m-4" key={i}>
          <VideoCard
            img={props.items[i].thumbnail}
            name={props.items[i].name}
            description={readableAgoUnits(props.items[i].published_at)}
            url={props.items[i].url}
            subscription={props.subscriptions.find((s) => s.uuid == props.items[i].subscription_uuid)}
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
        <div className="sticky top-0 z-10 bg-white flex flex-row justify-center items-center">
          <div className="flex-none">
            <CustomButton
              text={""}
              icon={IconForButton.menu}
              relatedModalId={"my-drawer"}
              showOnlyOnMobile={true}
              clickAction={() => {
              }}/>
          </div>
          <div className="flex-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800">{topic.name}</h1>
          </div>
          <div className="flex-none">
            <CustomButton
              text={""}
              icon={IconForButton.pencil}
              relatedModalId={EditTopicModalId}
              clickAction={() => {
              }}/>
            <CustomButton
              text={""}
              icon={IconForButton.trash}
              relatedModalId={undefined}
              clickAction={async () => {
                await deleteTopic(topic.uuid);
                props.refreshTopics();
                props.setSelectedTopicId(undefined);
              }}/>
          </div>
        </div>
        <div className="flex flex-row flex-wrap m-6">
          {cards}
        </div>
      </div>
    )
  }

  return topicGrid
}

export default TopicVideoCardGrid;