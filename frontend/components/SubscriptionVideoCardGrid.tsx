import {SubscriptionItem} from "../hooks/useSubscriptionItems";
import VideoCard from "./VideoCard";
import {Subscription} from "../hooks/useSubscriptions";

type SubscriptionVideoCardGridProps = {
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
}

const SubscriptionVideoCardGrid = (props: SubscriptionVideoCardGridProps) => {
  const cards = [];

  if (props.subscription) {
    for (let i = 0; i < props.items.length; i++) {
      cards.push(
        <div className="m-4" key={i}>
          <VideoCard
            img={props.items[i].thumbnail}
            name={props.subscription.name}
            description={props.items[i].name}
            url={props.items[i].url}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex flex-row flex-wrap m-6">{cards}</div>
  )
}

export default SubscriptionVideoCardGrid;