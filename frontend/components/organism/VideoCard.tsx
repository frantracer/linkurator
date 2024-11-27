import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {readableAgoUnits} from "../../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../../services/interactionService";
import {paths} from "../../configuration";
import Link from "next/link";
import {useInView} from "react-intersection-observer";
import {SwapButton} from "../atoms/SwapButton";
import {
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon
} from "../atoms/Icons";
import ItemCardSkeleton from "./ItemCardSkeleton";
import Miniature from "../atoms/Miniature";
import {providerIconUrl} from "../../entities/Subscription";

type VideoCardProps = {
  item: SubscriptionItem;
  withSubscription?: boolean;
  withInteractions?: boolean;
  onChange?: () => void;
  onChangeSwapButton?: (itemUuid: string, interactionType: InteractionType, checked: boolean) => Promise<void>;
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

async function defaultOnChangeSwapButton(itemUuid: string, interactionType: InteractionType, checked: boolean) {
  if (checked) {
    await interactWithItem(itemUuid, interactionType);
  } else {
    await removeInteractionWithItem(itemUuid, interactionType);
  }
}

const VideoCard = (
  {
    item,
    withSubscription = true,
    withInteractions = true,
    onChange = undefined,
    onChangeSwapButton = defaultOnChangeSwapButton
  }: VideoCardProps) => {
  const {ref, inView} = useInView({threshold: 0});

  if (!inView) {
    return (
      <div ref={ref}>
        <ItemCardSkeleton/>
      </div>
    )
  } else {
    return (
      <div className="card card-compact w-80 bg-base-200 shadow-base-100 shadow-xl hover:scale-105">
        <figure className="aspect-video h-48">
          <img className="h-full"
               src={item.thumbnail}
               alt={item.name}
               onClick={() => window.open(item.url, "_blank")}/>
          {item.duration != undefined &&
              <span className="absolute top-0 right-0 m-1 p-1 bg-black bg-opacity-90 rounded">
                <p className="text-white">{convert_seconds_to_hh_mm_ss(item.duration)}</p>
            </span>
          }
        </figure>
        <div className="card-body">
          <h2 className="card-title cursor-pointer" onClick={() => window.open(item.url, "_blank")}>
            {item.name}
          </h2>
          {withSubscription &&
              <div className="flex gap-x-2 items-center cursor-pointer">
                  <Miniature src={item.subscription.thumbnail} alt={item.subscription.name}/>
                  <Miniature src={providerIconUrl(item.subscription.provider)} alt={item.subscription.provider}/>
                  <Link href={paths.SUBSCRIPTIONS + "/" + item.subscription.uuid}>{item.subscription.name}</Link>
              </div>
          }
          <div className="flex flex-column">
            <p>{readableAgoUnits(item.published_at)}</p>
            {withInteractions &&
                <div className="card-actions justify-end">
                    <SwapButton
                        defaultChecked={item.discouraged}
                        onChange={
                          (isChecked) => onChangeSwapButton &&
                            onChangeSwapButton(item.uuid, InteractionType.Discouraged, isChecked).then(onChange)
                        }>
                        <ThumbsDownFilledIcon/>
                        <ThumbsDownIcon/>
                    </SwapButton>
                    <SwapButton
                        defaultChecked={item.recommended}
                        onChange={
                          (isChecked) => onChangeSwapButton &&
                            onChangeSwapButton(item.uuid, InteractionType.Recommended, isChecked).then(onChange)
                        }>
                        <ThumbsUpFilledIcon/>
                        <ThumbsUpIcon/>
                    </SwapButton>
                    <SwapButton
                        defaultChecked={item.hidden}
                        onChange={(isChecked) => onChangeSwapButton &&
                          onChangeSwapButton(item.uuid, InteractionType.Hidden, isChecked).then(onChange)}>
                        <ArchiveBoxFilledIcon/>
                        <ArchiveBoxIcon/>
                    </SwapButton>
                    <SwapButton
                        defaultChecked={item.viewed}
                        onChange={(isChecked) => onChangeSwapButton &&
                          onChangeSwapButton(item.uuid, InteractionType.Viewed, isChecked).then(onChange)}>
                        <CheckCircleFilledIcon/>
                        <CheckCircleIcon/>
                    </SwapButton>
                </div>
            }
          </div>
        </div>
      </div>
    )
  }
};

export default VideoCard;
