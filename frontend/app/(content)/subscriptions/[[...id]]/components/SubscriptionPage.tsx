'use client';

import {useTranslations} from 'next-intl';
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import CrossButton from "../../../../../components/atoms/CrossButton";
import {
  AddIcon,
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  MinusIcon,
  PencilIcon,
  RefreshIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import TopTitle from "../../../../../components/molecules/TopTitle";
import FilterToggleButton from "../../../../../components/molecules/FilterToggleButton";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
import {paths} from "../../../../../configuration";
import {getProviderIcon, getProviderPrettyName} from "../../../../../entities/Provider";
import useProviders from "../../../../../hooks/useProviders";
import useFilters from "../../../../../hooks/useFilters";
import useFilterBarVisibility from "../../../../../hooks/useFilterBarVisibility";
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
import {openModal} from "../../../../../utilities/modalAction";
import {newScopedChatPath, scopeFromFilters} from "../../../../../utilities/chatScope";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import {useToast} from "../../../../../contexts/ToastContext";

const REFRESH_SUBSCRIPTIONS_INTERVAL = 10000;

const SubscriptionPageComponent = ({subscriptionId}: { subscriptionId: string }) => {
  const t = useTranslations("common");
  const router = useRouter();
  const {showToast} = useToast();
  const {providers} = useProviders();

  const {filters, setFilters, resetFilters, isModified: areFiltersModified} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {showFilters, toggleFilters} = useFilterBarVisibility();
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

  const handleChatAboutThis = () => {
    if (!selectedSubscription) return;
    router.push(newScopedChatPath(scopeFromFilters(filters, {subscriptionIds: [selectedSubscription.uuid]})));
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
  if (selectedSubscription) {
    dropdownButtons.push(
      <MenuItem key={"subscriptions-chat"} onClick={handleChatAboutThis} hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <ChatBubbleIcon/>
          {t("chat_about_this")}
        </div>
      </MenuItem>
    )
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
      <TopTitle>
        <div className="flex flex-row items-center gap-4 h-full w-full px-4">
          {!profileIsLoading && <>
              <div className="w-10 shrink-0 flex items-center justify-start">
                  <FilterToggleButton isOpen={showFilters} isModified={areFiltersModified} onClick={toggleFilters}/>
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
                            <CrossButton onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)}/>
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
                {isUserLogged && selectedSubscription &&
                    <Dropdown
                        button={
                          <Button primary={false} fitContent={true} stopPropagation={false}>
                            <EllipsisHorizontalIcon/>
                          </Button>
                        }
                        small={true}
                        position="end"
                        bottom={true}
                        closeOnClickInside={true}
                    >
                        <Menu>
                          {dropdownButtons}
                        </Menu>
                    </Dropdown>
                }
              </div>
          </>}
        </div>
      </TopTitle>
      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-auto">
        {isSubscriptionError &&
            <div className="flex items-center justify-center h-dvh">
                <span>{t("subscription_not_exist")}</span>
            </div>
        }
        {selectedSubscription &&
            <ContentItemCardGrid
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
                topics={topics.filter(topic => topic.subscriptions_ids.includes(selectedSubscription.uuid))}
                filterBar={showFilters &&
                    <ContentFilterBar filters={filters}
                                      showInteractions={isUserLogged}
                                      setFilters={setFilters}
                                      resetFilters={resetFilters}/>
                }
            />
        }
        {selectedSubscription &&
            <AssignTopicModal topics={topics}
                              subscription={selectedSubscription}
                              refreshTopics={refreshTopics}/>
        }
      </div>
    </div>
  );
};

export default SubscriptionPageComponent;
