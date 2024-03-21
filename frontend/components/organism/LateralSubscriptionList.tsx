import {MenuItem} from "../atoms/MenuItem";
import {Subscription} from "../../entities/Subscription";
import {useRouter} from "next/router";
import {paths} from "../../configuration";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import Tag from "../atoms/Tag";
import React from "react";
import {Topic} from "../../entities/Topic";
import Miniature from "../atoms/Miniature";

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

  function counterTopicsPerSubscription(subscription: Subscription, topics: Topic[]): number {
    return topics.filter((topic) => {
      return topic.subscriptions_ids.includes(subscription.uuid);
    }).length;
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
        <div className="flex flex-row gap-2 items-center">
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <div className="whitespace-nowrap overflow-auto truncate w-full">{subscription.name}</div>
          <Tag>{counterTopicsPerSubscription(subscription, props.topics)}</Tag>
        </div>
      </MenuItem>
    ))

  return (
    <Menu>
      {items}
    </Menu>
  )
}

export default LateralSubscriptionList;
