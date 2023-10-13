import React, {useState} from "react";
import {Profile} from "../hooks/useProfile";
import LateralSearchBar from "./LateralSearchBar";
import ProfileMenu from "./ProfileMenu";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../entities/Topic";
import {Subscription} from "../entities/Subscription";
import CustomButton from "./CustomButton";
import {configuration, paths} from "../configuration";
import RedirectButton from "./RedirectButton";

type TopicLateralMenuProps = {
  profile: Profile;
  topics: Topic[];
  selectedTopic: Topic | undefined;
  subscriptions: Subscription[];
};

const Title = () => (
  <div className="flex px-2 py-4">
    <div className="flex-none px-4">
      <img src="/logo_v1_medium.png" alt="logo" className="w-8 h-8"/>
    </div>
    <div className="flex-1 justify-self-start">
      <a
        href=""
        className="text-2xl font-semibold tracking-widest text-gray-900 uppercase rounded-lg"
      >
        Linkurator
      </a>
    </div>
  </div>
);

const LateralMenu = (props: TopicLateralMenuProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <ul className="menu p-4 overflow-y-auto w-80 bg-white text-base-content">
      <Title/>
      <RedirectButton to={paths.SUBSCRIPTIONS}>Switch to subscriptions</RedirectButton>
      {props.profile &&
          <LateralSearchBar
              searchBarQuery={searchValue}
              setSearchBarQuery={setSearchValue}/>
      }
      <LateralTopicList
          topics={props.topics}
          selectedTopic={props.selectedTopic}
          searchValue={searchValue}/>
      {props.profile && <ProfileMenu profile={props.profile}/>}
      {props.profile && <CustomButton
          text={"Logout"}
          icon={undefined}
          relatedModalId={undefined}
          clickAction={() => {
            window.open(configuration.LOGOUT_URL, '_self')
          }}/>
      }
    </ul>
  );
};

export default LateralMenu;
