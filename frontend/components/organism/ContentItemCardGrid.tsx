import ContentItemCard from "./ContentItemCard";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {Topic, topicSorting} from "../../entities/Topic";
import React, {useEffect, useRef} from "react";
import {Filters, isItemShown} from "../../entities/Filters";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {InfoBanner} from "../atoms/InfoBanner";
import ALink from "../atoms/ALink";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";
import {paths} from "../../configuration";
import useSet from "../../hooks/useSet";
import {useTranslations} from "next-intl";
import useItemInteraction from "../../hooks/useItemInteraction";

type ContentItemCardGridProps = {
  refreshItem: (itemId: string) => void;
  fetchMoreItems: () => void;
  items: SubscriptionItem[];
  providers: Provider[];
  showInteractions: boolean;
  isLoading: boolean;
  isFinished: boolean;
  filters?: Filters;
  isBeingScanned?: boolean;
  scanningEntityName?: string;
  withSubscription?: boolean;
  subscriptions?: Subscription[] | null;
  topics?: Topic[] | null;
}

const ContentItemCardGrid = (
  {
    refreshItem,
    fetchMoreItems,
    items,
    providers,
    showInteractions,
    isLoading,
    isFinished,
    filters,
    isBeingScanned = false,
    scanningEntityName = "",
    withSubscription = true,
    subscriptions = null,
    topics = null
  }: ContentItemCardGridProps
) => {
  const {set: invalidCards, add: addInvalidCard} = useSet<string>();
  const t = useTranslations("common");
  const {onChangeSwapButton} = useItemInteraction();
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
          <ContentItemCard
            item={item}
            providers={providers}
            withSubscription={withSubscription}
            withInteractions={showInteractions}
            onChange={() => refreshItem(item.uuid)}
            onChangeSwapButton={onChangeSwapButton}
            addInvalidCard={addInvalidCard}
          />
        </div>
      );
    }
  }

  const sortedSubscriptions = subscriptions ? [...subscriptions].sort(subscriptionSorting) : [];
  const sortedTopics = topics ? [...topics].sort(topicSorting) : [];
  const showTagsRow = sortedSubscriptions.length > 0 || sortedTopics.length > 0;

  return (
    <main ref={containerRef} onScroll={handleGridScroll} className="flex flex-col h-full w-full overflow-auto bg-base-300">
      {showTagsRow &&
          <div className="shrink-0 flex flex-row flex-nowrap md:flex-wrap gap-2 p-2 overflow-x-auto md:overflow-visible scrollbar-hide border-b-[1px] border-neutral">
            {sortedSubscriptions.map(subscription => (
              <Tag key={subscription.uuid}>
                <ALink href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}>
                  <div className="flex flex-row items-center gap-1 whitespace-nowrap">
                    <Miniature src={subscription.thumbnail} alt={subscription.name} badgeImage={getProviderIcon(providers, subscription.provider)}/>
                    {subscription.name}
                  </div>
                </ALink>
              </Tag>
            ))}
            {sortedTopics.map(topic => (
              <Tag key={topic.uuid}>
                <ALink href={paths.TOPICS + "/" + topic.uuid}>
                  <div className="flex flex-row items-center gap-1 whitespace-nowrap">
                    {!topic.is_owner &&
                      <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
                    }
                    {topic.name}
                  </div>
                </ALink>
              </Tag>
            ))}
          </div>
      }
      {isBeingScanned &&
          <div className="flex items-center justify-center h-full">
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
          <div className={"flex items-center justify-center h-full"}>
              <Spinner/>
              <span>{t("loading")}</span>
          </div>
      }
      {!isBeingScanned && isFinished && !isLoading &&
          <div className={"flex items-center justify-center h-full"}>
              <InfoBanner>{t("no_more_content")}</InfoBanner>
          </div>
      }
    </main>
  );
}

export default ContentItemCardGrid;
