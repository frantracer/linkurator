import React, {useState} from "react";
import {flushSync} from "react-dom";
import {useTranslations} from "next-intl";
import {Subscription} from "../../entities/Subscription";
import EntityList from "./EntityList";
import SubscriptionCard from "./SubscriptionCard";
import AssignTopicModal, {AssignTopicModalId} from "./AssignTopicModal";
import useProfile from "../../hooks/useProfile";
import useSubscriptionListGroups from "../../hooks/useSubscriptionListGroups";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {followSubscription, unfollowSubscription} from "../../services/subscriptionService";
import {openModal} from "../../utilities/modalAction";
import {useToast} from "../../contexts/ToastContext";

type CuratorSubscriptionsListProps = {
  subscriptions: Subscription[];
  showFilterBar: boolean;
  filterText: string;
  onFilterTextChange: (value: string) => void;
  isLoading: boolean;
  refreshSubscriptions: () => void;
}

const CuratorSubscriptionsList = (
  {
    subscriptions,
    showFilterBar,
    filterText,
    onFilterTextChange,
    isLoading,
    refreshSubscriptions,
  }: CuratorSubscriptionsListProps
) => {
  const t = useTranslations("common");
  const {showToast} = useToast();
  const {profile, profileIsLoading} = useProfile();
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {refreshSubscriptions: refreshUserSubscriptions} = useSubscriptions(profile);
  const [assigningSubscription, setAssigningSubscription] = useState<Subscription | null>(null);

  const topicsCountBySubscription = new Map<string, number>();
  topics.forEach(topic => {
    topic.subscriptions_ids.forEach(subscriptionId => {
      topicsCountBySubscription.set(
        subscriptionId,
        (topicsCountBySubscription.get(subscriptionId) ?? 0) + 1,
      );
    });
  });

  const handleAssign = (subscription: Subscription) => {
    flushSync(() => setAssigningSubscription(subscription));
    openModal(AssignTopicModalId);
  }

  const handleFollow = (subscription: Subscription) => {
    followSubscription(subscription.uuid).then(() => {
      refreshSubscriptions();
      refreshUserSubscriptions();
    });
  }

  const handleUnfollow = (subscription: Subscription) => {
    unfollowSubscription(subscription.uuid).then(() => {
      refreshSubscriptions();
      refreshUserSubscriptions();
      showToast(t("subscription_unfollowed"), subscription.name, () => {
        followSubscription(subscription.uuid).then(() => {
          refreshSubscriptions();
          refreshUserSubscriptions();
        });
      });
    });
  }

  const renderCard = (subscription: Subscription) => (
    <SubscriptionCard
      key={subscription.uuid}
      subscription={subscription}
      topicsCount={topicsCountBySubscription.get(subscription.uuid) ?? 0}
      onAssign={profile ? handleAssign : undefined}
      onFollow={profile ? handleFollow : undefined}
      onUnfollow={profile ? handleUnfollow : undefined}
    />
  );

  const {facets, sections} = useSubscriptionListGroups(subscriptions, filterText, renderCard);

  return (
    <>
      <EntityList
        showFilterBar={showFilterBar}
        filterPlaceholder={t("filter_subscriptions_placeholder")}
        filterText={filterText}
        onFilterTextChange={onFilterTextChange}
        facets={facets}
        totalCount={subscriptions.length}
        isLoading={isLoading}
        emptyState={<p className="py-10 text-center text-sm text-base-content/60">{t("no_subscriptions_found")}</p>}
        sections={sections}
      />

      {assigningSubscription && (
        <AssignTopicModal
          topics={topics}
          subscription={assigningSubscription}
          refreshTopics={refreshTopics}
        />
      )}
    </>
  );
};

export default CuratorSubscriptionsList;
