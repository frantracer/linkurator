import VideoCard from "./VideoCard";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import React, {useEffect, useRef} from "react";
import {Filters, isItemShown} from "../../entities/Filters";
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

const VideoCardGrid = (
  {
    refreshItem,
    fetchMoreItems,
    items,
    showInteractions,
    isLoading,
    isFinished,
    filters,
    isBeingScanned = false,
    scanningEntityName = "",
    withSubscription = true
  }: VideoCardGridProps
) => {
  const {set: invalidCards, add: addInvalidCard} = useSet<string>();
  const t = useTranslations("common");
  const containerRef = useRef<HTMLElement>(null);
  const cards = [];

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    if (isFinished || isLoading) {
      return;
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreItems();
    }
  };

  // If there's no scrollbar fetch more items
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isFinished || isLoading) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight) {
      fetchMoreItems();
    }
  }, [items.length, isLoading, isFinished, fetchMoreItems]);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const shouldShowItem = filters ? isItemShown(item, filters) : true;

    if (shouldShowItem && !invalidCards.has(item.uuid)) {
      cards.push(
        <div className="m-4" key={item.uuid}>
          <VideoCard
            item={item}
            withSubscription={withSubscription}
            withInteractions={showInteractions}
            onChange={() => refreshItem(item.uuid)}
            addInvalidCard={addInvalidCard}
          />
        </div>
      );
    }
  }

  return (
    <main ref={containerRef} onScroll={handleGridScroll} className="flex flex-col w-full overflow-auto">
      {isBeingScanned &&
          <div className="flex items-center justify-center h-dvh">
              <FlexRow position={"center"}>
                  <Spinner/>
                  <span>{t("downloading_content", {title: scanningEntityName})}</span>
              </FlexRow>
          </div>
      }
      {!isBeingScanned &&
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
          justify-items-center justify-content-center">
            {cards}
          </div>
      }
      {!isBeingScanned && isLoading &&
          <FlexRow position={"center"}>
              <Spinner/>
              <span>{t("loading")}</span>
          </FlexRow>
      }
      {!isBeingScanned && isFinished && !isLoading &&
          <FlexRow position={"center"}>
              <InfoBanner>{t("no_more_content")}</InfoBanner>
          </FlexRow>
      }
    </main>
  );
}

export default VideoCardGrid;
