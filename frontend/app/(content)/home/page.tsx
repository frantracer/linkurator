'use client';

import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import TopTitle from "../../../components/molecules/TopTitle";
import Button from "../../../components/atoms/Button";
import {paths} from "../../../configuration";
import useProfile from "../../../hooks/useProfile";
import useSubscriptions from "../../../hooks/useSubscriptions";
import {useTopics} from "../../../hooks/useTopics";
import useFilters from "../../../hooks/useFilters";
import ItemCarousel from "../../../components/molecules/ItemCarousel";
import useLatestSubscriptionItems from "../../../hooks/useLatestSubscriptionItems";
import useLatestFavoriteTopicItems from "../../../hooks/useLatestFavoriteTopicItems";
import useLatestFollowedCuratorItems from "../../../hooks/useLatestFollowedCuratorItems";
import {useCurators} from "../../../hooks/useCurators";
import useProviders from "../../../hooks/useProviders";
import {HomeIcon} from "../../../components/atoms/Icons";
import EmptyStateNoFollowedCurators from "../../../components/organism/EmptyStateNoFollowedCurators";
import EmptyStateNoSubscriptions from "../../../components/organism/EmptyStateNoSubscriptions";
import EmptyStateBox from "../../../components/atoms/EmptyStateBox";

const HomePageComponent = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {providers} = useProviders();

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading} = useSubscriptions(profile);
  const {topics, topicsAreLoading} = useTopics(profile, profileIsLoading);
  const {filters} = useFilters();
  const {
    latestItems,
    isLoading: latestItemsLoading,
    refetch: refetchSubscriptionItems
  } = useLatestSubscriptionItems(subscriptions, 20, filters);
  const {
    latestFavoriteItems,
    isLoading: latestFavoriteItemsLoading,
    refetch: refetchFavoriteTopicItems
  } = useLatestFavoriteTopicItems(topics, 20, filters);
  const {curators} = useCurators(profile, profileIsLoading);
  const {
    latestCuratorItems,
    isLoading: latestCuratorItemsLoading,
    refetch: refetchCuratorItems
  } = useLatestFollowedCuratorItems(20, filters);

  // Get favorite topics and followed curators
  const isLoading = profileIsLoading || subscriptionsAreLoading || topicsAreLoading;
  const hasSubscriptions = subscriptions.length > 0;
  const hasTopics = topics.length > 0;
  const favoriteTopics = topics.filter(topic => topic.is_favorite);
  const hasFavoriteTopics = favoriteTopics.length > 0;
  const hasFollowedCurators = curators.length > 0;

  const goToTopics = () => {
    window.location.href = paths.TOPICS;
  }

  const goToChats = () => {
    window.location.href = paths.CHATS;
  }

  const refreshAllItems = () => {
    refetchSubscriptionItems();
    refetchFavoriteTopicItems();
    refetchCuratorItems();
  }

  useEffect(() => {
    if (!profileIsLoading && !profile) {
      router.push(paths.LOGIN);
    }
  }, [router, profile, profileIsLoading]);

  if (!profile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-base-300">
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0 flex items-center justify-start"/>
          <h1 className="text-xl font-bold flex-1 min-w-0 flex items-center justify-center gap-2">
            <HomeIcon/>
            {t("home")}
          </h1>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>

      {isLoading &&
          <div className="flex items-center justify-center h-full">
              <span className="loading loading-spinner loading-lg"></span>
          </div>
      }

      {!hasSubscriptions && !isLoading &&
          <div className="flex flex-col p-4 my-auto">
              <EmptyStateNoSubscriptions/>
          </div>
      }

      {hasSubscriptions && !isLoading &&
          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Curator Items Carousel */}
            {hasFollowedCurators &&
                <ItemCarousel
                    items={latestCuratorItems}
                    providers={providers}
                    title={t("latest_from_followed_curators")}
                    isLoading={latestCuratorItemsLoading}
                    collapsible={false}
                    defaultExpanded={true}
                    refreshItem={refreshAllItems}
                />
            }

            {/* Favorite Topics Carousel */}
            {hasTopics && hasFavoriteTopics &&
                <ItemCarousel
                    items={latestFavoriteItems}
                    providers={providers}
                    title={t("latest_from_favorite_topics")}
                    isLoading={latestFavoriteItemsLoading}
                    collapsible={false}
                    defaultExpanded={true}
                    refreshItem={refreshAllItems}
                />
            }

            {/* Subscriptions Carousel */}
              <ItemCarousel
                  items={latestItems}
                  providers={providers}
                  title={t("latest_from_subscriptions")}
                  isLoading={latestItemsLoading}
                  collapsible={false}
                  defaultExpanded={true}
                  refreshItem={refreshAllItems}
              />

            {/* Suggestions when no followed curators or no topics */}
            {!hasTopics && hasSubscriptions && (
              <EmptyStateBox
                title={t("organize_subscriptions_title")}
                message={t("organize_subscriptions_description")}
              >
                <Button
                  clickAction={() => goToChats()}
                  primary={false}
                  fitContent={true}
                >
                  {t("try_chatbot")}
                </Button>
              </EmptyStateBox>
            )}

            {!hasFollowedCurators &&
                <EmptyStateNoFollowedCurators/>
            }

            {hasTopics && !hasFavoriteTopics && (
              <EmptyStateBox
                title={t("no_favorite_topics_title")}
                message={t("no_favorite_topics_message")}
              >
                <Button
                  clickAction={() => goToTopics()}
                  primary={false}
                  fitContent={true}
                >
                  {t("browse_topics")}
                </Button>
              </EmptyStateBox>
            )}
          </div>
      }
    </div>
  );
};

export default HomePageComponent;