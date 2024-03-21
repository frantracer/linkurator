import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useSubscriptions from "../../hooks/useSubscriptions";
import useProfile from "../../hooks/useProfile";
import useTopicItems from "../../hooks/useTopicItems";
import TopicVideoCardGrid from "../../components/organism/TopicVideoCardGrid";
import NewTopicModal from "../../components/organism/NewTopicModal";
import {useTopics} from "../../hooks/useTopics";
import EditTopicModal from "../../components/organism/EditTopicModal";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import useFilters from "../../hooks/useFilters";
import TopicsLateralMenu from "../../components/organism/TopicsLateralMenu";
import {useRouter} from "next/router";
import CreateFirstTopicHero from "../../components/organism/CreateFirstTopicHero";
import Drawer from "../../components/molecules/Drawer";
import TopTitle from "../../components/molecules/TopTitle";
import Button from "../../components/atoms/Button";
import {MenuIcon, OptionsIcon} from "../../components/atoms/Icons";
import {LATERAL_TOPIC_MENU_ID} from "../../components/organism/LateralTopicList";
import TopicDetails, {TOPIC_DETAILS_ID} from "../../components/organism/TopicDetails";

const Home: NextPage = () => {
  const router = useRouter()

  const topicIdFromQuery: string | undefined = router.query.id ? router.query.id[0] as string : undefined;

  const {filters, setFilters, setDefaultFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions} = useSubscriptions(profile);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {
    topicItems,
    isLoading,
    isFinished,
    refreshTopicItem,
    refreshTopicItems,
    fetchMoreItems
  } = useTopicItems(topicIdFromQuery, filters);
  const [leftSidebarIsOpen, setLeftSidebarOpen] = React.useState<boolean>(false);
  const [rightSidebarIsOpen, setRightSidebarOpen] = React.useState<boolean>(false);

  const selectedTopic: Topic | undefined = topics.find(t => t.uuid === topicIdFromQuery);
  const topicName = selectedTopic ? selectedTopic.name : "";

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
    if (!profileIsLoading) {
      if (profile === undefined) {
        router.push(paths.LOGIN)
      } else {
        if (topicIdFromQuery) {
          if (topics.length > 0 && topics.find(t => t.uuid === topicIdFromQuery) === undefined) {
            router.push(paths.TOPICS)
          }
        } else if (topics.length > 0) {
          router.push(paths.TOPICS + "/" + topics[0].uuid)
        }
        setDefaultFilters()
      }
    }
  }, [topicIdFromQuery, router, profile, profileIsLoading, topics]);

  return (
    <div className="h-screen w-screen">
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
      <Drawer id={LATERAL_TOPIC_MENU_ID} sidebarIsOpen={leftSidebarIsOpen}
              openSidebar={() => setLeftSidebarOpen(true)} closeSidebar={() => setLeftSidebarOpen(false)}>
        <TopicsLateralMenu
          topics={topics}
          selectedTopic={selectedTopic}
          subscriptions={subscriptions}
          profile={profile!}
          closeMenu={() => setLeftSidebarOpen(false)}
        />
        <Drawer id={TOPIC_DETAILS_ID} right={true} alwaysOpenOnDesktop={false} sidebarIsOpen={rightSidebarIsOpen}
                openSidebar={() => setRightSidebarOpen(true)} closeSidebar={() => setRightSidebarOpen(false)}>
          <TopicDetails topic={selectedTopic}
                        subscriptions={subscriptions}
                        filters={filters}
                        setFilters={setFilters}
                        refreshTopics={refreshTopics}
                        closeSidebar={() => setRightSidebarOpen(false)}
          />
          <TopTitle>
            <Button clickAction={() => setLeftSidebarOpen(true)} showOnlyOnMobile={true}>
              <MenuIcon/>
            </Button>
            <h1 className="text-2xl font-bold whitespace-nowrap truncate text-center w-full">
              {topicName}
            </h1>
            <Button clickAction={() => setRightSidebarOpen(true)}>
              <OptionsIcon/>
            </Button>
          </TopTitle>
          {topics.length === 0 && !topicsAreLoading &&
              <CreateFirstTopicHero/>
          }
          {topics.length > 0 &&
              <TopicVideoCardGrid topic={selectedTopic}
                                  items={topicItems}
                                  fetchMoreItems={fetchMoreItems}
                                  refreshItem={refreshTopicItem}
                                  subscriptions={subscriptions}
                                  filters={filters}
                                  isLoading={isLoading}
                                  topicIsFinished={isFinished}
                                  handleScroll={handleGridScroll}/>
          }
          <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
          {selectedTopic &&
              <EditTopicModal refreshTopics={refreshTopics}
                              subscriptions={subscriptions}
                              topic={selectedTopic}
                              refreshTopicItems={refreshTopicItems}/>}
        </Drawer>
      </Drawer>
    </div>
  );
};

export default Home;
