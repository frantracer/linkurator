'use client';

import type {NextPage} from "next";
import React, {useEffect, useState} from "react";
import useSubscriptions from "../../../../hooks/useSubscriptions";
import useSubscriptionItems from "../../../../hooks/useSubscriptionItems";
import useProfile from "../../../../hooks/useProfile";
import SubscriptionVideoCardGrid from "../../../../components/organism/SubscriptionVideoCardGrid";
import {useTopics} from "../../../../hooks/useTopics";
import useFilters from "../../../../hooks/useFilters";
import {useParams, useRouter} from "next/navigation";
import {paths} from "../../../../configuration";
import Drawer from "../../../../components/molecules/Drawer";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {CrossIcon, MenuIcon, OptionsIcon} from "../../../../components/atoms/Icons";
import Avatar from "../../../../components/atoms/Avatar";
import SubscriptionDetails, {SUBSCRIPTION_DETAILS_ID} from "../../../../components/organism/SubscriptionDetails";
import {followSubscription, refreshSubscription, unfollowSubscription} from "../../../../services/subscriptionService";
import AssignTopicModal from "../../../../components/organism/AssignTopicModal";
import {showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import useSubscription from "../../../../hooks/useSubscription";
import Tag from "../../../../components/atoms/Tag";
import {ErrorBanner} from "../../../../components/atoms/ErrorBanner";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 30000;

const SubscriptionsPage: NextPage = () => {
  const router = useRouter()
  const pathParams = useParams<{ id: string[] | string }>();

  const selectedSubscriptionId: string | undefined = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const [error, setError] = useState<string | null>(null);

  const {filters, setFilters, resetFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {
    subscription: selectedSubscription,
    isSubscriptionError
  } = useSubscription(selectedSubscriptionId, subscriptions);

  const subscriptionUrl = selectedSubscription ? selectedSubscription.url : "";
  const subscriptionName = selectedSubscription ? selectedSubscription.name : "";
  const subscriptionThumbnail = selectedSubscription ? selectedSubscription.thumbnail : "";

  const isUserSubscription = !!(subscriptions.find(subscription => subscription.uuid === selectedSubscriptionId))
  const isUserLogged = !!(profile)
  const editable = isUserLogged && isUserSubscription

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

  const handleFollowSubscription = () => {
    followSubscription(selectedSubscriptionId!).then(() => {
      refreshSubscriptions();
    });
  }

  const handleUnfollowSubscription = () => {
    unfollowSubscription(selectedSubscriptionId!).then((resultOk) => {
      if (resultOk) {
        refreshSubscriptions();
      } else {
        setError("No puedes cancelar una suscripción asociada a una categoría");
      }
    })
  }

  useEffect(() => {
    if (!profileIsLoading) {
      if (profile && subscriptions.length > 0 && selectedSubscription === undefined) {
        router.push(paths.SUBSCRIPTIONS + "/" + subscriptions[0].uuid)
      }

      if (selectedSubscription?.isBeingScanned) {
        const timer = setTimeout(() => {
          refreshSubscriptions()
        }, REFRESH_SUBSCRIPTIONS_INTERVAL)
        return () => clearTimeout(timer)
      }
    }
  }, [profileIsLoading, selectedSubscription, profile, subscriptions, router, refreshSubscriptions]);

  return (
    <Drawer id={SUBSCRIPTION_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <SubscriptionDetails subscription={selectedSubscription}
                           topics={topics}
                           filters={filters}
                           editable={editable}
                           showInteractions={isUserLogged}
                           setFilters={setFilters}
                           resetFilters={resetFilters}
                           refreshSubscription={() => refreshSubscription(selectedSubscriptionId!)}/>
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <div className="flex flex-row gap-2 items-center justify-center w-full overflow-hidden">
          {subscriptionThumbnail && <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>}
          <h1 className="text-2xl font-bold whitespace-nowrap truncate hover:cursor-pointer"
              onClick={openSubscriptionUrl}>
            {subscriptionName}
          </h1>
          {selectedSubscription?.followed &&
              <Tag>
                <span>
                  {"Siguiendo"}
                </span>
                  <div className="hover:cursor-pointer" onClick={handleUnfollowSubscription}>
                      <CrossIcon/>
                  </div>
              </Tag>
          }
          {!selectedSubscription?.followed &&
              <Button primary={false} clickAction={handleFollowSubscription}>{"Seguir"}</Button>
          }
        </div>
        <Button clickAction={() => showLateralMenu(SUBSCRIPTION_DETAILS_ID)}>
          <OptionsIcon/>
        </Button>
      </TopTitle>
      {error &&
          <ErrorBanner>
              <span>{error}</span>
              <div className={"hover:cursor-pointer"} onClick={() => setError(null)}>
                  <CrossIcon/>
              </div>
          </ErrorBanner>
      }
      {isSubscriptionError &&
          <div className="flex items-center justify-center h-screen">
              <span>{"La subscripción no existe"}</span>
          </div>
      }
      <SubscriptionVideoCardGrid
        refreshItem={refreshSubscriptionItem}
        fetchMoreItems={fetchMoreItems}
        topics={topics}
        subscription={selectedSubscription}
        items={subscriptionsItems}
        filters={filters}
        showInteractions={isUserLogged}
        isLoading={isLoading}
        isFinished={isFinished}
        handleScroll={handleGridScroll}
      />
      {selectedSubscription &&
          <AssignTopicModal topics={topics}
                            subscription={selectedSubscription}
                            refreshTopics={refreshTopics}/>
      }
    </Drawer>
  );
};

export default SubscriptionsPage;
