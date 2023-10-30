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

const Home: NextPage = () => {
  const router = useRouter()

  const topicIdFromQuery: string | undefined = router.query.id ? router.query.id[0] as string : undefined;

  const {profile, profileIsLoading} = useProfile();
  const [subscriptions] = useSubscriptions(profile);
  const [topics, refreshTopics] = useTopics(profile);
  const [topicItems, loadingTopicItems, refreshTopicItems, refreshTopicItem,
    selectedTopicId, setSelectedTopicId, topicIsFinished] = useTopicItems();
  const [filters, setFilters] = useFilters();

  const selectedTopic: Topic | undefined = topics.find(t => t.uuid === selectedTopicId);

  const refreshItem = (item_uuid: string) => {
    refreshTopicItem(item_uuid)
  }

  useEffect(() => {
    if (!profileIsLoading) {
      if (profile === undefined) {
        router.push(paths.LOGIN)
      } else {
        if (topicIdFromQuery) {
          if (topics.length > 0 && topics.find(t => t.uuid === topicIdFromQuery) === undefined) {
            router.push(paths.TOPICS)
          } else {
            setSelectedTopicId(topicIdFromQuery);
          }
        } else if (selectedTopicId) {
          router.push(paths.TOPICS + "/" + selectedTopicId)
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

        <div className="drawer drawer-mobile">
          <input id={LATERAL_MENU_ID} type="checkbox" className="drawer-toggle"/>
          <TopicVideoCardGrid topic={selectedTopic}
                              items={topicItems}
                              refreshTopics={refreshTopics}
                              refreshItem={refreshItem}
                              setSelectedTopicId={setSelectedTopicId}
                              subscriptions={subscriptions}
                              filters={filters}
                              isLoading={loadingTopicItems}
                              topicIsFinished={topicIsFinished}/>
          <div className="drawer-side">
            <label htmlFor={LATERAL_MENU_ID} className="drawer-overlay"></label>
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
