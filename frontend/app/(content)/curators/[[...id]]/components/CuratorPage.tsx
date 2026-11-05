'use client';

import {useTranslations} from 'next-intl';
import {useRouter, useSearchParams} from "next/navigation";
import React, {Suspense, useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  RectangleGroup,
  ShareIcon,
  SubscriptionIcon,
  ThumbsUpIcon
} from "../../../../../components/atoms/Icons";
import Tag from "../../../../../components/atoms/Tag";
import TagsRow from "../../../../../components/atoms/TagsRow";
import PageHeader from "../../../../../components/organism/PageHeader";
import FollowToggleButton from "../../../../../components/molecules/FollowToggleButton";
import MenuAction from "../../../../../components/molecules/MenuAction";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import useShareLink from "../../../../../hooks/useShareLink";
import Avatar from "../../../../../components/atoms/Avatar";
import FilterToggleButton from "../../../../../components/molecules/FilterToggleButton";
import useFilterBarVisibility from "../../../../../hooks/useFilterBarVisibility";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import SearchBar from "../../../../../components/molecules/SearchBar";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
import {paths} from "../../../../../configuration";
import {useCurator} from "../../../../../hooks/useCurator";
import useCuratorItems from "../../../../../hooks/useCuratorItems";
import {useCurators} from "../../../../../hooks/useCurators";
import {useCuratorTopics} from "../../../../../hooks/useCuratorTopics";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";
import {newScopedChatPath, scopeFromFilters} from "../../../../../utilities/chatScope";
import CuratorTopicsList from "../../../../../components/organism/CuratorTopicsList";
import CuratorSubscriptionsList from "../../../../../components/organism/CuratorSubscriptionsList";
import {useCuratorSubscriptions} from "../../../../../hooks/useCuratorSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
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
  const {filters, setFilters, resetFilters, isModified: areFiltersModified, savedFilters} = useFilters();
  const {showFilters, toggleFilters} = useFilterBarVisibility();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [selectedSection, setSelectedSection] = useState<SectionKey>(DEFAULT_SECTION);
  const [nameFilter, setNameFilter] = useState("");

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

  const matchesNameFilter = (name: string) => name.toLowerCase().includes(nameFilter.trim().toLowerCase());
  const filteredTopics = topics.filter(topic => matchesNameFilter(topic.name));
  const filteredSubscriptions = subscriptions.filter(subscription => matchesNameFilter(subscription.name));
  const isRecommendationsSection = selectedSection === "recommendations";

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

  const handleChatAboutThis = () => {
    if (!curator) return;
    router.push(newScopedChatPath(scopeFromFilters(filters, {curatorIds: [curator.id]})));
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

  const shareCuratorLink = useShareLink(curatorName);

  const sections: { key: SectionKey; title: string; icon: React.ReactNode }[] = [
    {key: "recommendations", title: t("recommendations"), icon: <ThumbsUpIcon/>},
    {key: "topics", title: t("topics"), icon: <RectangleGroup/>},
    {key: "subscriptions", title: t("subscriptions"), icon: <SubscriptionIcon/>},
  ];

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
      {!isMainDataLoading && curator &&
          <PageHeader
              title={curatorName}
              media={<Avatar src={curatorThumbnail} alt=""/>}
              subtitle={t("topics_count", {count: topics.length})}
              actions={<>
                <div className="hidden sm:contents">
                  <Button primary={false} clickAction={handleChatAboutThis} tooltip={t("chat_about_this")}>
                      <ChatBubbleIcon/>
                      {t("ask_ai")}
                  </Button>
                </div>
                {!isOwnCuratorProfile &&
                    <FollowToggleButton followed={curator.followed} isLoggedIn={isLoggedIn}
                                        iconOnlyOnMobile={true}
                                        onFollow={() => handleFollowCurator(curator.id)}
                                        onUnfollow={() => handleUnfollowCurator(curator.id)}/>
                }
                <Dropdown label={t("more")} button={<EllipsisHorizontalIcon/>} width={"narrow"} position="end"
                          bottom={true} closeOnClickInside={true}>
                    <Menu>
                        <MenuAction icon={<ChatBubbleIcon/>} label={t("ask_ai")} onClick={handleChatAboutThis}
                                    mobileOnly={true}/>
                        <MenuAction icon={<ShareIcon/>} label={t("share")}
                                    onClick={isOwnCuratorProfile ? handleShareCurator : shareCuratorLink}/>
                    </Menu>
                </Dropdown>
              </>}
          />
      }
      {(isMainDataLoading || !curator) && <div className="h-14 shrink-0 border-b border-neutral bg-base-100"/>}

      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-hidden">
        <TagsRow leading={
          <FilterToggleButton isOpen={showFilters}
                              isModified={isRecommendationsSection ? areFiltersModified : nameFilter.trim() !== ""}
                              onClick={toggleFilters}/>
        }>
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
        </TagsRow>

        {isRecommendationsSection && showFilters && (
          <ContentFilterBar savedFilters={savedFilters} filters={filters} setFilters={setFilters} resetFilters={resetFilters}/>
        )}

        {!isRecommendationsSection && showFilters && (
          <div className="shrink-0 px-4 py-3 border-b border-neutral bg-base-300">
            <div className="sm:max-w-md">
              <SearchBar
                placeholder={selectedSection === "topics" ? t("filter_topics_placeholder") : t("filter_subscriptions_placeholder")}
                value={nameFilter}
                handleChange={setNameFilter}
                icon="filter"
              />
            </div>
          </div>
        )}

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
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto pb-mobile-nav">
            <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
              <CuratorTopicsList
                topics={filteredTopics}
                isUserLoggedIn={isLoggedIn}
                isLoading={isMainDataLoading}
                refreshTopics={refreshAllTopics}/>
            </div>
          </div>
        )}

        {selectedSection === "subscriptions" && (
          <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto pb-mobile-nav">
            <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
              <CuratorSubscriptionsList
                subscriptions={filteredSubscriptions}
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
    </div>
  );
};

const CuratorPage = ({curatorName}: { curatorName: string }) => (
  <Suspense>
    <CuratorPageComponent curatorName={curatorName}/>
  </Suspense>
);

export default CuratorPage;
