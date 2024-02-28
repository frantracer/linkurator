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
import FilterOptionsModal, {FilterOptionsModalId} from "../../components/organism/FilterOptionsModal";
import useFilters from "../../hooks/useFilters";
import {useRouter} from "next/router";
import SubscriptionsLateralMenu from "../../components/organism/SubscriptionsLateralMenu";
import {paths} from "../../configuration";
import EditTopicModal, {AssignTopicModalId} from "../../components/organism/AssignTopicModal";
import Drawer from "../../components/molecules/Drawer";
import TopTitle from "../../components/molecules/TopTitle";
import Button from "../../components/atoms/Button";
import {AddIcon, FunnelIcon, MenuIcon, OptionsIcon, RefreshIcon} from "../../components/atoms/Icons";
import {refreshSubscription} from "../../services/subscriptionService";
import Avatar from "../../components/atoms/Avatar";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 30000;

const SubscriptionsPage: NextPage = () => {
  const router = useRouter()

  const selectedSubscriptionId: string | undefined = router.query.id ? router.query.id[0] as string : undefined;

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
          selectedSubscription={selectedSubscription}
          profile={profile!}/>
        <TopTitle>
          <Button relatedModalId={LATERAL_MENU_ID} showOnlyOnMobile={true}>
            <MenuIcon/>
          </Button>
          <div className="flex flex-row gap-2 items-center justify-center w-full overflow-hidden hover:cursor-pointer"
               onClick={openSubscriptionUrl}>
            <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>
            <h1 className="text-2xl font-bold whitespace-nowrap truncate">
              {subscriptionName}
            </h1>
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0}>
              <Button>
                <OptionsIcon/>
              </Button>
            </div>
            <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-box w-52 gap-2">
              <Button fitContent={false} relatedModalId={AssignTopicModalId}>
                <AddIcon/>
                <span>Add to Topic</span>
              </Button>
              <Button fitContent={false} relatedModalId={FilterOptionsModalId}>
                <FunnelIcon/>
                <span>Filter items</span>
              </Button>
              <Button fitContent={false}
                      clickAction={
                        async () => {
                          if (selectedSubscription) {
                            refreshSubscription(selectedSubscription.uuid)
                              .then(() => {
                                refreshSubscriptions()
                              })
                          }
                        }
                      }>
                <RefreshIcon/>
                <span>Refresh</span>
              </Button>
            </ul>
          </div>
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
        <FilterOptionsModal filters={filters} setFilters={setFilters}/>
        {selectedSubscription &&
            <EditTopicModal refreshTopics={refreshTopics} topics={topics} subscription={selectedSubscription}/>
        }
        <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
      </Drawer>
    </div>

  );
};

export default SubscriptionsPage;
