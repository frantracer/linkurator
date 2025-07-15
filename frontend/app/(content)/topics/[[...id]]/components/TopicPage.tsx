'use client';

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Button from "../../../../../components/atoms/Button";
import Dropdown from "../../../../../components/atoms/Dropdown";
import { ErrorBanner } from "../../../../../components/atoms/ErrorBanner";
import FlexColumn from "../../../../../components/atoms/FlexColumn";
import FlexItem from "../../../../../components/atoms/FlexItem";
import FlexRow from "../../../../../components/atoms/FlexRow";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MenuIcon,
  MinusIcon,
  OptionsIcon,
  PencilIcon,
  StarIcon,
  StarFilledIcon,
  TrashIcon
} from "../../../../../components/atoms/Icons";
import Menu from "../../../../../components/atoms/Menu";
import { MenuItem } from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CreateFirstTopicHero from "../../../../../components/organism/CreateFirstTopicHero";
import DeleteTopicConfirmationModal, {
  DeleteTopicConfirmationModalId
} from "../../../../../components/organism/DeleteTopicConfirmationModal";
import EditTopicModal, { EditTopicModalId } from "../../../../../components/organism/EditTopicModal";
import { LATERAL_NAVIGATION_MENU_ID } from "../../../../../components/organism/LateralNavigationMenu";
import TopicDetails, { TOPIC_DETAILS_ID } from "../../../../../components/organism/TopicDetails";
import TopicVideoCardGrid from "../../../../../components/organism/TopicVideoCardGrid";
import { paths } from "../../../../../configuration";
import { isTopicScanned } from "../../../../../entities/Topic";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import useSubscriptions from "../../../../../hooks/useSubscriptions";
import { useTopic } from "../../../../../hooks/useTopic";
import useTopicItems from "../../../../../hooks/useTopicItems";
import { useTopics } from "../../../../../hooks/useTopics";
import useTopicSubscriptions from "../../../../../hooks/useTopicSubscriptions";
import { deleteTopic, followTopic, unfollowTopic } from "../../../../../services/topicService";
import { useFavoriteTopics } from "../../../../../hooks/useFavoriteTopics";
import { showLateralMenu } from "../../../../../utilities/lateralMenuAction";
import { openModal } from "../../../../../utilities/modalAction";

const REFRESH_TOPICS_INTERVAL = 10000;

