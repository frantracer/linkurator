import React from "react";
import {useTranslations} from "next-intl";
import {usePathname} from "next/navigation";
import Button from "./Button";
import {FunnelIcon, MagnifyingGlassIcon, MenuIcon, OptionsIcon} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {openModal} from "../../utilities/modalAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {SearchModalId} from "../organism/SearchModal";
import {SUBSCRIPTION_DETAILS_ID} from "../organism/SubscriptionDetails";
import {TOPIC_DETAILS_ID} from "../organism/TopicDetails";
import {CURATOR_DETAILS_ID} from "../organism/CuratorDetails";
import useProfile from "../../hooks/useProfile";
import FlexRow from "./FlexRow";

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
  const t = useTranslations("common");
  const pathname = usePathname();
  const {profile} = useProfile();

  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const currentPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const openLateralMenu = () => {
    showLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  };

  const openSearchModal = () => {
    openModal(SearchModalId);
  };

  const openFilters = () => {
    switch (currentPage) {
      case 'subscriptions':
        showLateralMenu(SUBSCRIPTION_DETAILS_ID);
        break;
      case 'topics':
        showLateralMenu(TOPIC_DETAILS_ID);
        break;
      case 'curators':
        showLateralMenu(CURATOR_DETAILS_ID);
        break;
      default:
        break;
    }
  };

  const openMoreOptions = () => {
    showLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t-2 border-neutral p-2 lg:hidden w-full">
      <FlexRow>
        <Button
          clickAction={openLateralMenu}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <MenuIcon/>
        </Button>

        <Button
          clickAction={openSearchModal}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <MagnifyingGlassIcon/>
        </Button>

        <Button
          clickAction={openFilters}
          fitContent={false}
          primary={false}
          borderless={true}
          disabled={!['topics', 'subscriptions', 'curators'].includes(currentPage)}
        >
          <FunnelIcon/>
        </Button>

        <Button
          clickAction={openMoreOptions}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <OptionsIcon/>
        </Button>
      </FlexRow>
    </div>
  );
};

export default BottomMenuMobile;