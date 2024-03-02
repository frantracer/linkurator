import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSearchBar from "../atoms/LateralSearchBar";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../../entities/Topic";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import {NewTopicModalId} from "./NewTopicModal";
import {useRouter} from "next/router";
import Button from "../atoms/Button";
import {AddIcon} from "../atoms/Icons";
import LogoHeader from "../molecules/LogoHeader";
import {hideLateralMenu} from "../../utilities/hideLateralMenu";
import {openModal} from "../../utilities/modalAction";

type TopicLateralMenuProps = {
  profile: Profile;
  topics: Topic[];
  selectedTopic: Topic | undefined;
  subscriptions: Subscription[];
};

const TopicsLateralMenu = (props: TopicLateralMenuProps) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>('');

  const goToSubscriptions = () => {
    router.push(paths.SUBSCRIPTIONS);
  }

  const profileUrl = props.profile ? props.profile.avatar_url : '';
  const profileName = props.profile ? props.profile.first_name : '';

  const openNewTopicModal = () => {
    openModal(NewTopicModalId);
    hideLateralMenu();
  }

  return (
    <div className="flex flex-col px-2 py-4 h-full w-80 bg-base-200 text-base-content gap-y-2">
      <LogoHeader avatarUrl={profileUrl} name={profileName}/>
      <div className="divider m-0"></div>
      <Button fitContent={false} clickAction={goToSubscriptions}>
        Switch to subscriptions
      </Button>
      <div className="flex flex-row items-center gap-x-2">
        <LateralSearchBar
          searchBarQuery={searchValue}
          setSearchBarQuery={setSearchValue}/>
        <Button clickAction={openNewTopicModal}>
          <AddIcon/>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <LateralTopicList
          topics={props.topics}
          selectedTopic={props.selectedTopic}
          searchValue={searchValue}/>
      </div>
      <div className="flex-[0_0_auto]">
        {props.profile &&
            <Button fitContent={false}
                    clickAction={() => {
                      window.open(configuration.LOGOUT_URL, '_self')
                    }}>
                <span>Logout</span>
            </Button>
        }
      </div>
    </div>
  );
};

export default TopicsLateralMenu;
