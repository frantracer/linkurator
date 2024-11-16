import {MenuItem} from "../atoms/MenuItem";
import {Subscription} from "../../entities/Subscription";
import {useRouter} from "next/navigation";
import {paths} from "../../configuration";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import React from "react";
import {Topic} from "../../entities/Topic";
import Miniature from "../atoms/Miniature";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexRow from "../atoms/FlexRow";

export const LATERAL_SUBSCRIPTION_MENU_ID = 'lateral-subscription-menu';

type LateralItemListProps = {
  subscriptions: Subscription[];
  topics: Topic[];
  selectedSubscription: Subscription | undefined;
  searchValue: string;
  closeMenu: () => void;
}

const LateralSubscriptionList = (props: LateralItemListProps) => {
  const router = useRouter()
  const handleClick = (subscriptionId: string) => {
    const subscription = props.subscriptions.find((subscription) => subscription.uuid === subscriptionId);
    if (subscription) {
      props.closeMenu()
      scrollToDrawerTop()
      router.push(paths.SUBSCRIPTIONS + "/" + subscription.uuid)
    }
  }

  const items = props.subscriptions
    .filter((subscription) => {
      return subscription.name.toLowerCase().includes(props.searchValue.toLowerCase());
    })
    .map((subscription) => (
      <MenuItem
        key={subscription.uuid}
        onClick={() => handleClick(subscription.uuid)}
        selected={subscription.uuid === props.selectedSubscription?.uuid}
      >
        <FlexRow>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <div className="whitespace-nowrap overflow-auto truncate w-full">{subscription.name}</div>
        </FlexRow>
      </MenuItem>
    ))

  const noItems = (
    <InfoBanner>
      <span className={"text-sm"}>No se encontraron subscripciones</span>
    </InfoBanner>
  )

  return (
    <Menu>
      {items.length > 0 ? items : noItems}
    </Menu>
  )
}

export default LateralSubscriptionList;
