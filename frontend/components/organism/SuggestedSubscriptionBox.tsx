import React from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Subscription} from "../../entities/Subscription";
import {Topic, topicSorting} from "../../entities/Topic";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import Dropdown from "../atoms/Dropdown";
import FilterChip from "../atoms/FilterChip";
import {AddIcon, RectangleGroup} from "../atoms/Icons";
import Checkbox from "../atoms/Checkbox";
import DropdownOptionRow from "../molecules/DropdownOptionRow";

type SuggestedSubscriptionBoxProps = {
  subscription: Subscription;
  providerIcon: string;
  providerName: string;
  alsoInTopicNames: string[];
  userTopics: Topic[];
  matchingUserTopicId: string | null;
  isPending: boolean;
  onFollow: (subscription: Subscription) => void;
  onToggleTopic: (subscription: Subscription, topic: Topic, isAssigned: boolean) => void;
}

const SuggestedSubscriptionBox = (
  {
    subscription,
    providerIcon,
    providerName,
    alsoInTopicNames,
    userTopics,
    matchingUserTopicId,
    isPending,
    onFollow,
    onToggleTopic,
  }: SuggestedSubscriptionBoxProps
) => {
  const t = useTranslations("common");

  // The user topic sharing the most subscriptions with the curator topic goes first
  const sortedUserTopics = [...userTopics].sort((a, b) => {
    if (a.uuid === matchingUserTopicId) {
      return -1;
    }
    if (b.uuid === matchingUserTopicId) {
      return 1;
    }
    return topicSorting(a, b);
  });

  const assignedTopicsCount = userTopics
    .filter(topic => topic.subscriptions_ids.includes(subscription.uuid))
    .length;
  const topicsLabel = assignedTopicsCount === 0
    ? t("add_to_topic")
    : t("in_topics_count", {count: assignedTopicsCount});

  return (
    <article className="flex flex-col gap-3 p-3 rounded-lg border border-neutral bg-base-100">
      <div className="flex items-start gap-3 min-w-0">
        <Avatar src={subscription.thumbnail} alt="" badgeImage={providerIcon}/>
        <div className="flex flex-col min-w-0">
          <Link href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
                className="text-sm font-semibold break-words hover:underline">{subscription.name}</Link>
          <span className="text-xs text-base-content/60 break-words">
            {providerName}
            {alsoInTopicNames.length > 0 && " · " + t("also_in_topics", {topics: alsoInTopicNames.join(", ")})}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
        {sortedUserTopics.length > 0 ? (
          <Dropdown label={t("add_to_topic")} width="medium" position="start"
                    fitAvailableSpace={true}
                    button={<FilterChip active={assignedTopicsCount > 0}><RectangleGroup/>{topicsLabel}</FilterChip>}>
            {sortedUserTopics.map(topic => (
              <li key={topic.uuid}>
                <DropdownOptionRow>
                  <Checkbox small={true} checked={topic.subscriptions_ids.includes(subscription.uuid)}
                            onChange={(isAssigned) => onToggleTopic(subscription, topic, isAssigned)}/>
                  <span className="flex-1 min-w-0 break-words">{topic.name}</span>
                </DropdownOptionRow>
              </li>
            ))}
          </Dropdown>
        ) : <span/>}
        <Button disabled={isPending} clickAction={() => onFollow(subscription)}>
          <AddIcon/>
          {t("follow")}
        </Button>
      </div>
    </article>
  );
};

export default SuggestedSubscriptionBox;
