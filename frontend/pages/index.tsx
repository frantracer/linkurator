import type {NextPage} from "next";
import Head from "next/head";
import React, {useState} from "react";
import "tailwindcss/tailwind.css";
import LateralMenu from "../components/LateralMenu";
import useSubscriptions from "../hooks/useSubscriptions";
import useSubscriptionItems from "../hooks/useSubscriptionItems";
import useProfile from "../hooks/useProfile";
import SubscriptionVideoCardGrid from "../components/SubscriptionVideoCardGrid";
import {SectionType} from "../entities/SectionType";
import useTopicItems from "../hooks/useTopicItems";
import TopicVideoCardGrid from "../components/TopicVideoCardGrid";
import NewTopicModal from "../components/NewTopicModal";
import {useTopics} from "../hooks/useTopics";
import EditTopicModal from "../components/EditTopicModal";
import {Subscription} from "../entities/Subscription";
import AssignTopicModal from "../components/AssignTopicModal";
import {Topic} from "../entities/Topic";
import CustomButton from "../components/CustomButton";
import configuration from "../configuration";
import CreateFirstTopicHero from "../components/CreateFirstTopicHero";
import {LATERAL_MENU_ID} from "../utilities/hideLateralMenu";
import FilterOptionsModal from "../components/FilterOptionsModal";
import useFilters from "../hooks/useFilters";

const Home: NextPage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const profile = useProfile();
  const [subscriptions] = useSubscriptions(profile);
  const [subscriptionsItems, _, refreshSubscriptionItem] = useSubscriptionItems(selectedSubscription);
  const [topics, refreshTopics] = useTopics(profile);
  const [topicItems, loadingTopicItems, refreshTopicItems, refreshTopicItem, selectedTopicId, setSelectedTopicId] = useTopicItems();
  const [section, setSection] = useState<SectionType>(SectionType.Topics);
  const [filters, setFilters] = useFilters();

  if (selectedSubscription === undefined && subscriptions.length > 0) {
    setSelectedSubscription(subscriptions[0]);
  }

  let selectedTopic: Topic | undefined = undefined
  if (selectedTopicId) {
    selectedTopic = topics.find(t => t.uuid === selectedTopicId);
    if (!selectedTopic) {
      setSelectedTopicId(undefined);
    }
  } else if (topics.length > 0) {
    setSelectedTopicId(topics[0].uuid);
  }

  const LoginButton = () => {
    return <CustomButton
      text={"Login"}
      icon={undefined}
      relatedModalId={undefined}
      clickAction={() => {
        window.open(configuration.LOGIN_URL, '_self')
      }}/>
  }

  const refreshItem = (item_uuid: string) => {
    refreshSubscriptionItem(item_uuid)
    refreshTopicItem(item_uuid)
  }

  let body =
    <main className="hero min-h-screen bg-gray-200 text-black">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold py-5">Decide the content you want to see</h1>
          <p className="py-2">We do not use any algorithm to recommend you what to see.</p>
          <p className="py-2">We provide the tools you need to find the content you seek.</p>
          <LoginButton/>
        </div>
      </div>
    </main>
  if (profile) {
    body =
      <main className="flex bg-gray-100">
        <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
        <FilterOptionsModal filters={filters} setFilters={setFilters}/>
        {selectedSubscription &&
            <AssignTopicModal topics={topics}
                              subscription={selectedSubscription}
                              refreshTopics={refreshTopics}/>}
        {selectedTopic &&
            <EditTopicModal refreshTopics={refreshTopics}
                            subscriptions={subscriptions}
                            topic={selectedTopic}
                            refreshTopicItems={refreshTopicItems}/>}

        <div className="drawer drawer-mobile">
          <input id={LATERAL_MENU_ID} type="checkbox" className="drawer-toggle"/>
          <div className="drawer-content">
            {section === SectionType.Subscriptions &&
                <SubscriptionVideoCardGrid refreshItem={refreshItem}
                                           topics={topics}
                                           subscription={selectedSubscription}
                                           items={subscriptionsItems}
                                           filters={filters}/>}
            {section === SectionType.Topics && topics.length > 0 &&
                <TopicVideoCardGrid topic={selectedTopic}
                                    items={topicItems}
                                    refreshTopics={refreshTopics}
                                    refreshItem={refreshItem}
                                    setSelectedTopicId={setSelectedTopicId}
                                    subscriptions={subscriptions}
                                    filters={filters}
                                    isLoading={loadingTopicItems}/>}
            {section === SectionType.Topics && topics.length == 0 &&
                <CreateFirstTopicHero/>}
          </div>
          <div className="drawer-side">
            <label htmlFor={LATERAL_MENU_ID} className="drawer-overlay"></label>
            <LateralMenu
              topics={topics}
              selectedTopic={selectedTopic}
              setSelectedTopicId={setSelectedTopicId}
              subscriptions={subscriptions}
              selectedSubscription={selectedSubscription}
              setSelectedSubscription={(subscription) => setSelectedSubscription(subscription)}
              profile={profile}
              section={section}
              setSection={(section) => setSection(section)}/>
          </div>
        </div>
      </main>
  }

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
      {body}
    </div>
  );
};

export default Home;
