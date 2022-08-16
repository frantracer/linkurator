import type {NextPage} from "next";
import Head from "next/head";
import {useState} from "react";
import LateralMenu from "../components/LateralMenu";
import useSubscriptions, {Subscription} from "../hooks/useSubscriptions";
import useSubscriptionItems from "../hooks/useSubscriptionItems";
import useProfile from "../hooks/useProfile";
import SubscriptionVideoCardGrid from "../components/SubscriptionVideoCardGrid";

const Home: NextPage = () => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>();
  const profile = useProfile();
  const subscriptions = useSubscriptions(profile);
  const subscriptionsItems = useSubscriptionItems(selectedSubscription);

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
          selectedSubscription={selectedSubscription}
          setSelectedSubscription={(subscription) => setSelectedSubscription(subscription)}
          profile={profile}
        />
        <SubscriptionVideoCardGrid subscription={selectedSubscription} items={subscriptionsItems}/>
      </main>
    </div>
  );
};

export default Home;
