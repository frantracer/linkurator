import React, {useState} from "react";
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
  BoltIcon,
  ChatBubbleIcon,
  CuratorIcon,
  HomeIcon,
  ImportIcon,
  MagnifyingGlassIcon,
  ProfileIcon,
  RectangleGroup,
  SettingsIcon,
  SubscriptionIcon,
  ThumbsUpIcon
} from "../atoms/Icons";
import {closeModal, openModal} from "../../utilities/modalAction";
import NewTopicModal from "./NewTopicModal";
import FindTopicModal from "./FindTopicModal";
import Button from "../atoms/Button";
import ALink from "../atoms/ALink";
import {LogoImage} from "../atoms/LogoImage";
import {LogoTitle} from "../atoms/LogoTitle";
import {hideLateralMenu} from "../../utilities/lateralMenuAction";
import {paths} from "../../configuration";
import FlexColumn from "../atoms/FlexColumn";
import {useCurators} from "../../hooks/useCurators";
import LateralCuratorList from "./LateralCuratorList";
import LateralChatList from "./LateralChatList";
import useChatConversations from "../../hooks/useChatConversations";
import useProviders from "../../hooks/useProviders";
import FindCuratorModal, {FindCuratorModalId} from "./FindCuratorModal";
import FindSubscriptionModal from "./FindSubscriptionModal";
import {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import FlexItem from "../atoms/FlexItem";
import ProfileInfo from "./ProfileInfo";
import {useTranslations} from "next-intl";
import QuickAccessesModal, {QuickAccessesModalId} from "./QuickAccessesModal";
import {v4 as uuidv4} from 'uuid';

export const LATERAL_NAVIGATION_MENU_ID = 'lateral-navigation-menu';

type CurrentPage = 'home' | 'topics' | 'subscriptions' | 'profile' | 'curators' | 'chats' | 'other';

type LateralNavigationMenuProps = {
  children?: React.ReactNode;
}

const mapStringToPage = (page: string): CurrentPage => {
  switch (page) {
    case 'home':
      return 'home';
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
    case 'profile':
      return 'home';
    case 'settings':
      return 'home';
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
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {curators, curatorsAreLoading, refreshCurators} = useCurators(profile, profileIsLoading);
  const {refreshTopics} = useTopics(profile, profileIsLoading);
  const {conversations, isLoading: conversationsLoading} = useChatConversations();
  const {providers} = useProviders();
  const [currentTab, setCurrentTab] = useState<CurrentPage>(initialPage);

  const selectedCurator = curators.find(curator => curator.username === selectedId);
  const selectedConversation = conversations.find(conversation => conversation.id === selectedId);

  const closeMenu = () => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID)
  }

  const openImportSubscriptionsModal = () => {
    openModal(ImportSubscriptionsModalId);
    closeMenu();
  }

  const openFindCuratorModal = () => {
    openModal(FindCuratorModalId);
    closeMenu();
  }

  const openQuickAccessesModal = () => {
    openModal(QuickAccessesModalId);
    closeMenu();
  }

  const goToNewChat = () => {
    closeMenu();
    const newChatId = uuidv4();
    router.push(paths.CHATS + "/" + newChatId);
  }

  const goToHome = () => {
    setCurrentTab('home');
    router.push(paths.HOME);
    closeMenu();
  }

  const goToCurator = (curatorUsername: string) => {
    router.push(paths.CURATORS + "/" + curatorUsername);
    closeMenu();
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
        </FlexRow>
        <Divider/>
        {!profile && !profileIsLoading &&
            <FlexRow>
                <FlexColumn>
                    <FlexRow>
                        <p className={"text-center"}>{t("follow_and_create")}</p>
                    </FlexRow>
                    <Button href={paths.REGISTER} fitContent={false} primary={true}>
                      {t("sign_up")}
                    </Button>
                    <Divider text={t("or")}/>
                    <Button href={paths.LOGIN} fitContent={false} primary={false}>
                      {t("log_in")}
                    </Button>
                </FlexColumn>
            </FlexRow>
        }
        {profile &&
            <Menu isFullHeight={false}>
                <MenuItem onClick={() => {
                  goToHome()
                }} selected={currentTab === 'home'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <HomeIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("home")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button primary={false} fitContent={true} borderless={true}
                                    clickAction={openQuickAccessesModal}
                                    tooltip={t("quick_accesses")}>
                                <BoltIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('topics');
                  router.push(paths.TOPICS);
                  closeMenu();
                }} selected={currentTab === 'topics'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <RectangleGroup/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("topics")}
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('subscriptions');
                  router.push(paths.SUBSCRIPTIONS);
                  closeMenu();
                }} selected={currentTab === 'subscriptions'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <SubscriptionIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("subscriptions")}
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('curators');
                }} selected={currentTab === 'curators'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <CuratorIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("curators")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button primary={false} fitContent={true} borderless={true}
                                    clickAction={openFindCuratorModal}
                                    tooltip={t("find_curators")}>
                                <MagnifyingGlassIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('chats');
                }} selected={currentTab === 'chats'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <ChatBubbleIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("chats")}
                        </FlexItem>
                        <FlexItem grow={false}>
                            <Button primary={false} fitContent={true} borderless={true}
                                    clickAction={goToNewChat}
                                    tooltip={t("new_chat")}>
                                <AddIcon/>
                            </Button>
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
            </Menu>
        }
        {profile && <Divider/>}
        {profile && currentTab === 'home' &&
            <div className={"flex flex-col overflow-y-auto overflow-x-hidden gap-2 flex-1"}>
                <Button primary={false} fitContent={false} clickAction={openQuickAccessesModal}>
                    <BoltIcon/>
                  {t("quick_accesses")}
                </Button>
                <Menu>
                    <MenuItem onClick={() => {
                      router.push(paths.PROFILE);
                      closeMenu();
                    }} selected={pathname === paths.PROFILE}>
                        <FlexRow position={"start"}>
                            <FlexItem>
                                <ProfileIcon/>
                            </FlexItem>
                            <FlexItem grow={true}>
                              {t("my_profile")}
                            </FlexItem>
                        </FlexRow>
                    </MenuItem>
                    <MenuItem onClick={() => {
                      openImportSubscriptionsModal();
                    }}>
                        <FlexRow position={"start"}>
                            <FlexItem>
                                <ImportIcon/>
                            </FlexItem>
                            <FlexItem grow={true}>
                              {t("import_subscriptions")}
                            </FlexItem>
                        </FlexRow>
                    </MenuItem>
                  {profile && <MenuItem onClick={() => {
                    goToCurator(profile.username);
                  }} selected={pathname === paths.CURATORS + "/" + profile.username}>
                      <FlexRow position={"start"}>
                          <FlexItem>
                              <ThumbsUpIcon/>
                          </FlexItem>
                          <FlexItem grow={true}>
                            {t("my_recommendations")}
                          </FlexItem>
                      </FlexRow>
                  </MenuItem>}
                    <MenuItem onClick={() => {
                      router.push(paths.SETTINGS);
                      closeMenu();
                    }} selected={pathname === paths.SETTINGS}>
                        <FlexRow position={"start"}>
                            <FlexItem>
                                <SettingsIcon/>
                            </FlexItem>
                            <FlexItem grow={true}>
                              {t("settings")}
                            </FlexItem>
                        </FlexRow>
                    </MenuItem>
                </Menu>
                <div className="mt-auto">
                    <Divider/>
                    <ProfileInfo profile={profile}/>
                </div>
            </div>
        }
        {profile && currentTab === 'curators' &&
            <div className={"flex flex-col overflow-y-auto overflow-x-hidden gap-2"}>
                <Button fitContent={false} clickAction={openFindCuratorModal} primary={false}>
                    <MagnifyingGlassIcon/>
                  {t("search")}
                </Button>
                <LateralCuratorList
                    curators={curators}
                    isLoading={curatorsAreLoading}
                    closeMenu={closeMenu}
                    selectedCurator={selectedCurator}
                    openFindCuratorModal={openFindCuratorModal}
                />
            </div>
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
      <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions} providers={providers}/>
      <FindTopicModal refreshTopics={refreshTopics}/>
      <FindSubscriptionModal refreshSubscriptions={refreshSubscriptions}/>
      <FindCuratorModal refreshCurators={refreshCurators} curators={curators}/>
      <QuickAccessesModal onClose={() => closeModal(QuickAccessesModalId)}/>
      {
        children
      }
    </Drawer>
  )
}
