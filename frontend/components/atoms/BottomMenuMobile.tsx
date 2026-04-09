import React from "react";
import {usePathname, useRouter} from "next/navigation";
import Button from "./Button";
import {
  BoltIcon,
  CuratorIcon,
  FunnelIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MenuIcon,
  RectangleGroup,
  SubscriptionIcon
} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {openModal} from "../../utilities/modalAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {QuickAccessesModalId} from "../organism/QuickAccessesModal";
import {SUBSCRIPTION_FILTER_ID} from "../organism/SubscriptionFilter";
import {TOPIC_FILTER_ID} from "../organism/TopicFilter";
import {CURATOR_FILTER_ID} from "../organism/CuratorFilter";
import {FindSubscriptionModalId} from "../organism/FindSubscriptionModal";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import Dropdown from "./Dropdown";
import {MenuItem} from "./MenuItem";
import {FindTopicModalId} from "../organism/FindTopicModal";
import {FindCuratorModalId} from "../organism/FindCuratorModal";

type CurrentPage = 'topics' | 'subscriptions' | 'curators' | 'profile' | 'other';

const mapStringToPage = (page: string): CurrentPage => {
  switch (page) {
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
    case 'curators':
      return 'curators';
    case 'profile':
      return 'profile';
    default:
      return 'other';
  }
}

const BottomMenuMobile = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const currentPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const openLateralMenu = () => {
    showLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  };

  const openQuickAccessesModal = () => {
    openModal(QuickAccessesModalId);
  };

  const goToHome = () => {
    router.push(paths.HOME);
  };

  const openFindSubscriptionModal = () => {
    openModal(FindSubscriptionModalId);
  };

  const openFindTopicModal = () => {
    openModal(FindTopicModalId);
  }

  const openFindCuratorModal = () => {
    openModal(FindCuratorModalId);
  }

  const openFilters = () => {
    switch (currentPage) {
      case 'subscriptions':
        showLateralMenu(SUBSCRIPTION_FILTER_ID);
        break;
      case 'topics':
        showLateralMenu(TOPIC_FILTER_ID);
        break;
      case 'curators':
        showLateralMenu(CURATOR_FILTER_ID);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="flex flex-row bg-base-100 border-t-2 border-neutral items-center justify-around p-2 mt-0.5 lg:hidden w-full">
      <Button
        clickAction={openLateralMenu}
        fitContent={true}
        primary={false}
        borderless={true}
        tooltip={t("menu")}
      >
        <MenuIcon/>
      </Button>

      <Button
        clickAction={openQuickAccessesModal}
        fitContent={true}
        primary={false}
        borderless={true}
        tooltip={t("quick_accesses")}
      >
        <BoltIcon/>
      </Button>

      <Button
        clickAction={goToHome}
        fitContent={true}
        primary={false}
        borderless={true}
        tooltip={t("home")}
      >
        <HomeIcon/>
      </Button>

      <Dropdown
        small={true}
        bottom={false}
        position={"end"}
        closeOnClickInside={true}
        button={
          <Button
            fitContent={true}
            primary={false}
            borderless={true}
            tooltip={t("search")}
            stopPropagation={false}
          >
            <MagnifyingGlassIcon/>
          </Button>
        }
      >
        <MenuItem onClick={openFindTopicModal}>
          <div className="flex flex-row items-center gap-2">
            <RectangleGroup/>
            {t("topics")}
          </div>
        </MenuItem>
        <MenuItem onClick={openFindSubscriptionModal}>
          <div className="flex flex-row items-center gap-2">
            <SubscriptionIcon/>
            {t("subscriptions")}
          </div>
        </MenuItem>
        <MenuItem onClick={openFindCuratorModal}>
          <div className="flex flex-row items-center gap-2">
            <CuratorIcon/>
            {t("curators")}
          </div>
        </MenuItem>
      </Dropdown>

      <Button
        clickAction={openFilters}
        fitContent={true}
        primary={false}
        borderless={true}
        tooltip={t("filter")}
        disabled={!['topics', 'subscriptions', 'curators'].includes(currentPage)}
      >
        <FunnelIcon/>
      </Button>
    </div>
  );
};

export default BottomMenuMobile;