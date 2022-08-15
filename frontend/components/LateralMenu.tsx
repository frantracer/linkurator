import {Subscription} from "../hooks/useSubscriptions";
import {useState} from "react";
import {Profile} from "../hooks/useProfile";
import LateralSearchBar from "./LateralSearchBar";
import LateralItemList from "./LateralItemList";
import ProfileMenu from "./ProfileMenu";

type LateralMenuProps = {
  subscriptions: Subscription[];
  profile: Profile;
  selectedSubscription: Subscription | undefined;
  setSelectedSubscription: (subscription: Subscription | undefined) => void;
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
      <div className="flex flex-col flex-shrink-0 w-full text-gray-700 bg-white md:w-64">
        <Title/>
        <ProfileMenu
          profile={props.profile}/>
        <LateralSearchBar
          searchBarQuery={searchValue}
          setSearchBarQuery={setSearchValue}/>
        <LateralItemList
          searchValue={searchValue}
          subscriptions={props.subscriptions}
          setSelectedSubscription={props.setSelectedSubscription}
          selectedSubscription={props.selectedSubscription}/>
      </div>
    </div>
  );
};

export default LateralMenu;
