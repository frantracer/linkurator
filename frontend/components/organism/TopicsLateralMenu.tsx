import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSearchBar from "../atoms/LateralSearchBar";
import ProfileMenu from "../atoms/ProfileMenu";
import LateralTopicList from "../molecules/LateralTopicList";
import {Topic} from "../../entities/Topic";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import {NewTopicModalId} from "./NewTopicModal";
import {useRouter} from "next/router";
import Button from "../atoms/Button";
import {AddIcon} from "../atoms/Icons";

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
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>('');

  const goToSubscriptions = () => {
    router.push(paths.SUBSCRIPTIONS);
  }

  return (
    <div className="flex flex-col p-4 h-full w-80 bg-white text-base-content gap-y-2">
      <Title/>
      <Button fitContent={false} clickAction={goToSubscriptions}>
        Switch to subscriptions
      </Button>
      <div className="flex flex-row items-center gap-x-2">
        <LateralSearchBar
          searchBarQuery={searchValue}
          setSearchBarQuery={setSearchValue}/>
        <Button relatedModalId={NewTopicModalId}>
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
        {props.profile && <ProfileMenu profile={props.profile}/>}
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

export default LateralMenu;
