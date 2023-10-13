import {MenuItem} from "./MenuItem";
import {Subscription} from "../entities/Subscription";
import {useRouter} from "next/router";
import {paths} from "../configuration";

type LateralItemListProps = {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | undefined;
  searchValue: string;
}

const LateralSubscriptionList = (props: LateralItemListProps) => {
  const router = useRouter()
  const handleClick = (subscriptionId: string) => {
    const subscription = props.subscriptions.find((subscription) => subscription.uuid === subscriptionId);
    if (subscription) {
      router.push(paths.SUBSCRIPTIONS + "/" + subscription.uuid)
    }
  }

  const items = props.subscriptions
    .filter((subscription) => {
      return subscription.name.toLowerCase().includes(props.searchValue.toLowerCase());
    })
    .map((subscription) => (
      <MenuItem
        title={subscription.name}
        key={subscription.uuid}
        onClick={() => handleClick(subscription.uuid)}
        selected={subscription.uuid === props.selectedSubscription?.uuid}
      />
    ))

  return (
    <nav className="flex-grow pb-4 px-4 md:block md:pb-0 md:overflow-y-auto">
      {items}
    </nav>
  )
}

export default LateralSubscriptionList;
