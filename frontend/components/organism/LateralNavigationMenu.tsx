import React, {useEffect, useState} from "react";
import Drawer from "../molecules/Drawer";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {useParams, usePathname, useRouter} from "next/navigation";
import Sidebar from "../atoms/Sidebar";
import Divider from "../atoms/Divider";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import FlexRow from "../atoms/FlexRow";
import {
  AddIcon,
  BookmarkSquaredFilled,
  ChatBubbleFilledIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  RectangleGroup,
  UserIconFilled
} from "../atoms/Icons";
import SearchBar from "../molecules/SearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import LateralTopicList from "./LateralTopicList";
import {closeModal, openModal} from "../../utilities/modalAction";
import NewTopicModal, {NewTopicModalId} from "./NewTopicModal";
import FindTopicModal, {FindTopicModalId} from "./FindTopicModal";
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
import FindSubscriptionModal, {FindSubscriptionModalId} from "./FindSubscriptionModal";
import SynchronizeSubscriptionsModal, {SynchronizeSubscriptionsModalId} from "./SynchronizeSubscriptionsModal";
import FlexItem from "../atoms/FlexItem";
import {SUBSCRIPTION_DETAILS_ID} from "./SubscriptionDetails";
import {TOPIC_DETAILS_ID} from "./TopicDetails";
import {CURATOR_DETAILS_ID} from "./CuratorDetails";
import {useTranslations} from "next-intl";
import SearchModal, {SearchModalId} from "./SearchModal";
import {v4 as uuidv4} from 'uuid';

export const LATERAL_NAVIGATION_MENU_ID = 'lateral-navigation-menu';

type CurrentPage = 'topics' | 'subscriptions' | 'profile' | 'curators' | 'chats' | 'other';

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
    case 'chats':
      return 'chats';
    default:
      return 'other';
  }
}

export const LateralNavigationMenu = ({children}: LateralNavigationMenuProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname()
  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const initialPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const pathParams = useParams<{ id: string[] | string }>();
  const pathParamsArray = Array.isArray(pathParams.id) ? pathParams.id : [pathParams.id];
  const selectedId: string | undefined = pathParamsArray.length > 0 ? pathParamsArray[0] : undefined;

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, subscriptionsAreLoading, refreshSubscriptions} = useSubscriptions(profile);
  const {curators, curatorsAreLoading, refreshCurators} = useCurators(profile, profileIsLoading);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
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

  const openFindTopicModal = () => {
    openModal(FindTopicModalId);
    closeMenu();
  }

  const openFindSubscriptionModal = () => {
    openModal(FindSubscriptionModalId);
    closeMenu();
  }

  const openSynchronizeSubscriptionsModal = () => {
    openModal(SynchronizeSubscriptionsModalId);
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

  const goToNewChat = () => {
    closeMenu();
    const newChatId = uuidv4();
    router.push(paths.CHATS + "/" + newChatId);
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
                <ALink href={"https://www.linkedin.com/in/frantracer/"}>
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
            <FlexRow hideOnMobile={true}>
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
                            <Button fitContent={true} clickAction={openFindTopicModal}>
                                <MagnifyingGlassIcon/>
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
                            <Button fitContent={true} clickAction={openFindSubscriptionModal}>
                                <MagnifyingGlassIcon/>
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
                  setCurrentTab('chats');
                }} selected={currentTab === 'chats'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <ChatBubbleFilledIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("chats")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button fitContent={true} clickAction={goToNewChat}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
            </Menu>
        }
        {profile && <Divider/>}
        {profile && currentTab === 'topics' &&
            <div className={"flex flex-col overflow-auto"}>
                <LateralTopicList
                    topics={topics}
                    subscriptions={subscriptions}
                    isLoading={topicsAreLoading || subscriptionsAreLoading}
                    closeMenu={closeMenu}
                    selectedTopic={selectedTopic}
                    openCreateTopicModal={openNewTopicModal}
                    openSyncSubscriptionModal={openSynchronizeSubscriptionsModal}
                />
                <Button clickAction={openNewTopicModal} fitContent={false}>
                    <AddIcon/>
                  {t("create_topic")}
                </Button>
            </div>
        }
        {profile && currentTab === 'subscriptions' &&
            <div className={"flex flex-col overflow-auto gap-2"}>
                <LateralSubscriptionList
                    subscriptions={subscriptions}
                    topics={topics}
                    isLoading={subscriptionsAreLoading || topicsAreLoading}
                    selectedSubscription={selectedSubscription}
                    closeMenu={closeMenu}
                    openSyncModal={openSynchronizeSubscriptionsModal}
                />
                <Button fitContent={false} clickAction={openSynchronizeSubscriptionsModal}>
                    <AddIcon/>
                  {t("synchronize_subscriptions")}
                </Button>
            </div>
        }
        {profile && currentTab === 'curators' &&
            <LateralCuratorList
                curators={curators}
                isLoading={curatorsAreLoading}
                closeMenu={closeMenu}
                selectedCurator={selectedCurator}
                openFollowCuratorModal={openFollowCuratorModal}
            />
        }
        {profile && currentTab === 'chats' &&
            <LateralChatList
                conversations={conversations}
                closeMenu={closeMenu}
                selectedConversation={selectedConversation}
                isLoading={conversationsLoading}
            />
        }
      </Sidebar>
      <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
      <FindTopicModal refreshTopics={refreshTopics}/>
      <FindSubscriptionModal refreshSubscriptions={refreshSubscriptions}/>
      <SynchronizeSubscriptionsModal/>
      <FolowCuratorModal refreshCurators={refreshCurators} curators={curators}/>
      <SearchModal onClose={() => closeModal(SearchModalId)}/>
      {
        children
      }
    </Drawer>
  )
}
