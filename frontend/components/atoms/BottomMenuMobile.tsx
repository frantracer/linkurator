import React from "react";
import {useRouter} from "next/navigation";
import Button from "./Button";
import {
  BoltIcon,
  CuratorIcon,
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
import {FindSubscriptionModalId} from "../organism/FindSubscriptionModal";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import Dropdown from "./Dropdown";
import {MenuItem} from "./MenuItem";
import {FindTopicModalId} from "../organism/FindTopicModal";
import {FindCuratorModalId} from "../organism/FindCuratorModal";
import ProfileDropdown from "../organism/ProfileDropdown";
import useProfile from "../../hooks/useProfile";

const BottomMenuMobile = () => {
  const router = useRouter();
  const t = useTranslations("common");
  const {profile} = useProfile();

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

  return (
    <div
      className="flex flex-row bg-base-100 border-t-[1px] border-neutral items-center justify-around p-2 lg:hidden w-full">
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

      {profile && <ProfileDropdown profile={profile} bottom={false}/>}
    </div>
  );
};

export default BottomMenuMobile;