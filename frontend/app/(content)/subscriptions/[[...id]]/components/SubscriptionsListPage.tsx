'use client';

import React, {useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import EntityCardGridSkeleton from "../../../../../components/molecules/EntityCardGridSkeleton";
import {flushSync} from "react-dom";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import Collapse from "../../../../../components/atoms/Collapse";
import Dropdown from "../../../../../components/atoms/Dropdown";
import FilterChip from "../../../../../components/atoms/FilterChip";
import {ImportIcon, MagnifyingGlassIcon, SubscriptionIcon} from "../../../../../components/atoms/Icons";
import EmptyStateImportSubscriptions from "../../../../../components/organism/EmptyStateImportSubscriptions";
import EmptyStateNoMatches from "../../../../../components/organism/EmptyStateNoMatches";
import Miniature from "../../../../../components/atoms/Miniature";
import SearchBar from "../../../../../components/molecules/SearchBar";
import PageHeader from "../../../../../components/organism/PageHeader";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import {openSearchPalette} from "../../../../../utilities/searchPaletteAction";
import {openImportModal} from "../../../../../utilities/importModalAction";
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
import {SUBSCRIPTIONS_PROVIDER_PARAM} from "../../../../../configuration";

const IMPORTED_SUBSCRIPTIONS_PARAM = "imported_subscriptions";
const providerOptionClass = "flex flex-row gap-2 items-center min-w-0 px-2 py-1.5 rounded-md cursor-pointer hover:bg-base-content/5 text-sm";

const SubscriptionsListPageComponent = () => {
  const t = useTranslations("common");
  const {showToast} = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const importToastShown = useRef(false);
  const providerFilter = searchParams.get(SUBSCRIPTIONS_PROVIDER_PARAM);
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {providers} = useProviders();
  const [filterText, setFilterText] = useState("");
  const [assigningSubscription, setAssigningSubscription] = useState<Subscription | null>(null);
  const [openProviders, setOpenProviders] = useState<Record<string, boolean>>({});

  const replaceSearchParam = useCallback((name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [searchParams, pathname, router]);

  // YouTube, Spotify and Patreon imports redirect back here with the number of imported subscriptions
  const importedSubscriptions = searchParams.get(IMPORTED_SUBSCRIPTIONS_PARAM);
  useEffect(() => {
    if (importedSubscriptions === null || importToastShown.current) {
      return;
    }
    importToastShown.current = true;
    showToast(t("subscriptions_imported", {count: Number(importedSubscriptions)}));
    replaceSearchParam(IMPORTED_SUBSCRIPTIONS_PARAM, null);
  }, [importedSubscriptions, replaceSearchParam, showToast, t]);

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

  const openDiscoverModal = () => openSearchPalette("subscriptions");
  
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

  const subscriptionsByProvider = providers
    .filter(provider => providerFilter === null || provider.name === providerFilter)
    .map(provider => ({
      provider,
      items: filteredSubscriptions
        .filter(subscription => subscription.provider === provider.name)
        .sort(subscriptionSorting),
    }))
    .filter(group => group.items.length > 0);

  const hasAnySubscriptions = subscriptions.length > 0;
  const hasFilter = filterText.trim() !== "" || providerFilter !== null;
  const hasNoMatches = hasAnySubscriptions && hasFilter && subscriptionsByProvider.length === 0;
  const providerFilterLabel = providerFilter === null
    ? t("all")
    : getProviderPrettyName(providers, providerFilter);

  return (
    <>
      <PageHeader title={t("subscriptions")} icon={<SubscriptionIcon/>}/>
      <div className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden pb-mobile-nav">
        <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
          <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2 w-full items-center justify-center">
            <Button fitContent={true} clickAction={openDiscoverModal} primary={false}>
              <MagnifyingGlassIcon/>
              {t("discover")}
            </Button>
            {/* On mobile the search and the provider filter take the first line and the buttons wrap to the second one */}
            <div className="order-first basis-full sm:order-none sm:basis-auto w-full sm:max-w-md flex flex-row gap-2 items-center">
              <div className="flex-1 min-w-0">
                <SearchBar
                  placeholder={t("filter_subscriptions_placeholder")}
                  value={filterText}
                  handleChange={setFilterText}
                  icon="filter"
                />
              </div>
              <div className="flex-none w-28">
                <Dropdown label={t("provider")} width={"narrow"} position="end" bottom={true} closeOnClickInside={true}
                          fullWidth={true}
                          button={<FilterChip active={providerFilter !== null}>{providerFilterLabel}</FilterChip>}>
                  <li role="radiogroup" aria-label={t("provider")} className="flex flex-col p-1">
                    <label className={providerOptionClass}>
                      <input type="radio" name="subscriptions-provider" className="radio radio-primary radio-xs"
                             checked={providerFilter === null}
                             onChange={() => replaceSearchParam(SUBSCRIPTIONS_PROVIDER_PARAM, null)}/>
                      {t("all")}
                    </label>
                    {providers.map(provider => (
                      <label key={provider.name} className={providerOptionClass}>
                        <input type="radio" name="subscriptions-provider" className="radio radio-primary radio-xs"
                               checked={providerFilter === provider.name}
                               onChange={() => replaceSearchParam(SUBSCRIPTIONS_PROVIDER_PARAM, provider.name)}/>
                        <Miniature src={getProviderIcon(providers, provider.name)} alt=""/>
                        {provider.prettyName}
                      </label>
                    ))}
                  </li>
                </Dropdown>
              </div>
            </div>
            {profile && (
              <Button fitContent={true} clickAction={() => openImportModal()}>
                <ImportIcon/>
                {t("import")}
              </Button>
            )}
          </div>

          {subscriptionsAreLoading && <EntityCardGridSkeleton/>}

          {!subscriptionsAreLoading && profile && !hasAnySubscriptions && (
            <EmptyStateImportSubscriptions/>
          )}

          {!subscriptionsAreLoading && hasNoMatches && (
            <EmptyStateNoMatches/>
          )}

          {subscriptionsByProvider.map(({provider, items}) => (
            <Collapse
              key={provider.name}
              isOpen={openProviders[provider.name] ?? true}
              onToggle={(isOpen) => setOpenProviders(prev => ({...prev, [provider.name]: isOpen}))}
              title={
                <div className="flex flex-row gap-2 items-center">
                  <Miniature src={getProviderIcon(providers, provider.name)} alt={`${provider.name} logo`}/>
                  <h2 className="text-xl">
                    {getProviderPrettyName(providers, provider.name)} ({items.length})
                  </h2>
                </div>
              }
              content={
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
              }
            />
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
