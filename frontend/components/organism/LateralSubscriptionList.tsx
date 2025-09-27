import {MenuItem} from "../atoms/MenuItem";
import {providerIconUrl, Subscription, subscriptionSorting} from "../../entities/Subscription";
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
  isLoading: boolean;
  selectedSubscription: Subscription | undefined;
  closeMenu: () => void;
  openSyncModal: () => void;
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
    .sort(subscriptionSorting)

  const spotifySubs = props.subscriptions
    .filter((subscription) => subscription.provider === "spotify")
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
    <div className="flex flex-col items-center h-fit gap-2 p-1">
      <InfoBanner>
        <span className={"text-sm"}>{t("no_subscriptions_found")}</span>
      </InfoBanner>
    </div>
  )

  const youtubeTitle = (
    <FlexRow position={"start"}>
      <Miniature src={providerIconUrl("youtube")} alt={"youtube logo"}/>
      <span className="text-sm font-semibold text-base-content/70 tracking-wide">
        {"YouTube"} ({youtubeItems.length})
      </span>
    </FlexRow>)

  const spotifyTitle = (
    <FlexRow position={"start"}>
      <Miniature src={providerIconUrl("spotify")} alt={"spotify logo"}/>
      <span className="text-sm font-semibold text-base-content/70 tracking-wide">
        {"Spotify"} ({spotifyItems.length})
      </span>
    </FlexRow>)

  return (
    <Menu>
      {youtubeItems.length > 0 &&
          <Collapse isOpen={true} title={youtubeTitle} content={youtubeItems}/>
      }
      {spotifyItems.length > 0 &&
          <Collapse isOpen={true} title={spotifyTitle} content={spotifyItems}/>
      }
      {youtubeItems.length === 0 && spotifyItems.length === 0 && !props.isLoading &&
        noItems
      }
    </Menu>
  )
}

export default LateralSubscriptionList;
