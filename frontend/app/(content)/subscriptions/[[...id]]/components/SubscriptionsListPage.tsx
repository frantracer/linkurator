'use client';

import React, {useEffect, useRef, useState} from "react";
import {flushSync} from "react-dom";
import {useTranslations} from "next-intl";
import {ImportIcon, SubscriptionIcon} from "../../../../../components/atoms/Icons";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import EmptyStateImportSubscriptions from "../../../../../components/organism/EmptyStateImportSubscriptions";
import EntityListLayout from "../../../../../components/organism/EntityListLayout";
import SubscriptionCard from "../../../../../components/organism/SubscriptionCard";
import {openImportModal} from "../../../../../utilities/importModalAction";
import {Subscription} from "../../../../../entities/Subscription";
import useProfile from "../../../../../hooks/useProfile";
import useSearchParam from "../../../../../hooks/useSearchParam";
import useSubscriptionListGroups from "../../../../../hooks/useSubscriptionListGroups";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import {followSubscription, unfollowSubscription} from "../../../../../services/subscriptionService";
import {openModal} from "../../../../../utilities/modalAction";
import {useToast} from "../../../../../contexts/ToastContext";

const IMPORTED_SUBSCRIPTIONS_PARAM = "imported_subscriptions";

const SubscriptionsListPageComponent = () => {
  const t = useTranslations("common");
  const {showToast} = useToast();
  const importToastShown = useRef(false);
  const {value: importedSubscriptions, setValue: setImportedSubscriptions} = useSearchParam(IMPORTED_SUBSCRIPTIONS_PARAM);
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const [filterText, setFilterText] = useState("");
  const [assigningSubscription, setAssigningSubscription] = useState<Subscription | null>(null);

  // YouTube, Spotify and Patreon imports redirect back here with the number of imported subscriptions
  useEffect(() => {
    if (importedSubscriptions === null || importToastShown.current) {
      return;
    }
    importToastShown.current = true;
    showToast(t("subscriptions_imported", {count: Number(importedSubscriptions)}));
    setImportedSubscriptions(null);
  }, [importedSubscriptions, setImportedSubscriptions, showToast, t]);

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

  const handleUnfollow = (subscription: Subscription) => {
    unfollowSubscription(subscription.uuid).then(() => {
      refreshSubscriptions();
      showToast(t("subscription_unfollowed"), subscription.name, () => {
        followSubscription(subscription.uuid).then(() => {
          refreshSubscriptions();
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
      onUnfollow={profile ? handleUnfollow : undefined}
    />
  );

  const {facets, sections} = useSubscriptionListGroups(subscriptions, filterText, renderCard);

  return (
    <>
      <EntityListLayout
        title={t("subscriptions")}
        icon={<SubscriptionIcon/>}
        subtitle={t("subscriptions_count", {count: subscriptions.length})}
        discoverFilter="subscriptions"
        mainAction={profile ? {label: t("import"), icon: <ImportIcon/>, onClick: () => openImportModal()} : undefined}
        filterPlaceholder={t("filter_subscriptions_placeholder")}
        filterText={filterText}
        onFilterTextChange={setFilterText}
        facets={facets}
        totalCount={subscriptions.length}
        isLoading={subscriptionsAreLoading}
        emptyState={profile ? <EmptyStateImportSubscriptions/> : null}
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
}

export default SubscriptionsListPageComponent;
