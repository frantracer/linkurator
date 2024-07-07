'use client';

import type {NextPage} from "next";
import React, {useEffect} from "react";
import useSubscriptions from "../../../../hooks/useSubscriptions";
import useProfile from "../../../../hooks/useProfile";
import useTopicItems from "../../../../hooks/useTopicItems";
import TopicVideoCardGrid from "../../../../components/organism/TopicVideoCardGrid";
import {useTopics} from "../../../../hooks/useTopics";
import EditTopicModal from "../../../../components/organism/EditTopicModal";
import {isTopicScanned} from "../../../../entities/Topic";
import {paths} from "../../../../configuration";
import useFilters from "../../../../hooks/useFilters";
import {useParams, useRouter} from "next/navigation";
import CreateFirstTopicHero from "../../../../components/organism/CreateFirstTopicHero";
import Drawer from "../../../../components/molecules/Drawer";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {MenuIcon, OptionsIcon} from "../../../../components/atoms/Icons";
import TopicDetails, {TOPIC_DETAILS_ID} from "../../../../components/organism/TopicDetails";
import {hideLateralMenu, showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import useTopicSubscriptions from "../../../../hooks/useTopicSubscriptions";
import {useTopic} from "../../../../hooks/useTopic";

const REFRESH_TOPICS_INTERVAL = 30000;

const Home: NextPage = () => {
  const router = useRouter()
  const pathParams = useParams<{ id: string[] | string }>();

  const topicIdFromQuery: string | undefined = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const {filters, setFilters, resetFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {topic: selectedTopic, topicIsLoading, topicIsError} = useTopic(topicIdFromQuery, topics, topicsAreLoading)
  const {topicSubscriptions} = useTopicSubscriptions(selectedTopic, subscriptions)
  const {
    topicItems,
    isLoading,
    isFinished,
    refreshTopicItem,
    refreshTopicItems,
    fetchMoreItems
  } = useTopicItems(selectedTopic ? selectedTopic.uuid : undefined, filters);

  const topicName = selectedTopic ? selectedTopic.name : "";
  const isTopicBeingScanned = selectedTopic ? !isTopicScanned(selectedTopic, subscriptions) : false
  const isUserLogged = !!profile
  const isUserTopic = !!(topics.find(topic => topic.uuid === topicIdFromQuery))
  const isTopicEditable = isUserLogged && isUserTopic

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget
    if (isFinished || isLoading) {
      return
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreItems()
    }
  }

  useEffect(() => {
    if (!topicIdFromQuery && topics.length > 0) {
      router.push(paths.TOPICS + "/" + topics[0].uuid)
    }

    if (isTopicBeingScanned) {
      const timer = setTimeout(() => {
        refreshTopicItems()
      }, REFRESH_TOPICS_INTERVAL)
      return () => clearTimeout(timer)
    }

  }, [subscriptions, topicIdFromQuery, router, profileIsLoading, topics, refreshTopicItems, isTopicBeingScanned]);

  return (
    <Drawer id={TOPIC_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <TopicDetails topic={selectedTopic}
                    subscriptions={topicSubscriptions}
                    filters={filters}
                    editable={isTopicEditable}
                    showInteractions={isUserLogged}
                    setFilters={setFilters}
                    resetFilters={resetFilters}
                    refreshTopics={refreshTopics}
                    closeSidebar={() => hideLateralMenu(TOPIC_DETAILS_ID)}
      />
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <h1 className="text-2xl font-bold whitespace-nowrap truncate text-center w-full">
          {topicName}
        </h1>
        <Button clickAction={() => showLateralMenu(TOPIC_DETAILS_ID)}>
          <OptionsIcon/>
        </Button>
      </TopTitle>
      {topicIsError && !topicIsLoading &&
          <div className="flex items-center justify-center h-screen">
              <span>Topic not found</span>
          </div>
      }
      {!selectedTopic && !topicIsLoading && !topicIsError &&
          <CreateFirstTopicHero/>
      }
      {selectedTopic &&
          <TopicVideoCardGrid topic={selectedTopic}
                              items={topicItems}
                              fetchMoreItems={fetchMoreItems}
                              refreshItem={refreshTopicItem}
                              subscriptions={topicSubscriptions}
                              filters={filters}
                              isLoading={isLoading}
                              topicIsFinished={isFinished}
                              handleScroll={handleGridScroll}
                              isTopicBeingScanned={isTopicBeingScanned}
                              displayInteractions={isUserLogged}
          />
      }
      {selectedTopic &&
          <EditTopicModal refreshTopics={refreshTopics}
                          subscriptions={subscriptions}
                          topic={selectedTopic}
                          refreshTopicItems={refreshTopicItems}
                          refreshSubscriptions={refreshSubscriptions}
          />
      }
    </Drawer>
  );
};

export default Home;
