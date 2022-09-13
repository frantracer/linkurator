import VideoCard from "./VideoCard";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {Topic} from "../entities/Topic";
import React from "react";
import CustomButton, {IconForButton} from "./CustomButton";
import {AssignTopicModalId} from "./AssignTopicModal";
import {LATERAL_MENU_ID} from "../utilities/hideLateralMenu";

type SubscriptionVideoCardGridProps = {
  refreshItems: () => void,
  topics: Topic[];
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
}

const SubscriptionVideoCardGrid = (props: SubscriptionVideoCardGridProps) => {
  const cards = [];

  if (props.subscription) {
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i];
      cards.push(
        <div className="m-4" key={item.uuid}>
          <VideoCard
            item={item}
            subscription={undefined}
            onChange={() => props.refreshItems()}
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
        return <div key={topic.uuid} className="badge badge-outline mx-2">
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
              relatedModalId={LATERAL_MENU_ID}
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