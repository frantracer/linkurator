import type {NextPage} from "next";
import Head from "next/head";
import {useState} from "react";
import LateralMenu from "../components/LateralMenu";
import useSubscriptions, {Subscription} from "../hooks/useSubscriptions";
import useSubscriptionItems from "../hooks/useSubscriptionItems";
import useProfile from "../hooks/useProfile";
import SubscriptionVideoCardGrid from "../components/SubscriptionVideoCardGrid";
import {SectionType} from "../entities/SectionType";
import useTopics, {Topic} from "../hooks/useTopics";
import useTopicItems from "../hooks/useTopicItems";
import TopicVideoCardGrid from "../components/TopicVideoCardGrid";


const Home: NextPage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const profile = useProfile();
  const subscriptions = useSubscriptions(profile);
  const subscriptionsItems = useSubscriptionItems(selectedSubscription);
  const topics = useTopics(profile);
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const topicItems = useTopicItems(selectedTopic)
  const [section, setSection] = useState<SectionType>(SectionType.Subscriptions);

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className="flex bg-gray-100">
        <LateralMenu
          topics={topics}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          subscriptions={subscriptions}
          selectedSubscription={selectedSubscription}
          setSelectedSubscription={(subscription) => setSelectedSubscription(subscription)}
          profile={profile}
          section={section}
          setSection={(section) => setSection(section)}/>
        {section === SectionType.Subscriptions &&
            <SubscriptionVideoCardGrid subscription={selectedSubscription} items={subscriptionsItems}/>}
        {section === SectionType.Topics &&
            <TopicVideoCardGrid topic={selectedTopic} items={topicItems}/>}
      </main>
    </div>
  );
};

export default Home;
