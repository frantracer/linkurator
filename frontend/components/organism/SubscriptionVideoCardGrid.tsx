import VideoCard from "./VideoCard";
import {Subscription} from "../../entities/Subscription";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {Topic} from "../../entities/Topic";
import React from "react";
import CustomButton, {IconForButton} from "../atoms/CustomButton";
import {AssignTopicModalId} from "./AssignTopicModal";
import {LATERAL_MENU_ID} from "../../utilities/hideLateralMenu";
import {Filters, isItemShown} from "../../entities/Filters";
import {FilterOptionsModalId} from "./FilterOptionsModal";
import {refreshSubscription} from "../../services/subscriptionService";
import TopicTag from "../atoms/TopicTag";
import {ITEMS_PER_PAGE} from "../../utilities/constants";

type SubscriptionVideoCardGridProps = {
  refreshSubscriptions: () => void,
  refreshItem: (itemId: string) => void,
  fetchMoreItems: () => void,
  topics: Topic[];
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
  filters: Filters;
  isLoading: boolean;
  isFinished: boolean;
}

const SubscriptionVideoCardGrid = (props: SubscriptionVideoCardGridProps) => {

  const cards = [];
  let content = <div></div>

  if (props.subscription) {
    for (let i = 0; i < props.items.length; i++) {
      const item = props.items[i];
      if (isItemShown(item, props.filters)) {
        cards.push(
          <div className="m-4" key={item.uuid}>
            <VideoCard
              item={item}
              subscription={undefined}
              onChange={() => props.refreshItem(item.uuid)}
            />
          </div>
        );
      }
    }

    const current_subscription = props.subscription;
    const topicTags = props.topics
      .filter(topic => {
        return topic.subscriptions_ids.includes(current_subscription.uuid)
      })
      .map(topic => <TopicTag key={topic.uuid} topic={topic}/>);

    if (!props.isFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
      props.fetchMoreItems()
    }

    content =
      <div className="flex flex-col w-full">
        <div className="sticky top-0 z-10 bg-white flex flex-row justify-between align-top w-full">
          <div className="flex items-start">
            <CustomButton
              text={""}
              icon={IconForButton.menu}
              relatedModalId={LATERAL_MENU_ID}
              showOnlyOnMobile={true}
              clickAction={() => {
              }}/>
          </div>
          <div className="flex flex-row">
            <img className="h-12 p-1 rounded" src={current_subscription.thumbnail}
                 alt={current_subscription.name + " icon"}/>
            <h1 onClick={() => window.open(current_subscription.url, "_blank")}
                className="text-2xl md:text-4xl font-bold text-gray-800 cursor-pointer hover:underline">
              {current_subscription.name}
            </h1>
          </div>
          <div className="flex">
            <div className="dropdown dropdown-end">
              <CustomButton
                text={""}
                icon={IconForButton.options}
                relatedModalId={undefined}
                clickAction={() => {
                }}/>
              <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-box w-52 gap-2">
                <CustomButton
                  text={"Add to Topic"}
                  icon={IconForButton.add}
                  relatedModalId={AssignTopicModalId}
                  clickAction={async () => {
                  }}/>
                <CustomButton
                  text={"Filter items"}
                  icon={IconForButton.funnel}
                  relatedModalId={FilterOptionsModalId}
                  clickAction={async () => {
                  }}/>
                <CustomButton
                  text={"Refresh"}
                  icon={IconForButton.refresh}
                  relatedModalId={undefined}
                  clickAction={
                    async () => {
                      refreshSubscription(current_subscription.uuid).then(() => {
                        props.refreshSubscriptions()
                      })
                    }
                  }/>
              </ul>
            </div>
          </div>
        </div>
        {!props.subscription.isBeingScanned &&
            <div>
                <div>
                  {topicTags}
                </div>
                <div className="flex flex-row flex-wrap m-6">
                  {cards}
                </div>
            </div>
        }
        {props.subscription.isBeingScanned &&
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
                <span>Fetching items for {props.subscription.name}...</span>
            </div>
        }
        {props.isLoading &&
            <div className="flex justify-center items-center">
                <button className="btn btn-sm btn-ghost loading">loading</button>
            </div>
        }
        {props.isFinished &&
            <div className="flex justify-center items-center">
                <button className="btn btn-sm btn-ghost">No more items to show</button>
            </div>
        }
      </div>
  }

  return content;
}

export default SubscriptionVideoCardGrid;
