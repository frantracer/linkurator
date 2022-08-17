import {SubscriptionItem} from "../hooks/useSubscriptionItems";
import VideoCard from "./VideoCard";
import {Subscription} from "../hooks/useSubscriptions";

type SubscriptionVideoCardGridProps = {
  subscription: Subscription | undefined;
  items: SubscriptionItem[];
}

const SubscriptionVideoCardGrid = (props: SubscriptionVideoCardGridProps) => {
  const cards = [];

  const formatDate = (date: Date) => {
    const difference = new Date().getTime() - date.getTime();
    let value: number;
    let unit: string;
    if (difference < 3600000) {
      value = Math.floor(difference / 60000);
      unit = "minute";
    } else if (difference < 86400000) {
      value = Math.floor(difference / 3600000);
      unit = "hour";
    } else if (difference < 604800000) {
      value = Math.floor(difference / 86400000);
      unit = "day";
    } else if (difference < 2419200000) {
      value = Math.floor(difference / 604800000);
      unit = "week";
    } else if (difference < 31536000000) {
      value = Math.floor(difference / 2419200000);
      unit = "month";
    } else {
      value = Math.floor(difference / 31536000000);
      unit = "year";
    }
    if (value !== 1) {
      unit += "s";
    }

    return `${value} ${unit} ago`;
  }

  if (props.subscription) {
    for (let i = 0; i < props.items.length; i++) {
      cards.push(
        <div className="m-4" key={i}>
          <VideoCard
            img={props.items[i].thumbnail}
            name={props.items[i].name}
            description={formatDate(props.items[i].published_at)}
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