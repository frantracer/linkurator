import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useSubscriptions from "../../hooks/useSubscriptions";
import useProfile from "../../hooks/useProfile";
import useTopicItems from "../../hooks/useTopicItems";
import TopicVideoCardGrid from "../../components/TopicVideoCardGrid";
import NewTopicModal from "../../components/NewTopicModal";
import {useTopics} from "../../hooks/useTopics";
import EditTopicModal from "../../components/EditTopicModal";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {LATERAL_MENU_ID} from "../../utilities/hideLateralMenu";
import FilterOptionsModal from "../../components/FilterOptionsModal";
import useFilters from "../../hooks/useFilters";
import TopicsLateralMenu from "../../components/TopicsLateralMenu";
import {useRouter} from "next/router";
import CreateFirstTopicHero from "../../components/CreateFirstTopicHero";

const Home: NextPage = () => {
  const router = useRouter()

  const topicIdFromQuery: string | undefined = router.query.id ? router.query.id[0] as string : undefined;

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
  } = useTopicItems(topicIdFromQuery);
  const [filters, setFilters] = useFilters();

  const selectedTopic: Topic | undefined = topics.find(t => t.uuid === topicIdFromQuery);

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
      }
    }
  }, [topicIdFromQuery, router, profile, profileIsLoading, topics]);

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
      <main className="flex bg-gray-100">
        <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
        <FilterOptionsModal filters={filters} setFilters={setFilters}/>
        {selectedTopic &&
            <EditTopicModal refreshTopics={refreshTopics}
                            subscriptions={subscriptions}
                            topic={selectedTopic}
                            refreshTopicItems={refreshTopicItems}/>}

        <div onScroll={handleGridScroll} className="drawer lg:drawer-open h-screen overflow-y-auto">
          <input id={LATERAL_MENU_ID} type="checkbox" className="drawer-toggle"/>
          <div className="drawer-content">
            {topics.length === 0 && !topicsAreLoading &&
              <CreateFirstTopicHero/>
            }
            {topics.length > 0 &&
              <TopicVideoCardGrid topic={selectedTopic}
                                  items={topicItems}
                                  fetchMoreItems={fetchMoreItems}
                                  refreshTopics={refreshTopics}
                                  refreshItem={refreshTopicItem}
                                  subscriptions={subscriptions}
                                  filters={filters}
                                  isLoading={isLoading}
                                  topicIsFinished={isFinished}/>
            }
          </div>
          <div className="drawer-side z-20">
            <label htmlFor={LATERAL_MENU_ID} aria-label="close sidebar" className="drawer-overlay"></label>
            <TopicsLateralMenu
              topics={topics}
              selectedTopic={selectedTopic}
              subscriptions={subscriptions}
              profile={profile!}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
