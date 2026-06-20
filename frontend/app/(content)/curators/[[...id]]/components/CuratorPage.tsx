'use client';

import {useTranslations} from 'next-intl';
import {useRouter, useSearchParams} from "next/navigation";
import React, {Suspense, useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import CrossButton from "../../../../../components/atoms/CrossButton";
import {
  AddIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  RectangleGroup,
  ShareIcon,
  SubscriptionIcon,
  ThumbsUpIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CuratorFilter, {CURATOR_FILTER_ID} from "../../../../../components/organism/CuratorFilter";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
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
import CuratorSubscriptionsList from "../../../../../components/organism/CuratorSubscriptionsList";
import {useCuratorSubscriptions} from "../../../../../hooks/useCuratorSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import ShareCuratorModal, {ShareCuratorModalId} from "../../../../../components/organism/ShareCuratorModal";
import {openModal} from "../../../../../utilities/modalAction";
import useProviders from "../../../../../hooks/useProviders";

type SectionKey = "recommendations" | "topics" | "subscriptions";

const SECTION_KEYS: SectionKey[] = ["recommendations", "topics", "subscriptions"];
const DEFAULT_SECTION: SectionKey = "recommendations";

const CuratorPageComponent = ({curatorName}: { curatorName: string }) => {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const {providers} = useProviders();
  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [selectedSection, setSelectedSection] = useState<SectionKey>(DEFAULT_SECTION);

  const sectionParam = searchParams.get("section");

  useEffect(() => {
    const nextSection = sectionParam && SECTION_KEYS.includes(sectionParam as SectionKey)
      ? sectionParam as SectionKey
      : DEFAULT_SECTION;
    setSelectedSection(nextSection);
  }, [sectionParam]);

  const selectSection = (key: SectionKey) => {
    if (key === selectedSection) {
      return;
    }
    router.push(`${paths.CURATORS}/${encodeURIComponent(curatorName)}?section=${key}`);
  };

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
  const {
    subscriptions,
    subscriptionsIsLoading: isSubscriptionsLoading,
    refetchSubscriptions
  } = useCuratorSubscriptions(curatorId);

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

  const sections: { key: SectionKey; title: string; icon: React.ReactNode }[] = [
    {key: "recommendations", title: t("recommendations"), icon: <ThumbsUpIcon/>},
    {key: "topics", title: t("topics"), icon: <RectangleGroup/>},
    {key: "subscriptions", title: t("subscriptions"), icon: <SubscriptionIcon/>},
  ];

  return (
    <Drawer id={CURATOR_FILTER_ID} right={true} alwaysOpenOnDesktop={false}>
      <CuratorFilter curator={curator} filters={filters} setFilters={setFilters} resetFilters={resetFilters}/>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          {!isMainDataLoading && curator &&
              <>
                  <div className="w-10 shrink-0 flex items-center justify-start">
                    {isLoggedIn && !isOwnCuratorProfile && curator &&
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
                      </div>
                      <div className="flex flex-row gap-2 items-center justify-center">
                        {curator && curator.followed &&
                            <Tag>
                    <span>
                    {t("following")}
                    </span>
                                <CrossButton onClick={() => handleUnfollowCurator(curator.id)}/>
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
                    <Button primary={false} fitContent={true} clickAction={handleFilter} tooltip={t("filter")}>
                      <FunnelIcon/>
                    </Button>
                  </div>
              </>
          }
        </div>
      </TopTitle>

      <div className="flex flex-col h-full bg-base-300 overflow-hidden">
        <div
          className="shrink-0 flex flex-row flex-nowrap md:flex-wrap gap-2 p-2 overflow-x-auto md:overflow-visible scrollbar-hide border-b-[1px] border-neutral">
          {sections.map(section => (
            <Tag
              key={section.key}
              selected={section.key === selectedSection}
              onClick={() => selectSection(section.key)}
            >
              <div className="flex flex-row items-center gap-1 whitespace-nowrap">
                {section.icon}
                {section.title}
              </div>
            </Tag>
          ))}
        </div>

        {selectedSection === "recommendations" && (
          <div className="flex-1 min-h-0">
            <ContentItemCardGrid
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

        {selectedSection === "topics" && (
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
              <CuratorTopicsList
                topics={topics}
                isUserLoggedIn={isLoggedIn}
                isLoading={isMainDataLoading}
                refreshTopics={refreshAllTopics}/>
            </div>
          </div>
        )}

        {selectedSection === "subscriptions" && (
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
              <CuratorSubscriptionsList
                subscriptions={subscriptions}
                isLoading={isMainDataLoading || isSubscriptionsLoading}
                refreshSubscriptions={() => refetchSubscriptions()}/>
            </div>
          </div>
        )}
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

const CuratorPage = ({curatorName}: { curatorName: string }) => (
  <Suspense>
    <CuratorPageComponent curatorName={curatorName}/>
  </Suspense>
);

export default CuratorPage;
