import React, {useEffect, useState} from "react";
import Drawer from "../molecules/Drawer";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {useParams, usePathname} from "next/navigation";
import Sidebar from "../atoms/Sidebar";
import Divider from "../atoms/Divider";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import FlexRow from "../atoms/FlexRow";
import {AddIcon, BookmarkSquaredFilled, ChatBubbleFilledIcon, FunnelIcon, RectangleGroup, UserIconFilled} from "../atoms/Icons";
import SearchBar from "../molecules/SearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import LateralTopicList from "./LateralTopicList";
import {closeModal, openModal} from "../../utilities/modalAction";
import NewTopicModal, {NewTopicModalId} from "./NewTopicModal";
import Button from "../atoms/Button";
import Avatar from "../atoms/Avatar";
import ALink from "../atoms/ALink";
import {LogoImage} from "../atoms/LogoImage";
import {LogoTitle} from "../atoms/LogoTitle";
import {hideLateralMenu, showLateralMenu} from "../../utilities/lateralMenuAction";
import {paths} from "../../configuration";
import FlexColumn from "../atoms/FlexColumn";
import {useCurators} from "../../hooks/useCurators";
import LateralCuratorList from "./LateralCuratorList";
import LateralChatList from "./LateralChatList";
import useChatConversations from "../../hooks/useChatConversations";
import FolowCuratorModal, {FollowCuratorModalId} from "./FollowCuratorModal";
import NewSubscriptionModal, {NewSubscriptionModalId} from "./NewSubscriptionModal";
import FlexItem from "../atoms/FlexItem";
import {SUBSCRIPTION_DETAILS_ID} from "./SubscriptionDetails";
import {TOPIC_DETAILS_ID} from "./TopicDetails";
import {CURATOR_DETAILS_ID} from "./CuratorDetails";
import {useTranslations} from "next-intl";
import SearchModal, { SearchModalId } from "./SearchModal";
import { v4 as uuidv4 } from 'uuid';

export const LATERAL_NAVIGATION_MENU_ID = 'lateral-navigation-menu';

type CurrentPage = 'topics' | 'subscriptions' | 'profile' | 'curators' | 'chat' | 'other';

type LateralNavigationMenuProps = {
  children?: React.ReactNode;
}

const mapStringToPage = (page: string): CurrentPage => {
  switch (page) {
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
    case 'profile':
      return 'profile';
    case 'curators':
      return 'curators';
    case 'chat':
      return 'chat';
    default:
      return 'other';
  }
}

