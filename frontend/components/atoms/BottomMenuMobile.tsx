import React from "react";
import {useTranslations} from "next-intl";
import {usePathname, useParams} from "next/navigation";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Menu from "./Menu";
import {MenuItem} from "./MenuItem";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  MenuIcon,
  OptionsIcon,
  AddIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  StarFilledIcon,
  RefreshIcon
} from "./Icons";
import {showLateralMenu} from "../../utilities/lateralMenuAction";
import {openModal} from "../../utilities/modalAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../organism/LateralNavigationMenu";
import {SearchModalId} from "../organism/SearchModal";
import {SUBSCRIPTION_DETAILS_ID} from "../organism/SubscriptionDetails";
import {TOPIC_DETAILS_ID} from "../organism/TopicDetails";
import {CURATOR_DETAILS_ID} from "../organism/CuratorDetails";
import {EditTopicModalId} from "../organism/EditTopicModal";
import {DeleteTopicConfirmationModalId} from "../organism/DeleteTopicConfirmationModal";
import {AssignTopicModalId} from "../organism/AssignTopicModal";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {useCurators} from "../../hooks/useCurators";
import useSubscription from "../../hooks/useSubscription";
import {useCurator} from "../../hooks/useCurator";
import {useFavoriteTopics} from "../../hooks/useFavoriteTopics";
import FlexRow from "./FlexRow";

type CurrentPage = 'topics' | 'subscriptions' | 'curators' | 'profile' | 'other';

const mapStringToPage = (page: string): CurrentPage => {
  switch (page) {
    case 'topics':
      return 'topics';
    case 'subscriptions':
      return 'subscriptions';
    case 'curators':
      return 'curators';
    case 'profile':
      return 'profile';
    default:
      return 'other';
  }
}

