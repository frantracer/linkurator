import React from "react";
import {usePathname} from "next/navigation";
import Button from "./Button";
import {BoltIcon, FunnelIcon, MenuIcon} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {openModal} from "../../utilities/modalAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {QuickAccessesModalId} from "../organism/QuickAccessesModal";
import {SUBSCRIPTION_DETAILS_ID} from "../organism/SubscriptionDetails";
import {TOPIC_DETAILS_ID} from "../organism/TopicDetails";
import {CURATOR_DETAILS_ID} from "../organism/CuratorDetails";
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
  const pathname = usePathname();

  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const currentPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const openLateralMenu = () => {
    showLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  };

  const openQuickAccessesModal = () => {
    openModal(QuickAccessesModalId);
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

  return (
    <div className="flex-1 z-10 bg-base-100 border-t-2 border-neutral p-2 lg:hidden w-full">
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
          clickAction={openQuickAccessesModal}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <BoltIcon/>
        </Button>

        {
          ['topics', 'subscriptions', 'curators'].includes(currentPage) &&
            <Button
                clickAction={openFilters}
                fitContent={false}
                primary={false}
                borderless={true}
            >
                <FunnelIcon/>
            </Button>
        }
      </FlexRow>
    </div>
  );
};

export default BottomMenuMobile;