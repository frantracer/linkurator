'use client';

import React, {useState} from "react";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import {CuratorIcon, MagnifyingGlassIcon} from "../../../../../components/atoms/Icons";
import SearchBar from "../../../../../components/molecules/SearchBar";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CuratorCard from "../../../../../components/organism/CuratorCard";
import FindCuratorModal, {FindCuratorModalId} from "../../../../../components/organism/FindCuratorModal";
import EmptyStateNoFollowedCurators from "../../../../../components/organism/EmptyStateNoFollowedCurators";
import EmptyStateNoMatches from "../../../../../components/organism/EmptyStateNoMatches";
import {Curator, curatorSorting} from "../../../../../entities/Curators";
import {useCurators} from "../../../../../hooks/useCurators";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";
import {openModal} from "../../../../../utilities/modalAction";

const CuratorsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {curators, curatorsAreLoading, refreshCurators} = useCurators(profile, profileIsLoading);
  const [filterText, setFilterText] = useState("");

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredCurators = normalizedFilter === ""
    ? curators
    : curators.filter(curator => curator.username.toLowerCase().includes(normalizedFilter));

  const followedCurators = filteredCurators.filter(curator => curator.followed).sort(curatorSorting);
  const otherCurators = filteredCurators.filter(curator => !curator.followed).sort(curatorSorting);

  const openDiscoverModal = () => openModal(FindCuratorModalId);

  const handleFollow = (curator: Curator) => {
    followCurator(curator.id).then(() => refreshCurators());
  }

  const handleUnfollow = (curator: Curator) => {
    unfollowCurator(curator.id).then(() => refreshCurators());
  }

  const renderSection = (title: string, items: Curator[]) => {
    if (items.length === 0) return null;
    return (
      <section className="flex flex-col gap-3">
        <div className="flex flex-row gap-2 items-center">
          <CuratorIcon/>
          <h2 className="text-xl">{title} ({items.length})</h2>
        </div>
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4 justify-items-center justify-content-center">
          {items.map(curator => (
            <CuratorCard
              key={curator.id}
              curator={curator}
              onFollow={profile ? handleFollow : undefined}
              onUnfollow={profile ? handleUnfollow : undefined}
            />
          ))}
        </div>
      </section>
    );
  }

  const hasAnyCurators = curators.length > 0;
  const hasFilter = normalizedFilter !== "";
  const hasNoMatches = hasAnyCurators && hasFilter && filteredCurators.length === 0;

  return (
    <>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0"/>
          <div className="flex-1 min-w-0 flex flex-row items-center justify-center gap-2">
            <CuratorIcon/>
            <h1 className="text-xl font-bold truncate">{t("curators")}</h1>
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
                placeholder={t("filter_curators_placeholder")}
                value={filterText}
                handleChange={setFilterText}
                icon="filter"
              />
            </div>
          </div>

          {!curatorsAreLoading && profile && !hasAnyCurators && (
            <EmptyStateNoFollowedCurators/>
          )}

          {!curatorsAreLoading && hasNoMatches && (
            <EmptyStateNoMatches/>
          )}

          {renderSection(t("following"), followedCurators)}
          {renderSection(t("discover_curators"), otherCurators)}
        </div>
      </div>

      <FindCuratorModal curators={curators} refreshCurators={refreshCurators}/>
    </>
  );
}

export default CuratorsListPageComponent;
