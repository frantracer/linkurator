import {SubscriptionItem} from "../hooks/useSubscriptionItems";
import VideoCard from "./VideoCard";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {Subscription} from "../entities/Subscription";

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
            name={props.items[i].name}
            description={readableAgoUnits(props.items[i].published_at)}
            url={props.items[i].url}
          />
        </div>
      );
    }
  }

  return (
    <div>
      <div className="text-3xl text-center text-gray-800">{props.subscription ? props.subscription.name : ""}</div>
      <div className="flex flex-row flex-wrap m-6">{cards}</div>
    </div>
  )
}

export default SubscriptionVideoCardGrid;