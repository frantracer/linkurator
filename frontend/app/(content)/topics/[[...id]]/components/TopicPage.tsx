'use client';

import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {ErrorBanner} from "../../../../../components/atoms/ErrorBanner";
import CrossButton from "../../../../../components/atoms/CrossButton";
import {
  AddIcon,
  ChatBubbleIcon,
  EllipsisHorizontalIcon,
  MinusIcon,
  PencilIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import DeleteTopicConfirmationModal, {
  DeleteTopicConfirmationModalId
} from "../../../../../components/organism/DeleteTopicConfirmationModal";
import EditTopicModal, {EditTopicModalId} from "../../../../../components/organism/EditTopicModal";
import ContentFilterBar from "../../../../../components/organism/ContentFilterBar";
import ContentItemCardGrid from "../../../../../components/organism/ContentItemCardGrid";
import {paths} from "../../../../../configuration";
import {isTopicScanned} from "../../../../../entities/Topic";
import useFilters from "../../../../../hooks/useFilters";
import useFilterBarVisibility from "../../../../../hooks/useFilterBarVisibility";
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
import TopTitle from "../../../../../components/molecules/TopTitle";
import FilterToggleButton from "../../../../../components/molecules/FilterToggleButton";
import useProviders from "../../../../../hooks/useProviders";
import ALink from "../../../../../components/atoms/ALink";

const REFRESH_TOPICS_INTERVAL = 10000;

const TopicPageComponent = ({topicId}: { topicId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const {filters, setFilters, resetFilters, isModified: areFiltersModified} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {showFilters, toggleFilters} = useFilterBarVisibility();
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
    openModal(DeleteTopicConfirmationModalId)
  }

  const handleFavoriteTopic = (topicId: string) => {
    if (selectedTopic) {
      toggleFavorite(topicId, selectedTopic.is_favorite);
    }
  }

  const deleteTopicAction = (topicId: string) => {
    deleteTopic(topicId)
      .then(() => {
        refreshTopics()
        router.push(paths.TOPICS)
      })
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
    if (selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfollow-topic"} onClick={() => handleUnfollowTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <MinusIcon/>
            {t("unfollow")}
          </div>
        </MenuItem>
      )
    }
    if (!selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-follow-topic"} onClick={() => handleFollowTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <AddIcon/>
            {t("follow")}
          </div>
        </MenuItem>
      )
    }

    // Add favorite/unfavorite option for all topics (owner and followed)
    if (selectedTopic.is_favorite) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfavorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <StarFilledIcon/>
            {t("remove_from_favorites")}
          </div>
        </MenuItem>
      )
    } else {
      dropdownButtons.push(
        <MenuItem key={"topics-favorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <div className="flex flex-row gap-2 items-center justify-left">
            <StarIcon/>
            {t("add_to_favorites")}
          </div>
        </MenuItem>
      )
    }
  }
  if (selectedTopic) {
    dropdownButtons.push(
      <MenuItem key={"topics-chat"} onClick={handleChatAboutThis} hideMenuOnClick={true}>
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
          {!topicIsLoading && <>
              <div className="w-10 shrink-0 flex items-center justify-start">
                  <FilterToggleButton isOpen={showFilters} isModified={areFiltersModified} onClick={toggleFilters}/>
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center gap-2 overflow-hidden">
                  <div className="w-full flex flex-row items-center justify-center gap-2 overflow-hidden">
                      <h1 className="text-xl font-bold min-w-0 whitespace-nowrap truncate">
                        {topicName}
                      </h1>
                  </div>
                  <div className="flex flex-row gap-2 items-center justify-center">
                    {selectedTopic && !selectedTopic.is_owner &&
                        <Button primary={false} href={paths.CURATORS + "/" + selectedTopic.curator.username}>
                            <Miniature src={selectedTopic.curator.avatar_url} alt={selectedTopic.curator.username}/>
                            <span>{selectedTopic.curator.username}</span>
                        </Button>
                    }
                    {selectedTopic && selectedTopic.followed && !selectedTopic.is_owner &&
                        <Tag>
                      <span>
                        {t("following")}
                      </span>
                            <CrossButton onClick={() => handleUnfollowTopic(selectedTopic.uuid)}/>
                        </Tag>
                    }
                    {selectedTopic && !selectedTopic.followed && !selectedTopic.is_owner && isUserLogged &&
                        <Button primary={false} clickAction={() => handleFollowTopic(selectedTopic.uuid)}>
                          {t("follow")}
                        </Button>
                    }
                    {selectedTopic && !selectedTopic.followed && !selectedTopic.is_owner && !isUserLogged &&
                        <Button primary={false} href={paths.LOGIN}>
                          {t("follow")}
                        </Button>
                    }
                    {selectedTopic && selectedTopic.is_owner &&
                        <Tag>
                            <ALink href={paths.TOPICS}>
                                <span className="whitespace-nowrap text-nowrap">{t("my_topics")}</span>
                            </ALink>
                        </Tag>
                    }
                  </div>
              </div>
              <div className="w-10 shrink-0 flex items-center justify-end">
                {isUserLogged && selectedTopic &&
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
                filterBar={showFilters &&
                    <ContentFilterBar subscriptions={topicSubscriptions}
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
            <DeleteTopicConfirmationModal onDeleteTopic={() => deleteTopicAction(selectedTopic.uuid)}/>
        }
      </div>
    </div>
  )
    ;
};

export default TopicPageComponent;
