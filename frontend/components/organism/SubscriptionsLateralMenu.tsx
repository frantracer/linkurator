import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSearchBar from "../atoms/LateralSearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import Button from "../atoms/Button";
import {useRouter} from "next/router";
import LogoHeader from "../molecules/LogoHeader";

type LateralMenuProps = {
  profile: Profile;
  subscriptions: Subscription[];
  selectedSubscription: Subscription | undefined;
};

const LateralMenu = (props: LateralMenuProps) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>('');

  const goToTopics = () => {
    router.push(paths.TOPICS);
  };

  const profileUrl = props.profile ? props.profile.avatar_url : '';
  const profileName = props.profile ? props.profile.first_name : '';

  return (
    <div className="flex flex-col px-2 py-4 h-full w-80 bg-base-200 text-base-content gap-y-2">
      <LogoHeader avatarUrl={profileUrl} name={profileName}/>
      <div className="divider m-0"></div>
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
