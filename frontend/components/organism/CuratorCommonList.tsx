import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {CuratorSuggestions} from "../../entities/CuratorSuggestions";
import {Subscription, subscriptionFiltering} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import Button from "../atoms/Button";
import EmptyStateBox from "../atoms/EmptyStateBox";
import {LinkIcon} from "../atoms/Icons";
import EntityCardGridSkeleton from "../molecules/EntityCardGridSkeleton";
import PageFilterBar from "../molecules/PageFilterBar";
import SearchBar from "../molecules/SearchBar";
import CommonTopicPanel from "./CommonTopicPanel";
import EmptyStateNoMatches from "./EmptyStateNoMatches";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {followSubscription, unfollowSubscription} from "../../services/subscriptionService";
import {
  assignSubscriptionToTopic,
  followTopic,
  unassignSubscriptionToTopic,
  unfollowTopic
} from "../../services/topicService";
import {useToast} from "../../contexts/ToastContext";
import {
  curatorRecommendationsPath,
  unfilteredCuratorRecommendations
} from "../../utilities/curatorRecommendationsUrl";

type CuratorCommonListProps = {
  curatorName: string;
  suggestions: CuratorSuggestions;
  showFilterBar: boolean;
  filterText: string;
  onFilterTextChange: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
  refreshSuggestions: () => void;
  refreshTopics: () => void;
  onBrowseSubscriptions: () => void;
}

