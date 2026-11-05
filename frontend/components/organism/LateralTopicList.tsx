import {Topic} from "../../entities/Topic";
import Miniature from "../atoms/Miniature";
import NavLink from "../atoms/NavLink";
import TopicIcon from "../atoms/TopicIcon";
import {paths} from "../../configuration";
import React from "react";
import {useTranslations} from "next-intl";

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  onOpenTopic: () => void;
}

const LateralTopicList = ({topics, selectedTopic, onOpenTopic}: LateralTopicListProps) => {
  const t = useTranslations("common");
  const favoriteTopics = topics.filter(topic => topic.is_favorite);

  if (favoriteTopics.length === 0) {
    return null;
  }

  return (
    <nav aria-labelledby="sidebar-favorites-heading" className="flex flex-col gap-0.5">
      <h2 id="sidebar-favorites-heading"
          className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-base-content/60">
        {t("favorites")}
      </h2>
      {favoriteTopics.map(topic => (
        <NavLink
          key={topic.uuid}
          href={paths.TOPICS + "/" + topic.uuid}
          selected={topic.uuid === selectedTopic?.uuid}
          onClick={onOpenTopic}
          icon={<TopicIcon name={topic.name} size={"xs"}/>}
          trailing={!topic.is_owner &&
              <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>}
        >
          {topic.name}
        </NavLink>
      ))}
    </nav>
  )
}

export default LateralTopicList;
