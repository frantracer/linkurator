'use client';

import {useTranslations} from 'next-intl';
import EmptyStateBox from "../../../../../components/atoms/EmptyStateBox";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  RefreshIcon,
  ShareIcon
} from "../../../../../components/atoms/Icons";
import useShareLink from "../../../../../hooks/useShareLink";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import PageHeader from "../../../../../components/molecules/PageHeader";
import FollowToggleButton from "../../../../../components/molecules/FollowToggleButton";
import ShareLinkButton from "../../../../../components/molecules/ShareLinkButton";
import Avatar from "../../../../../components/atoms/Avatar";
import AssignTopicModal, {AssignTopicModalId} from "../../../../../components/organism/AssignTopicModal";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
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

  const shareSubscription = useShareLink(subscriptionName);

  // On phones Ask AI and Share move into the overflow menu so the header keeps to one row
  const mobileMenuButtons = [
    <MenuItem key={"subscriptions-chat"} onClick={handleChatAboutThis} hideMenuOnClick={true}>
      <div className="flex flex-row gap-2 items-center justify-left">
        <ChatBubbleIcon/>
        {t("ask_ai")}
      </div>
    </MenuItem>,
    <MenuItem key={"subscriptions-share"} onClick={shareSubscription} hideMenuOnClick={true}>
      <div className="flex flex-row gap-2 items-center justify-left">
        <ShareIcon/>
        {t("share")}
      </div>
    </MenuItem>,
  ];

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

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
      {!profileIsLoading && selectedSubscription &&
          <PageHeader
              title={subscriptionName}
              media={<Avatar src={selectedSubscription.thumbnail} alt=""/>}
              subtitle={
                <a href={subscriptionUrl} target="_blank" rel="noopener noreferrer"
                   className="inline-flex flex-row items-center gap-1 hover:text-primary">
                  <Miniature src={getProviderIcon(providers, selectedSubscription.provider)} alt=""/>
                  {t("open_source_page", {provider: getProviderPrettyName(providers, selectedSubscription.provider)})}
                </a>
              }
              actions={<>
                <FollowToggleButton followed={selectedSubscription.followed} isLoggedIn={isUserLogged}
                                    onFollow={() => handleFollowSubscription(selectedSubscription.uuid)}
                                    onUnfollow={() => handleUnfollowSubscription(selectedSubscription.uuid)}/>
                <div className="hidden sm:contents">
                  <Button primary={false} clickAction={handleChatAboutThis} tooltip={t("chat_about_this")}>
                      <ChatBubbleIcon/>
                      {t("ask_ai")}
                  </Button>
                  <ShareLinkButton title={subscriptionName}/>
                </div>
                <div className={dropdownButtons.length > 0 ? "contents" : "contents sm:hidden"}>
                  <Dropdown label={t("more")} button={<EllipsisHorizontalIcon/>} small={true} position="end"
                            bottom={true} closeOnClickInside={true}>
                      <Menu>
                          <div className="sm:hidden">{mobileMenuButtons}</div>
                        {dropdownButtons}
                      </Menu>
                  </Dropdown>
                </div>
              </>}
          />
      }
      {(profileIsLoading || !selectedSubscription) && !isSubscriptionError &&
          <div className="h-14 shrink-0 border-b border-neutral bg-base-100"/>}
      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-auto">
        {isSubscriptionError &&
            <EmptyStateBox title={t("subscription_not_exist")} message={t("not_found_message")}/>
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
                filterBar={
                    <ContentFilterBar isModified={areFiltersModified} filters={filters}
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
