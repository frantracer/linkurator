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
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MenuIcon,
  MinusIcon,
  OptionsIcon,
  PencilIcon,
  RefreshIcon
} from "../../../../components/atoms/Icons";
import SubscriptionDetails, {SUBSCRIPTION_DETAILS_ID} from "../../../../components/organism/SubscriptionDetails";
import {followSubscription, refreshSubscription, unfollowSubscription} from "../../../../services/subscriptionService";
import AssignTopicModal, {AssignTopicModalId} from "../../../../components/organism/AssignTopicModal";
import {showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import useSubscription from "../../../../hooks/useSubscription";
import Tag from "../../../../components/atoms/Tag";
import {ErrorBanner} from "../../../../components/atoms/ErrorBanner";
import FlexRow from "../../../../components/atoms/FlexRow";
import FlexItem from "../../../../components/atoms/FlexItem";
import Dropdown from "../../../../components/atoms/Dropdown";
import {openModal} from "../../../../utilities/modalAction";
import FlexColumn from "../../../../components/atoms/FlexColumn";
import Miniature from "../../../../components/atoms/Miniature";
import {providerIconUrl, providerPrettyName} from "../../../../entities/Subscription";
import { MenuItem } from "../../../../components/atoms/MenuItem";
import Menu from "../../../../components/atoms/Menu";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 10000;

const SubscriptionsPage: NextPage = () => {
  const router = useRouter()
  const pathParams = useParams<{ id: string[] | string }>();

  const selectedSubscriptionId: string | undefined = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const [error, setError] = useState<string | null>(null);

  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {
    subscription: selectedSubscription,
    isSubscriptionError
  } = useSubscription(selectedSubscriptionId, subscriptions);

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

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget
    if (isFinished || isLoading) {
      return
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreItems()
    }
  }

  const handleShowFilters = () => {
    showLateralMenu(SUBSCRIPTION_DETAILS_ID);
  }

  const handleAssignSubscription = () => {
    if (selectedSubscription && !selectedSubscription.followed) {
      setError("Dale a Seguir antes de asignar la subscripción");
    } else {
      openModal(AssignTopicModalId);
      setError(null);
    }
  }

  const handleRefreshSubscription = (subscriptionId: string) => {
    refreshSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
    });
  }

  const handleFollowSubscription = (subscriptionId: string) => {
    followSubscription(subscriptionId).then(() => {
      refreshSubscriptions();
    });
  }

  const handleUnfollowSubscription = (subscriptionId: string) => {
    unfollowSubscription(subscriptionId).then((resultOk) => {
      if (resultOk) {
        refreshSubscriptions();
        setError(null);
      } else {
        setError("No puedes dejar de seguir una subscripción asociada a una categoría");
      }
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
    if (!selectedSubscriptionId && subscriptions.length > 0) {
      router.push(paths.SUBSCRIPTIONS + "/" + subscriptions[0].uuid)
    }
  }, [router, selectedSubscriptionId, subscriptions]);

  const dropdownButtons = []
  dropdownButtons.push(
    <MenuItem key={"subscriptions-show-filters"} onClick={handleShowFilters}>
      <FlexRow position="center">
        <FunnelIcon/>
        {"Filtrar"}
      </FlexRow>
    </MenuItem>
  )
  if (selectedSubscription && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-assign"} onClick={handleAssignSubscription}>
        <FlexRow position="center">
          <PencilIcon/>
          {"Asignar"}
        </FlexRow>
      </MenuItem>
    )
    dropdownButtons.push(
      <MenuItem key={"subscriptions-refresh"} onClick={() => {
        handleRefreshSubscription(selectedSubscription.uuid)
      }}>
        <FlexRow position="center">
          <RefreshIcon/>
          {"Actualizar"}
        </FlexRow>
      </MenuItem>
    )
  }
  if (selectedSubscription && selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-unfollow"} onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)}>
        <FlexRow position="center">
          <MinusIcon/>
          {"Dejar de seguir"}
        </FlexRow>
      </MenuItem>
    )
  }
  if (selectedSubscription && !selectedSubscription.followed && isUserLogged) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-follow"} onClick={() => handleFollowSubscription(selectedSubscription.uuid)}>
        <FlexRow position="center">
        <AddIcon/>
          {"Seguir"}
        </FlexRow>
      </MenuItem>
    )
  }

  return (
    <Drawer id={SUBSCRIPTION_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <SubscriptionDetails subscription={selectedSubscription}
                           filters={filters}
                           showInteractions={isUserLogged}
                           setFilters={setFilters}
                           resetFilters={resetFilters}/>
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <FlexRow hideOverflow={true}>
          <FlexItem grow={true}/>
          <FlexRow>
            <FlexItem>
              <FlexColumn gap={0} position={"center"}>
                <FlexRow>
                  {selectedSubscription &&
                      <Miniature src={selectedSubscription.thumbnail} alt={selectedSubscription.name}/>
                  }
                  <h1 className="text-xl font-bold whitespace-nowrap truncate">
                    {subscriptionName}
                  </h1>
                </FlexRow>
                <FlexRow>
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
                          {"Siguiendo"}
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
                        {"Seguir"}
                      </Button>
                  }
                  {selectedSubscription && !selectedSubscription.followed && !isUserLogged &&
                      <Button primary={false} href={paths.LOGIN}>
                        {"Seguir"}
                      </Button>
                  }
                </FlexRow>
              </FlexColumn>
            </FlexItem>
          </FlexRow>
          <FlexItem grow={true}/>
        </FlexRow>
        <Dropdown button={<OptionsIcon/>} start={false} bottom={true}>
          <Menu>
            {dropdownButtons}
          </Menu>
        </Dropdown>
      </TopTitle>
      {error &&
          <FlexRow position={"center"}>
              <ErrorBanner>
                  <span>{error}</span>
                  <div className={"hover:cursor-pointer"} onClick={() => setError(null)}>
                      <CrossIcon/>
                  </div>
              </ErrorBanner>
          </FlexRow>
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
        filters={debouncedFilters}
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
