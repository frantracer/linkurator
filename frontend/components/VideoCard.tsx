import {Subscription} from "../entities/Subscription";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {readableAgoUnits} from "../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../services/interactionService";
import {CustomSwapButton, CustomSwapButtonIcon} from "./CustomSwapButton";

type VideoCardProps = {
  item: SubscriptionItem;
  subscription?: Subscription;
  onChange: () => void;
};

const VideoCard = (props: VideoCardProps) => {
  function onChangeSwapButton(itemUuid: string, interactionType: InteractionType, checked: boolean) {
    if (checked) {
      interactWithItem(itemUuid, interactionType).then(props.onChange);
    } else {
      removeInteractionWithItem(itemUuid, interactionType).then(props.onChange);
    }
  }

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
  );
};

export default VideoCard;
