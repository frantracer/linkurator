import VideoCard from "./VideoCard";
import {Topic} from "../entities/Topic";
import CustomButton, {IconForButton} from "./CustomButton";
import {deleteTopic} from "../services/topicService";
import {EditTopicModalId} from "./EditTopicModal";
import React from "react";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {Subscription} from "../entities/Subscription";
import {LATERAL_MENU_ID} from "../utilities/hideLateralMenu";
import {FilterOptionsModalId} from "./FilterOptionsModal";
import {Filters, isItemShown} from "../entities/Filters";

type TopicVideoCardGridProps = {
  refreshItem: (itemId: string) => void,
  refreshTopics: () => void,
  setSelectedTopicId: (topicId: string | undefined) => void,
  topic: Topic | undefined;
  items: SubscriptionItem[];
  subscriptions: Subscription[];
  filters: Filters;
  isLoading: boolean;
  topicIsFinished: boolean;
}

export const TOPIC_GRID_ID = "topic-grid";

const TopicVideoCardGrid = (props: TopicVideoCardGridProps) => {
  const cards = [];

  let subscriptionTags;
  if (props.topic) {
    const current_topic = props.topic;
    subscriptionTags = props.subscriptions
      .filter(subscription => {
        return current_topic.subscriptions_ids.includes(subscription.uuid)
      })
      .map(subscription => {
        return <div key={subscription.uuid} className="badge badge-outline mx-2">
          <img className="w-4 h-4 inline-block mx-1 rounded" src={subscription.thumbnail} alt={subscription.name}/>
          <p>{subscription.name}</p>
        </div>
      });
  }

  if (props.topic) {
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i];
      if (isItemShown(item, props.filters)) {
        cards.push(
          <div className="m-4" key={item.uuid}>
            <VideoCard
              item={item}
              subscription={props.subscriptions.find((s) => s.uuid == item.subscription_uuid)}
              onChange={() => props.refreshItem(item.uuid)}
            />
          </div>
        );
      }
    }
  }

  let topicGrid = <div></div>
  if (props.topic) {
    const topic = props.topic;

    topicGrid = (
      <div id={TOPIC_GRID_ID} className="drawer-content">
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
              <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800">{topic.name}</h1>
            </div>
            <div className="flex-none">
              <div className="dropdown dropdown-end">
                <CustomButton
                  text={""}
                  icon={IconForButton.options}
                  relatedModalId={undefined}
                  clickAction={() => {
                  }}/>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <CustomButton
                    text={"Edit Topic"}
                    icon={IconForButton.pencil}
                    relatedModalId={EditTopicModalId}
                    clickAction={() => {
                    }}/>
                  <CustomButton
                    text={"Delete topic"}
                    icon={IconForButton.trash}
                    relatedModalId={undefined}
                    clickAction={async () => {
                      await deleteTopic(topic.uuid);
                      props.refreshTopics();
                      props.setSelectedTopicId(undefined);
                    }}/>
                  <CustomButton
                    text={"Filter items"}
                    icon={IconForButton.funnel}
                    relatedModalId={FilterOptionsModalId}
                    clickAction={async () => {
                    }}/>
                </ul>
              </div>
            </div>
          </div>
          {subscriptionTags}
          <div className="flex flex-row flex-wrap m-6">
            {cards}
          </div>
          {props.isLoading &&
              <div className="flex justify-center items-center">
                  <button className="btn btn-sm btn-ghost loading">loading</button>
              </div>
          }
          {props.topicIsFinished &&
              <div className="flex justify-center items-center">
                  <button className="btn btn-sm btn-ghost">No more items to show</button>
              </div>
          }
        </div>
      </div>
    )
  }

  return topicGrid
}

export default TopicVideoCardGrid;