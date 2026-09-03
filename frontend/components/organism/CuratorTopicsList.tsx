import React from "react";
import {Topic} from "../../entities/Topic";
import {useTranslations} from "next-intl";
import FlexRow from "../atoms/FlexRow";
import {InfoBanner} from "../atoms/InfoBanner";
import {Spinner} from "../atoms/Spinner";
import TopicCard from "./TopicCard";
import {useFavoriteTopics} from "../../hooks/useFavoriteTopics";
import {followTopic, unfollowTopic} from "../../services/topicService";

type CuratorTopicsListProps = {
  topics: Topic[];
  isUserLoggedIn: boolean;
  isLoading: boolean;
  refreshTopics: () => void;
}

const CuratorTopicsList = (
  {
    topics,
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

  return (
    <div className="w-full">
      {isLoading && (
        <FlexRow position={"center"}>
          <Spinner/>
          <span>{t("loading")}</span>
        </FlexRow>
      )}
      {!isLoading && topics.length === 0 && (
        <div className={"flex flex-col items-center space-y-2"}>
          <InfoBanner>
            <span className="text-sm">{t("no_topics_found")}</span>
          </InfoBanner>
        </div>
      )}
      {!isLoading && topics.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4 justify-items-center">
          {topics.map((topic) => (
            <TopicCard
              key={topic.uuid}
              topic={topic}
              onToggleFavorite={handleToggleFavorite}
              onFollow={isUserLoggedIn ? handleFollow : undefined}
              onUnfollow={isUserLoggedIn ? handleUnfollow : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CuratorTopicsList;
