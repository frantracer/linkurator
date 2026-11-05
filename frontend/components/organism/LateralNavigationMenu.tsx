import React, {useEffect} from "react";
import Drawer from "../molecules/Drawer";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {usePathname, useRouter} from "next/navigation";
import Sidebar from "../atoms/Sidebar";
import NavLink from "../atoms/NavLink";
import {
  AddIcon,
  ChatBubbleIcon,
  CuratorIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  RectangleGroup,
  SubscriptionIcon
} from "../atoms/Icons";
import TopicEditorModal from "./TopicEditorModal";
import Button from "../atoms/Button";
import ALink from "../atoms/ALink";
import {LogoImage} from "../atoms/LogoImage";
import {LogoTitle} from "../atoms/LogoTitle";
import {hideLateralMenu} from "../../utilities/lateralMenuAction";
import {paths} from "../../configuration";
import useProviders from "../../hooks/useProviders";
import ProfileDropdown from "./ProfileDropdown";
import NotificationsDropdown from "./NotificationsDropdown";
import {useTranslations} from "next-intl";
import SearchPalette from "./SearchPalette";
import {openSearchPalette} from "../../utilities/searchPaletteAction";
import LateralTopicList from "./LateralTopicList";
import {v4 as uuidv4} from 'uuid';
import ImportSubscriptionsModal from "./ImportSubscriptionsModal";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";

export const LATERAL_NAVIGATION_MENU_ID = 'lateral-navigation-menu';

type Section = 'home' | 'topics' | 'subscriptions' | 'curators' | 'chats' | 'other';

type LateralNavigationMenuProps = {
  children?: React.ReactNode;
}

const mapStringToSection = (page: string | undefined): Section => {
  switch (page) {
    case 'home':
      return 'home';
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
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
  const currentSection = mapStringToSection(pathnameArray[0]);

  const {profile, profileIsLoading} = useProfile();
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {providers} = useProviders();

  const selectedTopicId = currentSection === 'topics' ? pathnameArray[1] : undefined;
  const selectedTopic = selectedTopicId ? topics.find((topic) => topic.uuid === selectedTopicId) : undefined;

  // Any navigation closes the mobile drawer, including links in the profile and notification menus
  useEffect(() => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  }, [pathname]);

  const closeMenu = () => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID)
  }

  const openTopic = () => {
    closeMenu();
    scrollToDrawerTop();
  }

  const openSearch = () => {
    openSearchPalette();
    closeMenu();
  }

  const goToNewChat = () => {
    closeMenu();
    router.push(paths.CHATS + "/" + uuidv4());
  }

  return (
    <Drawer id={LATERAL_NAVIGATION_MENU_ID}>
      <Sidebar>
        <ALink href={paths.HOME}>
          <span className="flex flex-row items-center gap-2 px-2">
            <LogoImage/>
            <LogoTitle/>
          </span>
        </ALink>
        {!profile && !profileIsLoading &&
            <div className="flex flex-col gap-3 px-2">
                <p className={"text-sm text-base-content/70"}>{t("follow_and_create")}</p>
                <Button href={paths.REGISTER} fitContent={false} primary={true}>
                  {t("sign_up")}
                </Button>
                <Button href={paths.LOGIN} fitContent={false} primary={false}>
                  {t("log_in")}
                </Button>
            </div>
        }
        {profile &&
            <button
                type="button"
                onClick={openSearch}
                className="flex flex-row items-center gap-2 mx-1 px-3 h-9 rounded-lg border border-neutral text-sm text-base-content/60 hover:border-primary hover:text-base-content"
            >
                <MagnifyingGlassIcon/>
                <span className="flex-1 text-left">{t("search")}</span>
                <kbd className="hidden lg:inline kbd kbd-xs">⌘K</kbd>
            </button>
        }
        {profile &&
            <nav aria-label={t("main_navigation")} className="flex flex-col gap-0.5">
                <NavLink href={paths.HOME} selected={currentSection === 'home'} onClick={closeMenu}
                         icon={<HomeIcon/>}>
                  {t("home")}
                </NavLink>
                <NavLink href={paths.TOPICS} selected={currentSection === 'topics' && !selectedTopic?.is_favorite}
                         onClick={closeMenu} icon={<RectangleGroup/>}>
                  {t("topics")}
                </NavLink>
                <NavLink href={paths.SUBSCRIPTIONS} selected={currentSection === 'subscriptions'} onClick={closeMenu}
                         icon={<SubscriptionIcon/>}>
                  {t("subscriptions")}
                </NavLink>
                <NavLink href={paths.CURATORS} selected={currentSection === 'curators'} onClick={closeMenu}
                         icon={<CuratorIcon/>}>
                  {t("curators")}
                </NavLink>
                <div className="relative">
                    <NavLink href={paths.CHATS} selected={currentSection === 'chats'} onClick={closeMenu}
                             icon={<ChatBubbleIcon/>}>
                      {t("chats")}
                    </NavLink>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2">
                      <Button primary={false} borderless={true} clickAction={goToNewChat} tooltip={t("new_chat")}>
                          <AddIcon/>
                      </Button>
                    </span>
                </div>
            </nav>
        }
        {profile &&
            <div className={"flex flex-col overflow-y-auto overflow-x-hidden mb-auto"}>
                <LateralTopicList topics={topics} selectedTopic={selectedTopic} onOpenTopic={openTopic}/>
            </div>
        }
        {profile &&
            <div className="flex flex-row items-center gap-3 px-1 pt-3 border-t border-neutral">
                <ProfileDropdown profile={profile} bottom={false} position="start" showProfileInfo={false}/>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold truncate">{profile.first_name} {profile.last_name}</span>
                    <span className="text-xs text-base-content/60 truncate">@{profile.username}</span>
                </div>
                <NotificationsDropdown profile={profile} bottom={false} position="end"/>
            </div>
        }
      </Sidebar>
      <TopicEditorModal onSaved={refreshTopics} subscriptions={subscriptions} providers={providers}/>
      <SearchPalette/>
      <ImportSubscriptionsModal refreshSubscriptions={refreshSubscriptions}/>
      {
        children
      }
    </Drawer>
  )
}
