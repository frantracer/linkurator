import VideoCard from "./VideoCard";
import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {Topic} from "../entities/Topic";
import React from "react";
import CustomButton, {IconForButton} from "./CustomButton";
import {AssignTopicModalId} from "./AssignTopicModal";
import {LATERAL_MENU_ID} from "../utilities/hideLateralMenu";
import {Filters, isItemShown} from "../entities/Filters";
import {FilterOptionsModalId} from "./FilterOptionsModal";
import {refreshSubscription} from "../services/subscriptionService";
import TopicTag from "./TopicTag";
import {ITEMS_PER_PAGE} from "../utilities/constants";

type SubscriptionVideoCardGridProps = {
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

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget
    if (props.isFinished || props.isLoading) {
      return
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      props.fetchMoreItems()
    }
  }

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
      <div onScroll={handleGridScroll} className="drawer-content">
        <div className="w-full">
          <div className="sticky top-0 z-10 bg-white flex flex-row justify-between">
            <div className="flex-none">
              <CustomButton
                text={""}
                icon={IconForButton.menu}
                relatedModalId={LATERAL_MENU_ID}
                showOnlyOnMobile={true}
                clickAction={() => {
                }}/>
            </div>
            <div className="flex items-center flex-row">
              <img className="h-12 mx-1 my-1 mb-2 rounded" src={current_subscription.thumbnail} alt={current_subscription.name + " icon"} />
              <h1 onClick={() => window.open(current_subscription.url, "_blank")}
                  className="text-2xl md:text-4xl font-bold text-gray-800 cursor-pointer hover:underline">
                {current_subscription.name}
              </h1>
            </div>
            <div className="flex-none items-end">
              <div className="dropdown dropdown-end">
                <CustomButton
                  text={""}
                  icon={IconForButton.options}
                  relatedModalId={undefined}
                  clickAction={() => {
                  }}/>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
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
                      clickAction={async () => {
                        await refreshSubscription(current_subscription.uuid)
                      }}/>
                </ul>
              </div>
            </div>
          </div>
          {topicTags}
          <div className="flex flex-row flex-wrap m-6">
            {cards}
          </div>
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
      </div>
  }

  return content;
}

export default SubscriptionVideoCardGrid;
