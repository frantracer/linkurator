'use client';

import {useTranslations} from "next-intl";
import {useRouter, useSearchParams} from "next/navigation";
import React, {Suspense, useEffect, useState} from "react";
import TopTitle from "../../../components/molecules/TopTitle";
import {paths} from "../../../configuration";
import useProfile from "../../../hooks/useProfile";
import useSubscriptions from "../../../hooks/useSubscriptions";
import {useTopics} from "../../../hooks/useTopics";
import useFilters from "../../../hooks/useFilters";
import useLatestSubscriptionItems from "../../../hooks/useLatestSubscriptionItems";
import useLatestFavoriteTopicItems from "../../../hooks/useLatestFavoriteTopicItems";
import useLatestFollowedCuratorItems from "../../../hooks/useLatestFollowedCuratorItems";
import {useCurators} from "../../../hooks/useCurators";
import useProviders from "../../../hooks/useProviders";
import {CuratorIcon, FunnelIcon, HomeIcon, StarIcon, SubscriptionIcon} from "../../../components/atoms/Icons";
import Button from "../../../components/atoms/Button";
import Tag from "../../../components/atoms/Tag";
import Drawer from "../../../components/molecules/Drawer";
import ContentItemCardGrid from "../../../components/organism/ContentItemCardGrid";
import HomeFilter, {HOME_FILTER_ID} from "../../../components/organism/HomeFilter";
import {showLateralMenu} from "../../../utilities/lateralMenuAction";
import EmptyStateNoFavoriteTopics from "../../../components/organism/EmptyStateNoFavoriteTopics";
import EmptyStateNoFollowedCurators from "../../../components/organism/EmptyStateNoFollowedCurators";
import EmptyStateNoMatches from "../../../components/organism/EmptyStateNoMatches";
import EmptyStateOrganizeSubscriptions from "../../../components/organism/EmptyStateOrganizeSubscriptions";
import EmptyStateImportSubscriptions from "../../../components/organism/EmptyStateImportSubscriptions";
import {SubscriptionItem} from "../../../entities/SubscriptionItem";

type SectionKey = "curators" | "favorites" | "subscriptions";

const SECTION_KEYS: SectionKey[] = ["curators", "favorites", "subscriptions"];
const DEFAULT_SECTION: SectionKey = "favorites";