export const LateralNavigationMenu = ({children}: LateralNavigationMenuProps) => {
  const t = useTranslations("common");
  const pathname = usePathname()
  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const initialPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const pathParams = useParams<{ id: string[] | string }>();
  const pathParamsArray = Array.isArray(pathParams.id) ? pathParams.id : [pathParams.id];
  const selectedId: string | undefined = pathParamsArray.length > 0 ? pathParamsArray[0] : undefined;

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {conversations, isLoading: conversationsLoading} = useChatConversations();
  const [currentPage, setCurrentPage] = useState<CurrentPage>(initialPage);
  const [currentTab, setCurrentTab] = useState<CurrentPage>(initialPage);

  const selectedSubscription = subscriptions.find(subscription => subscription.uuid === selectedId);
  const selectedTopic = topics.find(topic => topic.uuid === selectedId);
  const selectedCurator = curators.find(curator => curator.id === selectedId);
  const selectedConversation = conversations.find(conversation => conversation.id === selectedId);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const closeMenu = () => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID)
  }

  const openNewTopicModal = () => {
    openModal(NewTopicModalId);
    closeMenu();
  }

  const openNewSubscriptionModal = () => {
    openModal(NewSubscriptionModalId);
    closeMenu();
  }

  const openFollowCuratorModal = () => {
    openModal(FollowCuratorModalId);
    closeMenu();
  }

  const openSearchModal = () => {
    openModal(SearchModalId);
    closeMenu();
  }

  const openFilters = (page: CurrentPage) => {
    switch (page) {
      case 'subscriptions':
        showLateralMenu(SUBSCRIPTION_DETAILS_ID);
        break;
      case 'topics':
        showLateralMenu(TOPIC_DETAILS_ID);
        break;
      case 'curators':
        showLateralMenu(CURATOR_DETAILS_ID);
        break;
    }
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  }

  return (
    <Drawer id={LATERAL_NAVIGATION_MENU_ID}>
      <Sidebar>
        <FlexRow position={"between"}>
          <FlexRow>
            <FlexColumn gap={1}>
              <ALink href={paths.HOME}>
                <FlexRow position={"start"}>
                  <LogoImage/>
                  <LogoTitle/>
                </FlexRow>
              </ALink>
              <FlexRow position={"center"}>
                <ALink href={"https://x.com/frantracer"}>
                  <span className={"text-xs"}>{t("project_by")} <b>{"@frantracer"}</b></span>
                </ALink>
              </FlexRow>
            </FlexColumn>
          </FlexRow>
          <FlexItem>
            {profile &&
                <ALink href={paths.PROFILE} onClick={() => {
                  setCurrentTab('profile');
                  closeMenu()
                }}>
                    <Avatar src={profile.avatar_url} alt={profile.first_name}/>
                </ALink>
            }
          </FlexItem>
        </FlexRow>
        <Divider/>
        {profile &&
            <FlexRow>
                <FlexItem grow={true}>
                    <SearchBar placeholder={t("search_placeholder")} handleClick={openSearchModal}/>
                </FlexItem>
                <FlexItem shrink={false}>
                    <Button fitContent={true} clickAction={() => openFilters(currentPage)}>
                        <FlexRow>
                            <FunnelIcon/>
                            <span>{t("filter")}</span>
                        </FlexRow>
                    </Button>
                </FlexItem>
            </FlexRow>
        }
        {!profile && !profileIsLoading &&
            <FlexRow>
                <FlexColumn>
                    <FlexRow>
                        <p className={"text-center"}>{t("follow_and_create")}</p>
                    </FlexRow>
                    <Button href={paths.REGISTER} fitContent={false}>{t("sign_up")}</Button>
                    <Divider text={t("or")}/>
                    <Button href={paths.LOGIN} fitContent={false}>{t("log_in")}</Button>
                </FlexColumn>
            </FlexRow>
        }
        {profile &&
            <Menu isFullHeight={false}>
                <MenuItem onClick={() => {
                  setCurrentTab('topics');
                }} selected={currentTab === 'topics'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <RectangleGroup/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("topics")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button fitContent={true} clickAction={openNewTopicModal}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('subscriptions');
                }} selected={currentTab === 'subscriptions'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <BookmarkSquaredFilled/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("subscriptions")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button clickAction={openNewSubscriptionModal}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('curators');
                }} selected={currentTab === 'curators'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <UserIconFilled/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("curators")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button fitContent={true} clickAction={openFollowCuratorModal}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('chat');
                }} selected={currentTab === 'chat'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <ChatBubbleFilledIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("chats")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button fitContent={true} href={paths.CHAT + "/" + uuidv4()} clickAction={closeMenu}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
            </Menu>
        }
        {profile && <Divider/>}
        {profile && currentTab === 'subscriptions' &&
            <LateralSubscriptionList
                subscriptions={subscriptions}
                topics={topics}
                selectedSubscription={selectedSubscription}
                closeMenu={closeMenu}
            />
        }
        {profile && currentTab === 'topics' &&
            <LateralTopicList
                topics={topics}
                closeMenu={closeMenu}
                selectedTopic={selectedTopic}/>
        }
        {profile && currentTab === 'curators' &&
            <LateralCuratorList
                curators={curators}
                closeMenu={closeMenu}
                selectedCurator={selectedCurator}
            />
        }
        {profile && currentTab === 'chat' &&
            <LateralChatList
                conversations={conversations}
                closeMenu={closeMenu}
                selectedConversation={selectedConversation}
                isLoading={conversationsLoading}
            />
        }
      </Sidebar>
      <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
      <NewSubscriptionModal refreshSubscriptions={refreshSubscriptions}/>
      <FolowCuratorModal refreshCurators={refreshCurators} curators={curators}/>
      <SearchModal onClose={() => closeModal(SearchModalId)}/>
      {
        children
      }
    </Drawer>
  )
}
