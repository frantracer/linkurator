import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../services/interactionService";
import {CustomSwapButton, CustomSwapButtonIcon} from "./CustomSwapButton";
import {paths} from "../configuration";
import Link from "next/link";
import {useInView} from "react-intersection-observer";

type VideoCardProps = {
  item: SubscriptionItem;
  subscription?: Subscription;
  onChange: () => void;
};

const convert_seconds_to_hh_mm_ss = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - (hours * 3600)) / 60);
  const seconds_left = seconds - (hours * 3600) - (minutes * 60);
  let result = "";
  if (hours > 0) {
    result += hours.toString() + ":";
    result += minutes.toString().padStart(2, "0") + ":";
  } else {
    result += minutes.toString() + ":";
  }
  result += seconds_left.toString().padStart(2, "0");
  return result;
}

const VideoCard = (props: VideoCardProps) => {
  const {ref, inView} = useInView({threshold: 0});

  function onChangeSwapButton(itemUuid: string, interactionType: InteractionType, checked: boolean) {
    if (checked) {
      interactWithItem(itemUuid, interactionType).then(props.onChange);
    } else {
      removeInteractionWithItem(itemUuid, interactionType).then(props.onChange);
    }
  }

  let card = <div className="card card-compact w-64 md:w-80 text-black shadow-xl hover:scale-105" ref={ref}>
    <figure>
      <img className="w-full cursor-pointer"
           src="/video_caption_skeleton.png"
           alt="Loading item..."/>
    </figure>
    <div className="card-body">
      <h2 className="card-title cursor-pointer">
        Loading...
      </h2>
    </div>
  </div>

  if (inView) {
    card = <div className="card card-compact w-64 md:w-80 text-black shadow-xl hover:scale-105">
      <figure>
        <img className="w-full cursor-pointer"
             src={props.item.thumbnail}
             alt={props.item.name}
             onClick={() => window.open(props.item.url, "_blank")}/>
        {props.item.duration != undefined &&
            <span className="absolute top-0 right-0 m-1 p-1 bg-black bg-opacity-90 rounded">
                <p className="text-white">{convert_seconds_to_hh_mm_ss(props.item.duration)}</p>
            </span>
        }
      </figure>
      <div className="card-body">
        <h2 className="card-title cursor-pointer" onClick={() => window.open(props.item.url, "_blank")}>
          {props.item.name}
        </h2>
        {props.subscription &&
            <div className="flex items-center cursor-pointer">
                <img className="w-4 h-4 inline-block mx-1 rounded" src={props.subscription.thumbnail}
                     alt={props.subscription.name}/>
                <Link href={paths.SUBSCRIPTIONS + "/" + props.subscription.uuid}>{props.subscription.name}</Link>
            </div>}
        <div className="flex flex-column">
          <p>{readableAgoUnits(props.item.published_at)}</p>
          <div className="card-actions justify-end">
            <CustomSwapButton icon={CustomSwapButtonIcon.ThumbsDown} defaultChecked={props.item.discouraged}
                              onChecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Discouraged, true)}
                              onUnchecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Discouraged, false)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.ThumbsUp} defaultChecked={props.item.recommended}
                              onChecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Recommended, true)}
                              onUnchecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Recommended, false)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.EyeSlash} defaultChecked={props.item.hidden}
                              onChecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Hidden, true)}
                              onUnchecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Hidden, false)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.CheckCircle} defaultChecked={props.item.viewed}
                              onChecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Viewed, true)}
                              onUnchecked={() => onChangeSwapButton(props.item.uuid, InteractionType.Viewed, false)}/>
          </div>
        </div>
      </div>
    </div>
  }

  return card
};

export default VideoCard;
