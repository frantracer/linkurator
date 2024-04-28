import React from "react";
import Avatar from "./Avatar";
import {Profile} from "../../services/profileService";

type ProfileMenuProps = {
  profile: Profile | undefined
}

const ProfileMenu = (props: ProfileMenuProps) => {
  return (
    <div className="flex flex-row items-center py-4 px-4">
      <h2 className="grow text-2xl font-bold">{props.profile ? props.profile.first_name : "Guest"}</h2>
      {props.profile && <Avatar src={props.profile.avatar_url} alt={props.profile.first_name}/>}
    </div>
  )
}

export default ProfileMenu;
