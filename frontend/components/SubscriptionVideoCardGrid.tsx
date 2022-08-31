import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/TopicItem";
import {Topic} from "../entities/Topic";
import React from "react";

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

    content = <div>
      <div className="text-3xl text-center text-gray-800">{current_subscription.name}</div>
      {topicTags}
      <div className="flex flex-row flex-wrap m-6">{cards}</div>
    </div>
  }

  return content;
}

export default SubscriptionVideoCardGrid;