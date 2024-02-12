import {Profile} from "../../hooks/useProfile";
import React from "react";

type ProfileMenuProps = {
  profile: Profile | undefined
}

const ProfileMenu = (props: ProfileMenuProps) => {
  const Avatar = (props: { img: string, userName: string }) => (
    <img
      className="inline-block rounded-full w-7 h-7 ring-1 ring-white"
      src={props.img}
      alt=""
    />
  );

  return (
    <div className="flex flex-row items-center py-4 px-4">
      <h2 className="grow text-2xl font-bold">{props.profile ? props.profile.first_name : "Guest"}</h2>
      <div className="flex">
        {props.profile && <Avatar img={props.profile.avatar_url} userName={props.profile.first_name}/>}
      </div>
    </div>
  )
}

export default ProfileMenu;
