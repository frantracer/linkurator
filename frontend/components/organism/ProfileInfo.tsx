import React from "react";
import Avatar from "../atoms/Avatar";
import {Profile} from "../../services/profileService";

type ProfileInfoProps = {
  profile: Profile;
};

const ProfileInfo = ({profile}: ProfileInfoProps) => {
  return (
    <div className="flex flex-row items-center gap-3 p-4">
      <Avatar src={profile.avatar_url} alt={profile.first_name}/>
      <div className="flex flex-col">
        <span className="font-semibold">{profile.first_name} {profile.last_name}</span>
        <span className="text-sm text-base-content/60">@{profile.username}</span>
      </div>
    </div>
  );
};

export default ProfileInfo;
