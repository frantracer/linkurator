import ContentItemCard from "./ContentItemCard";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {Topic, topicSorting} from "../../entities/Topic";
import React, {useEffect, useRef} from "react";
import {Filters, isItemShown} from "../../entities/Filters";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import EmptyStateBox from "../atoms/EmptyStateBox";
import EndOfList from "../atoms/EndOfList";
import ItemCardSkeleton from "./ItemCardSkeleton";
import ALink from "../atoms/ALink";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";
import TagsRow from "../atoms/TagsRow";
import {paths} from "../../configuration";
import useSet from "../../hooks/useSet";
import {useTranslations} from "next-intl";
import useItemInteraction from "../../hooks/useItemInteraction";
import {CONTENT_GRID_STYLE} from "../../utilities/contentGrid";

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
  filterBar?: React.ReactNode;
  emptyState?: React.ReactNode;
  stripLeading?: React.ReactNode;
}

const SKELETON_COUNT = 8;

export const ContentItemCardGridSkeleton = () => (
  <div style={CONTENT_GRID_STYLE} aria-busy="true">
    {Array.from({length: SKELETON_COUNT}).map((_, index) => <ItemCardSkeleton key={index}/>)}
  </div>
);

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
    topics = null,
    filterBar = null,
    emptyState = null,
    stripLeading = null,
  }: ContentItemCardGridProps
) => {
  const {set: invalidCards, add: addInvalidCard} = useSet<string>();
  const t = useTranslations("common");
  const {onChangeSwapButton} = useItemInteraction();
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = [];

  const handleGridScroll = (event: React.UIEvent<HTMLDivElement>) => {
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
        <ContentItemCard
            key={item.uuid}
            item={item}
            providers={providers}
            withSubscription={withSubscription}
            withInteractions={showInteractions}
            onChange={() => refreshItem(item.uuid)}
            onChangeSwapButton={onChangeSwapButton}
            addInvalidCard={addInvalidCard}
          />
      );
    }
  }

  const sortedSubscriptions = subscriptions ? [...subscriptions].sort(subscriptionSorting) : [];
  const sortedTopics = topics ? [...topics].sort(topicSorting) : [];
  const showTagsRow = stripLeading !== null || sortedSubscriptions.length > 0 || sortedTopics.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-base-300">
      {showTagsRow &&
          <TagsRow leading={stripLeading}>
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
          </TagsRow>
      }
      {filterBar}
      <div ref={containerRef} onScroll={handleGridScroll} className="flex-1 min-h-0 overflow-auto flex flex-col pb-mobile-nav">
        {isBeingScanned &&
            <div className="flex items-center justify-center h-full">
                <FlexRow position={"center"}>
                    <Spinner/>
                    <span>{t("downloading_content", {title: scanningEntityName})}</span>
                </FlexRow>
            </div>
        }
        {!isBeingScanned && cards.length > 0 &&
            <div style={CONTENT_GRID_STYLE}>
              {cards}
            </div>
        }
        {!isBeingScanned && isLoading && cards.length === 0 && <ContentItemCardGridSkeleton/>}
        {!isBeingScanned && isLoading && cards.length > 0 &&
            <div className="flex flex-row items-center justify-center gap-2 py-6 text-sm text-base-content/60" role="status">
                <span className="loading loading-spinner loading-sm"/>
                <span>{t("loading_more")}</span>
            </div>
        }
        {!isBeingScanned && isFinished && !isLoading && cards.length === 0 &&
          (emptyState ?? <EmptyStateBox title={t("no_content_yet_title")} message={t("no_content_yet_message")}/>)
        }
        {!isBeingScanned && isFinished && !isLoading && cards.length > 0 &&
            <EndOfList text={t("all_caught_up")}/>
        }
      </div>
    </div>
  );
}

export default ContentItemCardGrid;
