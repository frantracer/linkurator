'use client';

import {useTranslations} from 'next-intl';
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  RectangleGroup,
  ShareIcon,
  ThumbsUpFilledIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CuratorFilter, {CURATOR_FILTER_ID} from "../../../../../components/organism/CuratorFilter";
import VideoCardGrid from "../../../../../components/organism/VideoCardGrid";
import {paths} from "../../../../../configuration";
import {useCurator} from "../../../../../hooks/useCurator";
import useCuratorItems from "../../../../../hooks/useCuratorItems";
import {useCurators} from "../../../../../hooks/useCurators";
import {useCuratorTopics} from "../../../../../hooks/useCuratorTopics";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";
import {showLateralMenu} from "../../../../../utilities/lateralMenuAction";
import CuratorTopicsList from "../../../../../components/organism/CuratorTopicsList";
import {Tabs} from "../../../../../components/atoms/Tabs";
import {useTopics} from "../../../../../hooks/useTopics";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import ShareCuratorModal, {ShareCuratorModalId} from "../../../../../components/organism/ShareCuratorModal";
import {openModal} from "../../../../../utilities/modalAction";
import useProviders from "../../../../../hooks/useProviders";
import ProfileDropdown from "../../../../../components/organism/ProfileDropdown";

const CuratorPageComponent = ({curatorName}: { curatorName: string }) => {
  const t = useTranslations("common");
  const {providers} = useProviders();
  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState<string>(t('recommendations'));
  const {profile, profileIsLoading: isProfileLoading} = useProfile();
  const {refreshTopics: refreshUserTopics} = useTopics(profile, isProfileLoading);
  const {curators, refreshCurators, curatorsAreLoading: isCuratorsLoading} = useCurators(profile, isProfileLoading);
  const {curator, curatorIsLoading: isCuratorLoading} = useCurator(curatorName, curators);
  const curatorId = curator ? curator.id : null;
  const {
    curatorItems,
    fetchMoreItems,
    refreshCuratorItem,
    isLoading: isCuratorItemsLoading,
    isFinished: isCuratorItemsFinished
  } = useCuratorItems(curatorId, debouncedFilters);
  const {topics, topicsIsLoading: isTopicsLoading, refetchTopics} = useCuratorTopics(curatorId);

  const isLoggedIn = !!(profile)
  const isOwnCuratorProfile = isLoggedIn && !!(curator) && profile.username === curator.username;
  const isMainDataLoading = isCuratorLoading || isCuratorsLoading || isProfileLoading || isTopicsLoading;
  const isItemsLoading = isCuratorItemsLoading || isCuratorLoading;
  const curatorThumbnail = curator ? curator.avatar_url : "";

  const refreshAllTopics = () => {
    refetchTopics().then(() => {
      refreshUserTopics();
    })
  }

  const handleFilter = () => {
    showLateralMenu(CURATOR_FILTER_ID);
  }

  const handleFollowCurator = (curatorId: string) => {
    followCurator(curatorId).then(() => {
      refreshCurators()
    })
  }

  const handleUnfollowCurator = (curatorId: string) => {
    unfollowCurator(curatorId).then(() => {
      refreshCurators()
    })
  }

  const handleShareCurator = () => {
    openModal(ShareCuratorModalId);
  }

  const dropdownButtons = []
  if (curator) {
    if (isLoggedIn) {
      if (curator.followed) {
        dropdownButtons.push(
          <MenuItem key={"curators-unfollow"} onClick={() => handleUnfollowCurator(curator.id)} hideMenuOnClick={true}>
            <div className="flex flex-row gap-2 items-center justify-left">
              <MinusIcon/>
              {t("unfollow")}
            </div>
          </MenuItem>
        )
      } else {
        dropdownButtons.push(
          <MenuItem key={"curators-follow"} onClick={() => handleFollowCurator(curator.id)} hideMenuOnClick={true}>
            <div className="flex flex-row gap-2 items-center justify-left">
              <AddIcon/>
              {t("follow")}
            </div>
          </MenuItem>
        )
      }
    }
    dropdownButtons.push(
      <MenuItem key={"curators-filter"} onClick={handleFilter} hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <FunnelIcon/>
          {t("filter")}
        </div>
      </MenuItem>
    )
  }

  useEffect(() => {
    if (filters.textSearch === debouncedFilters.textSearch) {
      setDebouncedFilters(filters)
    } else {
      const timer = setTimeout(() => {
        setDebouncedFilters(filters)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [debouncedFilters.textSearch, filters]);

  return (
    <Drawer id={CURATOR_FILTER_ID} right={true} alwaysOpenOnDesktop={false}>
      <CuratorFilter curator={curator} filters={filters} setFilters={setFilters} resetFilters={resetFilters}/>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          {!isMainDataLoading && curator &&
              <>
            <div className="w-10 shrink-0 flex items-center justify-start">
              {!isOwnCuratorProfile && curator &&
                  <Dropdown
                      small={true}
                      position="start"
                      bottom={true}
                      button={
                        <Button primary={false} fitContent={true} stopPropagation={false}>
                          <OptionsIcon/>
                        </Button>
                      }
                      closeOnClickInside={true}
                  >
                      <Menu>
                        {dropdownButtons}
                      </Menu>
                  </Dropdown>
              }
            </div>
            <div className="flex-1 min-w-0 flex flex-col items-center gap-2 overflow-hidden">
              <div className="w-full flex flex-row gap-2 items-center justify-center overflow-hidden">
                <div className="shrink-0">
                  <Miniature src={curatorThumbnail} alt={curatorName}/>
                </div>
                <h1 className="text-xl font-bold min-w-0 whitespace-nowrap truncate">
                  {curatorName}
                </h1>
                <div className="shrink-0">
                  <Button primary={false} fitContent={true} clickAction={handleFilter} tooltip={t("filter")}
                          hideOnMobile={true}>
                    <FunnelIcon/>
                  </Button>
                </div>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                {curator && curator.followed &&
                    <Tag>
                    <span>
                    {t("following")}
                    </span>
                        <div className="hover:cursor-pointer" onClick={() => handleUnfollowCurator(curator.id)}>
                            <CrossIcon/>
                        </div>
                    </Tag>
                }
                {curator && !curator.followed && isLoggedIn && !isOwnCuratorProfile &&
                    <Button primary={false} clickAction={() => handleFollowCurator(curator.id)}>
                      {t("follow")}
                    </Button>
                }
                {curator && !curator.followed && !isLoggedIn &&
                    <Button primary={false} href={paths.LOGIN}>
                      {t("follow")}
                    </Button>
                }
                {isOwnCuratorProfile &&
                    <Button primary={false} clickAction={handleShareCurator}>
                        <ShareIcon/>
                      {t("share")}
                    </Button>
                }
              </div>
            </div>
            <div className="w-10 shrink-0 flex items-center justify-end">
              {profile && <ProfileDropdown profile={profile}/>}
            </div>
          </>
          }
        </div>
      </TopTitle>

      {/* Mobile tabs */}
      <div className="flex flex-col md:hidden overflow-y-hidden">
        <Tabs tabsText={[t("recommendations"), t("topics")]}
              selectedTab={activeTab}
              onTabSelected={(tab) => setActiveTab(tab)}/>

        {activeTab === t('recommendations') && (
          <div className="p-2 flex w-full h-full overflow-x-hidden overflow-y-auto">
            <VideoCardGrid
              refreshItem={refreshCuratorItem}
              fetchMoreItems={fetchMoreItems}
              items={curatorItems}
              providers={providers}
              showInteractions={isLoggedIn}
              isLoading={isItemsLoading && isMainDataLoading}
              isFinished={isCuratorItemsFinished}
            />
          </div>
        )}

        {activeTab === t('topics') && (
          <div className="p-2 flex w-full h-full overflow-x-hidden overflow-y-auto">
            <CuratorTopicsList topics={topics} isLoading={isMainDataLoading} refreshTopics={refreshAllTopics}/>
          </div>
        )}
      </div>

      {/* Desktop two-column layout */}
      <div className="hidden flex-col md:grid md:grid-cols-3 h-full overflow-auto">
        <div className="col-span-2 border-r border-neutral h-full overflow-y-auto">
          <div className="flex flex-col h-full gap-4 items-start">
            <div className="flex flex-row gap-2 items-center h-fit w-full justify-center">
              <ThumbsUpFilledIcon/>
              <h2 className={"text-xl text-balance"}>{t("recommendations")}</h2>
            </div>
            <VideoCardGrid
              refreshItem={refreshCuratorItem}
              fetchMoreItems={fetchMoreItems}
              items={curatorItems}
              providers={providers}
              showInteractions={isLoggedIn}
              isLoading={isItemsLoading && isMainDataLoading}
              isFinished={isCuratorItemsFinished}
            />
          </div>
        </div>

        <div className="col-span-1 flex w-full h-full overflow-x-hidden overflow-y-auto">
          <div className="w-full items-center mx-4">
            <div className="flex flex-col h-full gap-4 items-start">
              <div className="flex flex-row gap-2 items-center h-fit w-full justify-center">
                <RectangleGroup/>
                <h2 className="text-xl text-balance">{t("topics")}</h2>
              </div>
              <CuratorTopicsList topics={topics} isLoading={isMainDataLoading} refreshTopics={refreshAllTopics}/>
            </div>
          </div>
        </div>
      </div>
      {curator && (
        <ShareCuratorModal
          curatorName={curatorName}
          curatorUrl={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}
    </Drawer>
  );
};

export default CuratorPageComponent;
