import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {Topic} from "../entities/Topic";
import React from "react";
import CustomButton, {IconForButton} from "./CustomButton";
import {AssignTopicModalId} from "./AssignTopicModal";

type SubscriptionVideoCardGridProps = {
  topics: Topic[];
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
}

const SubscriptionVideoCardGrid = (props: SubscriptionVideoCardGridProps) => {
  const cards = [];

  if (props.subscription) {
    for (let i = 0; i < props.items.length; i++) {
      cards.push(
        <div className="m-4" key={i}>
          <VideoCard
            img={props.items[i].thumbnail}
            name={props.items[i].name}
            description={readableAgoUnits(props.items[i].published_at)}
            url={props.items[i].url}
            subscription={undefined}
          />
        </div>
      );
    }
  }

  let content = <div></div>
  if (props.subscription) {
    const current_subscription = props.subscription;
    const topicTags = props.topics
      .filter(topic => {
        return topic.subscriptions_ids.includes(current_subscription.uuid)
      })
      .map(topic => {
        return <div key={topic.uuid} className="badge mx-2">
          {topic.name}
        </div>
      });

    content =
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
            <h1 onClick={() => window.open(current_subscription.url, "_blank")}
               className="text-2xl md:text-4xl font-bold text-center text-gray-800 cursor-pointer hover:underline">
              {current_subscription.name}
            </h1>
          </div>
          <div className="flex-none">
            <CustomButton
              text={""}
              icon={IconForButton.add}
              relatedModalId={AssignTopicModalId}
              clickAction={() => {
              }}/>
          </div>
        </div>
        {topicTags}
        <div className="flex flex-row flex-wrap m-6">
          {cards}
        </div>
      </div>
  }

  return content;
}

export default SubscriptionVideoCardGrid;