import {useState} from "react";
import {Profile} from "../hooks/useProfile";
import LateralSearchBar from "./LateralSearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import ProfileMenu from "./ProfileMenu";
import {SectionType} from "../entities/SectionType";
import SectionDropdown from "./SectionDropdown";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../entities/Topic";
import {Subscription} from "../entities/Subscription";

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
      href="#"
      className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg focus:outline-none focus:shadow-outline"
    >
      Linkurator
    </a>
    <button className="rounded-lg md:hidden focus:outline-none focus:shadow-outline">
      Linkurator
    </button>
  </div>
);

const LateralMenu = (props: LateralMenuProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  return (
    <div className="sticky top-0 flex-col h-screen bg-white shadow-lg md:flex md:flex-row">
      <div className="flex flex-col flex-shrink-0 w-full bg-white md:w-64">
        <Title/>
        <ProfileMenu
          profile={props.profile}/>
        <SectionDropdown section={props.section} setSection={props.setSection}/>
        <LateralSearchBar
          searchBarQuery={searchValue}
          setSearchBarQuery={setSearchValue}/>
        {props.section === SectionType.Subscriptions &&
            <LateralSubscriptionList
                searchValue={searchValue}
                subscriptions={props.subscriptions}
                setSelectedSubscription={props.setSelectedSubscription}
                selectedSubscription={props.selectedSubscription}/>
        }
        {props.section === SectionType.Topics &&
            <LateralTopicList
                topics={props.topics}
                setSelectedTopicId={props.setSelectedTopicId}
                selectedTopic={props.selectedTopic}
                searchValue={searchValue}/>
        }
      </div>
    </div>
  );
};

export default LateralMenu;