const BottomMenuMobile = () => {
  const t = useTranslations("common");
  const pathname = usePathname();
  const params = useParams<{ id: string[] | string }>();
  const {profile, profileIsLoading} = useProfile();

  const pathnameArray = pathname.split('/').filter((path) => path !== '');
  const currentPage: CurrentPage = mapStringToPage(pathnameArray[0]);

  const pathParamsArray = Array.isArray(params.id) ? params.id : [params.id];
  const selectedId: string | undefined = pathParamsArray.length > 0 ? pathParamsArray[0] : undefined;

  // Hooks for data fetching
  const {subscriptions} = useSubscriptions(profile);
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {toggleFavorite} = useFavoriteTopics();

  // Get current page data
  const selectedTopic = topics.find(topic => topic.uuid === selectedId);
  const {subscription: selectedSubscription} = useSubscription(selectedId || '', subscriptions);
  const {curator: selectedCurator} = useCurator(pathnameArray[1] || '', curators);

  const isUserLogged = !!profile;

  const openLateralMenu = () => {
    showLateralMenu(LATERAL_NAVIGATION_MENU_ID);
  };

  const openSearchModal = () => {
    openModal(SearchModalId);
  };

  const openFilters = () => {
    switch (currentPage) {
      case 'subscriptions':
        showLateralMenu(SUBSCRIPTION_DETAILS_ID);
        break;
      case 'topics':
        showLateralMenu(TOPIC_DETAILS_ID);
        break;
      case 'curators':
        showLateralMenu(CURATOR_DETAILS_ID);
        break;
      default:
        break;
    }
  };

  // Topic page handlers
  const handleEditTopic = () => {
    openModal(EditTopicModalId);
  };

  const handleDeleteTopic = () => {
    openModal(DeleteTopicConfirmationModalId);
  };

  const handleFollowTopic = (topicId: string) => {
    // Import and call the service
    import('../../services/topicService').then(({followTopic}) => {
      followTopic(topicId).then(() => {
        refreshTopics();
      });
    });
  };

  const handleUnfollowTopic = (topicId: string) => {
    import('../../services/topicService').then(({unfollowTopic}) => {
      unfollowTopic(topicId).then(() => {
        refreshTopics();
      });
    });
  };

  const handleFavoriteTopic = (topicId: string) => {
    if (selectedTopic) {
      toggleFavorite(topicId, selectedTopic.is_favorite);
    }
  };

  // Subscription page handlers
  const handleAssignSubscription = () => {
    if (selectedSubscription && !selectedSubscription.followed) {
      // Show error message
    } else {
      openModal(AssignTopicModalId);
    }
  };

  const handleRefreshSubscription = (subscriptionId: string) => {
    import('../../services/subscriptionService').then(({refreshSubscription}) => {
      refreshSubscription(subscriptionId);
    });
  };

  const handleFollowSubscription = (subscriptionId: string) => {
    import('../../services/subscriptionService').then(({followSubscription}) => {
      followSubscription(subscriptionId);
    });
  };

  const handleUnfollowSubscription = (subscriptionId: string) => {
    import('../../services/subscriptionService').then(({unfollowSubscription}) => {
      unfollowSubscription(subscriptionId);
    });
  };

  // Curator page handlers
  const handleFollowCurator = (curatorId: string) => {
    import('../../services/curatorService').then(({followCurator}) => {
      followCurator(curatorId).then(() => {
        refreshCurators();
      });
    });
  };

  const handleUnfollowCurator = (curatorId: string) => {
    import('../../services/curatorService').then(({unfollowCurator}) => {
      unfollowCurator(curatorId).then(() => {
        refreshCurators();
      });
    });
  };

  // Generate dropdown buttons based on current page
  const getDropdownButtons = () => {
    const dropdownButtons = [];

    // Always add filter button for supported pages
    if (['topics', 'subscriptions', 'curators'].includes(currentPage)) {
      dropdownButtons.push(
        <MenuItem key={`${currentPage}-show-filters`} onClick={openFilters} hideMenuOnClick={true}>
          <FlexRow position="center">
            <FunnelIcon />
            {t("filter")}
          </FlexRow>
        </MenuItem>
      );
    }

    if (currentPage === 'topics' && selectedTopic && isUserLogged) {
      if (selectedTopic.is_owner) {
        dropdownButtons.push(
          <MenuItem key="topics-edit-topic" onClick={handleEditTopic} hideMenuOnClick={true}>
            <FlexRow position="center">
              <PencilIcon />
              {t("edit")}
            </FlexRow>
          </MenuItem>
        );
        dropdownButtons.push(
          <MenuItem key="topics-delete-topic" onClick={handleDeleteTopic} hideMenuOnClick={true}>
            <FlexRow position="center">
              <TrashIcon />
              {t("delete")}
            </FlexRow>
          </MenuItem>
        );
      }
      if (selectedTopic.followed && !selectedTopic.is_owner) {
        dropdownButtons.push(
          <MenuItem key="topics-unfollow-topic" onClick={() => handleUnfollowTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <MinusIcon />
              {t("unfollow")}
            </FlexRow>
          </MenuItem>
        );
      }
      if (!selectedTopic.followed && !selectedTopic.is_owner) {
        dropdownButtons.push(
          <MenuItem key="topics-follow-topic" onClick={() => handleFollowTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <AddIcon />
              {t("follow")}
            </FlexRow>
          </MenuItem>
        );
      }
      // Favorite/unfavorite
      if (selectedTopic.is_favorite) {
        dropdownButtons.push(
          <MenuItem key="topics-unfavorite-topic" onClick={() => handleFavoriteTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <StarFilledIcon />
              {t("remove_from_favorites")}
            </FlexRow>
          </MenuItem>
        );
      } else {
        dropdownButtons.push(
          <MenuItem key="topics-favorite-topic" onClick={() => handleFavoriteTopic(selectedTopic.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <StarIcon />
              {t("add_to_favorites")}
            </FlexRow>
          </MenuItem>
        );
      }
    }

    if (currentPage === 'subscriptions' && selectedSubscription && isUserLogged) {
      dropdownButtons.push(
        <MenuItem key="subscriptions-assign" onClick={handleAssignSubscription} hideMenuOnClick={true}>
          <FlexRow position="center">
            <PencilIcon />
            {t("assign")}
          </FlexRow>
        </MenuItem>
      );
      dropdownButtons.push(
        <MenuItem key="subscriptions-refresh" onClick={() => handleRefreshSubscription(selectedSubscription.uuid)} hideMenuOnClick={true}>
          <FlexRow position="center">
            <RefreshIcon />
            {t("refresh")}
          </FlexRow>
        </MenuItem>
      );
      if (selectedSubscription.followed) {
        dropdownButtons.push(
          <MenuItem key="subscriptions-unfollow" onClick={() => handleUnfollowSubscription(selectedSubscription.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <MinusIcon />
              {t("unfollow")}
            </FlexRow>
          </MenuItem>
        );
      } else {
        dropdownButtons.push(
          <MenuItem key="subscriptions-follow" onClick={() => handleFollowSubscription(selectedSubscription.uuid)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <AddIcon />
              {t("follow")}
            </FlexRow>
          </MenuItem>
        );
      }
    }

    if (currentPage === 'curators' && selectedCurator && isUserLogged) {
      if (selectedCurator.followed) {
        dropdownButtons.push(
          <MenuItem key="curators-unfollow" onClick={() => handleUnfollowCurator(selectedCurator.id)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <MinusIcon />
              {t("unfollow")}
            </FlexRow>
          </MenuItem>
        );
      } else {
        dropdownButtons.push(
          <MenuItem key="curators-follow" onClick={() => handleFollowCurator(selectedCurator.id)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <AddIcon />
              {t("follow")}
            </FlexRow>
          </MenuItem>
        );
      }
    }

    return dropdownButtons;
  };

  if (!profile) {
    return null;
  }

  const dropdownButtons = getDropdownButtons();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t-2 border-neutral p-2 lg:hidden w-full">
      <FlexRow>
        <Button
          clickAction={openLateralMenu}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <MenuIcon/>
        </Button>

        <Button
          clickAction={openSearchModal}
          fitContent={false}
          primary={false}
          borderless={true}
        >
          <MagnifyingGlassIcon/>
        </Button>

        <Button
          clickAction={openFilters}
          fitContent={false}
          primary={false}
          borderless={true}
          disabled={!['topics', 'subscriptions', 'curators'].includes(currentPage)}
        >
          <FunnelIcon/>
        </Button>

        <Dropdown button={<OptionsIcon />} borderless={true} bottom={false} start={false}>
          <Menu>
            {dropdownButtons}
          </Menu>
        </Dropdown>
      </FlexRow>
    </div>
  );
};

export default BottomMenuMobile;