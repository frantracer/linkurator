import React from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {getProviderIcon, getProviderPrettyName} from "../../entities/Provider";
import {Subscription} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import useProviders from "../../hooks/useProviders";
import {RectangleGroup} from "../atoms/Icons";
import FollowToggleButton from "../molecules/FollowToggleButton";
import Miniature from "../atoms/Miniature";
import SuggestedSubscriptionBox from "./SuggestedSubscriptionBox";

type CommonTopicPanelProps = {
  topic: Topic;
  sharedSubscriptions: Subscription[];
  candidates: Subscription[];
  totalSubscriptionsCount: number;
  alsoInTopicNames: Record<string, string[]>;
  userTopics: Topic[];
  matchingUserTopicId: string | null;
  pendingSubscriptionIds: string[];
  onFollow: (subscription: Subscription) => void;
  onToggleTopic: (subscription: Subscription, topic: Topic, isAssigned: boolean) => void;
  onSetTopicFollowed: (topic: Topic, isFollowed: boolean) => void;
}

// What the user and the curator both follow in a curator topic, next to what the user could follow from it
const CommonTopicPanel = (
  {
    topic,
    sharedSubscriptions,
    candidates,
    totalSubscriptionsCount,
    alsoInTopicNames,
    userTopics,
    matchingUserTopicId,
    pendingSubscriptionIds,
    onFollow,
    onToggleTopic,
    onSetTopicFollowed,
  }: CommonTopicPanelProps
) => {
  const t = useTranslations("common");
  const {providers} = useProviders();
  return (
    <section className="rounded-xl border border-neutral bg-base-100">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 border-b border-neutral">
        <RectangleGroup/>
        <Link href={paths.TOPICS + "/" + topic.uuid} className="text-lg font-semibold hover:underline min-w-0 truncate">
          {topic.name}
        </Link>
        <FollowToggleButton followed={topic.followed} isLoggedIn={true} iconOnlyOnMobile={true} primary={false}
                            onFollow={() => onSetTopicFollowed(topic, true)}
                            onUnfollow={() => onSetTopicFollowed(topic, false)}/>
        <div className="flex items-center gap-2">
          <progress className="progress progress-primary w-20" value={sharedSubscriptions.length}
                    max={totalSubscriptionsCount}/>
          <span className="text-xs text-base-content/60 whitespace-nowrap">
            {t("common_overlap", {shared: sharedSubscriptions.length, total: totalSubscriptionsCount})}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="flex flex-col gap-2 px-4 py-3 bg-base-200/50 border-b border-neutral sm:border-b-0 sm:border-r sm:rounded-bl-xl">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">{t("you_both_follow")}</h3>
          <ul className="flex flex-col gap-3 max-h-64 overflow-y-auto overflow-x-hidden pb-2 pr-2">
            {sharedSubscriptions.map(subscription => (
              <li key={subscription.uuid} className="flex items-center gap-2 min-w-0">
                <Miniature src={subscription.thumbnail} alt=""
                           badgeImage={getProviderIcon(providers, subscription.provider)}/>
                <Link href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
                      className="text-sm break-words min-w-0 hover:underline">{subscription.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            {t("new_for_you", {count: candidates.length})}
          </h3>
          {candidates.length === 0
            ? <p className="text-sm text-base-content/60">{t("common_all_followed")}</p>
            : <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3">
              {candidates.map(candidate => (
                <SuggestedSubscriptionBox
                  key={candidate.uuid}
                  subscription={candidate}
                  providerIcon={getProviderIcon(providers, candidate.provider)}
                  providerName={getProviderPrettyName(providers, candidate.provider)}
                  alsoInTopicNames={alsoInTopicNames[candidate.uuid] ?? []}
                  userTopics={userTopics}
                  matchingUserTopicId={matchingUserTopicId}
                  isPending={pendingSubscriptionIds.includes(candidate.uuid)}
                  onFollow={onFollow}
                  onToggleTopic={onToggleTopic}
                />
              ))}
            </div>}
        </div>
      </div>
    </section>
  );
};

export default CommonTopicPanel;
