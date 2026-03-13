'use client';

import {useTranslations} from 'next-intl';
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  PencilIcon,
  RefreshIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import SubscriptionFilter, {SUBSCRIPTION_FILTER_ID} from "../../../../../components/organism/SubscriptionFilter";
import VideoCardGrid from "../../../../../components/organism/VideoCardGrid";
import {paths} from "../../../../../configuration";
import {getProviderIcon, getProviderPrettyName} from "../../../../../entities/Provider";
import useProviders from "../../../../../hooks/useProviders";
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
import {useToast} from "../../../../../contexts/ToastContext";
import ProfileDropdown from "../../../../../components/organism/ProfileDropdown";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 10000;

const SubscriptionPageComponent = ({subscriptionId}: { subscriptionId: string }) => {
  const t = useTranslations("common");
  const router = useRouter();
  const {showToast} = useToast();
  const {providers} = useProviders();

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
    showLateralMenu(SUBSCRIPTION_FILTER_ID);
  }

  const handleAssignSubscription = () => {
    openModal(AssignTopicModalId);
  }

  const handleRefreshSubscription = (subscriptionId: string, subscriptionName: string) => {
    refreshSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
      showToast(t("subscription_updated"), subscriptionName);
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
        <div className="flex flex-row gap-2 items-center justify-left">
          <PencilIcon/>
          {t("assign")}
        </div>
      </MenuItem>
    )
    dropdownButtons.push(
      <MenuItem key={"subscriptions-refresh"} onClick={() => {
        handleRefreshSubscription(selectedSubscription.uuid, selectedSubscription.name)
      }} hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <RefreshIcon/>
          {t("refresh")}
        </div>
      </MenuItem>
    )
  }
  if (selectedSubscription && selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-unfollow"} onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)}
                hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <MinusIcon/>
          {t("unfollow")}
        </div>
      </MenuItem>
    )
  }
  if (selectedSubscription && !selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-follow"} onClick={() => handleFollowSubscription(selectedSubscription.uuid)}
                hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <AddIcon/>
          {t("follow")}
        </div>
      </MenuItem>
    )
  }
  dropdownButtons.push(
    <MenuItem key={"subscriptions-filter"} onClick={handleShowFilters} hideMenuOnClick={true}>
      <div className="flex flex-row gap-2 items-center justify-left">
        <FunnelIcon/>
        {t("filter")}
      </div>
    </MenuItem>
  )

  return (
    <Drawer id={SUBSCRIPTION_FILTER_ID} right={true} alwaysOpenOnDesktop={false}>
      <SubscriptionFilter subscription={selectedSubscription}
                          filters={filters}
                          showInteractions={isUserLogged}
                          setFilters={setFilters}
                          resetFilters={resetFilters}/>
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          {!profileIsLoading && <>
            <div className="w-10 shrink-0 flex items-center justify-start">
              {selectedSubscription &&
                  <Dropdown
                      button={
                        <Button primary={false} fitContent={true} stopPropagation={false}>
                          <OptionsIcon/>
                        </Button>
                      }
                      small={true}
                      position="start"
                      bottom={true}
                      closeOnClickInside={true}
                  >
                      <Menu>
                        {dropdownButtons}
                      </Menu>
                  </Dropdown>
              }
            </div>
            <div className="flex-1 min-w-0 flex flex-col items-center gap-2 overflow-hidden">
              <div className="w-full flex flex-row items-center justify-center gap-2 overflow-hidden">
                {selectedSubscription &&
                    <div className="shrink-0">
                      <Miniature src={selectedSubscription.thumbnail} alt={selectedSubscription.name}/>
                    </div>
                }
                <h1 className="text-xl font-bold min-w-0 whitespace-nowrap truncate">
                  {subscriptionName}
                </h1>
                <div className="shrink-0">
                  <Button primary={false} fitContent={true} clickAction={handleShowFilters} tooltip={t("filter")}
                          hideOnMobile={true}>
                    <FunnelIcon/>
                  </Button>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2">
                {selectedSubscription &&
                    <Button primary={false} clickAction={openSubscriptionUrl}>
                        <Miniature src={getProviderIcon(providers, selectedSubscription.provider)}
                                   alt={selectedSubscription.provider}/>
                      {getProviderPrettyName(providers, selectedSubscription.provider)}
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
            <div className="w-10 shrink-0 flex items-center justify-end">
              {profile && <ProfileDropdown profile={profile}/>}
            </div>
          </>}
        </div>
      </TopTitle>
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
              providers={providers}
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
