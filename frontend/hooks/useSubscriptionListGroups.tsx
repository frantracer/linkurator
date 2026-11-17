import React from "react";
import {useTranslations} from "next-intl";
import Miniature from "../components/atoms/Miniature";
import {EntityListFacets, EntityListSection} from "../components/organism/EntityList";
import {SUBSCRIPTIONS_PROVIDER_PARAM} from "../configuration";
import {getProviderIcon} from "../entities/Provider";
import {Subscription, subscriptionFiltering, subscriptionSorting} from "../entities/Subscription";
import useProviders from "./useProviders";
import useSearchParam from "./useSearchParam";
import useSearchParamsUpdate from "./useSearchParamsUpdate";

export const SUBSCRIPTIONS_FOLLOW_PARAM = "follow";

type FollowFacet = "following" | "not_following";

const FOLLOW_FACETS: FollowFacet[] = ["following", "not_following"];

const parseFollowFacet = (value: string | null): FollowFacet | null => {
  if (value === "following" || value === "not_following") {
    return value;
  }
  return null;
}

const facetOfSubscription = (subscription: Subscription): FollowFacet =>
  subscription.followed ? "following" : "not_following";

type UseSubscriptionListGroups = {
  facets: EntityListFacets;
  followFacets: EntityListFacets | undefined;
  clearFacets: () => void;
  sections: EntityListSection[];
}

// Groups the subscriptions by provider and, when asked, filters them by whether the user follows them, with the
// selected provider and following status kept in the URL
const useSubscriptionListGroups = (
  subscriptions: Subscription[],
  filterText: string,
  showFollowFacets: boolean,
  renderCard: (subscription: Subscription) => React.ReactNode,
): UseSubscriptionListGroups => {
  const t = useTranslations("common");
  const {providers} = useProviders();
  const {value: providerFilter, setValue: setProviderFilter} = useSearchParam(SUBSCRIPTIONS_PROVIDER_PARAM);
  const {value: followParam, setValue: setFollowParam} = useSearchParam(SUBSCRIPTIONS_FOLLOW_PARAM);
  const updateSearchParams = useSearchParamsUpdate();
  const followFilter = showFollowFacets ? parseFollowFacet(followParam) : null;

  const filteredSubscriptions = subscriptions
    .filter(subscription => filterText.trim() === "" || subscriptionFiltering(subscription, filterText.trim()))
    .filter(subscription => followFilter === null || facetOfSubscription(subscription) === followFilter);

  const providerIcon = (providerName: string) => (
    <Miniature src={getProviderIcon(providers, providerName)} alt=""/>
  );

  // A provider without subscriptions only gets a tag when the URL asks for it, so it can still be cleared
  const options = providers
    .map(provider => ({
      key: provider.name,
      label: provider.prettyName,
      icon: providerIcon(provider.name),
      count: subscriptions.filter(subscription => subscription.provider === provider.name).length,
    }))
    .filter(option => option.count > 0 || option.key === providerFilter);

  const followLabels: Record<FollowFacet, string> = {
    following: t("following"),
    not_following: t("not_following"),
  };

  const followOptions = FOLLOW_FACETS
    .map(facet => ({
      key: facet,
      label: followLabels[facet],
      count: subscriptions.filter(subscription => facetOfSubscription(subscription) === facet).length,
    }))
    .filter(option => option.count > 0 || option.key === followFilter);

  const sections: EntityListSection[] = providers
    .filter(provider => providerFilter === null || provider.name === providerFilter)
    .map(provider => ({
      key: provider.name,
      title: provider.prettyName,
      icon: providerIcon(provider.name),
      items: filteredSubscriptions
        .filter(subscription => subscription.provider === provider.name)
        .sort(subscriptionSorting)
        .map(renderCard),
    }));

  return {
    facets: {options, selected: providerFilter, onSelect: setProviderFilter},
    followFacets: showFollowFacets
      ? {options: followOptions, selected: followFilter, onSelect: setFollowParam}
      : undefined,
    clearFacets: () => updateSearchParams({
      [SUBSCRIPTIONS_PROVIDER_PARAM]: null,
      [SUBSCRIPTIONS_FOLLOW_PARAM]: null,
    }),
    sections,
  };
}

export default useSubscriptionListGroups;
