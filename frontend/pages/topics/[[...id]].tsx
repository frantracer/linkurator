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
import EditTopicModal, {EditTopicModalId} from "../../components/organism/EditTopicModal";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {LATERAL_MENU_ID} from "../../utilities/hideLateralMenu";
import FilterOptionsModal, {FilterOptionsModalId} from "../../components/organism/FilterOptionsModal";
import useFilters from "../../hooks/useFilters";
import TopicsLateralMenu from "../../components/organism/TopicsLateralMenu";
import {useRouter} from "next/router";
import CreateFirstTopicHero from "../../components/organism/CreateFirstTopicHero";
import Drawer from "../../components/molecules/Drawer";
import TopTitle from "../../components/molecules/TopTitle";
import Button from "../../components/atoms/Button";
import {FunnelIcon, MenuIcon, OptionsIcon, PencilIcon, TrashIcon} from "../../components/atoms/Icons";
import {deleteTopic} from "../../services/topicService";

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
      <Drawer id={LATERAL_MENU_ID}>
        <TopicsLateralMenu
          topics={topics}
          selectedTopic={selectedTopic}
          subscriptions={subscriptions}
          profile={profile!}
        />
        <TopTitle title={topicName}>
          <Button relatedModalId={LATERAL_MENU_ID} showOnlyOnMobile={true}>
            <MenuIcon/>
          </Button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0}>
              <Button>
                <OptionsIcon/>
              </Button>
            </div>
            <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-box w-52 gap-2">
              <Button fitContent={false} relatedModalId={EditTopicModalId}>
                <PencilIcon/>
                <span>Edit Topic</span>
              </Button>
              <Button fitContent={false} clickAction={async () => {
                if (selectedTopic) {
                  await deleteTopic(selectedTopic.uuid);
                  refreshTopics();
                  router.push(paths.TOPICS);
                }
              }}>
                <TrashIcon/>
                <span>Delete Topic</span>
              </Button>
              <Button fitContent={false} relatedModalId={FilterOptionsModalId}>
                <FunnelIcon/>
                <span>Filter items</span>
              </Button>
            </ul>
          </div>
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
        <div>
          <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
          <FilterOptionsModal filters={filters} setFilters={setFilters}/>
          {selectedTopic &&
              <EditTopicModal refreshTopics={refreshTopics}
                              subscriptions={subscriptions}
                              topic={selectedTopic}
                              refreshTopicItems={refreshTopicItems}/>}
        </div>
      </Drawer>
    </div>
  );
};

export default Home;
