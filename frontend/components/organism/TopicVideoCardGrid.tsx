import VideoCard from "./VideoCard";
import {Topic} from "../../entities/Topic";
import React from "react";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {Subscription} from "../../entities/Subscription";
import {Filters, isItemShown} from "../../entities/Filters";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {InfoBanner} from "../atoms/InfoBanner";

type TopicVideoCardGridProps = {
  fetchMoreItems: () => void,
  refreshItem: (itemId: string) => void,
  topic: Topic | null;
  items: SubscriptionItem[];
  subscriptions: Subscription[];
  filters: Filters;
  isLoading: boolean;
  topicIsFinished: boolean;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void,
  isTopicBeingScanned: boolean,
  displayInteractions: boolean
}

const TopicVideoCardGrid = (props: TopicVideoCardGridProps) => {
  const cards = [];

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
              withInteractions={props.displayInteractions}
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
      {props.isTopicBeingScanned &&
          <div className="flex items-center justify-center h-screen">
              <FlexRow position={"center"}>
                  <Spinner/>
                  <span>Descargando contenido de {props.topic?.name}...</span>
              </FlexRow>
          </div>
      }
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
        justify-items-center justify-content-center">
        {cards}
      </div>
      {!props.isTopicBeingScanned && props.isLoading &&
          <FlexRow position={"center"}>
              <Spinner/>
              <span>{"Cargando..."}</span>
          </FlexRow>
      }
      {!props.isTopicBeingScanned && props.topicIsFinished && !props.isLoading &&
          <FlexRow position={"center"}>
              <InfoBanner>{"No hay más contenido que mostrar"}</InfoBanner>
          </FlexRow>
      }
    </main>
  )
}

export default TopicVideoCardGrid;
