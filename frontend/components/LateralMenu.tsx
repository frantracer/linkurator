import React, {useState} from "react";
import {Profile} from "../hooks/useProfile";
import LateralSearchBar from "./LateralSearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import ProfileMenu from "./ProfileMenu";
import {SectionType} from "../entities/SectionType";
import SectionDropdown from "./SectionDropdown";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../entities/Topic";
import {Subscription} from "../entities/Subscription";
import CustomButton from "./CustomButton";
import configuration from "../configuration";

type LateralMenuProps = {
  profile: Profile;
  topics: Topic[];
  selectedTopic: Topic | undefined;
  setSelectedTopicId: (topicId: string | undefined) => void;
  subscriptions: Subscription[];
  selectedSubscription: Subscription | undefined;
  setSelectedSubscription: (subscription: Subscription | undefined) => void;
  section: SectionType;
  setSection: (section: SectionType) => void;
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

const LateralMenu = (props: LateralMenuProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const LogoutButton = () => {
    return <CustomButton
      text={"Logout"}
      icon={undefined}
      relatedModalId={undefined}
      clickAction={() => {
        window.open(configuration.LOGOUT_URL, '_self')
      }}/>
  }

  return (
    <ul className="menu p-4 overflow-y-auto w-80 bg-white text-base-content">
      <Title/>
      {props.profile && <SectionDropdown section={props.section} setSection={props.setSection}/>}
      {props.profile &&
          <LateralSearchBar
              searchBarQuery={searchValue}
              setSearchBarQuery={setSearchValue}/>
      }
      {props.section === SectionType.Subscriptions && props.profile &&
          <LateralSubscriptionList
              searchValue={searchValue}
              subscriptions={props.subscriptions}
              setSelectedSubscription={props.setSelectedSubscription}
              selectedSubscription={props.selectedSubscription}/>
      }
      {props.section === SectionType.Topics && props.profile &&
          <LateralTopicList
              topics={props.topics}
              setSelectedTopicId={props.setSelectedTopicId}
              selectedTopic={props.selectedTopic}
              searchValue={searchValue}/>
      }
      {props.profile && <ProfileMenu profile={props.profile}/>}
      {props.profile && <LogoutButton/>}
    </ul>
  );
};

export default LateralMenu;