const CuratorCommonList = (
  {
    curatorName,
    suggestions,
    showFilterBar,
    filterText,
    onFilterTextChange,
    isLoading,
    isError,
    refreshSuggestions,
    refreshTopics,
    onBrowseSubscriptions,
  }: CuratorCommonListProps
) => {
  const t = useTranslations("common");
  const {showToast, showErrorToast} = useToast();
  const {profile, profileIsLoading} = useProfile();
  const {
    topics: userTopics,
    topicsAreLoading: userTopicsAreLoading,
    refreshTopics: refreshUserTopics
  } = useTopics(profile, profileIsLoading);
  const {refreshSubscriptions: refreshUserSubscriptions} = useSubscriptions(profile);
  const [pendingSubscriptionIds, setPendingSubscriptionIds] = useState<string[]>([]);

  const ownedTopics = userTopics.filter(topic => topic.is_owner);
  const subscriptionsById = new Map(suggestions.subscriptions.map(subscription => [subscription.uuid, subscription]));
  const trimmedFilter = filterText.trim();

  const refreshAll = () => {
    refreshUserSubscriptions();
    refreshUserTopics();
  }

  const runPending = async (subscriptions: Subscription[], action: () => Promise<void>) => {
    const ids = subscriptions.map(subscription => subscription.uuid);
    setPendingSubscriptionIds(pendingIds => pendingIds.concat(ids));
    try {
      await action();
    } finally {
      setPendingSubscriptionIds(pendingIds => pendingIds.filter(id => !ids.includes(id)));
    }
  }

  const unfollowAll = (subscriptions: Subscription[]) => runPending(subscriptions, async () => {
    const unfollowed = await Promise.all(subscriptions.map(subscription => unfollowSubscription(subscription.uuid)));
    if (unfollowed.includes(false)) {
      showErrorToast(t("action_failed"));
    }
    refreshAll();
  });

  const followAll = (subscriptions: Subscription[]) => runPending(subscriptions, async () => {
    const results = await Promise.all(subscriptions.map(subscription => followSubscription(subscription.uuid)));
    const followed = subscriptions.filter((_, index) => results[index]);
    const failed = subscriptions.filter((_, index) => !results[index]);
    refreshAll();

    if (failed.length > 0) {
      showErrorToast(t("action_failed"), undefined, () => followAll(failed));
    }
    if (followed.length > 0) {
      showToast(t("subscriptions_followed", {count: followed.length}),
        followed.length === 1 ? followed[0].name : undefined,
        () => unfollowAll(followed));
    }
  });

  const setTopicAssignment = (subscription: Subscription, topic: Topic, isAssigned: boolean, offerUndo: boolean) =>
    runPending([subscription], async () => {
      try {
        await (isAssigned
          ? assignSubscriptionToTopic(topic.uuid, subscription.uuid)
          : unassignSubscriptionToTopic(topic.uuid, subscription.uuid));
        if (offerUndo) {
          showToast(
            isAssigned
              ? t("subscription_added_to_topic", {topic: topic.name})
              : t("subscription_removed_from_topic", {topic: topic.name}),
            subscription.name,
            () => setTopicAssignment(subscription, topic, !isAssigned, false));
        }
      } catch {
        showErrorToast(t("action_failed"), subscription.name,
          () => setTopicAssignment(subscription, topic, isAssigned, offerUndo));
      }
      refreshUserTopics();
    });

  const setTopicFollowed = (topic: Topic, isFollowed: boolean) => {
    (isFollowed ? followTopic(topic.uuid) : unfollowTopic(topic.uuid))
      .then(() => {
        refreshSuggestions();
        refreshTopics();
      })
      .catch(() => showErrorToast(t("action_failed"), topic.name));
  }

  const alsoInTopicNames = (topicId: string): Record<string, string[]> => {
    const names: Record<string, string[]> = {};
    suggestions.topics
      .filter(suggestion => suggestion.topic.uuid !== topicId)
      .forEach(suggestion => suggestion.candidateSubscriptionIds.forEach(subscriptionId => {
        names[subscriptionId] = (names[subscriptionId] ?? []).concat(suggestion.topic.name);
      }));
    return names;
  }

  const resolveSubscriptions = (subscriptionIds: string[]): Subscription[] => subscriptionIds
    .map(subscriptionId => subscriptionsById.get(subscriptionId))
    .filter((subscription): subscription is Subscription => subscription !== undefined);

  const panels = suggestions.topics
    .map(suggestion => ({
      suggestion,
      sharedSubscriptions: resolveSubscriptions(suggestion.sharedSubscriptionIds),
      candidates: resolveSubscriptions(suggestion.candidateSubscriptionIds)
        .filter(subscription => trimmedFilter === "" || subscriptionFiltering(subscription, trimmedFilter)),
    }))
    .filter(panel => trimmedFilter === "" || panel.candidates.length > 0);

  const isEmpty = !isLoading && !isError && suggestions.topics.length === 0;

  return (
    <>
      {showFilterBar && !isEmpty && !isError && (
        <PageFilterBar width="wide">
          <div className="w-full sm:max-w-sm shrink-0">
            <SearchBar placeholder={t("filter_subscriptions_placeholder")} value={filterText}
                       handleChange={onFilterTextChange} icon="filter"/>
          </div>
        </PageFilterBar>
      )}
      <div
        className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] pb-mobile-nav">
        <div className="flex flex-col gap-4 p-4 max-w-5xl w-full mx-auto">
          {isLoading && <EntityCardGridSkeleton/>}

          {!isLoading && isError && (
            <EmptyStateBox title={t("common_suggestions_load_failed")}
                           message={t("common_suggestions_load_failed_message")}>
              <Button clickAction={refreshSuggestions}>{t("retry")}</Button>
            </EmptyStateBox>
          )}

          {isEmpty && (
            <EmptyStateBox icon={<LinkIcon/>} title={t("no_common_subscriptions_title")}
                           message={t("no_common_subscriptions")}>
              <Button primary={false} clickAction={onBrowseSubscriptions}>{t("browse_curator_subscriptions")}</Button>
            </EmptyStateBox>
          )}

          {!isLoading && !isError && !isEmpty && panels.length === 0 && (
            <EmptyStateNoMatches onClearFilters={() => onFilterTextChange("")}/>
          )}

          {!isLoading && !isError && panels.map(panel => (
            <CommonTopicPanel
              key={panel.suggestion.topic.uuid}
              topic={panel.suggestion.topic}
              recommendationsHref={curatorRecommendationsPath(curatorName, {
                filters: unfilteredCuratorRecommendations.filters,
                includedSubscriptions: panel.sharedSubscriptions.concat(panel.candidates)
                  .map(subscription => subscription.uuid),
              })}
              sharedSubscriptions={panel.sharedSubscriptions}
              candidates={panel.candidates}
              totalSubscriptionsCount={
                panel.suggestion.sharedSubscriptionIds.length + panel.suggestion.candidateSubscriptionIds.length}
              alsoInTopicNames={alsoInTopicNames(panel.suggestion.topic.uuid)}
              userTopics={ownedTopics}
              matchingUserTopicId={panel.suggestion.matchingUserTopicId}
              pendingSubscriptionIds={userTopicsAreLoading
                ? panel.candidates.map(candidate => candidate.uuid)
                : pendingSubscriptionIds}
              onFollow={(subscription) => followAll([subscription])}
              onToggleTopic={(subscription, topic, isAssigned) =>
                setTopicAssignment(subscription, topic, isAssigned, true)}
              onSetTopicFollowed={setTopicFollowed}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CuratorCommonList;
