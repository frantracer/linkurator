import React from "react";
import {usePathname, useRouter} from "next/navigation";
import Button from "./Button";
import {BoltIcon, FunnelIcon, HomeIcon, MagnifyingGlassIcon, MenuIcon} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {openModal} from "../../utilities/modalAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {QuickAccessesModalId} from "../organism/QuickAccessesModal";
import {SUBSCRIPTION_FILTER_ID} from "../organism/SubscriptionFilter";
import {TOPIC_FILTER_ID} from "../organism/TopicFilter";
import {CURATOR_FILTER_ID} from "../organism/CuratorFilter";
import {FindSubscriptionModalId} from "../organism/FindSubscriptionModal";
import FlexRow from "./FlexRow";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";

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
    <div className="flex-1 z-10 bg-base-100 border-t-2 border-neutral p-2 lg:hidden w-full">
      <FlexRow>
        <Button
          clickAction={openLateralMenu}
          fitContent={false}
          primary={false}
          borderless={true}
          tooltip={t("menu")}
        >
          <MenuIcon/>
        </Button>

        <Button
          clickAction={openQuickAccessesModal}
          fitContent={false}
          primary={false}
          borderless={true}
          tooltip={t("quick_accesses")}
        >
          <BoltIcon/>
        </Button>

        <Button
          clickAction={goToHome}
          fitContent={false}
          primary={false}
          borderless={true}
          tooltip={t("home")}
        >
          <HomeIcon/>
        </Button>

        <Button
          clickAction={openFindSubscriptionModal}
          fitContent={false}
          primary={false}
          borderless={true}
          tooltip={t("search")}
        >
          <MagnifyingGlassIcon/>
        </Button>

        <Button
          clickAction={openFilters}
          fitContent={false}
          primary={false}
          borderless={true}
          tooltip={t("filter")}
          disabled={!['topics', 'subscriptions', 'curators'].includes(currentPage)}
        >
          <FunnelIcon/>
        </Button>

      </FlexRow>
    </div>
  );
};

export default BottomMenuMobile;