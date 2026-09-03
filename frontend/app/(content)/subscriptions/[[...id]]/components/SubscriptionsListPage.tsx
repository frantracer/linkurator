'use client';

import React, {useState} from "react";
import {flushSync} from "react-dom";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import {ImportIcon, MagnifyingGlassIcon, SubscriptionIcon} from "../../../../../components/atoms/Icons";
import EmptyStateNoSubscriptions from "../../../../../components/organism/EmptyStateNoSubscriptions";
import EmptyStateNoMatches from "../../../../../components/organism/EmptyStateNoMatches";
import Miniature from "../../../../../components/atoms/Miniature";
import SearchBar from "../../../../../components/molecules/SearchBar";
import TopTitle from "../../../../../components/molecules/TopTitle";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import {FindSubscriptionModalId} from "../../../../../components/organism/FindSubscriptionModal";
import {ImportSubscriptionsModalId} from "../../../../../components/organism/ImportSubscriptionsModal";
import SubscriptionCard from "../../../../../components/organism/SubscriptionCard";
import {getProviderIcon, getProviderPrettyName} from "../../../../../entities/Provider";
import {Subscription, subscriptionFiltering, subscriptionSorting} from "../../../../../entities/Subscription";
import useProfile from "../../../../../hooks/useProfile";
import useProviders from "../../../../../hooks/useProviders";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import {followSubscription, unfollowSubscription} from "../../../../../services/subscriptionService";
import {openModal} from "../../../../../utilities/modalAction";
import {useToast} from "../../../../../contexts/ToastContext";

const SubscriptionsListPageComponent = () => {
  const t = useTranslations("common");
  const {showToast} = useToast();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {providers} = useProviders();
  const [filterText, setFilterText] = useState("");
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

  const filteredSubscriptions = filterText.trim() === ""
    ? subscriptions
    : subscriptions.filter(subscription => subscriptionFiltering(subscription, filterText.trim()));

  const openDiscoverModal = () => openModal(FindSubscriptionModalId);
  const openImportModal = () => openModal(ImportSubscriptionsModalId);

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

  const subscriptionsByProvider = providers.map(provider => ({
    provider,
    items: filteredSubscriptions
      .filter(subscription => subscription.provider === provider.name)
      .sort(subscriptionSorting),
  })).filter(group => group.items.length > 0);

  const hasAnySubscriptions = subscriptions.length > 0;
  const hasFilter = filterText.trim() !== "";
  const hasNoMatches = hasAnySubscriptions && hasFilter && filteredSubscriptions.length === 0;

  return (
    <>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0"/>
          <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-2">
            <SubscriptionIcon/>
            <h1 className="text-xl font-bold truncate">{t("subscriptions")}</h1>
          </div>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>
      <div className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
          <div className="flex flex-row gap-2 w-full items-center justify-center">
            <Button fitContent={true} clickAction={openDiscoverModal} primary={false}>
              <MagnifyingGlassIcon/>
              {t("discover")}
            </Button>
            <div className="w-full max-w-sm">
              <SearchBar
                placeholder={t("filter_subscriptions_placeholder")}
                value={filterText}
                handleChange={setFilterText}
                icon="filter"
              />
            </div>
            {profile && (
              <Button fitContent={true} clickAction={openImportModal} primary={false}>
                <ImportIcon/>
                {t("import")}
              </Button>
            )}
          </div>

          {!subscriptionsAreLoading && profile && !hasAnySubscriptions && (
            <EmptyStateNoSubscriptions/>
          )}

          {!subscriptionsAreLoading && hasNoMatches && (
            <EmptyStateNoMatches/>
          )}

          {subscriptionsByProvider.map(({provider, items}) => (
            <section key={provider.name} className="flex flex-col gap-3">
              <div className="flex flex-row gap-2 items-center">
                <Miniature src={getProviderIcon(providers, provider.name)} alt={`${provider.name} logo`}/>
                <h2 className="text-xl">
                  {getProviderPrettyName(providers, provider.name)} ({items.length})
                </h2>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4 justify-items-center justify-content-center">
                {items.map(subscription => (
                  <SubscriptionCard
                    key={subscription.uuid}
                    subscription={subscription}
                    topicsCount={topicsCountBySubscription.get(subscription.uuid) ?? 0}
                    onAssign={profile ? handleAssign : undefined}
                    onUnfollow={profile ? handleUnfollow : undefined}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

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
