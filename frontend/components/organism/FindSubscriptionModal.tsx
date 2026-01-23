import React, {useState} from "react";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import FlexColumn from "../atoms/FlexColumn";
import SearchBar from "../molecules/SearchBar";
import {useDebounce} from "../../hooks/useDebounce";
import useFindSubscriptions from "../../hooks/useFindSubscriptions";
import FlexRow from "../atoms/FlexRow";
import ALink from "../atoms/ALink";
import {paths} from "../../configuration";
import Miniature from "../atoms/Miniature";
import {MenuItem} from "../atoms/MenuItem";
import Menu from "../atoms/Menu";
import Button from "../atoms/Button";
import {AddIcon, MinusIcon} from "../atoms/Icons";
import {followSubscription, unfollowSubscription} from "../../services/subscriptionService";
import {closeModal} from "../../utilities/modalAction";
import FlexItem from "../atoms/FlexItem";
import {getProviderIcon} from "../../entities/Provider";
import useProviders from "../../hooks/useProviders";
import {useTranslations} from "next-intl";

export const FindSubscriptionModalId = "find-subscription-modal";

type FindSubscriptionModalProps = {
  refreshSubscriptions: () => void;
}

const FindSubscriptionModal = (props: FindSubscriptionModalProps) => {
  const t = useTranslations("common");
  const {providers} = useProviders();

  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const debouncedSubscriptionSearch = useDebounce(subscriptionSearch, 500);

  const {
    subscriptions,
    subscriptionsAreLoading,
    refreshSubscriptions
  } = useFindSubscriptions(debouncedSubscriptionSearch);

  const handleFollow = (subscriptionUuid: string) => {
    followSubscription(subscriptionUuid).then(() => {
      refreshSubscriptions();
      props.refreshSubscriptions();
    });
  }

  const handleUnfollow = (subscriptionUuid: string) => {
    unfollowSubscription(subscriptionUuid).then(() => {
      refreshSubscriptions();
      props.refreshSubscriptions();
    });
  }

  const handleClose = () => {
    setSubscriptionSearch("");
    closeModal(FindSubscriptionModalId);
  }

  const subItems = subscriptions.map((subscription) => {
    return (
      <MenuItem key={subscription.uuid} onClick={() => {
      }}>
        <FlexRow position={"start"} key={subscription.uuid}>
          <ALink href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
                 onClick={handleClose}>
            <FlexItem grow={true}>
              <FlexRow position={"start"}>
                <Miniature src={subscription.thumbnail} alt={subscription.name}
                           badgeImage={getProviderIcon(providers, subscription.provider)}/>
                <span>{subscription.name}</span>
              </FlexRow>
            </FlexItem>
          </ALink>
          <FlexItem grow={true}/>
          {subscription.followed &&
              <Button clickAction={() => handleUnfollow(subscription.uuid)}>
                  <MinusIcon/>
                {t("unfollow")}
              </Button>
          }
          {!subscription.followed &&
              <Button clickAction={() => handleFollow(subscription.uuid)}>
                  <AddIcon/>
                {t("follow")}
              </Button>
          }
        </FlexRow>
      </MenuItem>
    )
  });

  return (
    <Modal id={FindSubscriptionModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center pb-2">{t("find_subscriptions")}</h1>
      <FlexColumn>
        <FlexItem grow={true}>
          <SearchBar placeholder={t("search_subscription")} value={subscriptionSearch}
                     handleChange={setSubscriptionSearch}/>
        </FlexItem>
        <Box title={""}>
          <div className={"h-72 overflow-y-auto"}>
            {subscriptionsAreLoading && <span>{t("loading_subscriptions")}</span>}
            {subItems.length > 0 &&
                <Menu isFullHeight={true}>
                  {subItems}
                </Menu>
            }
            {subItems.length === 0 && !subscriptionsAreLoading && debouncedSubscriptionSearch !== "" &&
                <FlexRow position={"center"}>{t("no_subscriptions_found")}</FlexRow>
            }
          </div>
        </Box>
      </FlexColumn>
    </Modal>
  )
}

export default FindSubscriptionModal;