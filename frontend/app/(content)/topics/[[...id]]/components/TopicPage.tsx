'use client';

import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import {ErrorBanner} from "../../../../../components/atoms/ErrorBanner";
import FlexRow from "../../../../../components/atoms/FlexRow";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  PencilIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import DeleteTopicConfirmationModal, {
  DeleteTopicConfirmationModalId
} from "../../../../../components/organism/DeleteTopicConfirmationModal";
import EditTopicModal, {EditTopicModalId} from "../../../../../components/organism/EditTopicModal";
import TopicFilter, {TOPIC_FILTER_ID} from "../../../../../components/organism/TopicFilter";
import VideoCardGrid from "../../../../../components/organism/VideoCardGrid";
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
import {showLateralMenu} from "../../../../../utilities/lateralMenuAction";
import {openModal} from "../../../../../utilities/modalAction";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import TopTitle from "../../../../../components/molecules/TopTitle";
import useProviders from "../../../../../hooks/useProviders";

const REFRESH_TOPICS_INTERVAL = 10000;

const TopicPageComponent = ({topicId}: { topicId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const {filters, setFilters, resetFilters} = useFilters();
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

  const handleShowFilters = () => {
    showLateralMenu(TOPIC_FILTER_ID);
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
    if (!topicId && topics.length > 0 && !topicsAreLoading) {
      router.push(paths.TOPICS + "/" + topics[0].uuid)
    }
    if (!topicId && topics.length === 0 && !topicsAreLoading) {
      router.push(paths.HOME)
    }
  }, [router, topicId, topics, topicsAreLoading]);

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
          <FlexRow position="center">
            <PencilIcon/>
            {t("edit")}
          </FlexRow>
        </MenuItem>
      )
      dropdownButtons.push(
        <MenuItem key={"topics-delete-topic"} onClick={handleDeleteTopic} hideMenuOnClick={true}>
          <FlexRow position="center">
            <TrashIcon/>
            {t("delete")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfollow-topic"} onClick={() => handleUnfollowTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <FlexRow position="center">
            <MinusIcon/>
            {t("unfollow")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (!selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-follow-topic"} onClick={() => handleFollowTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <FlexRow position="center">
            <AddIcon/>
            {t("follow")}
          </FlexRow>
        </MenuItem>
      )
    }

    // Add favorite/unfavorite option for all topics (owner and followed)
    if (selectedTopic.is_favorite) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfavorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <FlexRow position="center">
            <StarFilledIcon/>
            {t("remove_from_favorites")}
          </FlexRow>
        </MenuItem>
      )
    } else {
      dropdownButtons.push(
        <MenuItem key={"topics-favorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)}
                  hideMenuOnClick={true}>
          <FlexRow position="center">
            <StarIcon/>
            {t("add_to_favorites")}
          </FlexRow>
        </MenuItem>
      )
    }
  }
  dropdownButtons.push(
    <MenuItem key={"topics-filter"} onClick={handleShowFilters} hideMenuOnClick={true}>
      <FlexRow position="center">
        <FunnelIcon/>
        {t("filter")}
      </FlexRow>
    </MenuItem>
  )

  return (
    <Drawer id={TOPIC_FILTER_ID} right={true} alwaysOpenOnDesktop={false}>
      <TopicFilter topic={selectedTopic}
                   subscriptions={topicSubscriptions}
                   providers={providers}
                   filters={filters}
                   showInteractions={isUserLogged}
                   setFilters={setFilters}
                   resetFilters={resetFilters}
      />
      <TopTitle>
        <div className="flex flex-row items-center overflow-visible">
          <div className="flex-grow"/>
          <div className="flex-grow items-center gap-2 overflow-hidden">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-center gap-2">
                <h1 className="text-xl font-bold whitespace-nowrap truncate">
                  {topicName}
                </h1>
                <Button primary={false} fitContent={true} clickAction={handleShowFilters} tooltip={t("filter")} hideOnMobile={true}>
                  <FunnelIcon/>
                </Button>
              </div>
              <FlexRow>
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
                        <div className="hover:cursor-pointer"
                             onClick={() => handleUnfollowTopic(selectedTopic.uuid)}>
                            <CrossIcon/>
                        </div>
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
                        <span className="whitespace-nowrap text-nowrap">{t("my_topics")}</span>
                    </Tag>
                }
              </FlexRow>
            </div>
          </div>
          <div className="flex-grow"/>
          {selectedTopic &&
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
      {
        topicIsError && !topicIsLoading &&
          <FlexRow position={"center"}>
              <ErrorBanner>
                  <span>{t("topic_not_found")}</span>
              </ErrorBanner>
          </FlexRow>
      }
      {
        selectedTopic &&
          <VideoCardGrid
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
          />
      }
      {
        selectedTopic &&
          <EditTopicModal refreshTopics={refreshTopics}
                          subscriptions={combinedSubscriptions}
                          topic={selectedTopic}
                          refreshTopicItems={refreshTopicItems}
                          refreshSubscriptions={refreshSubscriptions}
          />
      }
      {
        selectedTopic &&
          <DeleteTopicConfirmationModal onDeleteTopic={() => deleteTopicAction(selectedTopic.uuid)}/>
      }
    </Drawer>
  )
    ;
};

export default TopicPageComponent;
