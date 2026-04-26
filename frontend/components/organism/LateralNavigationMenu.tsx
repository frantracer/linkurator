import React, {useState} from "react";
import Drawer from "../molecules/Drawer";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {usePathname, useRouter} from "next/navigation";
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
import useProviders from "../../hooks/useProviders";
import FindCuratorModal from "./FindCuratorModal";
import FindSubscriptionModal from "./FindSubscriptionModal";
import FlexItem from "../atoms/FlexItem";
import ProfileInfo from "./ProfileInfo";
import {useTranslations} from "next-intl";
import QuickAccessesModal, {QuickAccessesModalId} from "./QuickAccessesModal";
import LateralTopicList from "./LateralTopicList";
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

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {topics, topicsAreLoading, refreshTopics} = useTopics(profile, profileIsLoading);
  const {providers} = useProviders();
  const [currentTab, setCurrentTab] = useState<CurrentPage>(initialPage);

  const selectedTopicId = pathnameArray[0] === 'topics' ? pathnameArray[1] : undefined;
  const selectedTopic = selectedTopicId ? topics.find((topic) => topic.uuid === selectedTopicId) : undefined;

  const closeMenu = () => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID)
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
                  router.push(paths.CURATORS);
                  closeMenu();
                }} selected={currentTab === 'curators'}>
                    <FlexRow position={"start"}>
                        <FlexItem>
                            <CuratorIcon/>
                        </FlexItem>
                        <FlexItem grow={true}>
                          {t("curators")}
                        </FlexItem>
                    </FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentTab('chats');
                  router.push(paths.CHATS);
                  closeMenu();
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
        {profile &&
            <div className={"flex flex-col"}>
                <Menu isFullHeight={false}>
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
            </div>
        }
        {profile && <Divider/>}
        {profile &&
            <div className={"flex flex-col overflow-y-auto overflow-x-hidden gap-2 mb-auto"}>
                <Button primary={false} fitContent={false} clickAction={openQuickAccessesModal}>
                    <BoltIcon/>
                  {t("quick_accesses")}
                </Button>
                <LateralTopicList
                    topics={topics}
                    selectedTopic={selectedTopic}
                    isLoading={topicsAreLoading}
                    closeMenu={closeMenu}
                />
            </div>
        }
        {profile &&
            <div className={"flex flex-col gap-2"}>
                <div className="mt-auto">
                    <Divider/>
                    <ProfileInfo profile={profile}/>
                </div>
            </div>
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
