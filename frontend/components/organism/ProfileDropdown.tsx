'use client';

import React from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import Avatar from "../atoms/Avatar";
import Dropdown from "../atoms/Dropdown";
import {MenuItem} from "../atoms/MenuItem";
import {BellIcon, LogoutIcon, ProfileIcon, SettingsIcon, ThumbsUpIcon} from "../atoms/Icons";
import Divider from "../atoms/Divider";
import {configuration, paths} from "../../configuration";
import {Profile} from "../../services/profileService";
import ProfileInfo from "./ProfileInfo";
import useUnreadNotificationsCount from "../../hooks/useUnreadNotificationsCount";
import {formatUnreadCount} from "../../utilities/unreadCount";

type ProfileDropdownProps = {
  profile: Profile;
  bottom?: boolean;
  position?: "start" | "center" | "end";
  showProfileInfo?: boolean;
  withNotifications?: boolean;
};

const ProfileDropdown = (
  {profile, bottom = true, position = "end", showProfileInfo = true, withNotifications = false}: ProfileDropdownProps
) => {
  const t = useTranslations("common");
  const router = useRouter();
  const {unreadCount} = useUnreadNotificationsCount(profile);

  return (
    <>
      <Dropdown
        button={
          <div className="relative">
            {withNotifications && unreadCount > 0 &&
                <span className="absolute top-0 right-0 z-10 w-4 h-4 rounded-full bg-primary border-2 border-base-100"/>
            }
            <div
              className="w-fit h-fit border-transparent hover:border-primary border-2 rounded-full overflow-hidden p-0">
              <Avatar src={profile.avatar_url} alt={profile.first_name}/>
            </div>
          </div>
        }
        bottom={bottom}
        position={position}
        closeOnClickInside={true}
      >
        {showProfileInfo && (
          <>
            <ProfileInfo profile={profile}/>
            <Divider/>
          </>
        )}
        {withNotifications && (
          <MenuItem onClick={() => router.push(paths.NOTIFICATIONS)}>
            <div className="flex flex-row items-center gap-2 w-full">
              <BellIcon/>
              {t("notifications")}
              {unreadCount > 0 &&
                  <span className="badge badge-primary badge-sm ml-auto">{formatUnreadCount(unreadCount)}</span>
              }
            </div>
          </MenuItem>
        )}
        <MenuItem onClick={() => router.push(paths.PROFILE)}>
          <div className="flex flex-row items-center gap-2">
            <ProfileIcon/>
            {t("my_profile")}
          </div>
        </MenuItem>
        <MenuItem onClick={() => router.push(paths.CURATORS + "/" + profile.username)}>
          <div className="flex flex-row items-center gap-2">
            <ThumbsUpIcon/>
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
