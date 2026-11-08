'use client';

import {useTranslations} from "next-intl";
import EmptyStateBox from "../../../../../components/atoms/EmptyStateBox";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  StarFilledIcon,
  ShareIcon,
  StarIcon,
  TrashIcon
} from "../../../../../components/atoms/Icons";
import ConfirmDialog from "../../../../../components/organism/ConfirmDialog";
import TopicEditorModal, {EditTopicModalId} from "../../../../../components/organism/TopicEditorModal";
import FilterToggleButton from "../../../../../components/molecules/FilterToggleButton";
import useFilterBarVisibility from "../../../../../hooks/useFilterBarVisibility";
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
import PageHeader from "../../../../../components/organism/PageHeader";
import FollowToggleButton from "../../../../../components/molecules/FollowToggleButton";
import MenuAction from "../../../../../components/molecules/MenuAction";
import useShareLink from "../../../../../hooks/useShareLink";
import TopicIcon from "../../../../../components/atoms/TopicIcon";
import Link from "next/link";
import useProviders from "../../../../../hooks/useProviders";

const REFRESH_TOPICS_INTERVAL = 10000;

const DeleteTopicDialogId = "delete-topic-dialog";

const TopicPageComponent = ({topicId}: { topicId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const {filters, setFilters, resetFilters, isModified: areFiltersModified, savedFilters} = useFilters();
  const {showFilters, toggleFilters} = useFilterBarVisibility();
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
                <span className="hidden sm:inline">{" · "}{t("subscriptions_count", {count: topicSubscriptions.length})}</span>
              </>}
              actions={<>
                <div className="hidden sm:contents">
                  <Button primary={false} clickAction={handleChatAboutThis} tooltip={t("chat_about_this")}>
                      <ChatBubbleIcon/>
                      {t("ask_ai")}
                  </Button>
                </div>
                {!selectedTopic.is_owner &&
                    <FollowToggleButton followed={selectedTopic.followed} isLoggedIn={isUserLogged}
                                        iconOnlyOnMobile={true}
                                        onFollow={() => handleFollowTopic(selectedTopic.uuid)}
                                        onUnfollow={() => handleUnfollowTopic(selectedTopic.uuid)}/>
                }
                <Dropdown label={t("more")} button={<EllipsisHorizontalIcon/>} width={"narrow"} position="end"
                          bottom={true} closeOnClickInside={true}>
                    <Menu>
                        <MenuAction icon={<ChatBubbleIcon/>} label={t("ask_ai")} onClick={handleChatAboutThis}
                                    mobileOnly={true}/>
                        <MenuAction icon={<ShareIcon/>} label={t("share")} onClick={shareTopic}/>
                      {isUserLogged && (selectedTopic.is_owner || selectedTopic.followed) &&
                          <MenuAction icon={selectedTopic.is_favorite ? <StarFilledIcon/> : <StarIcon/>}
                                      label={selectedTopic.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}
                                      onClick={() => handleFavoriteTopic(selectedTopic.uuid)}/>
                      }
                      {isUserLogged && selectedTopic.is_owner &&
                          <MenuAction icon={<PencilIcon/>} label={t("edit")} onClick={handleEditTopic}/>
                      }
                      {isUserLogged && selectedTopic.is_owner &&
                          <MenuAction icon={<TrashIcon/>} label={t("delete")} onClick={handleDeleteTopic}/>
                      }
                    </Menu>
                </Dropdown>
              </>}
          />
      }
      {topicIsLoading && <div className="h-16 shrink-0 border-b border-neutral bg-base-100"/>}
      <div className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-auto">
        {
          topicIsError && !topicIsLoading &&
            <EmptyStateBox title={t("topic_not_found")} message={t("not_found_message")}>
                <Button href={paths.TOPICS}>{t("browse_topics")}</Button>
            </EmptyStateBox>
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
                stripLeading={<FilterToggleButton isOpen={showFilters} isModified={areFiltersModified}
                                                  onClick={toggleFilters}/>}
                filterBar={showFilters &&
                    <ContentFilterBar savedFilters={savedFilters} subscriptions={topicSubscriptions}
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
            <TopicEditorModal subscriptions={combinedSubscriptions}
                              providers={providers}
                              topic={selectedTopic}
                              onSaved={() => {
                                refreshTopics();
                                refreshTopicItems();
                                refreshSubscriptions();
                              }}
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
