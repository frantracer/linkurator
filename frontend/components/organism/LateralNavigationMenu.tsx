import React, {useState} from "react";
import Drawer from "../molecules/Drawer";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {useParams, usePathname} from "next/navigation";
import Sidebar from "../atoms/Sidebar";
import Divider from "../atoms/Divider";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import FlexRow from "../atoms/FlexRow";
import {AddIcon, BookmarkSquaredFilled, RectangleGroup} from "../atoms/Icons";
import SearchBar from "../molecules/SearchBar";
import LateralSubscriptionList from "./LateralSubscriptionList";
import LateralTopicList from "./LateralTopicList";
import {openModal} from "../../utilities/modalAction";
import NewTopicModal, {NewTopicModalId} from "./NewTopicModal";
import Button from "../atoms/Button";
import Avatar from "../atoms/Avatar";
import ALink from "../atoms/ALink";
import {LogoImage} from "../atoms/LogoImage";
import {LogoTitle} from "../atoms/LogoTitle";
import {hideLateralMenu} from "../../utilities/hideLateralMenu";
import {paths} from "../../configuration";
import FlexColumn from "../atoms/FlexColumn";

export const LATERAL_NAVIGATION_MENU_ID = 'lateral-navigation-menu';

type CurrentPage = 'topics' | 'subscriptions' | 'profile' | 'other';

type LateralNavigationMenuProps = {
  children?: React.ReactNode;
}

const mapStringToPage = (page: string): CurrentPage => {
  switch (page) {
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
    case 'profile':
      return 'profile';
    default:
      return 'other';
  }
}

export const LateralNavigationMenu = ({children}: LateralNavigationMenuProps) => {
  const pathname = usePathname()
  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const initialPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const pathParams = useParams<{ id: string[] | string }>();
  const pathParamsArray = Array.isArray(pathParams.id) ? pathParams.id : [pathParams.id];
  const selectedId: string | undefined = pathParamsArray.length > 0 ? pathParamsArray[0] : undefined;

  const [searchValue, setSearchValue] = useState<string>('');
  const {profile, profileIsLoading} = useProfile();
  const {subscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const [currentPage, setCurrentPage] = useState<CurrentPage>(initialPage);

  const selectedSubscription = subscriptions.find(subscription => subscription.uuid === selectedId);
  const selectedTopic = topics.find(topic => topic.uuid === selectedId);

  const closeMenu = () => {
    hideLateralMenu(LATERAL_NAVIGATION_MENU_ID)
  }

  const openNewTopicModal = () => {
    openModal(NewTopicModalId);
    closeMenu();
  }

  return (
    <Drawer id={LATERAL_NAVIGATION_MENU_ID}>
      <Sidebar>
        <FlexRow position={"between"}>
          <LogoImage/>
          <ALink href={'/'}>
            <LogoTitle/>
          </ALink>
          {profile &&
              <ALink href={paths.PROFILE} onClick={() => {
                setCurrentPage('profile');
                closeMenu()
              }}>
                  <Avatar src={profile.avatar_url} alt={profile.first_name}/>
              </ALink>
          }
        </FlexRow>
        <Divider/>
        {!profile && !profileIsLoading &&
            <FlexColumn>
                <p className={"text-center"}><b>Create your own categories</b></p>
                <ALink href={"/login"}>
                    <Button fitContent={false}>Sign up</Button>
                </ALink>
            </FlexColumn>
        }
        {profile &&
            <Menu isFullHeight={false}>
                <MenuItem onClick={() => {
                  setCurrentPage('topics');
                }} selected={currentPage === 'topics'}>
                    <FlexRow position={"start"}><RectangleGroup/>Topics</FlexRow>
                </MenuItem>
                <MenuItem onClick={() => {
                  setCurrentPage('subscriptions');
                }} selected={currentPage === 'subscriptions'}>
                    <FlexRow position={"start"}><BookmarkSquaredFilled/>Subscriptions</FlexRow>
                </MenuItem>
            </Menu>
        }
        {profile && <Divider/>}
        {profile && currentPage === 'subscriptions' &&
            <SearchBar value={searchValue} handleChange={setSearchValue}/>
        }
        {profile && currentPage === 'subscriptions' &&
            <LateralSubscriptionList
                searchValue={searchValue}
                subscriptions={subscriptions}
                topics={topics}
                selectedSubscription={selectedSubscription}
                closeMenu={closeMenu}
            />
        }
        {profile && currentPage === 'topics' &&
            <FlexRow>
                <SearchBar value={searchValue} handleChange={setSearchValue}/>
                <Button clickAction={openNewTopicModal}>
                    <AddIcon/>
                </Button>
            </FlexRow>
        }
        {profile && currentPage === 'topics' &&
            <LateralTopicList
                searchValue={searchValue}
                topics={topics}
                closeMenu={closeMenu}
                selectedTopic={selectedTopic}/>
        }
      </Sidebar>
      <NewTopicModal refreshTopics={refreshTopics} subscriptions={subscriptions}/>
      {children}
    </Drawer>
  )
}
