import React from "react";
import Miniature from "../components/atoms/Miniature";
import {EntityListFacets, EntityListSection} from "../components/organism/EntityList";
import {SUBSCRIPTIONS_PROVIDER_PARAM} from "../configuration";
import {getProviderIcon} from "../entities/Provider";
import {Subscription, subscriptionFiltering, subscriptionSorting} from "../entities/Subscription";
import useProviders from "./useProviders";
import useSearchParam from "./useSearchParam";

type UseSubscriptionListGroups = {
  facets: EntityListFacets;
  sections: EntityListSection[];
}

// Groups the subscriptions by provider, with the selected provider kept in the URL
const useSubscriptionListGroups = (
  subscriptions: Subscription[],
  filterText: string,
  renderCard: (subscription: Subscription) => React.ReactNode,
): UseSubscriptionListGroups => {
  const {providers} = useProviders();
  const {value: providerFilter, setValue: setProviderFilter} = useSearchParam(SUBSCRIPTIONS_PROVIDER_PARAM);

  const filteredSubscriptions = filterText.trim() === ""
    ? subscriptions
    : subscriptions.filter(subscription => subscriptionFiltering(subscription, filterText.trim()));

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
    sections,
  };
}

export default useSubscriptionListGroups;
