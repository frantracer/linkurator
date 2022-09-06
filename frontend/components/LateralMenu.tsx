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
  <div className="flex flex-row items-center justify-between flex-shrink-0 px-8 py-4">
    <a
      href=""
      className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg focus:outline-none focus:shadow-outline"
    >
      Linkurator
    </a>
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

  const LoginButton = () => {
    return <CustomButton
      text={"Login"}
      icon={undefined}
      relatedModalId={undefined}
      clickAction={() => {
        window.open(configuration.LOGIN_URL, '_self')
      }}/>
  }

  return (
    <ul className="menu p-4 overflow-y-auto w-80 bg-white text-base-content">
      <Title/>
      {!props.profile && <LoginButton/>}
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
