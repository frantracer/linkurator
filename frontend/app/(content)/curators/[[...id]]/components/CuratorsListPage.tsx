'use client';

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {CuratorIcon} from "../../../../../components/atoms/Icons";
import CuratorCard from "../../../../../components/organism/CuratorCard";
import EmptyStateNoFollowedCurators from "../../../../../components/organism/EmptyStateNoFollowedCurators";
import EntityListLayout, {EntityListSection} from "../../../../../components/organism/EntityListLayout";
import {Curator, curatorSorting} from "../../../../../entities/Curators";
import {useCurators} from "../../../../../hooks/useCurators";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";

const CuratorsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {curators, curatorsAreLoading, refreshCurators} = useCurators(profile, profileIsLoading);
  const [filterText, setFilterText] = useState("");

  const handleFollow = (curator: Curator) => {
    followCurator(curator.id).then(() => refreshCurators());
  }

  const handleUnfollow = (curator: Curator) => {
    unfollowCurator(curator.id).then(() => refreshCurators());
  }

  const renderCard = (curator: Curator) => (
    <CuratorCard
      key={curator.id}
      curator={curator}
      onFollow={profile ? handleFollow : undefined}
      onUnfollow={profile ? handleUnfollow : undefined}
    />
  );

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredCurators = normalizedFilter === ""
    ? curators
    : curators.filter(curator => curator.username.toLowerCase().includes(normalizedFilter));

  const sections: EntityListSection[] = [
    {
      key: "following",
      title: t("following"),
      icon: <CuratorIcon/>,
      items: filteredCurators.filter(curator => curator.followed).sort(curatorSorting).map(renderCard),
    },
    {
      key: "discover_curators",
      title: t("discover_curators"),
      icon: <CuratorIcon/>,
      items: filteredCurators.filter(curator => !curator.followed).sort(curatorSorting).map(renderCard),
    },
  ];

  // Only followed curators are listed, so there is nothing to split into tags
  return (
    <EntityListLayout
      title={t("curators")}
      icon={<CuratorIcon/>}
      subtitle={t("following_count", {count: curators.filter(curator => curator.followed).length})}
      discoverFilter="curators"
      filterPlaceholder={t("filter_curators_placeholder")}
      filterText={filterText}
      onFilterTextChange={setFilterText}
      totalCount={curators.length}
      isLoading={curatorsAreLoading}
      emptyState={profile ? <EmptyStateNoFollowedCurators/> : null}
      sections={sections}
    />
  );
}

export default CuratorsListPageComponent;
