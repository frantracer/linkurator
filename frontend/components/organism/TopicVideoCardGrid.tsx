import VideoCard from "./VideoCard";
import {Topic} from "../../entities/Topic";
import React from "react";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {Subscription} from "../../entities/Subscription";
import {Filters, isItemShown} from "../../entities/Filters";
import {paths} from "../../configuration";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import Link from "next/link";
import Tag from "../atoms/Tag";
import Miniature from "../atoms/Miniature";

type TopicVideoCardGridProps = {
  fetchMoreItems: () => void,
  refreshItem: (itemId: string) => void,
  topic: Topic | undefined;
  items: SubscriptionItem[];
  subscriptions: Subscription[];
  filters: Filters;
  isLoading: boolean;
  topicIsFinished: boolean;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void,
}

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
        return (
          <Tag key={subscription.uuid}>
            <Miniature src={subscription.thumbnail} alt={subscription.name}/>
            <Link href={paths.SUBSCRIPTIONS + "/" + subscription.uuid} scroll={false}>
              {subscription.name}
            </Link>
          </Tag>
        )
      });

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

    if (!props.topicIsFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
      props.fetchMoreItems()
    }
  }

  return (
    <main onScroll={props.handleScroll} className="flex flex-col w-full overflow-auto">
      <div className="flex flex-row flex-wrap m-2 gap-2">
        {subscriptionTags}
      </div>
      <div className="flex flex-row flex-wrap m-2">
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
    </main>
  )
}

export default TopicVideoCardGrid;
