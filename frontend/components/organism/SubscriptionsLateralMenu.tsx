import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSearchBar from "../atoms/LateralSearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import ProfileMenu from "../atoms/ProfileMenu";
import {Subscription} from "../../entities/Subscription";
import CustomButton from "../atoms/CustomButton";
import {configuration, paths} from "../../configuration";
import RedirectButton from "../atoms/RedirectButton";

type LateralMenuProps = {
  profile: Profile;
  subscriptions: Subscription[];
  selectedSubscription: Subscription | undefined;
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

  return (
    <div className="flex flex-col p-4 h-full w-80 bg-white text-base-content">
      <div className="flex-[0_0_auto]">
        <Title/>
        <RedirectButton to={paths.TOPICS}>Switch to topics</RedirectButton>
        {props.profile &&
            <LateralSearchBar
                searchBarQuery={searchValue}
                setSearchBarQuery={setSearchValue}/>
        }
      </div>
      <div className="flex-1 overflow-y-auto">

        {props.profile &&
            <LateralSubscriptionList
                searchValue={searchValue}
                subscriptions={props.subscriptions}
                selectedSubscription={props.selectedSubscription}/>
        }
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
