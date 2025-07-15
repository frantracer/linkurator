import React from "react";
import {Topic} from "../../entities/Topic";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";
import {InfoBanner} from "../atoms/InfoBanner";
import {CrossIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {followTopic, unfollowTopic} from "../../services/topicService";
import {MenuItem} from "../atoms/MenuItem";
import Menu from "../atoms/Menu";
import FlexItem from "../atoms/FlexItem";
import {useRouter} from "next/navigation";
import Tag from "../atoms/Tag";

type CuratorTopicsListProps = {
  topics: Topic[];
  isLoading: boolean;
  refreshTopics: () => void;
}

const CuratorTopicsList = ({topics, isLoading, refreshTopics}: CuratorTopicsListProps) => {
  const router = useRouter()
  const t = useTranslations("common");

  const handleFollowTopic = (topicId: string) => {
    followTopic(topicId).then(() => {
      refreshTopics();
    });
  }

  const handleUnfollowTopic = (topicId: string) => {
    unfollowTopic(topicId).then(() => {
      refreshTopics();
    });
  }

  if (isLoading) {
    return (
      <FlexColumn gap={4}>
        <div className="animate-pulse space-y-2">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="h-12 bg-base-300 rounded-lg"></div>
          ))}
        </div>
      </FlexColumn>
    );
  }

  if (topics.length === 0) {
    return (
      <FlexColumn gap={4}>
        <InfoBanner>
          <span className="text-sm">{t("no_topics_found")}</span>
        </InfoBanner>
      </FlexColumn>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <Menu>
        {topics.map((topic) => (
          <MenuItem key={topic.uuid} onClick={() => router.push(paths.TOPICS + "/" + topic.uuid)}
                    hideMenuOnClick={true}>
            <FlexRow position={"start"}>
              <span className="flex w-full">{topic.name}</span>
              <FlexItem/>
              {topic.followed && !topic.is_owner && (
                <Tag>
                  <span>{t("following")}</span>
                  <div className="hover:cursor-pointer"
                       onClick={(event) => {
                         handleUnfollowTopic(topic.uuid);
                         event.stopPropagation();
                       }}>
                    <CrossIcon/>
                  </div>
                </Tag>
              )}
              {!topic.followed && !topic.is_owner && (
                <Button
                  primary={true}
                  clickAction={() => handleFollowTopic(topic.uuid)}
                >
                  {t("follow")}
                </Button>
              )}
            </FlexRow>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CuratorTopicsList;