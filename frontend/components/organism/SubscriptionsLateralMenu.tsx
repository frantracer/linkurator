import React, {useState} from "react";
import {Profile} from "../../hooks/useProfile";
import LateralSubscriptionList from "./LateralSubscriptionList";
import {Subscription} from "../../entities/Subscription";
import {configuration, paths} from "../../configuration";
import Button from "../atoms/Button";
import LogoHeader from "../molecules/LogoHeader";
import SearchBar from "../molecules/SearchBar";
import {Topic} from "../../entities/Topic";
import Sidebar from "../atoms/Sidebar";
import Divider from "../atoms/Divider";
import ALink from "../atoms/ALink";
import {MenuItem} from "../atoms/MenuItem";
import Menu from "../atoms/Menu";

type LateralMenuProps = {
  profile: Profile;
  subscriptions: Subscription[];
  topics: Topic[],
  selectedSubscription: Subscription | undefined;
  closeMenu: () => void;
};

const LateralMenu = (props: LateralMenuProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const profileUrl = props.profile ? props.profile.avatar_url : '';
  const profileName = props.profile ? props.profile.first_name : '';

  return (
    <Sidebar>
      <LogoHeader avatarUrl={profileUrl} name={profileName}/>
      <Divider/>
      <Menu isFullHeight={false}>
        <ALink href={paths.TOPICS}>
          <MenuItem onClick={() => {
          }} selected={false}>Topics</MenuItem>
        </ALink>
        <ALink href={paths.SUBSCRIPTIONS}>
          <MenuItem onClick={() => {
          }} selected={true}>Subscriptions</MenuItem>
        </ALink>
      </Menu>
      <Divider/>
      <SearchBar handleChange={setSearchValue}/>
      {props.profile &&
          <LateralSubscriptionList
              searchValue={searchValue}
              subscriptions={props.subscriptions}
              topics={props.topics}
              selectedSubscription={props.selectedSubscription}
              closeMenu={props.closeMenu}
          />
      }
      {props.profile &&
          <Button fitContent={false} clickAction={() => {
            window.open(configuration.LOGOUT_URL, '_self')
          }}>
              <span>Logout</span>
          </Button>
      }
    </Sidebar>
  );
};

export default LateralMenu;
