import type {NextPage} from "next";
import Head from "next/head";
import React, {useState} from "react";
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

const Home: NextPage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const profile = useProfile();
  const [subscriptions] = useSubscriptions(profile);
  const [subscriptionsItems] = useSubscriptionItems(selectedSubscription);
  const [topics, refreshTopics] = useTopics(profile);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  const [topicItems, refreshTopicItems] = useTopicItems(topics.find(t => t.uuid === selectedTopicId));
  const [section, setSection] = useState<SectionType>(SectionType.Topics);

  const selectedTopic = topics.find(t => t.uuid === selectedTopicId);

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className="flex bg-gray-100">
        <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
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
          <input id="my-drawer" type="checkbox" className="drawer-toggle"/>
          <div className="drawer-content">
            <label htmlFor="my-drawer" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>
            {section === SectionType.Subscriptions &&
                <SubscriptionVideoCardGrid topics={topics}
                                           subscription={selectedSubscription}
                                           items={subscriptionsItems}/>}
            {section === SectionType.Topics &&
                <TopicVideoCardGrid topic={selectedTopic}
                                    items={topicItems}
                                    refreshTopics={refreshTopics}
                                    setSelectedTopicId={setSelectedTopicId}/>}
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
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
    </div>
  );
};

export default Home;
