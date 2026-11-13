import React from "react";
import {useTranslations} from "next-intl";
import {RectangleGroup, StarIcon} from "../components/atoms/Icons";
import {EntityListFacets, EntityListSection} from "../components/organism/EntityList";
import {Topic} from "../entities/Topic";
import useSearchParam from "./useSearchParam";

export const TOPICS_FACET_PARAM = "show";

type TopicsFacet = "favorites" | "mine" | "following" | "not_following";

const TOPICS_FACETS: TopicsFacet[] = ["favorites", "mine", "following", "not_following"];

const parseTopicsFacet = (value: string | null): TopicsFacet | null => {
  if (value === "favorites" || value === "mine" || value === "following" || value === "not_following") {
    return value;
  }
  return null;
}

// Every topic belongs to exactly one facet, so the facet counts add up to the total
const facetOfTopic = (topic: Topic): TopicsFacet => {
  if (topic.is_favorite) {
    return "favorites";
  }
  if (topic.is_owner) {
    return "mine";
  }
  if (topic.followed) {
    return "following";
  }
  return "not_following";
}

type UseTopicListGroups = {
  facets: EntityListFacets;
  sections: EntityListSection[];
}

// Groups the topics by favorites, owned, followed and not followed, with the selected group kept in the URL
const useTopicListGroups = (
  topics: Topic[],
  filterText: string,
  renderCard: (topic: Topic) => React.ReactNode,
): UseTopicListGroups => {
  const t = useTranslations("common");
  const {value: facetParam, setValue: setFacetParam} = useSearchParam(TOPICS_FACET_PARAM);
  const selectedFacet = parseTopicsFacet(facetParam);

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredTopics = normalizedFilter === ""
    ? topics
    : topics.filter(topic => topic.name.toLowerCase().includes(normalizedFilter));

  const facetDetails: Record<TopicsFacet, { title: string, icon: React.ReactNode }> = {
    favorites: {title: t("favorites"), icon: <StarIcon/>},
    mine: {title: t("my_topics"), icon: <RectangleGroup/>},
    following: {title: t("following"), icon: <RectangleGroup/>},
    not_following: {title: t("not_following"), icon: <RectangleGroup/>},
  };

  const sections: EntityListSection[] = TOPICS_FACETS
    .filter(facet => selectedFacet === null || facet === selectedFacet)
    .map(facet => ({
      key: facet,
      title: facetDetails[facet].title,
      icon: facetDetails[facet].icon,
      items: filteredTopics.filter(topic => facetOfTopic(topic) === facet).map(renderCard),
    }));

  // A facet without topics only gets a tag when the URL asks for it, so it can still be cleared
  const options = TOPICS_FACETS
    .map(facet => ({
      key: facet,
      label: facetDetails[facet].title,
      icon: facet === "favorites" ? facetDetails[facet].icon : undefined,
      count: topics.filter(topic => facetOfTopic(topic) === facet).length,
    }))
    .filter(option => option.count > 0 || option.key === selectedFacet);

  return {
    facets: {options, selected: selectedFacet, onSelect: setFacetParam},
    sections,
  };
}

export default useTopicListGroups;
