'use client';

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import Button from "../../../../../components/atoms/Button";
import {AddIcon, CuratorIcon, MagnifyingGlassIcon, MinusIcon} from "../../../../../components/atoms/Icons";
import Miniature from "../../../../../components/atoms/Miniature";
import SearchBar from "../../../../../components/molecules/SearchBar";
import TopTitle from "../../../../../components/molecules/TopTitle";
import FindCuratorModal, {FindCuratorModalId} from "../../../../../components/organism/FindCuratorModal";
import EmptyStateNoFollowedCurators from "../../../../../components/organism/EmptyStateNoFollowedCurators";
import EmptyStateNoMatches from "../../../../../components/organism/EmptyStateNoMatches";
import {paths} from "../../../../../configuration";
import {Curator, curatorSorting} from "../../../../../entities/Curators";
import {useCurators} from "../../../../../hooks/useCurators";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";
import {openModal} from "../../../../../utilities/modalAction";

const CuratorsListPageComponent = () => {
  const t = useTranslations("common");
  const router = useRouter();
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

  const goToCurator = (curator: Curator) => {
    router.push(paths.CURATORS + "/" + curator.username);
  }

  const handleFollow = (curatorId: string) => {
    followCurator(curatorId).then(() => refreshCurators());
  }

  const handleUnfollow = (curatorId: string) => {
    unfollowCurator(curatorId).then(() => refreshCurators());
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
          className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4 justify-items-center justify-content-center">
          {items.map(curator => (
            <div
              key={curator.id}
              onClick={() => goToCurator(curator)}
              className="card rounded-lg w-60 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
            >
              <div className="card-body m-1 p-2 gap-3">
                <div className="flex flex-row items-center gap-2 min-w-0">
                  <Miniature src={curator.avatar_url} alt={curator.username}/>
                  <h3 className="card-title text-sm flex-1 hover:text-primary line-clamp-2">
                    {curator.username}
                  </h3>
                </div>
                {profile && (
                  <div className="card-actions flex justify-end mt-auto">
                    {curator.followed ? (
                      <Button
                        primary={false}
                        fitContent={true}
                        clickAction={() => handleUnfollow(curator.id)}
                        tooltip={t("unfollow")}
                      >
                        <MinusIcon/>
                        {t("unfollow")}
                      </Button>
                    ) : (
                      <Button
                        primary={false}
                        fitContent={true}
                        clickAction={() => handleFollow(curator.id)}
                        tooltip={t("follow")}
                      >
                        <AddIcon/>
                        {t("follow")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
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