const TopicPageComponent = ({ topicId }: { topicId: string }) => {
  const t = useTranslations("common");
  const router = useRouter()

  const { filters, setFilters, resetFilters } = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const { profile, profileIsLoading } = useProfile();
  const { subscriptions, refreshSubscriptions } = useSubscriptions(profile);
  const { topics, topicsAreLoading, refreshTopics } = useTopics(profile, profileIsLoading);
  const { topic: selectedTopic, topicIsLoading, topicIsError } = useTopic(topicId, topics, topicsAreLoading);
  const { toggleFavorite } = useFavoriteTopics();
  const { topicSubscriptions } = useTopicSubscriptions(selectedTopic, subscriptions)
  const {
    topicItems,
    isLoading,
    isFinished,
    refreshTopicItem,
    refreshTopicItems,
    fetchMoreItems
  } = useTopicItems(selectedTopic ? selectedTopic.uuid : undefined, debouncedFilters);

  const topicName = selectedTopic ? selectedTopic.name : "";
  const isTopicBeingScanned = selectedTopic ? !isTopicScanned(selectedTopic, subscriptions) : false
  const isUserLogged = !!profile

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
    showLateralMenu(TOPIC_DETAILS_ID);
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
    if (!topicId && topics.length > 0) {
      router.push(paths.TOPICS + "/" + topics[0].uuid)
    }
  }, [router, topicId, topics]);

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
  dropdownButtons.push(
    <MenuItem key={"topics-show-filters"} onClick={handleShowFilters} hideMenuOnClick={true}>
      <FlexRow position="center">
        <FunnelIcon />
        {t("filter")}
      </FlexRow>
    </MenuItem>
  )
  if (selectedTopic && isUserLogged) {
    if (selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-edit-topic"} onClick={handleEditTopic} hideMenuOnClick={true}>
          <FlexRow position="center">
            <PencilIcon />
            {t("edit")}
          </FlexRow>
        </MenuItem>
      )
      dropdownButtons.push(
        <MenuItem key={"topics-delete-topic"} onClick={handleDeleteTopic} hideMenuOnClick={true}>
          <FlexRow position="center">
            <TrashIcon />
            {t("delete")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfollow-topic"} onClick={() => handleUnfollowTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
          <FlexRow position="center">
            <MinusIcon />
            {t("unfollow")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (!selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-follow-topic"} onClick={() => handleFollowTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
          <FlexRow position="center">
            <AddIcon />
            {t("follow")}
          </FlexRow>
        </MenuItem>
      )
    }

    // Add favorite/unfavorite option for all topics (owner and followed)
    if (selectedTopic.is_favorite) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfavorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
          <FlexRow position="center">
            <StarFilledIcon />
            {t("remove_from_favorites")}
          </FlexRow>
        </MenuItem>
      )
    } else {
      dropdownButtons.push(
        <MenuItem key={"topics-favorite-topic"} onClick={() => handleFavoriteTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
          <FlexRow position="center">
            <StarIcon />
            {t("add_to_favorites")}
          </FlexRow>
        </MenuItem>
      )
    }
  }

  return (
    <Drawer id={TOPIC_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <TopicDetails topic={selectedTopic}
        subscriptions={topicSubscriptions}
        filters={filters}
        showInteractions={isUserLogged}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon />
        </Button>
        <FlexRow hideOverflow={true}>
          <FlexItem grow={true} />
          <FlexRow>
            <FlexItem>
              <FlexColumn gap={0} position={"center"}>
                <FlexRow>
                  <h1 className="text-xl font-bold whitespace-nowrap truncate">
                    {topicName}
                  </h1>
                </FlexRow>
                <FlexRow>
                  {selectedTopic && !selectedTopic.is_owner &&
                    <Button primary={false} href={paths.CURATORS + "/" + selectedTopic.curator.username}>
                      <Miniature src={selectedTopic.curator.avatar_url} alt={selectedTopic.curator.username} />
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
                        <CrossIcon />
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
              </FlexColumn>
            </FlexItem>
          </FlexRow>
          <FlexItem grow={true} />
        </FlexRow>
        <Dropdown button={<OptionsIcon />} start={false} bottom={true}>
          <Menu>
            {dropdownButtons}
          </Menu>
        </Dropdown>
      </TopTitle>
      {topicIsError && !topicIsLoading &&
        <FlexRow position={"center"}>
          <ErrorBanner>
            <span>{t("topic_not_found")}</span>
          </ErrorBanner>
        </FlexRow>
      }
      {!selectedTopic && !topicIsLoading && !topicIsError &&
        <CreateFirstTopicHero />
      }
      {selectedTopic &&
        <TopicVideoCardGrid topic={selectedTopic}
          items={topicItems}
          fetchMoreItems={fetchMoreItems}
          refreshItem={refreshTopicItem}
          subscriptions={topicSubscriptions}
          filters={debouncedFilters}
          isLoading={isLoading}
          topicIsFinished={isFinished}
          handleScroll={handleGridScroll}
          isTopicBeingScanned={isTopicBeingScanned}
          displayInteractions={isUserLogged}
        />
      }
      {selectedTopic &&
        <EditTopicModal refreshTopics={refreshTopics}
          subscriptions={subscriptions}
          topic={selectedTopic}
          refreshTopicItems={refreshTopicItems}
          refreshSubscriptions={refreshSubscriptions}
        />
      }
      {selectedTopic &&
        <DeleteTopicConfirmationModal onDeleteTopic={() => deleteTopicAction(selectedTopic.uuid)} />
      }
    </Drawer>
  );
};

export default TopicPageComponent;
