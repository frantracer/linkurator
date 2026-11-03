'use client';

import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {ErrorBanner} from "../../../../../components/atoms/ErrorBanner";
import {
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  StarFilledIcon,
  ShareIcon,
  StarIcon,
  TrashIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import ConfirmDialog from "../../../../../components/organism/ConfirmDialog";
import EditTopicModal, {EditTopicModalId} from "../../../../../components/organism/EditTopicModal";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
import {paths} from "../../../../../configuration";
import {isTopicScanned} from "../../../../../entities/Topic";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import {useTopic} from "../../../../../hooks/useTopic";
import useTopicItems from "../../../../../hooks/useTopicItems";
import {useTopics} from "../../../../../hooks/useTopics";
import useTopicSubscriptions from "../../../../../hooks/useTopicSubscriptions";
import {deleteTopic, followTopic, unfollowTopic} from "../../../../../services/topicService";
import {useFavoriteTopics} from "../../../../../hooks/useFavoriteTopics";
import {openModal} from "../../../../../utilities/modalAction";
import {newScopedChatPath, scopeFromFilters} from "../../../../../utilities/chatScope";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import PageHeader from "../../../../../components/molecules/PageHeader";
import FollowToggleButton from "../../../../../components/molecules/FollowToggleButton";
import ShareLinkButton from "../../../../../components/molecules/ShareLinkButton";
import useShareLink from "../../../../../hooks/useShareLink";
import TopicIcon from "../../../../../components/atoms/TopicIcon";
import Link from "next/link";
import useProviders from "../../../../../hooks/useProviders";

const REFRESH_TOPICS_INTERVAL = 10000;

const DeleteTopicDialogId = "delete-topic-dialog";

const TopicPageComponent = ({topicId}: { topicId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const {filters, setFilters, resetFilters, isModified: areFiltersModified} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {providers} = useProviders();
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {topic: selectedTopic, topicIsLoading, topicIsError} = useTopic(topicId, topics, topicsAreLoading);
  const {toggleFavorite} = useFavoriteTopics();
  const {topicSubscriptions} = useTopicSubscriptions(selectedTopic, subscriptions)
  const {
    topicItems,
    isLoading,
    isFinished,
    refreshTopicItem,
    refreshTopicItems,
    fetchMoreItems
  } = useTopicItems(selectedTopic ? selectedTopic.uuid : undefined, debouncedFilters);
  const combinedSubscriptions = subscriptions.concat(topicSubscriptions)
    .filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.uuid === value.uuid
      )))
    .sort((a, b) => a.name.localeCompare(b.name));

  const topicName = selectedTopic ? selectedTopic.name : "";
  const isTopicBeingScanned = selectedTopic ? !isTopicScanned(selectedTopic, subscriptions) : false
  const isUserLogged = !!profile

  const handleChatAboutThis = () => {
    if (!selectedTopic) return;
    router.push(newScopedChatPath(scopeFromFilters(filters, {topicIds: [selectedTopic.uuid]})));
  }

  const handleEditTopic = () => {
    openModal(EditTopicModalId);
  }

  const handleFollowTopic = (topicId: string) => {
    followTopic(topicId).then(() => {
      refreshTopics()
    })
  }

  const handleUnfollowTopic = (topicId: string) => {
    unfollowTopic(topicId).then(() => {
      refreshTopics()
    })
  }

  const handleDeleteTopic = () => {
    openModal(DeleteTopicDialogId)
  }

  const handleFavoriteTopic = (topicId: string) => {
    if (selectedTopic) {
      toggleFavorite(topicId, selectedTopic.is_favorite);
    }
  }

  const deleteTopicAction = async (topicId: string) => {
    await deleteTopic(topicId);
    refreshTopics();
    router.push(paths.TOPICS);
  }

  useEffect(() => {
    if (isTopicBeingScanned) {
      const interval = setInterval(() => {
        refreshSubscriptions()
      }, REFRESH_TOPICS_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [isTopicBeingScanned, refreshSubscriptions]);

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

  const shareTopic = useShareLink(topicName);

  const dropdownButtons = []
  if (selectedTopic && isUserLogged) {
    if (selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-edit-topic"} onClick={handleEditTopic} hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <PencilIcon/>
            {t("edit")}
          </div>
        </MenuItem>
      )
      dropdownButtons.push(
        <MenuItem key={"topics-delete-topic"} onClick={handleDeleteTopic} hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <TrashIcon/>
            {t("delete")}
          </div>
        </MenuItem>
      )
    }
  }

  // On phones these header actions move into the overflow menu so the header keeps to one row
  const mobileMenuButtons = []
  if (selectedTopic && isUserLogged && (selectedTopic.is_owner || selectedTopic.followed)) {
    mobileMenuButtons.push(
      <MenuItem key={"topics-favorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)}
                hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          {selectedTopic.is_favorite ? <StarFilledIcon/> : <StarIcon/>}
          {selectedTopic.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}
        </div>
      </MenuItem>
    )
  }
  if (selectedTopic) {
    mobileMenuButtons.push(
      <MenuItem key={"topics-chat"} onClick={handleChatAboutThis} hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <ChatBubbleIcon/>
          {t("ask_ai")}
        </div>
      </MenuItem>
    )
    mobileMenuButtons.push(
      <MenuItem key={"topics-share"} onClick={shareTopic} hideMenuOnClick={true}>
        <div className="flex flex-row gap-2 items-center justify-left">
          <ShareIcon/>
          {t("share")}
        </div>
      </MenuItem>
    )
  }

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
      {!topicIsLoading && selectedTopic &&
          <PageHeader
              title={topicName}
              media={<TopicIcon name={topicName} size={"md"}/>}
              subtitle={<>
                {selectedTopic.is_owner
                  ? t("your_topic")
                  : <Link className="hover:text-primary" href={paths.CURATORS + "/" + selectedTopic.curator.username}>
                    {t("by_curator", {username: selectedTopic.curator.username})}
                  </Link>
                }
                {" · "}{t("subscriptions_count", {count: topicSubscriptions.length})}
              </>}
              actions={<>
                {!selectedTopic.is_owner &&
                    <FollowToggleButton followed={selectedTopic.followed} isLoggedIn={isUserLogged}
                                        onFollow={() => handleFollowTopic(selectedTopic.uuid)}
                                        onUnfollow={() => handleUnfollowTopic(selectedTopic.uuid)}/>
                }
                <div className="hidden sm:contents">
                  {isUserLogged && (selectedTopic.is_owner || selectedTopic.followed) &&
                      <Button primary={false} ariaPressed={selectedTopic.is_favorite}
                              clickAction={() => handleFavoriteTopic(selectedTopic.uuid)}
                              tooltip={selectedTopic.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}>
                        {selectedTopic.is_favorite ? <StarFilledIcon/> : <StarIcon/>}
                      </Button>
                  }
                  <Button primary={false} clickAction={handleChatAboutThis} tooltip={t("chat_about_this")}>
                      <ChatBubbleIcon/>
                      {t("ask_ai")}
                  </Button>
                  <ShareLinkButton title={topicName}/>
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
      {topicIsLoading && <div className="h-14 shrink-0 border-b border-neutral bg-base-100"/>}
      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-auto">
        {
          topicIsError && !topicIsLoading &&
            <div className="flex flex-row gap-2 items-center justify-center">
                <ErrorBanner>
                    <span>{t("topic_not_found")}</span>
                </ErrorBanner>
            </div>
        }
        {
          selectedTopic &&
            <ContentItemCardGrid
                items={topicItems}
                providers={providers}
                fetchMoreItems={fetchMoreItems}
                refreshItem={refreshTopicItem}
                filters={debouncedFilters}
                isLoading={isLoading}
                isFinished={isFinished}
                isBeingScanned={isTopicBeingScanned}
                scanningEntityName={selectedTopic.name}
                showInteractions={isUserLogged}
                subscriptions={topicSubscriptions}
                filterBar={
                    <ContentFilterBar isModified={areFiltersModified} subscriptions={topicSubscriptions}
                                      providers={providers}
                                      filters={filters}
                                      showInteractions={isUserLogged}
                                      setFilters={setFilters}
                                      resetFilters={resetFilters}/>
                }
            />
        }
        {
          selectedTopic &&
            <EditTopicModal refreshTopics={refreshTopics}
                            subscriptions={combinedSubscriptions}
                            providers={providers}
                            topic={selectedTopic}
                            refreshTopicItems={refreshTopicItems}
                            refreshSubscriptions={refreshSubscriptions}
            />
        }
        {
          selectedTopic &&
            <ConfirmDialog
                id={DeleteTopicDialogId}
                title={t("delete_topic_confirmation")}
                message={t("delete_topic_confirmation_message")}
                confirmLabel={t("delete")}
                errorMessage={t("delete_topic_failed")}
                onConfirm={() => deleteTopicAction(selectedTopic.uuid)}
            />
        }
      </div>
    </div>
  )
    ;
};

export default TopicPageComponent;
