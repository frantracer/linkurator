import React, {useState} from "react";
import {Profile} from "../hooks/useProfile";
import LateralSearchBar from "./LateralSearchBar";
import ProfileMenu from "./ProfileMenu";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../entities/Topic";
import {Subscription} from "../entities/Subscription";
import CustomButton, {IconForButton} from "./CustomButton";
import {configuration, paths} from "../configuration";
import RedirectButton from "./RedirectButton";
import {NewTopicModalId} from "./NewTopicModal";

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
    <div className="flex flex-col p-4 h-full w-80 bg-white text-base-content">
      <div className="flex-[0_0_auto]">
        <Title/>
        <RedirectButton to={paths.SUBSCRIPTIONS}>Switch to subscriptions</RedirectButton>
        <LateralSearchBar
          searchBarQuery={searchValue}
          setSearchBarQuery={setSearchValue}/>
        <CustomButton
          text={"New Topic"}
          icon={IconForButton.add}
          relatedModalId={NewTopicModalId}
          clickAction={() => {
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <LateralTopicList
          topics={props.topics}
          selectedTopic={props.selectedTopic}
          searchValue={searchValue}/>
      </div>
      <div className="flex-[0_0_auto]">
        {props.profile && <ProfileMenu profile={props.profile}/>}
        {props.profile && <CustomButton
            text={"Logout"}
            icon={undefined}
            relatedModalId={undefined}
            clickAction={() => {
              window.open(configuration.LOGOUT_URL, '_self')
            }}/>
        }
      </div>
    </div>
  );
};

export default LateralMenu;
