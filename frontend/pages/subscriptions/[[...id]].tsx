import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useSubscriptions from "../../hooks/useSubscriptions";
import useSubscriptionItems from "../../hooks/useSubscriptionItems";
import useProfile from "../../hooks/useProfile";
import SubscriptionVideoCardGrid from "../../components/organism/SubscriptionVideoCardGrid";
import NewTopicModal from "../../components/organism/NewTopicModal";
import {useTopics} from "../../hooks/useTopics";
import {LATERAL_MENU_ID} from "../../utilities/hideLateralMenu";
import useFilters from "../../hooks/useFilters";
import {useRouter} from "next/router";
import SubscriptionsLateralMenu from "../../components/organism/SubscriptionsLateralMenu";
import {paths} from "../../configuration";
import Drawer from "../../components/molecules/Drawer";
import TopTitle from "../../components/molecules/TopTitle";
import Button from "../../components/atoms/Button";
import {MenuIcon, OptionsIcon} from "../../components/atoms/Icons";
import Avatar from "../../components/atoms/Avatar";
import SubscriptionDetails, {SUBSCRIPTION_DETAILS_ID} from "../../components/organism/SubscriptionDetails";
import {refreshSubscription} from "../../services/subscriptionService";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 30000;

const SubscriptionsPage: NextPage = () => {
  const router = useRouter()

  const selectedSubscriptionId: string = router.query.id ? router.query.id[0] as string : "";

  const {filters, setFilters, setDefaultFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);

  const selectedSubscription = subscriptions.find(subscription => subscription.uuid === selectedSubscriptionId);

  const subscriptionUrl = selectedSubscription ? selectedSubscription.url : "";
  const subscriptionName = selectedSubscription ? selectedSubscription.name : "";
  const subscriptionThumbnail = selectedSubscription ? selectedSubscription.thumbnail : "";

  const openSubscriptionUrl = () => {
    if (subscriptionUrl) window.open(subscriptionUrl, "_blank");
  }

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
    <div className="h-screen w-screen">
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
      <Drawer id={LATERAL_MENU_ID}>
        <SubscriptionsLateralMenu
          subscriptions={subscriptions}
          topics={topics}
          selectedSubscription={selectedSubscription}
          profile={profile!}/>
        <Drawer id={SUBSCRIPTION_DETAILS_ID} right={true} alwaysOpenOnDesktop={true}>
          <SubscriptionDetails subscription={selectedSubscription}
                               topics={topics}
                               filters={filters}
                               setFilters={setFilters}
                               refreshSubscription={() => refreshSubscription(selectedSubscriptionId)}/>
          <TopTitle>
            <Button relatedModalId={LATERAL_MENU_ID} showOnlyOnMobile={true}>
              <MenuIcon/>
            </Button>
            <div className="flex flex-row gap-2 items-center justify-center w-full overflow-hidden hover:cursor-pointer"
                 onClick={openSubscriptionUrl}>
              {subscriptionThumbnail && <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>}
              <h1 className="text-2xl font-bold whitespace-nowrap truncate">
                {subscriptionName}
              </h1>
            </div>
            <Button relatedModalId={SUBSCRIPTION_DETAILS_ID}>
              <OptionsIcon/>
            </Button>
          </TopTitle>
          <SubscriptionVideoCardGrid
            refreshItem={refreshSubscriptionItem}
            fetchMoreItems={fetchMoreItems}
            topics={topics}
            subscription={selectedSubscription}
            items={subscriptionsItems}
            filters={filters}
            isLoading={isLoading}
            isFinished={isFinished}
            handleScroll={handleGridScroll}
          />
          <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
        </Drawer>
      </Drawer>
    </div>

  );
};

export default SubscriptionsPage;
