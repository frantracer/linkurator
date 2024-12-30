'use client';

import type {NextPage} from "next";
import React, {useEffect, useState} from "react";
import useSubscriptions from "../../../../hooks/useSubscriptions";
import useProfile from "../../../../hooks/useProfile";
import useTopicItems from "../../../../hooks/useTopicItems";
import TopicVideoCardGrid from "../../../../components/organism/TopicVideoCardGrid";
import {useTopics} from "../../../../hooks/useTopics";
import EditTopicModal, {EditTopicModalId} from "../../../../components/organism/EditTopicModal";
import {isTopicScanned} from "../../../../entities/Topic";
import {paths} from "../../../../configuration";
import useFilters from "../../../../hooks/useFilters";
import {useParams, useRouter} from "next/navigation";
import CreateFirstTopicHero from "../../../../components/organism/CreateFirstTopicHero";
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
  TrashIcon
} from "../../../../components/atoms/Icons";
import TopicDetails, {TOPIC_DETAILS_ID} from "../../../../components/organism/TopicDetails";
import {showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import useTopicSubscriptions from "../../../../hooks/useTopicSubscriptions";
import {useTopic} from "../../../../hooks/useTopic";
import Tag from "../../../../components/atoms/Tag";
import {deleteTopic, followTopic, unfollowTopic} from "../../../../services/topicService";
import {openModal} from "../../../../utilities/modalAction";
import FlexRow from "../../../../components/atoms/FlexRow";
import {ErrorBanner} from "../../../../components/atoms/ErrorBanner";
import FlexItem from "../../../../components/atoms/FlexItem";
import Dropdown from "../../../../components/atoms/Dropdown";
import FlexColumn from "../../../../components/atoms/FlexColumn";
import Miniature from "../../../../components/atoms/Miniature";
import DeleteTopicConfirmationModal, {
  DeleteTopicConfirmationModalId
} from "../../../../components/organism/DeleteTopicConfirmationModal";
import { MenuItem } from "../../../../components/atoms/MenuItem";
import Menu from "../../../../components/atoms/Menu";
import { useTranslations } from "next-intl";

const REFRESH_TOPICS_INTERVAL = 10000;

const Home: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter()
  const pathParams = useParams<{ id: string[] | string }>();

  const topicIdFromQuery: string | undefined = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {topic: selectedTopic, topicIsLoading, topicIsError} = useTopic(topicIdFromQuery, topics, topicsAreLoading)
  const {topicSubscriptions} = useTopicSubscriptions(selectedTopic, subscriptions)
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

  const deleteTopicAction = (topicId: string) => {
    deleteTopic(topicId)
      .then(() => {
        refreshTopics()
        router.push(paths.TOPICS)
      })
  }

  useEffect(() => {
    if (!topicIdFromQuery && topics.length > 0) {
      router.push(paths.TOPICS + "/" + topics[0].uuid)
    }
  }, [router, topicIdFromQuery, topics]);

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
    <MenuItem key={"topics-show-filters"} onClick={handleShowFilters}>
      <FlexRow position="center">
        <FunnelIcon/>
        {t("filter")}
      </FlexRow>
    </MenuItem>
  )
  if (selectedTopic && isUserLogged) {
    if (selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-edit-topic"} onClick={handleEditTopic}>
          <FlexRow position="center">
            <PencilIcon/>
            {t("edit")}
          </FlexRow>
        </MenuItem>
      )
      dropdownButtons.push(
        <MenuItem key={"topics-delete-topic"} onClick={handleDeleteTopic}>
          <FlexRow position="center">
            <TrashIcon/>
            {t("delete")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-unfollow-topic"} onClick={() => handleUnfollowTopic(selectedTopic.uuid)}>
          <FlexRow position="center">
            <MinusIcon/>
            {t("unfollow")}
          </FlexRow>
        </MenuItem>
      )
    }
    if (!selectedTopic.followed && !selectedTopic.is_owner) {
      dropdownButtons.push(
        <MenuItem key={"topics-follow-topic"} onClick={() => handleFollowTopic(selectedTopic.uuid)}>
          <FlexRow position="center">
            <AddIcon/>
            {t("follow")}
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
          <MenuIcon/>
        </Button>
        <FlexRow hideOverflow={true}>
          <FlexItem grow={true}/>
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
      {topicIsError && !topicIsLoading &&
          <FlexRow position={"center"}>
              <ErrorBanner>
                  <span>{t("topic_not_found")}</span>
              </ErrorBanner>
          </FlexRow>
      }
      {!selectedTopic && !topicIsLoading && !topicIsError &&
          <CreateFirstTopicHero/>
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
        <DeleteTopicConfirmationModal onDeleteTopic={() => deleteTopicAction(selectedTopic.uuid)}/>
      }
    </Drawer>
  );
};

export default Home;
