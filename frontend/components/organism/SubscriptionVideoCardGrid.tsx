import VideoCard from "./VideoCard";
import {Subscription} from "../../entities/Subscription";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {Topic} from "../../entities/Topic";
import React from "react";
import {Filters, isItemShown} from "../../entities/Filters";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import Link from "next/link";
import {paths} from "../../configuration";
import Tag from "../atoms/Tag";

type SubscriptionVideoCardGridProps = {
  refreshItem: (itemId: string) => void,
  fetchMoreItems: () => void,
  topics: Topic[];
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
  filters: Filters;
  isLoading: boolean;
  isFinished: boolean;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void,
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
      .map(topic => {
          return (
            <Tag key={topic.uuid}>
              <Link href={paths.TOPICS + "/" + topic.uuid} scroll={false}>
                {topic.name}
              </Link>
            </Tag>
          )
        }
      );

    if (!props.isFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
      props.fetchMoreItems()
    }

    content =
      <main onScroll={props.handleScroll} className="flex flex-col w-full overflow-auto">
        {!props.subscription.isBeingScanned &&
            <div>
                <div className="flex flex-row flex-wrap m-2 gap-2">
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
      </main>
  }

  return content;
}

export default SubscriptionVideoCardGrid;
