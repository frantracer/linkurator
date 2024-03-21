import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralTopicList from "./LateralTopicList";
import {Topic} from "../../entities/Topic";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import {NewTopicModalId} from "./NewTopicModal";
import {useRouter} from "next/router";
import Button from "../atoms/Button";
import {AddIcon} from "../atoms/Icons";
import LogoHeader from "../molecules/LogoHeader";
import {openModal} from "../../utilities/modalAction";
import SearchBar from "../molecules/SearchBar";
import Sidebar from "../atoms/Sidebar";
import Divider from "../atoms/Divider";

type TopicLateralMenuProps = {
  profile: Profile;
  topics: Topic[];
  selectedTopic: Topic | undefined;
  subscriptions: Subscription[];
  closeMenu: () => void;
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
    props.closeMenu();
  }

  return (
    <Sidebar>
      <LogoHeader avatarUrl={profileUrl} name={profileName}/>
      <Divider/>
      <Button fitContent={false} clickAction={goToSubscriptions}>
        Switch to subscriptions
      </Button>
      <div className="flex flex-row items-center gap-x-2">
        <SearchBar handleChange={setSearchValue}/>
        <Button clickAction={openNewTopicModal}>
          <AddIcon/>
        </Button>
      </div>
      <LateralTopicList
        topics={props.topics}
        selectedTopic={props.selectedTopic}
        searchValue={searchValue}
        closeMenu={props.closeMenu}
      />
      {props.profile &&
          <Button fitContent={false}
                  clickAction={() => {
                    window.open(configuration.LOGOUT_URL, '_self')
                  }}>
              <span>Logout</span>
          </Button>
      }
    </Sidebar>
  );
};

export default TopicsLateralMenu;
