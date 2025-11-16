import VideoCard from "./VideoCard";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import React from "react";
import {Filters, isItemShown} from "../../entities/Filters";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {InfoBanner} from "../atoms/InfoBanner";
import useSet from "../../hooks/useSet";
import {useTranslations} from "next-intl";

type VideoCardGridProps = {
  refreshItem: (itemId: string) => void;
  fetchMoreItems: () => void;
  items: SubscriptionItem[];
  showInteractions: boolean;
  isLoading: boolean;
  isFinished: boolean;
  filters?: Filters;
  isBeingScanned?: boolean;
  scanningEntityName?: string;
  withSubscription?: boolean;
}

const VideoCardGrid = (props: VideoCardGridProps) => {
  const {set: invalidCards, add: addInvalidCard} = useSet<string>();
  const t = useTranslations("common");
  const cards = [];

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    if (props.isFinished || props.isLoading) {
      return;
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      props.fetchMoreItems();
    }
  };

  for (let i = 0; i < props.items.length; i++) {
    const item = props.items[i];
    const shouldShowItem = props.filters ? isItemShown(item, props.filters) : true;

    if (shouldShowItem && !invalidCards.has(item.uuid)) {
      cards.push(
        <div className="m-4" key={item.uuid}>
          <VideoCard
            item={item}
            withSubscription={props.withSubscription}
            withInteractions={props.showInteractions}
            onChange={() => props.refreshItem(item.uuid)}
            addInvalidCard={addInvalidCard}
          />
        </div>
      );
    }
  }

  if (!props.isFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
    props.fetchMoreItems()
  }

  return (
    <main onScroll={handleGridScroll} className="flex flex-col w-full overflow-auto">
      {props.isBeingScanned &&
        <div className="flex items-center justify-center h-dvh">
          <FlexRow position={"center"}>
            <Spinner/>
            <span>{t("downloading_content", {title: props.scanningEntityName})}</span>
          </FlexRow>
        </div>
      }
      {!props.isBeingScanned &&
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
          justify-items-center justify-content-center">
          {cards}
        </div>
      }
      {!props.isBeingScanned && props.isLoading &&
        <FlexRow position={"center"}>
          <Spinner/>
          <span>{t("loading")}</span>
        </FlexRow>
      }
      {!props.isBeingScanned && props.isFinished && !props.isLoading &&
        <FlexRow position={"center"}>
          <InfoBanner>{t("no_more_content")}</InfoBanner>
        </FlexRow>
      }
    </main>
  );
}

export default VideoCardGrid;
