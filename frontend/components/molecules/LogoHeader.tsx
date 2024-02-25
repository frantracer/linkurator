import Avatar from "../atoms/Avatar";
import React from "react";

type LogoHeaderProps = {
  avatarUrl: string;
  name: string;
};

const LogoHeader = (props: LogoHeaderProps) => {
  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <img src="/logo_v1_medium.png" alt="logo" className="w-8 h-8"/>
      <a
        href=""
        className="text-2xl font-semibold tracking-widest uppercase rounded-lg"
      >
        Linkurator
      </a>
      <Avatar src={props.avatarUrl} alt={props.name}/>
    </div>
  )
};

export default LogoHeader;
