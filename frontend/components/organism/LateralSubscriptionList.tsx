import {MenuItem} from "../atoms/MenuItem";
import {providerIconUrl, Subscription, subscriptionFiltering, subscriptionSorting} from "../../entities/Subscription";
import {useRouter} from "next/navigation";
import {paths} from "../../configuration";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import React from "react";
import {Topic} from "../../entities/Topic";
import Miniature from "../atoms/Miniature";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexRow from "../atoms/FlexRow";
import Collapse from "../atoms/Collapse";
import {useTranslations} from "next-intl";

type LateralItemListProps = {
  subscriptions: Subscription[];
  topics: Topic[];
  selectedSubscription: Subscription | undefined;
  searchValue: string;
  closeMenu: () => void;
}

const LateralSubscriptionList = (props: LateralItemListProps) => {
  const t = useTranslations("common");
  const router = useRouter()
  const handleClick = (subscriptionId: string) => {
    const subscription = props.subscriptions.find((subscription) => subscription.uuid === subscriptionId);
    if (subscription) {
      props.closeMenu()
      scrollToDrawerTop()
      router.push(paths.SUBSCRIPTIONS + "/" + subscription.uuid)
    }
  }

  const youtubeSubs = props.subscriptions
    .filter((subscription) => subscription.provider === "youtube")
    .filter((subscription) => subscriptionFiltering(subscription, props.searchValue))
    .sort(subscriptionSorting)

  const spotifySubs = props.subscriptions
    .filter((subscription) => subscription.provider === "spotify")
    .filter((subscription) => subscriptionFiltering(subscription, props.searchValue))
    .sort(subscriptionSorting)

  const youtubeItems = youtubeSubs
    .map((subscription) => (
      <MenuItem
        key={subscription.uuid}
        onClick={() => handleClick(subscription.uuid)}
        selected={subscription.uuid === props.selectedSubscription?.uuid}
      >
        <FlexRow>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <div className="whitespace-nowrap overflow-auto text-wrap w-full">{subscription.name}</div>
        </FlexRow>
      </MenuItem>
    ))

  const spotifyItems = spotifySubs
    .map((subscription) => (
      <MenuItem
        key={subscription.uuid}
        onClick={() => handleClick(subscription.uuid)}
        selected={subscription.uuid === props.selectedSubscription?.uuid}
      >
        <FlexRow>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <div className="whitespace-nowrap overflow-auto text-wrap w-full">{subscription.name}</div>
        </FlexRow>
      </MenuItem>
    ))

  const noItems = (
    <InfoBanner>
      <span className={"text-sm"}>{t("no_subscriptions_found")}</span>
    </InfoBanner>
  )

  const youtubeTitle = (
    <FlexRow position={"start"}>
      <Miniature src={providerIconUrl("youtube")} alt={"youtube logo"}/>
      <span>Youtube</span>
    </FlexRow>)

  const spotifyTitle = (
    <FlexRow position={"start"}>
      <Miniature src={providerIconUrl("spotify")} alt={"spotify logo"}/>
      <span>Spotify</span>
    </FlexRow>)

  return (
    <Menu>
      {youtubeItems.length > 0 &&
          <Collapse isOpen={true} title={youtubeTitle} content={youtubeItems}/>
      }
      {spotifyItems.length > 0 &&
          <Collapse isOpen={true} title={spotifyTitle} content={spotifyItems}/>
      }
      {youtubeItems.length === 0 && spotifyItems.length === 0 && noItems}
    </Menu>
  )
}

export default LateralSubscriptionList;
