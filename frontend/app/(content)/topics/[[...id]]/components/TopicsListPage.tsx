'use client';

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {AddIcon, RectangleGroup} from "../../../../../components/atoms/Icons";
import ConfirmDialog from "../../../../../components/organism/ConfirmDialog";
import EmptyStateNoTopics from "../../../../../components/organism/EmptyStateNoTopics";
import EntityListLayout from "../../../../../components/organism/EntityListLayout";
import TopicCard from "../../../../../components/organism/TopicCard";
import TopicEditorModal, {EditTopicModalId, NewTopicModalId} from "../../../../../components/organism/TopicEditorModal";
import {Topic} from "../../../../../entities/Topic";
import {useFavoriteTopics} from "../../../../../hooks/useFavoriteTopics";
import useProfile from "../../../../../hooks/useProfile";
import useProviders from "../../../../../hooks/useProviders";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import useTopicListGroups from "../../../../../hooks/useTopicListGroups";
import {useTopics} from "../../../../../hooks/useTopics";
import {deleteTopic, followTopic, unfollowTopic} from "../../../../../services/topicService";
import {openModal} from "../../../../../utilities/modalAction";
import {flushSync} from "react-dom";
import {useToast} from "../../../../../contexts/ToastContext";

const DeleteTopicDialogId = "delete-topic-dialog";

const TopicsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {providers} = useProviders();
  const {toggleFavorite} = useFavoriteTopics();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [filterText, setFilterText] = useState("");
  const {showToast} = useToast();

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

  const {facets, sections} = useTopicListGroups(topics, filterText, renderCard);

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
        facets={facets}
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
