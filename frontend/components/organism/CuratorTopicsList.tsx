import React from "react";
import {Topic} from "../../entities/Topic";
import {useTranslations} from "next-intl";
import EntityList from "./EntityList";
import TopicCard from "./TopicCard";
import {useFavoriteTopics} from "../../hooks/useFavoriteTopics";
import useTopicListGroups from "../../hooks/useTopicListGroups";
import {followTopic, unfollowTopic} from "../../services/topicService";

type CuratorTopicsListProps = {
  topics: Topic[];
  showFilterBar: boolean;
  filterText: string;
  onFilterTextChange: (value: string) => void;
  isUserLoggedIn: boolean;
  isLoading: boolean;
  refreshTopics: () => void;
}

const CuratorTopicsList = (
  {
    topics,
    showFilterBar,
    filterText,
    onFilterTextChange,
    isUserLoggedIn,
    isLoading,
    refreshTopics,
  }: CuratorTopicsListProps
) => {
  const t = useTranslations("common");
  const {toggleFavorite} = useFavoriteTopics();

  const handleToggleFavorite = (topic: Topic) => {
    toggleFavorite(topic.uuid, topic.is_favorite).then(() => refreshTopics());
  }

  const handleFollow = (topic: Topic) => {
    followTopic(topic.uuid).then(() => refreshTopics());
  }

  const handleUnfollow = (topic: Topic) => {
    unfollowTopic(topic.uuid).then(() => refreshTopics());
  }

  const renderCard = (topic: Topic) => (
    <TopicCard
      key={topic.uuid}
      topic={topic}
      onToggleFavorite={handleToggleFavorite}
      onFollow={isUserLoggedIn ? handleFollow : undefined}
      onUnfollow={isUserLoggedIn ? handleUnfollow : undefined}
    />
  );

  const {facets, sections} = useTopicListGroups(topics, filterText, renderCard);

  return (
    <EntityList
      showFilterBar={showFilterBar}
      filterPlaceholder={t("filter_topics_placeholder")}
      filterText={filterText}
      onFilterTextChange={onFilterTextChange}
      facets={facets}
      totalCount={topics.length}
      isLoading={isLoading}
      emptyState={<p className="py-10 text-center text-sm text-base-content/60">{t("no_topics_found")}</p>}
      sections={sections}
    />
  );
};

export default CuratorTopicsList;
