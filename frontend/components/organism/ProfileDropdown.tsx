'use client';

import React from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import Avatar from "../atoms/Avatar";
import Dropdown from "../atoms/Dropdown";
import {MenuItem} from "../atoms/MenuItem";
import {ImportIcon, LogoutIcon, SettingsIcon, ThumbsUpFilledIcon, UserIconFilled} from "../atoms/Icons";
import Divider from "../atoms/Divider";
import {configuration, paths} from "../../configuration";
import {openModal} from "../../utilities/modalAction";
import ImportSubscriptionsModal, {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import {Profile} from "../../services/profileService";

type ProfileDropdownProps = {
  profile: Profile;
};

const ProfileDropdown = ({profile}: ProfileDropdownProps) => {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <>
      <ImportSubscriptionsModal/>
      <Dropdown
        button={
          <div className="w-fit h-fit border-transparent hover:border-primary border-2 rounded-full overflow-hidden p-0">
            <Avatar src={profile.avatar_url} alt={profile.first_name}/>
          </div>
        }
        bottom={true}
        position="end"
        closeOnClickInside={true}
      >
        <li className="flex flex-row items-center gap-3 p-4">
          <Avatar src={profile.avatar_url} alt={profile.first_name}/>
          <div className="flex flex-col">
            <span className="font-semibold">{profile.first_name} {profile.last_name}</span>
            <span className="text-sm text-base-content/60">@{profile.username}</span>
          </div>
        </li>
        <Divider/>
        <MenuItem onClick={() => router.push(paths.PROFILE)}>
          <div className="flex flex-row items-center gap-2">
            <UserIconFilled/>
            {t("my_profile")}
          </div>
        </MenuItem>
        <MenuItem onClick={() => openModal(ImportSubscriptionsModalId)}>
          <div className="flex flex-row items-center gap-2">
            <ImportIcon/>
            {t("import_subscriptions")}
          </div>
        </MenuItem>
        <MenuItem onClick={() => router.push(paths.CURATORS + "/" + profile.username)}>
          <div className="flex flex-row items-center gap-2">
            <ThumbsUpFilledIcon/>
            {t("my_recommendations")}
          </div>
        </MenuItem>
        <MenuItem onClick={() => router.push(paths.SETTINGS)}>
          <div className="flex flex-row items-center gap-2">
            <SettingsIcon/>
            {t("settings")}
          </div>
        </MenuItem>
        <Divider/>
        <MenuItem onClick={() => window.open(configuration.LOGOUT_URL, '_self')}>
          <div className="flex flex-row items-center gap-2">
            <LogoutIcon/>
            {t("logout")}
          </div>
        </MenuItem>
      </Dropdown>
    </>
  );
};

export default ProfileDropdown;
