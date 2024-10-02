import VideoCard from "./VideoCard";
import {Subscription} from "../../entities/Subscription";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {Topic} from "../../entities/Topic";
import React from "react";
import {Filters, isItemShown} from "../../entities/Filters";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {InfoBanner} from "../atoms/InfoBanner";

type SubscriptionVideoCardGridProps = {
  refreshItem: (itemId: string) => void,
  fetchMoreItems: () => void,
  topics: Topic[];
  subscription: Subscription | null;
  items: SubscriptionItem[];
  filters: Filters;
  showInteractions: boolean;
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
              withInteractions={props.showInteractions}
              onChange={() => props.refreshItem(item.uuid)}
            />
          </div>
        );
      }
    }

    if (!props.isFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
      props.fetchMoreItems()
    }

    content =
      <main onScroll={props.handleScroll} className="flex flex-col w-full overflow-auto">
        {!props.subscription.isBeingScanned &&
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
                justify-items-center justify-content-center">
              {cards}
            </div>
        }
        {props.subscription.isBeingScanned &&
            <div className="flex items-center justify-center h-screen">
                <FlexRow position={"center"}>
                    <Spinner/>
                    <span>Descargando contenido de {props.subscription.name}...</span>
                </FlexRow>
            </div>
        }
        {!props.subscription.isBeingScanned && props.isLoading &&
            <FlexRow position={"center"}>
                <Spinner/>
                <span>{"Cargando..."}</span>
            </FlexRow>
        }
        {!props.subscription.isBeingScanned && props.isFinished && !props.isLoading &&
            <FlexRow position={"center"}>
                <InfoBanner>{"No hay más contenido que mostrar"}</InfoBanner>
            </FlexRow>
        }
      </main>
  }

  return content;
}

export default SubscriptionVideoCardGrid;
