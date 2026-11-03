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
  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] min-w-0",
  {
    "text-base-content font-semibold": selected,
    "text-base-content/60": !selected,
  }
);

const iconClass = (selected: boolean) => classNames(
  "relative flex items-center justify-center w-14 h-7 rounded-full transition-colors",
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
      <Link href={paths.HOME} className={tabClass(isHome)} aria-current={isHome ? "page" : undefined}>
        <span className={iconClass(isHome)}><HomeIcon/></span>
        {t("home")}
      </Link>
      <Link href={paths.TOPICS} className={tabClass(isTopics)} aria-current={isTopics ? "page" : undefined}>
        <span className={iconClass(isTopics)}><RectangleGroup/></span>
        {t("topics")}
      </Link>
      <button type="button" className={tabClass(false)} onClick={() => openSearchPalette()}>
        <span className={iconClass(false)}><MagnifyingGlassIcon/></span>
        {t("search")}
      </button>
      <Link href={paths.CHATS} className={tabClass(isChats)} aria-current={isChats ? "page" : undefined}>
        <span className={iconClass(isChats)}><ChatBubbleIcon/></span>
        {t("chats")}
      </Link>
      <button type="button" className={tabClass(false)} onClick={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)}>
        <span className={iconClass(false)}>
          <MenuIcon/>
          {unreadCount > 0 &&
              <span className="absolute top-0 right-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-base-100"/>}
        </span>
        {t("more")}
      </button>
    </nav>
  );
};

export default BottomMenuMobile;
