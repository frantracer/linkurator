'use client';

import {useTranslations} from 'next-intl';
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import FlexRow from "../../../../../components/atoms/FlexRow";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  PencilIcon,
  RefreshIcon
} from "../../../../../components/atoms/Icons";
import {InfoBanner} from "../../../../../components/atoms/InfoBanner";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import SubscriptionDetails, {SUBSCRIPTION_DETAILS_ID} from "../../../../../components/organism/SubscriptionDetails";
import VideoCardGrid from "../../../../../components/organism/VideoCardGrid";
import {paths} from "../../../../../configuration";
import {providerIconUrl, providerPrettyName} from "../../../../../entities/Subscription";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import useSubscription from "../../../../../hooks/useSubscription";
import useSubscriptionItems from "../../../../../hooks/useSubscriptionItems";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopics} from "../../../../../hooks/useTopics";
import {
  followSubscription,
  refreshSubscription,
  unfollowSubscription
} from "../../../../../services/subscriptionService";
import {showLateralMenu} from "../../../../../utilities/lateralMenuAction";
import {openModal} from "../../../../../utilities/modalAction";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 10000;

const SubscriptionPageComponent = ({subscriptionId}: { subscriptionId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const [showRefreshedMessage, setShowRefreshedMessage] = useState<boolean>(false);

  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {
    subscription: selectedSubscription,
    isSubscriptionError
  } = useSubscription(subscriptionId, subscriptions);

  const subscriptionUrl = selectedSubscription ? selectedSubscription.url : "";
  const subscriptionName = selectedSubscription ? selectedSubscription.name : "";

  const isUserLogged = !!(profile)

  const openSubscriptionUrl = () => {
    if (subscriptionUrl) window.open(subscriptionUrl, "_blank");
  }

  const {
    subscriptionsItems,
    refreshSubscriptionItem,
    fetchMoreItems,
    isLoading,
    isFinished
  } = useSubscriptionItems(selectedSubscription, debouncedFilters);

  const handleShowFilters = () => {
    showLateralMenu(SUBSCRIPTION_DETAILS_ID);
  }

  const handleAssignSubscription = () => {
    openModal(AssignTopicModalId);
  }

  const handleRefreshSubscription = (subscriptionId: string) => {
    setShowRefreshedMessage(false);
    refreshSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
      setShowRefreshedMessage(true);
    });
  }

  const handleFollowSubscription = (subscriptionId: string) => {
    followSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
    });
  }

  const handleUnfollowSubscription = (subscriptionId: string) => {
    unfollowSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
    })
  }

  useEffect(() => {
    if (!profileIsLoading) {
      if (profile && subscriptions.length > 0 && selectedSubscription === undefined) {
        router.push(paths.SUBSCRIPTIONS + "/" + subscriptions[0].uuid)
      }
    }
  }, [profile, profileIsLoading, router, selectedSubscription, subscriptions]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSubscription && selectedSubscription.isBeingScanned) {
        refreshSubscriptions();
      } else {
        clearInterval(interval);
      }
    }, REFRESH_SUBSCRIPTIONS_INTERVAL)
    return () => clearInterval(interval)
  }, [refreshSubscriptions, selectedSubscription]);

  useEffect(() => {
    if (filters.textSearch === debouncedFilters.textSearch) {
      setDebouncedFilters(filters)
    } else {
      const timer = setTimeout(() => {
        setDebouncedFilters(filters)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [debouncedFilters.textSearch, filters]);

  useEffect(() => {
    if (!subscriptionId && subscriptions.length > 0) {
      router.push(paths.SUBSCRIPTIONS + "/" + subscriptions[0].uuid)
    }
  }, [router, subscriptionId, subscriptions]);

  const dropdownButtons = []
  if (selectedSubscription && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-assign"} onClick={handleAssignSubscription} hideMenuOnClick={true}>
        <FlexRow position="center">
          <PencilIcon/>
          {t("assign")}
        </FlexRow>
      </MenuItem>
    )
    dropdownButtons.push(
      <MenuItem key={"subscriptions-refresh"} onClick={() => {
        handleRefreshSubscription(selectedSubscription.uuid)
      }} hideMenuOnClick={true}>
        <FlexRow position="center">
          <RefreshIcon/>
          {t("refresh")}
        </FlexRow>
      </MenuItem>
    )
  }
  if (selectedSubscription && selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-unfollow"} onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)}
                hideMenuOnClick={true}>
        <FlexRow position="center">
          <MinusIcon/>
          {t("unfollow")}
        </FlexRow>
      </MenuItem>
    )
  }
  if (selectedSubscription && !selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-follow"} onClick={() => handleFollowSubscription(selectedSubscription.uuid)}
                hideMenuOnClick={true}>
        <FlexRow position="center">
          <AddIcon/>
          {t("follow")}
        </FlexRow>
      </MenuItem>
    )
  }
  dropdownButtons.push(
    <MenuItem key={"subscriptions-filter"} onClick={handleShowFilters} hideMenuOnClick={true}>
      <FlexRow position="center">
        <FunnelIcon/>
        {t("filter")}
      </FlexRow>
    </MenuItem>
  )

  return (
    <Drawer id={SUBSCRIPTION_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <SubscriptionDetails subscription={selectedSubscription}
                           filters={filters}
                           showInteractions={isUserLogged}
                           setFilters={setFilters}
                           resetFilters={resetFilters}/>
      <TopTitle>
        <div className="flex flex-row midd items-center overflow-visible">
          <div className="flex-grow"/>
          <div className="flex flex-row items-center gap-2 overflow-hidden">
            <div className="flex flex-col gap-2 overflow-hidden">
              <div className="flex flex-row items-center justify-center gap-2 overflow-hidden">
                {selectedSubscription &&
                    <Miniature src={selectedSubscription.thumbnail} alt={selectedSubscription.name}/>
                }
                <h1 className="text-xl font-bold whitespace-nowrap truncate">
                  {subscriptionName}
                </h1>
                <Button primary={false} fitContent={true} clickAction={handleShowFilters} tooltip={t("filter")} hideOnMobile={true}>
                  <FunnelIcon/>
                </Button>
              </div>
              <div className="flex flex-row items-center justify-center gap-2">
                {selectedSubscription &&
                    <Button primary={false} clickAction={openSubscriptionUrl}>
                        <Miniature src={providerIconUrl(selectedSubscription.provider)}
                                   alt={selectedSubscription.provider}/>
                      {providerPrettyName(selectedSubscription.provider)}
                    </Button>
                }
                {selectedSubscription && selectedSubscription.followed &&
                    <Tag>
                      <span>
                        {t("following")}
                      </span>
                        <div className="hover:cursor-pointer"
                             onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)}>
                            <CrossIcon/>
                        </div>
                    </Tag>
                }
                {selectedSubscription && !selectedSubscription.followed && isUserLogged &&
                    <Button primary={false}
                            clickAction={() => handleFollowSubscription(selectedSubscription.uuid)}>
                      {t("follow")}
                    </Button>
                }
                {selectedSubscription && !selectedSubscription.followed && !isUserLogged &&
                    <Button primary={false} href={paths.LOGIN}>
                      {t("follow")}
                    </Button>
                }
              </div>
            </div>
          </div>
          <div className="flex-grow"/>
          {selectedSubscription &&
              <Dropdown
                  button={<OptionsIcon/>}
                  position="end"
                  bottom={true}
                  borderless={true}
                  closeOnClickInside={true}
              >
                  <Menu>
                    {dropdownButtons}
                  </Menu>
              </Dropdown>
          }
        </div>
      </TopTitle>
      {showRefreshedMessage &&
          <FlexRow position={"center"}>
              <InfoBanner>
                  <span>{t("subscription_updated")}</span>
                  <div className={"hover:cursor-pointer"} onClick={() => setShowRefreshedMessage(false)}>
                      <CrossIcon/>
                  </div>
              </InfoBanner>
          </FlexRow>
      }
      {isSubscriptionError &&
          <div className="flex items-center justify-center h-dvh">
              <span>{t("subscription_not_exist")}</span>
          </div>
      }
      {selectedSubscription &&
        <VideoCardGrid
          refreshItem={refreshSubscriptionItem}
          fetchMoreItems={fetchMoreItems}
          items={subscriptionsItems}
          filters={debouncedFilters}
          showInteractions={isUserLogged}
          isLoading={isLoading}
          isFinished={isFinished}
          isBeingScanned={selectedSubscription.isBeingScanned}
          scanningEntityName={selectedSubscription.name}
          withSubscription={false}
        />
      }
      {selectedSubscription &&
          <AssignTopicModal topics={topics}
                            subscription={selectedSubscription}
                            refreshTopics={refreshTopics}/>
      }
    </Drawer>
  );
};

export default SubscriptionPageComponent;
