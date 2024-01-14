import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useSubscriptions from "../../hooks/useSubscriptions";
import useSubscriptionItems from "../../hooks/useSubscriptionItems";
import useProfile from "../../hooks/useProfile";
import SubscriptionVideoCardGrid from "../../components/SubscriptionVideoCardGrid";
import NewTopicModal from "../../components/NewTopicModal";
import {useTopics} from "../../hooks/useTopics";
import {LATERAL_MENU_ID} from "../../utilities/hideLateralMenu";
import FilterOptionsModal from "../../components/FilterOptionsModal";
import useFilters from "../../hooks/useFilters";
import {useRouter} from "next/router";
import SubscriptionsLateralMenu from "../../components/SubscriptionsLateralMenu";
import {paths} from "../../configuration";
import EditTopicModal from "../../components/AssignTopicModal";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 30000;

const SubscriptionsPage: NextPage = () => {
  const router = useRouter()

  const selectedSubscriptionId: string | undefined = router.query.id ? router.query.id[0] as string : undefined;

  const {filters, setFilters, setDefaultFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);

  const selectedSubscription = subscriptions.find(subscription => subscription.uuid === selectedSubscriptionId);

  const {
    subscriptionsItems,
    refreshSubscriptionItem,
    fetchMoreItems,
    isLoading,
    isFinished
  } = useSubscriptionItems(selectedSubscription, filters);

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
        if (subscriptions.length > 0 && selectedSubscription === undefined) {
          router.push(paths.SUBSCRIPTIONS + "/" + subscriptions[0].uuid)
        }
        setDefaultFilters()
      }

      if (selectedSubscription?.isBeingScanned) {
        setTimeout(() => {
          refreshSubscriptions()
        }, REFRESH_SUBSCRIPTIONS_INTERVAL)
      }
    }
    }, [profileIsLoading, selectedSubscription, profile, subscriptions, router]);

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
        {selectedSubscription &&
            <EditTopicModal refreshTopics={refreshTopics} topics={topics} subscription={selectedSubscription}/>
        }

        <div onScroll={handleGridScroll} className="drawer lg:drawer-open h-screen overflow-y-auto">
          <input id={LATERAL_MENU_ID} type="checkbox" className="drawer-toggle"/>
          <div className="drawer-content">
            <SubscriptionVideoCardGrid
              refreshSubscriptions={refreshSubscriptions}
              refreshItem={refreshSubscriptionItem}
              fetchMoreItems={fetchMoreItems}
              topics={topics}
              subscription={selectedSubscription}
              items={subscriptionsItems}
              filters={filters}
              isLoading={isLoading}
              isFinished={isFinished}/>
          </div>
          <div className="drawer-side z-20">
            <label htmlFor={LATERAL_MENU_ID} aria-label="close sidebar" className="drawer-overlay"></label>
            <SubscriptionsLateralMenu
              subscriptions={subscriptions}
              selectedSubscription={selectedSubscription}
              profile={profile!}/>
          </div>
        </div>
      </main>
    </div>

  );
};

export default SubscriptionsPage;