const HomePageComponent = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const {providers} = useProviders();

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
    router.push(`${paths.HOME}?section=${key}`);
  };

  const handleShowFilters = () => {
    showLateralMenu(HOME_FILTER_ID);
  };

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading} = useSubscriptions(profile);
  const {topics, topicsAreLoading} = useTopics(profile, profileIsLoading);
  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {
    latestItems,
    isLoading: latestItemsLoading,
    isFinished: latestItemsFinished,
    refetch: refetchSubscriptionItems,
    fetchMoreItems: fetchMoreSubscriptionItems
  } = useLatestSubscriptionItems(subscriptions, 20, debouncedFilters);
  const {
    latestFavoriteItems,
    isLoading: latestFavoriteItemsLoading,
    isFinished: latestFavoriteItemsFinished,
    refetch: refetchFavoriteTopicItems,
    fetchMoreItems: fetchMoreFavoriteTopicItems
  } = useLatestFavoriteTopicItems(topics, debouncedFilters);
  const {curators} = useCurators(profile, profileIsLoading);
  const {
    latestCuratorItems,
    isLoading: latestCuratorItemsLoading,
    isFinished: latestCuratorItemsFinished,
    refetch: refetchCuratorItems,
    fetchMoreItems: fetchMoreCuratorItems
  } = useLatestFollowedCuratorItems(20, debouncedFilters);

  const isLoading = profileIsLoading || subscriptionsAreLoading || topicsAreLoading;
  const hasSubscriptions = subscriptions.length > 0;
  const hasTopics = topics.length > 0;
  const hasFollowedCurators = curators.length > 0;

  const sections: {
    key: SectionKey;
    title: string;
    icon: React.ReactNode;
    items: SubscriptionItem[];
    isLoading: boolean;
    isFinished: boolean;
    refetch: () => void;
    fetchMoreItems: () => void;
    emptyState: React.ReactNode;
  }[] = [
    {
      key: "favorites",
      title: t("favorites"),
      icon: <StarIcon/>,
      items: latestFavoriteItems,
      isLoading: latestFavoriteItemsLoading,
      isFinished: latestFavoriteItemsFinished,
      refetch: refetchFavoriteTopicItems,
      fetchMoreItems: fetchMoreFavoriteTopicItems,
      emptyState: !hasSubscriptions
        ? <EmptyStateImportSubscriptions/>
        : hasTopics
          ? <EmptyStateNoFavoriteTopics/>
          : <EmptyStateOrganizeSubscriptions/>,
    },
    {
      key: "curators",
      title: t("curators"),
      icon: <CuratorIcon/>,
      items: latestCuratorItems,
      isLoading: latestCuratorItemsLoading,
      isFinished: latestCuratorItemsFinished,
      refetch: refetchCuratorItems,
      fetchMoreItems: fetchMoreCuratorItems,
      emptyState: hasFollowedCurators ? <EmptyStateNoMatches/> : <EmptyStateNoFollowedCurators/>,
    },
    {
      key: "subscriptions",
      title: t("subscriptions"),
      icon: <SubscriptionIcon/>,
      items: latestItems,
      isLoading: latestItemsLoading,
      isFinished: latestItemsFinished,
      refetch: refetchSubscriptionItems,
      fetchMoreItems: fetchMoreSubscriptionItems,
      emptyState: hasSubscriptions
        ? <EmptyStateNoMatches/>
        : <EmptyStateImportSubscriptions/>,
    },
  ];

  const activeSection = sections.find(section => section.key === selectedSection) ?? sections[0];
  const showEmptyState = !activeSection.isLoading && activeSection.items.length === 0;

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

  useEffect(() => {
    if (!profileIsLoading && !profile) {
      router.push(paths.LOGIN);
    }
  }, [router, profile, profileIsLoading]);

  if (!profile) {
    return null;
  }

  return (
    <Drawer id={HOME_FILTER_ID} right={true} alwaysOpenOnDesktop={false}>
      <HomeFilter title={activeSection.title}
                  icon={activeSection.icon}
                  filters={filters}
                  showInteractions={true}
                  setFilters={setFilters}
                  resetFilters={resetFilters}/>
      <div className="flex flex-col h-full bg-base-300">
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0 flex items-center justify-start"/>
          <h1 className="text-xl font-bold flex-1 min-w-0 flex items-center justify-center gap-2">
            <HomeIcon/>
            {t("home")}
          </h1>
          <div className="w-10 shrink-0 flex items-center justify-end">
            <Button primary={false} fitContent={true} clickAction={handleShowFilters} tooltip={t("filter")}>
              <FunnelIcon/>
            </Button>
          </div>
        </div>
      </TopTitle>

      {isLoading &&
          <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
          </div>
      }

      {!isLoading &&
          <>
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

            {showEmptyState
              ? <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                {activeSection.emptyState}
              </div>
              : <div className="flex-1 min-h-0">
                <ContentItemCardGrid
                  items={activeSection.items}
                  providers={providers}
                  fetchMoreItems={activeSection.fetchMoreItems}
                  refreshItem={() => activeSection.refetch()}
                  filters={debouncedFilters}
                  isLoading={activeSection.isLoading}
                  isFinished={activeSection.isFinished}
                  showInteractions={true}
                />
              </div>
            }
          </>
      }
      </div>
    </Drawer>
  );
};

const HomePage = () => (
  <Suspense>
    <HomePageComponent/>
  </Suspense>
);

export default HomePage;
