import type {NextPage} from "next";
import Head from "next/head";
import {useState} from "react";
import LateralMenu from "../components/LateralMenu";
import VideoCard from "../components/VideoCard";
import useSubscriptions, {Subscription} from "../hooks/useSubscriptions";
import useSubscriptionItems from "../hooks/useSubscriptionItems";

const Home: NextPage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const subscriptions = useSubscriptions();
  const subscriptionsItems = useSubscriptionItems(selectedSubscription);
  const cards = [];

  const subscriptionName = selectedSubscription?.name ?? "No subscription selected";
  for (let i = 0; i < subscriptionsItems.length; i++) {
    cards.push(
      <div className="m-4" key={i}>
        <VideoCard
          img={subscriptionsItems[i].thumbnail}
          name={subscriptionName}
          description={subscriptionsItems[i].name}
        />
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className="flex bg-gray-100">
        <LateralMenu
          subscriptions={subscriptions}
          onClickSubscription={(subscription) => setSelectedSubscription(subscription)}
        />

        <div className="flex flex-row flex-wrap m-6">{cards}</div>
      </main>
    </div>
  );
};

export default Home;
