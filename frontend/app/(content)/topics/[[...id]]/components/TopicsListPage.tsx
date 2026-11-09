'use client';

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {AddIcon, RectangleGroup, StarIcon} from "../../../../../components/atoms/Icons";
import ConfirmDialog from "../../../../../components/organism/ConfirmDialog";
import EmptyStateNoTopics from "../../../../../components/organism/EmptyStateNoTopics";
import EntityListLayout, {EntityListFacet, EntityListSection} from "../../../../../components/organism/EntityListLayout";
import TopicCard from "../../../../../components/organism/TopicCard";
import TopicEditorModal, {EditTopicModalId, NewTopicModalId} from "../../../../../components/organism/TopicEditorModal";
import {Topic} from "../../../../../entities/Topic";
import {useFavoriteTopics} from "../../../../../hooks/useFavoriteTopics";
import useProfile from "../../../../../hooks/useProfile";
import useProviders from "../../../../../hooks/useProviders";
import useSearchParam from "../../../../../hooks/useSearchParam";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import {deleteTopic, followTopic, unfollowTopic} from "../../../../../services/topicService";
import {openModal} from "../../../../../utilities/modalAction";
import {flushSync} from "react-dom";
import {useToast} from "../../../../../contexts/ToastContext";

const DeleteTopicDialogId = "delete-topic-dialog";
const TOPICS_FACET_PARAM = "show";

type TopicsFacet = "favorites" | "mine" | "following";

const TOPICS_FACETS: TopicsFacet[] = ["favorites", "mine", "following"];

const parseTopicsFacet = (value: string | null): TopicsFacet | null => {
  if (value === "favorites" || value === "mine" || value === "following") {
    return value;
  }
  return null;
}

// Every topic belongs to exactly one facet, so the facet counts add up to the total
const belongsToFacet = (topic: Topic, facet: TopicsFacet): boolean => {
  switch (facet) {
    case "favorites":
      return topic.is_favorite;
    case "mine":
      return topic.is_owner && !topic.is_favorite;
    case "following":
      return !topic.is_owner && !topic.is_favorite;
  }
}

const TopicsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {providers} = useProviders();
  const {toggleFavorite} = useFavoriteTopics();
  const {value: facetParam, setValue: setFacetParam} = useSearchParam(TOPICS_FACET_PARAM);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [filterText, setFilterText] = useState("");
  const {showToast} = useToast();

  const selectedFacet = parseTopicsFacet(facetParam);

  const handleToggleFavorite = (topic: Topic) => {
    toggleFavorite(topic.uuid, topic.is_favorite);
  }

  const handleEditTopic = (topic: Topic) => {
    flushSync(() => setEditingTopic(topic));
    openModal(EditTopicModalId);
  }

  const handleDeleteTopic = (topic: Topic) => {
    setDeletingTopic(topic);
    openModal(DeleteTopicDialogId);
  }

  const handleFollowTopic = (topic: Topic) => {
    followTopic(topic.uuid).then(() => refreshTopics());
  }

  const handleUnfollowTopic = (topic: Topic) => {
    unfollowTopic(topic.uuid).then(() => refreshTopics());
    showToast(t("topic_unfollowed"), topic.name, () => {
      followTopic(topic.uuid).then(() => refreshTopics());
    });
  }

  const confirmDeleteTopic = async () => {
    if (deletingTopic) {
      await deleteTopic(deletingTopic.uuid);
      setDeletingTopic(null);
      refreshTopics();
    }
  }

  const renderCard = (topic: Topic) => (
    <TopicCard
      key={topic.uuid}
      topic={topic}
      onToggleFavorite={handleToggleFavorite}
      onEdit={topic.is_owner ? handleEditTopic : undefined}
      onDelete={topic.is_owner ? handleDeleteTopic : undefined}
      onFollow={!topic.is_owner ? handleFollowTopic : undefined}
      onUnfollow={!topic.is_owner ? handleUnfollowTopic : undefined}
    />
  );

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredTopics = normalizedFilter === ""
    ? topics
    : topics.filter(topic => topic.name.toLowerCase().includes(normalizedFilter));

  const facetDetails: Record<TopicsFacet, { title: string, icon: React.ReactNode }> = {
    favorites: {title: t("favorites"), icon: <StarIcon/>},
    mine: {title: t("my_topics"), icon: <RectangleGroup/>},
    following: {title: t("following"), icon: <RectangleGroup/>},
  };

  const sections: EntityListSection[] = TOPICS_FACETS
    .filter(facet => selectedFacet === null || facet === selectedFacet)
    .map(facet => ({
      key: facet,
      title: facetDetails[facet].title,
      icon: facetDetails[facet].icon,
      items: filteredTopics.filter(topic => belongsToFacet(topic, facet)).map(renderCard),
    }));

  const facetOptions: EntityListFacet[] = TOPICS_FACETS.map(facet => ({
    key: facet,
    label: facetDetails[facet].title,
    icon: facet === "favorites" ? facetDetails[facet].icon : undefined,
    count: topics.filter(topic => belongsToFacet(topic, facet)).length,
  }));

  return (
    <>
      <EntityListLayout
        title={t("topics")}
        icon={<RectangleGroup/>}
        subtitle={t("topics_count", {count: topics.length})}
        discoverFilter="topics"
        mainAction={profile ? {label: t("create"), icon: <AddIcon/>, onClick: () => openModal(NewTopicModalId)} : undefined}
        filterPlaceholder={t("filter_topics_placeholder")}
        filterText={filterText}
        onFilterTextChange={setFilterText}
        facets={{options: facetOptions, selected: selectedFacet, onSelect: setFacetParam}}
        totalCount={topics.length}
        isLoading={topicsAreLoading}
        emptyState={profile ? <EmptyStateNoTopics/> : null}
        sections={sections}
      />

      {editingTopic && (
        <TopicEditorModal
          topic={editingTopic}
          subscriptions={subscriptions}
          providers={providers}
          onSaved={() => {
            refreshTopics();
            refreshSubscriptions();
          }}
        />
      )}

      <ConfirmDialog
        id={DeleteTopicDialogId}
        title={t("delete_topic_confirmation")}
        message={t("delete_topic_confirmation_message")}
        confirmLabel={t("delete")}
        errorMessage={t("delete_topic_failed")}
        onConfirm={confirmDeleteTopic}
      />
    </>
  );
}

export default TopicsListPageComponent;
