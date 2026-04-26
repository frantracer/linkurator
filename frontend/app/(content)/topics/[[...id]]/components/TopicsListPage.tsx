'use client';

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import {InfoBanner} from "../../../../../components/atoms/InfoBanner";
import {AddIcon, MagnifyingGlassIcon, RectangleGroup, StarIcon} from "../../../../../components/atoms/Icons";
import SearchBar from "../../../../../components/molecules/SearchBar";
import TopTitle from "../../../../../components/molecules/TopTitle";
import EditTopicModal, {EditTopicModalId} from "../../../../../components/organism/EditTopicModal";
import {FindTopicModalId} from "../../../../../components/organism/FindTopicModal";
import {NewTopicModalId} from "../../../../../components/organism/NewTopicModal";
import TopicCard from "../../../../../components/organism/TopicCard";
import {Topic} from "../../../../../entities/Topic";
import {useFavoriteTopics} from "../../../../../hooks/useFavoriteTopics";
import useProfile from "../../../../../hooks/useProfile";
import useProviders from "../../../../../hooks/useProviders";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import {openModal} from "../../../../../utilities/modalAction";
import {flushSync} from "react-dom";

const TopicsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {providers} = useProviders();
  const {toggleFavorite} = useFavoriteTopics();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [filterText, setFilterText] = useState("");

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredTopics = normalizedFilter === ""
    ? topics
    : topics.filter(topic => topic.name.toLowerCase().includes(normalizedFilter));

  const favoriteTopics = filteredTopics.filter(topic => topic.is_favorite);
  const myTopics = filteredTopics.filter(topic => topic.is_owner && !topic.is_favorite);
  const otherTopics = filteredTopics.filter(topic => !topic.is_owner && !topic.is_favorite);

  const handleToggleFavorite = (topic: Topic) => {
    toggleFavorite(topic.uuid, topic.is_favorite);
  }

  const handleEditTopic = (topic: Topic) => {
    flushSync(() => setEditingTopic(topic));
    openModal(EditTopicModalId);
  }

  const openDiscoverModal = () => openModal(FindTopicModalId);
  const openNewModal = () => openModal(NewTopicModalId);

  const renderSection = (title: string, icon: React.ReactNode, sectionTopics: Topic[]) => {
    if (sectionTopics.length === 0) return null;
    return (
      <section className="flex flex-col gap-3">
        <div className="flex flex-row gap-2 items-center">
          {icon}
          <h2 className="text-xl">{title} ({sectionTopics.length})</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 justify-items-center justify-content-center">
          {sectionTopics.map(topic => (
            <TopicCard
              key={topic.uuid}
              topic={topic}
              onToggleFavorite={handleToggleFavorite}
              onEdit={topic.is_owner ? handleEditTopic : undefined}
            />
          ))}
        </div>
      </section>
    );
  }

  const hasAnyTopics = topics.length > 0;

  return (
    <>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0"/>
          <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-2">
            <RectangleGroup/>
            <h1 className="text-xl font-bold truncate">{t("topics")}</h1>
          </div>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>
      <div className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
          <div className="flex flex-row gap-2 w-full items-center">
            <Button fitContent={true} clickAction={openDiscoverModal} primary={false}>
              <MagnifyingGlassIcon/>
              {t("discover")}
            </Button>
            <SearchBar
              placeholder={t("filter_topics_placeholder")}
              value={filterText}
              handleChange={setFilterText}
              icon="filter"
            />
            {profile && (
              <Button fitContent={true} clickAction={openNewModal} primary={false}>
                <AddIcon/>
                {t("create")}
              </Button>
            )}
          </div>

          {!topicsAreLoading && !hasAnyTopics && (
            <InfoBanner>
              <span>{t("no_topics_found")}</span>
            </InfoBanner>
          )}

          {renderSection(t("favorites"), <StarIcon/>, favoriteTopics)}
          {renderSection(t("my_topics"), <RectangleGroup/>, myTopics)}
          {renderSection(t("other_topics"), <RectangleGroup/>, otherTopics)}
        </div>
      </div>

      {editingTopic && (
        <EditTopicModal
          topic={editingTopic}
          subscriptions={subscriptions}
          providers={providers}
          refreshTopics={refreshTopics}
          refreshTopicItems={() => undefined}
          refreshSubscriptions={refreshSubscriptions}
        />
      )}
    </>
  );
}

export default TopicsListPageComponent;
