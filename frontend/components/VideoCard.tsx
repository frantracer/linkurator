import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../services/interactionService";
import {CustomSwapButton, CustomSwapButtonIcon} from "./CustomSwapButton";

type VideoCardProps = {
  item: SubscriptionItem;
  subscription?: Subscription;
};

const VideoCard = (props: VideoCardProps) => {
  return (
    <div className="card card-compact w-64 md:w-80 text-black shadow-xl hover:scale-105 cursor-pointer">
      <figure>
        <img className="w-full"
             src={props.item.thumbnail}
             alt={props.item.name}
             onClick={() => window.open(props.item.url, "_blank")}/>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{props.item.name}</h2>
        {props.subscription &&
            <div className="flex items-center">
                <img className="w-4 h-4 inline-block mx-1 rounded" src={props.subscription.thumbnail}
                     alt={props.subscription.name}/>
                <p>{props.subscription.name}</p>
            </div>}
        <div className="flex flex-column">
          <p>{readableAgoUnits(props.item.published_at)}</p>
          <div className="card-actions justify-end">
            <CustomSwapButton icon={CustomSwapButtonIcon.ThumbsDown} defaultChecked={props.item.discouraged}
                              onChecked={() => interactWithItem(props.item.uuid, InteractionType.Discouraged)}
                              onUnchecked={() => removeInteractionWithItem(props.item.uuid, InteractionType.Discouraged)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.ThumbsUp} defaultChecked={props.item.recommended}
                              onChecked={() => interactWithItem(props.item.uuid, InteractionType.Recommended)}
                              onUnchecked={() => removeInteractionWithItem(props.item.uuid, InteractionType.Recommended)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.EyeSlash} defaultChecked={props.item.hidden}
                              onChecked={() => interactWithItem(props.item.uuid, InteractionType.Hidden)}
                              onUnchecked={() => removeInteractionWithItem(props.item.uuid, InteractionType.Hidden)}/>
            <CustomSwapButton icon={CustomSwapButtonIcon.CheckCircle} defaultChecked={props.item.viewed}
                              onChecked={() => interactWithItem(props.item.uuid, InteractionType.Viewed)}
                              onUnchecked={() => removeInteractionWithItem(props.item.uuid, InteractionType.Viewed)}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
