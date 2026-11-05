import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import classNames from "classnames";
import {useTranslations} from "next-intl";
import {ChatBubbleIcon, HomeIcon, MagnifyingGlassIcon, MenuIcon, RectangleGroup} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {openSearchPalette} from "../../utilities/searchPaletteAction";
import {paths} from "../../configuration";
import useProfile from "../../hooks/useProfile";
import useUnreadNotificationsCount from "../../hooks/useUnreadNotificationsCount";

const tabClass = (selected: boolean) => classNames(
  "flex flex-1 items-center justify-center min-w-0",
  {
    "text-base-content": selected,
    "text-base-content/60": !selected,
  }
);

const iconClass = (selected: boolean) => classNames(
  "relative flex items-center justify-center w-12 h-10 rounded-full transition-colors",
  {"bg-primary/15 text-primary": selected}
);

const BottomMenuMobile = () => {
  const pathname = usePathname();
  const t = useTranslations("common");
  const {profile} = useProfile();
  const {unreadCount} = useUnreadNotificationsCount(profile);

  const isHome = pathname === paths.HOME;
  const isTopics = pathname.startsWith(paths.TOPICS);
  const isChats = pathname.startsWith(paths.CHATS);

  return (
    <nav
      aria-label={t("main_navigation")}
      className="lg:hidden fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex flex-row items-stretch h-16 px-1 rounded-2xl border border-neutral bg-base-100/85 backdrop-blur-md shadow-lg shadow-black/20">
      <button type="button" className={tabClass(false)} aria-label={t("more")} title={t("more")}
              onClick={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)}>
        <span className={iconClass(false)}>
          <MenuIcon/>
          {unreadCount > 0 &&
              <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-base-100"/>}
        </span>
      </button>
      <Link href={paths.TOPICS} className={tabClass(isTopics)} aria-current={isTopics ? "page" : undefined}
            aria-label={t("topics")} title={t("topics")}>
        <span className={iconClass(isTopics)}><RectangleGroup/></span>
      </Link>
      <Link href={paths.HOME} className={tabClass(isHome)} aria-current={isHome ? "page" : undefined}
            aria-label={t("home")} title={t("home")}>
        <span className={iconClass(isHome)}><HomeIcon/></span>
      </Link>
      <button type="button" className={tabClass(false)} aria-label={t("search")} title={t("search")}
              onClick={() => openSearchPalette()}>
        <span className={iconClass(false)}><MagnifyingGlassIcon/></span>
      </button>
      <Link href={paths.CHATS} className={tabClass(isChats)} aria-current={isChats ? "page" : undefined}
            aria-label={t("chats")} title={t("chats")}>
        <span className={iconClass(isChats)}><ChatBubbleIcon/></span>
      </Link>
    </nav>
  );
};

export default BottomMenuMobile;
