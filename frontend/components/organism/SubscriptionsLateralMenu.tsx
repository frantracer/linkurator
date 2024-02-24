import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSearchBar from "../atoms/LateralSearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import ProfileMenu from "../atoms/ProfileMenu";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import Button from "../atoms/Button";
import {useRouter} from "next/router";

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
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>('');

  const goToTopics = () => {
    router.push(paths.TOPICS);
  };

  return (
    <div className="flex flex-col p-4 h-full w-80 bg-white text-base-content gap-y-2">
      <Title/>
      <Button fitContent={false} clickAction={goToTopics}>
        Switch to topics
      </Button>
      {props.profile &&
          <LateralSearchBar
              searchBarQuery={searchValue}
              setSearchBarQuery={setSearchValue}/>
      }
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
        {props.profile &&
            <Button fitContent={false} clickAction={() => {
              window.open(configuration.LOGOUT_URL, '_self')
            }}>
                <span>Logout</span>
            </Button>
        }
      </div>
    </div>
  );
};

export default LateralMenu;
