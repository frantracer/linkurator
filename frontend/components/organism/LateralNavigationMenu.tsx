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
import {NewTopicModalId} from "./NewTopicModal";
import Button from "../atoms/Button";
import Avatar from "../atoms/Avatar";
import ALink from "../atoms/ALink";
import {LogoImage} from "../atoms/LogoImage";
import {LogoTitle} from "../atoms/LogoTitle";
import {hideLateralMenu} from "../../utilities/hideLateralMenu";

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
  const {topics} = useTopics(profile, profileIsLoading);
  const [currentPage, setCurrentPage] = useState<CurrentPage>(initialPage);

  const selectedSubscription = subscriptions.find(subscription => subscription.uuid === selectedId);
  const selectedTopic = topics.find(topic => topic.uuid === selectedId);

  const profileUrl = profile ? profile.avatar_url : '';
  const profileName = profile ? profile.first_name : '';

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
        <FlexRow>
          <LogoImage/>
          <ALink href={'/'}>
            <LogoTitle/>
          </ALink>
          <ALink href={'/profile'} onClick={() => setCurrentPage('profile')}>
            <Avatar src={profileUrl} alt={profileName}/>
          </ALink>
        </FlexRow>
        <Divider/>
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
        <Divider/>
        {currentPage === 'subscriptions' &&
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
        {currentPage === 'topics' &&
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
      {children}
    </Drawer>
  )
}
