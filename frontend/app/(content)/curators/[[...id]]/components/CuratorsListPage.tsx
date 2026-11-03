'use client';

import React, {useState} from "react";
import EntityCardGridSkeleton from "../../../../../components/molecules/EntityCardGridSkeleton";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import Collapse from "../../../../../components/atoms/Collapse";
import {CuratorIcon, MagnifyingGlassIcon} from "../../../../../components/atoms/Icons";
import SearchBar from "../../../../../components/molecules/SearchBar";
import PageHeader from "../../../../../components/molecules/PageHeader";
import CuratorCard from "../../../../../components/organism/CuratorCard";
import {openSearchPalette} from "../../../../../utilities/searchPaletteAction";
import EmptyStateNoFollowedCurators from "../../../../../components/organism/EmptyStateNoFollowedCurators";
import EmptyStateNoMatches from "../../../../../components/organism/EmptyStateNoMatches";
import {Curator, curatorSorting} from "../../../../../entities/Curators";
import {useCurators} from "../../../../../hooks/useCurators";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";

const CuratorsListPageComponent = () => {
  const t = useTranslations("common");
  const {profile, profileIsLoading} = useProfile();
  const {curators, curatorsAreLoading, refreshCurators} = useCurators(profile, profileIsLoading);
  const [filterText, setFilterText] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredCurators = normalizedFilter === ""
    ? curators
    : curators.filter(curator => curator.username.toLowerCase().includes(normalizedFilter));

  const followedCurators = filteredCurators.filter(curator => curator.followed).sort(curatorSorting);
  const otherCurators = filteredCurators.filter(curator => !curator.followed).sort(curatorSorting);

  const openDiscoverModal = () => openSearchPalette("curators");

  const handleFollow = (curator: Curator) => {
    followCurator(curator.id).then(() => refreshCurators());
  }

  const handleUnfollow = (curator: Curator) => {
    unfollowCurator(curator.id).then(() => refreshCurators());
  }

  const renderSection = (key: string, title: string, items: Curator[]) => {
    if (items.length === 0) return null;
    return (
      <Collapse
        isOpen={openSections[key] ?? true}
        onToggle={(isOpen) => setOpenSections(prev => ({...prev, [key]: isOpen}))}
        title={
          <div className="flex flex-row gap-2 items-center">
            <CuratorIcon/>
            <h2 className="text-xl">{title} ({items.length})</h2>
          </div>
        }
        content={
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
        }
      />
    );
  }

  const hasAnyCurators = curators.length > 0;
  const hasFilter = normalizedFilter !== "";
  const hasNoMatches = hasAnyCurators && hasFilter && filteredCurators.length === 0;

  return (
    <>
      <PageHeader title={t("curators")} icon={<CuratorIcon/>}/>
      <div className="flex flex-col h-full bg-base-300 overflow-y-auto overflow-x-hidden pb-mobile-nav">
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

          {curatorsAreLoading && <EntityCardGridSkeleton/>}

          {!curatorsAreLoading && profile && !hasAnyCurators && (
            <EmptyStateNoFollowedCurators/>
          )}

          {!curatorsAreLoading && hasNoMatches && (
            <EmptyStateNoMatches/>
          )}

          {renderSection("following", t("following"), followedCurators)}
          {renderSection("discover_curators", t("discover_curators"), otherCurators)}
        </div>
      </div>

    </>
  );
}

export default CuratorsListPageComponent;
